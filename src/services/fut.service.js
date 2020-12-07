import { goToSearchMarketPage } from './navigate.service';
import {
  setLoaderVisibility,
  waitUntilElementExists,
  waitUntilOneOfElementsExists,
  waitUntilOneOfElementsExistAndConditionIsTrue,
} from './ui.service';
import { triggerEvent, click, sleep } from './helper.service';
import {
  FUT,
  FILTERS_FIELDS,
  BUY_INPUT_SETTINGS,
  MIN_BUY_AFTER_WHICH_RESET_MIN_BUY,
  PERCENT_AFTER_WHICH_RESET_MIN_BUY,
  MAX_PAGES_TO_SEARCH_ON,
  MAX_PLAYERS_TO_BUY_IN_ONE_STEP,
} from '../constants';
import { areStringsEqual, parseStringToInt } from './string.serivce';
import { CustomFutError } from './error.service';
import {
  getSearchRequestDelay,
  getDefaultDelay,
  getSearchRequestDelayBetweenPages,
  getPurchaseDelay,
} from './delay.service';

const callFilterHadler = async (filter, filterField) => {
  const [handler, selector] = FILTER_FIELD_HANDLER[filterField];
  return await handler(filter, selector);
};

const resetFilters = () => click(FUT.PAGE_SELECTORS.resetButton);

export const initializeFilters = async (filters, skipReset) => {
  try {
    setLoaderVisibility(true);
    await goToSearchMarketPage();
    if (!skipReset) {
      resetFilters();
    }
    const allFilterFields = Object.values(FILTERS_FIELDS);
    for (let i = 0; i < allFilterFields.length; i++) {
      const filterField = allFilterFields[i];
      const filter = filters[filterField];
      if (filter) {
        await sleep(getDefaultDelay());
        await callFilterHadler(filter, filterField);
      }
    }
    setLoaderVisibility(false);
  } catch (e) {
    setLoaderVisibility(false);
    console.error(e);
    throw new CustomFutError('Can`t initialize filters. Some inputs were not found. Contact developers.');
  }
};

const setPlayer = async (player, inputSelector) => {
  $(inputSelector).val(player.name);
  triggerEvent(inputSelector, 'input');
  await waitUntilElementExists(FUT.PAGE_SELECTORS.playerResultsListButton);
  const neededButton = $(FUT.PAGE_SELECTORS.playerResultsListButton).filter((i, button) => {
    const name = $(button).find('.btn-text').text();
    const rating = $(button).find('.btn-subtext').text();
    return areStringsEqual(name, player.name) && areStringsEqual(rating, player.rating);
  })[0];
  if (neededButton) {
    click(neededButton);
  } else {
    throw new Error();
  }
};

const setAdditionalFilter = async ({ title }, selector) => {
  const currentValue = $(selector).find('span.label').text();
  if (areStringsEqual(currentValue, title)) {
    return;
  }
  click(`${selector} .inline-container`);
  await waitUntilElementExists(`${selector} .inline-list li`);
  const neededButton = $(`${selector} .inline-list li`).filter((i, menuItem) => {
    const menuItemTitle = $(menuItem).text();
    return areStringsEqual(title, menuItemTitle);
  })[0];
  if (neededButton) {
    click(neededButton);
  } else {
    throw new Error();
  }
};

const setPriceInput = async (value, selector) => {
  const input = $(selector);
  if (input.length) {
    input.val(value);
    triggerEvent(selector, 'change');
    triggerEvent(selector, 'blur');
  } else {
    throw new Error();
  }
};

const FILTER_FIELD_HANDLER = {
  [FILTERS_FIELDS.PLAYER]: [setPlayer, FUT.PAGE_SELECTORS.selectPlayerInput],
  [FILTERS_FIELDS.QUALITY]: [setAdditionalFilter, FUT.PAGE_SELECTORS.qualityInput],
  [FILTERS_FIELDS.POSITION]: [setAdditionalFilter, FUT.PAGE_SELECTORS.positionInput],
  [FILTERS_FIELDS.RARITY]: [setAdditionalFilter, FUT.PAGE_SELECTORS.rarityInput],
  [FILTERS_FIELDS.NATION]: [setAdditionalFilter, FUT.PAGE_SELECTORS.nationInput],
  [FILTERS_FIELDS.LEAGUE]: [setAdditionalFilter, FUT.PAGE_SELECTORS.leagueInput],
  [FILTERS_FIELDS.TEAM]: [setAdditionalFilter, FUT.PAGE_SELECTORS.teamInput],
  [FILTERS_FIELDS.MAX_BUY]: [setPriceInput, FUT.PAGE_SELECTORS.maxBuyNowInput],
  [FILTERS_FIELDS.MIN_BUY]: [setPriceInput, FUT.PAGE_SELECTORS.minBuyNowInput],
  [FILTERS_FIELDS.MIN_BID]: [setPriceInput, FUT.PAGE_SELECTORS.minBidInput],
};

const getFutPriceStep = (value, increasing, customMin, customSteps) => {
  let step = customMin || BUY_INPUT_SETTINGS.min;
  if (value >= BUY_INPUT_SETTINGS.max && increasing) {
    return 0;
  }
  if (value <= BUY_INPUT_SETTINGS.min && !increasing) {
    return step;
  }
  (customSteps || BUY_INPUT_SETTINGS.steps).forEach((stepInfo, index) => {
    if (value >= stepInfo.min && value <= stepInfo.max) {
      if (!increasing && value === stepInfo.min) {
        const prev = BUY_INPUT_SETTINGS.steps[index - 1];
        step = prev ? prev.step : 0;
        return;
      }
      if (increasing && value === stepInfo.max) {
        const next = BUY_INPUT_SETTINGS.steps[index + 1];
        step = next ? next.step : 0;
        return;
      }
      step = stepInfo.step;
    }
  });
  return step;
};

const calculateMinBuyNowAndMinBid = (minBuyNow, minBid, maxBuyNow) => {
  if (minBuyNow == null) {
    return [0, 0];
  }
  let newMinBuyNow = minBuyNow;
  let newMinBid = minBid + getFutPriceStep(minBid, true, BUY_INPUT_SETTINGS.minBid, BUY_INPUT_SETTINGS.bidSteps);
  if (newMinBid >= newMinBuyNow) {
    newMinBuyNow = (newMinBuyNow || 0) + getFutPriceStep(newMinBuyNow, true);
    newMinBid = 0;
  }
  const shouldResetValues = newMinBuyNow >= maxBuyNow || newMinBuyNow >= (maxBuyNow * PERCENT_AFTER_WHICH_RESET_MIN_BUY / 100) || newMinBuyNow > MIN_BUY_AFTER_WHICH_RESET_MIN_BUY.max;
  if (newMinBuyNow > MIN_BUY_AFTER_WHICH_RESET_MIN_BUY.min && shouldResetValues) {
    newMinBuyNow = 0;
    newMinBid = 0;
  }
  return [newMinBuyNow, newMinBid];
};

export const setMinBuyNowAndMinBid = async (minBuyNow, minBid, maxBuyNow) => {
  [minBuyNow, minBid] = calculateMinBuyNowAndMinBid(minBuyNow, minBid, maxBuyNow);
  await initializeFilters({
    [FILTERS_FIELDS.MIN_BUY]: minBuyNow,
    [FILTERS_FIELDS.MIN_BID]: minBid,
  }, true);
  return [minBuyNow, minBid];
};

const getBuyNowPrice = (playerItem) => {
  const value = $(playerItem).find(FUT.PAGE_SELECTORS.playerBuyNow).text();
  return parseStringToInt(value);
};

const getRating = (playerItem) => {
  return $(playerItem).find(FUT.PAGE_SELECTORS.playerOverviewRating).text();
};

const loadPlayersOnPage = async (page) => {
  const existingSelector = await waitUntilOneOfElementsExists(FUT.PAGE_SELECTORS.searchNoResults, FUT.PAGE_SELECTORS.searchResultsListItem);
  const isEmptyList = existingSelector === FUT.PAGE_SELECTORS.searchNoResults;
  let playersOnPage = [];
  let isLastPage = true;
  if (!isEmptyList) {
    isLastPage = !$(FUT.PAGE_SELECTORS.nextButton).length;
    playersOnPage = $(FUT.PAGE_SELECTORS.searchResultsListItem)
      .toArray()
      .map(item => ({
        page,
        item,
        buyNowPrice: getBuyNowPrice(item),
        rating: getRating(item)
      }));
  }
  return {
    playersOnPage,
    isLastPage,
  };
};

const loadPlayers = async () => {
  let players = [];
  let currentPage = 0;
  while (currentPage < MAX_PAGES_TO_SEARCH_ON) {
    const {
      playersOnPage,
      isLastPage,
    } = await loadPlayersOnPage(currentPage);
    players = players.concat(playersOnPage);
    if (isLastPage || currentPage === MAX_PAGES_TO_SEARCH_ON - 1) {
      break;
    }
    await moveBetweenPages(currentPage, currentPage + 1);
    currentPage++;
  }
  return {
    players,
    currentPage: currentPage ? currentPage : currentPage,
  };
};

const calculateCheapestPlayers = (players, rating) => {
  if (rating) {
    players = players.filter(player => areStringsEqual(player.rating, rating));
  }
  return players.sort((a, b) => a.buyNowPrice === b.buyNowPrice ? b.page - a.page : a.buyNowPrice - b.buyNowPrice);
};

export const searchPlayersOnMarket = async (step) => {
  await sleep(getSearchRequestDelay());
  click(FUT.PAGE_SELECTORS.searchButton);
  let {
    players,
    currentPage,
  } = await loadPlayers();
  return {
    players: calculateCheapestPlayers(players, step.rating).slice(0, MAX_PLAYERS_TO_BUY_IN_ONE_STEP),
    currentPage,
  };
};

const movePageUp = async () => {
  await sleep(getSearchRequestDelayBetweenPages());
  await click(FUT.PAGE_SELECTORS.nextButton);
};

const movePageDown = async () => {
  await sleep(getSearchRequestDelayBetweenPages());
  await click(FUT.PAGE_SELECTORS.prevButton);
};

const moveBetweenPages = async (from, to) => {
  if (from > to) {
    while (from > to) {
      await movePageDown();
      from--;
    }
  }
  if (from < to) {
    while (from < to) {
      await movePageUp();
      from++;
    }
  }
  await sleep(getDefaultDelay());
};

const findPlayerItemByBuyNowPrice = (buyNowPrice) => {
  return $(FUT.PAGE_SELECTORS.searchResultsListItem)
    .toArray()
    .find(item => {
      return areStringsEqual(buyNowPrice, getBuyNowPrice(item));
    });
};

const checkIsPlayerBuyed = async () => {
  const getReturnValue = (elem) => elem.hasClass('won') ? true : elem.hasClass('expired') ? false : null;
  const condition = (elem) => elem.hasClass('won') || elem.hasClass('expired');
  return await waitUntilOneOfElementsExistAndConditionIsTrue(
    {
      selector: FUT.PAGE_SELECTORS.playerDetails.inSlide,
      condition,
      getReturnValue,
    },
    {
      selector: FUT.PAGE_SELECTORS.playerDetails.inCarousel,
      condition,
      getReturnValue,
    }
  );
};

const buyPlayer = async (player) => {
  click(player.item);
  await sleep(getDefaultDelay());
  const buyButton = $(FUT.PAGE_SELECTORS.buyNowActionButton);
  if (buyButton.is(':disabled')) {
    return {
      isPurchaseDisabled: true,
    };
  }
  click(buyButton);
  await waitUntilElementExists(FUT.PAGE_SELECTORS.confirmBuyModalOkButton);
  await sleep(getPurchaseDelay());
  click(FUT.PAGE_SELECTORS.confirmBuyModalOkButton);
  const isBought = await checkIsPlayerBuyed();
  return {
    isBought,
    buyNowPrice: player.buyNowPrice,
  };
};

export const buyPlayers = async (searchResult, shouldSkipAfterPurchase) => {
  let boughtItems = [];
  let isPurchaseDisabledCount = 0;
  const { players, currentPage } = searchResult;
  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    if (player.page !== currentPage) {
      await moveBetweenPages(currentPage, player.page);
      player.item = findPlayerItemByBuyNowPrice(player.buyNowPrice);
    }
    const buyResult = await buyPlayer(player);
    if (buyResult.isPurchaseDisabled) {
      isPurchaseDisabledCount++;
    }
    if (buyResult.isPurchaseDisabled || !buyResult.isBought) {
      continue;
    }
    if (buyResult.isBought) {
      boughtItems.push(buyResult);
      if (shouldSkipAfterPurchase) {
        break;
      }
    }
  }
  return {
    boughtItems,
    isPurchaseDisabled: isPurchaseDisabledCount === players.length,
  };
};
