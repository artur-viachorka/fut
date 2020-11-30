import { first } from 'rxjs/operators';
import { getRandomNumberInRange, sleep, getSortHandler, getTheMostRepeatableNumber, convertMsToMinutes } from './helper.service';
import { pauseRunnerSubject, stopRunnerSubject, syncTradepile, setWorkingStatus } from './runner.service';
import {
  bidPlayerRequest,
  searchOnTransfermarketRequest,
  sendItemsToTransferListRequest,
  sendItemToAuctionHouseRequest,
  getLiteRequest,
} from './fetch.service';
import {
  SEARCH_REQUEST_INTERVAL_RANGE_IN_SECONDS,
  SEARCH_REQUEST_RANGE_BETWEEN_PAGES_IN_SECONDS,
  MAX_PAGES_TO_SEARCH_ON,
  BUY_INPUT_SETTINGS,
  PERCENT_AFTER_WHICH_RESET_MIN_BUY,
  SEARCH_ITEMS_THAT_SIGNAL_ABOUT_PAGINATION,
  SEARCH_ITEMS_PAGE_SIZE,
  MIN_BUY_AFTER_WHICH_RESET_MIN_BUY,
  SHORT_DELAY_BEFORE_DEFAULT_REQUEST_RANGE,
  LONG_DELAY_BEFORE_DEFAULT_REQUEST_RANGE,
  DELAY_BEFORE_MOVING_TO_TRANSFER_LIST_RANGE,
  FUT,
  MIN_EXPIRES_TO_BUY,
  SEARCH_ITEMS_ORDER_CONFIG,
  HOUR_IN_SECONDS,
  MAX_PLAYERS_TO_BUY_IN_ONE_STEP,
  FUT_COMMISSION_IN_PERCENT,
  SEARCH_ITEMS_PAGE_SIZE_ON_PRICE_CHECK,
  MAX_PAGES_TO_SEARCH_ON_PRICE_CHECK,
  PRICE_CACHE_LIFE_MINUTES,
  RUNNER_STATUS,
  PURCHASE_DELAY,
} from '../constants';

import { CustomFutError } from './error.service';

import { saveToStorage, getFromStorage } from './storage.service';

export const getSearchRequestDelay = () => {
  return getRandomNumberInRange(SEARCH_REQUEST_INTERVAL_RANGE_IN_SECONDS.from, SEARCH_REQUEST_INTERVAL_RANGE_IN_SECONDS.to);
};

export const getPurchaseDelay = () => {
  return getRandomNumberInRange(PURCHASE_DELAY.from, PURCHASE_DELAY.to);
};

const getDelayBeforeMovingToTransferList = () => {
  return getRandomNumberInRange(DELAY_BEFORE_MOVING_TO_TRANSFER_LIST_RANGE.from, DELAY_BEFORE_MOVING_TO_TRANSFER_LIST_RANGE.to);
};

const getSearchRequestDelayBetweenPages = () => {
  return getRandomNumberInRange(SEARCH_REQUEST_RANGE_BETWEEN_PAGES_IN_SECONDS.from, SEARCH_REQUEST_RANGE_BETWEEN_PAGES_IN_SECONDS.to);
};

export const getDelayBeforeDefaultRequest = (isLong) => {
  return getRandomNumberInRange(
    isLong? LONG_DELAY_BEFORE_DEFAULT_REQUEST_RANGE.from : SHORT_DELAY_BEFORE_DEFAULT_REQUEST_RANGE.from,
    isLong? LONG_DELAY_BEFORE_DEFAULT_REQUEST_RANGE.to : SHORT_DELAY_BEFORE_DEFAULT_REQUEST_RANGE.to,
  );
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

export const calculateMinBuyNowAndMinBid = (minBuyNow, minBid, maxBuyNow) => {
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

const mapAuctionInfoItems = (result, pageNumber) => {
  return (result?.auctionInfo || []).map(item => ({
    ...item,
    pageNumber,
  }));
};

const isPageLast = (pageNumber, listLength) => pageNumber === Math.ceil((listLength / 20) - 1);

const searchPlayersOnMarketPaginated = async (params) => {
  params.type = 'player';
  params.start = 0;
  params.num = SEARCH_ITEMS_THAT_SIGNAL_ABOUT_PAGINATION;
  let isWorking = true;
  pauseRunnerSubject
    .pipe(first())
    .subscribe(() => isWorking = false);

  stopRunnerSubject
    .pipe(first())
    .subscribe(() => isWorking = false);
  let result = await searchOnTransfermarketRequest(params);
  let auctionInfo = mapAuctionInfoItems(result, 0);
  if (auctionInfo.length === SEARCH_ITEMS_THAT_SIGNAL_ABOUT_PAGINATION) {
    for (let i = 1; i < MAX_PAGES_TO_SEARCH_ON; i++) {
      await sleep(getSearchRequestDelayBetweenPages());
      if (!isWorking) {
        return null;
      }
      params = {
        ...params,
        start: (params.start || 0) + SEARCH_ITEMS_PAGE_SIZE,
      };
      let searchResult = await searchOnTransfermarketRequest(params);
      const mappedAuctionInfo = mapAuctionInfoItems(searchResult, i);
      if (mappedAuctionInfo.length !== SEARCH_ITEMS_THAT_SIGNAL_ABOUT_PAGINATION) {
        break;
      }
      auctionInfo = auctionInfo.concat(mappedAuctionInfo);
    }
  }
  return auctionInfo;
};

export const searchPlayersOnMarket = async (params, step) => {
  let auctionInfo = await searchPlayersOnMarketPaginated(params);
  if (!auctionInfo?.length) {
    return null;
  }
  const sortedAuctionInfo = auctionInfo.length > 1
    ? auctionInfo
      .filter(item =>
        item
        && item.buyNowPrice
        && item.expires > MIN_EXPIRES_TO_BUY
        && item.tradeState === FUT.TRADE_STATE.active
        && (step.rating ? item.itemData.rating === step.rating : true)
      )
      .sort(getSortHandler(SEARCH_ITEMS_ORDER_CONFIG))
    : auctionInfo;
  if (!sortedAuctionInfo?.length) {
    return null;
  }
  const cheapestPlayers = sortedAuctionInfo.slice(0, MAX_PLAYERS_TO_BUY_IN_ONE_STEP);
  return {
    cheapestPlayers,
    auctionInfo
  };
};

const buyPlayer = async (player) => {
  if (!player?.buyNowPrice || !player?.tradeId || player?.tradeState !== 'active') {
    return;
  }
  const bidResult = await bidPlayerRequest(player);
  const auctionInfo = (bidResult?.auctionInfo || [])[0];
  if (auctionInfo?.tradeId && auctionInfo?.itemData?.id) {
    return {
      auctionInfo,
      credits: bidResult?.credits,
    };
  }
};

export const buyPlayers = async ({ cheapestPlayers, auctionInfo }, params, shouldSkipAfterPurchase, credits) => {
  let boughtItems = [];
  let cantBuyInReasonOfCredits = 0;
  await sleep(getPurchaseDelay());
  for (let i = 0; i < cheapestPlayers.length; i++) {
    const player = cheapestPlayers[i];

    if (player.buyNowPrice > credits ) {
      cantBuyInReasonOfCredits++;
      continue;
    }

    if (!isPageLast(player.pageNumber, auctionInfo.length)) {
      await sleep(getSearchRequestDelayBetweenPages());
      const playersOnPage = await searchOnTransfermarketRequest({
        ...params,
        start: player.pageNumber * SEARCH_ITEMS_PAGE_SIZE,
        micr: 150,
      });
      if ((playersOnPage?.auctionInfo || []).find(auctionItem => auctionItem.tradeId === player.tradeId)) {
        await sleep(getDelayBeforeDefaultRequest());
        const liteData = await getLiteRequest([player.tradeId]);
        const activeTrade = (liteData?.auctionInfo || []).find(item => item.tradeId === player.tradeId && item.tradeState === FUT.TRADE_STATE.active);
        if (!activeTrade) {
          continue;
        }
      } else {
        continue;
      }
    }
    const boughtResult = await buyPlayer(player);
    await sleep(getDelayBeforeDefaultRequest());
    if (boughtResult) {
      credits = boughtResult.credits;
      boughtItems.push(boughtResult.auctionInfo);
      if (shouldSkipAfterPurchase) {
        break;
      }
    }
  }
  return {
    boughtItems,
    credits,
    tooLowCredits: cantBuyInReasonOfCredits === cheapestPlayers.length,
  };
};

export const sendItemsToTransferList = async (boughtItems) => {
  const itemDataIds = boughtItems.map(item => item?.itemData?.id).filter(Boolean);
  if (itemDataIds?.length) {
    await sleep(getDelayBeforeMovingToTransferList());
    let result = await sendItemsToTransferListRequest(itemDataIds);
    return result?.itemData || [];
  }
};

export const saveTransferListLimit = async (transferListLimit) => {
  return await saveToStorage({ transferListLimit });
};

export const getTransferListLimit = async () => {
  const { transferListLimit } = await getFromStorage('transferListLimit');
  return transferListLimit;
};

const findFirstCheapestItems = (auctionInfo) => {
  return (auctionInfo || []).sort((a, b) => a.buyNowPrice - b.buyNowPrice).slice(0, 5);
};

const findCheapestAuctionItems = async (definitionId, maxPrice) => {
  const pageSize = SEARCH_ITEMS_PAGE_SIZE_ON_PRICE_CHECK;
  const maxPages = MAX_PAGES_TO_SEARCH_ON_PRICE_CHECK;

  const params = {
    type: 'player',
    start: 0,
    num: pageSize,
    maxb: maxPrice,
    definitionId,
  };

  let isWorking = true;

  stopRunnerSubject
    .pipe(first())
    .subscribe(() => isWorking = false);

  await sleep(getSearchRequestDelay());

  let result = await searchOnTransfermarketRequest(params);
  let cheapests = findFirstCheapestItems(result?.auctionInfo);
  if (result?.auctionInfo?.length === pageSize) {
    for (let i = 1; i < maxPages; i++) {
      await sleep(getSearchRequestDelay());
      const cheapestBuyNowPrice = cheapests[0]?.buyNowPrice;
      if (!cheapestBuyNowPrice) {
        throw new CustomFutError('No prices were found');
      }
      if (!isWorking) {
        throw new CustomFutError('Runner is stopped');
      }
      params.maxb = cheapestBuyNowPrice;
      params.start = (params.start || 0) + pageSize;

      let searchResult = await searchOnTransfermarketRequest(params);
      const newCheapests = findFirstCheapestItems(searchResult?.auctionInfo);
      cheapests = [...newCheapests, ...cheapests.slice(newCheapests.length)];

      if (searchResult?.auctionInfo?.length < pageSize) {
        break;
      }
    }
  }
  return cheapests;
};

const getSellPriceFromLocal = async (definitionId) => {
  const priceLifeMinutes = PRICE_CACHE_LIFE_MINUTES;
  const { sellPrices } = await getFromStorage('sellPrices');
  const item = (sellPrices || {})[definitionId];
  if (item?.createdTimestamp && item?.price != null) {
    const now = Date.now();
    const isExpired = convertMsToMinutes(now - item.createdTimestamp) > priceLifeMinutes;
    return isExpired ? null : item.price;
  }
};

const saveSellPriceLocally = async (definitionId, sellPrice) => {
  let { sellPrices } = await getFromStorage('sellPrices');
  sellPrices = sellPrices || {};
  sellPrices[definitionId] = {
    price: sellPrice,
    createdTimestamp: Date.now(),
  };
  await saveToStorage({ sellPrices });
};

const getPriceAfterWithCommission = (price) => {
  return price - (price * FUT_COMMISSION_IN_PERCENT / 100);
};

const calculateSellPrice = async (definitionId, buyNowPrice, minPrice, maxPrice) => {
  let price = await getSellPriceFromLocal(definitionId);
  if (!price) {
    const cheapests = await findCheapestAuctionItems(definitionId, maxPrice);
    price = getTheMostRepeatableNumber((cheapests || []).map(item => item.buyNowPrice));
  }
  if (!price) {
    throw new CustomFutError('No prices were found');
  }
  const lowerThenMarketPrice = price - getFutPriceStep(price, false);
  const finalPrice = getPriceAfterWithCommission(lowerThenMarketPrice) > buyNowPrice
    ? lowerThenMarketPrice
    : getPriceAfterWithCommission(price) > buyNowPrice
      ? price
      : null;
  const result = finalPrice > minPrice ? finalPrice : null;
  if (result) {
    await saveSellPriceLocally(definitionId, price);
    return result;
  } else {
    throw new CustomFutError('Not profitable price');
  }
};

export const sellPlayer = async (itemId, definitionId, buyNowPrice, minPrice, maxPrice) => {
  setWorkingStatus(RUNNER_STATUS.CALCULATING_SELL_PRICE);
  try {
    const sellPrice = await calculateSellPrice(definitionId, buyNowPrice, minPrice, maxPrice);
    setWorkingStatus(RUNNER_STATUS.MOVING_TO_AUCTION);
    const minSellPrice = sellPrice - getFutPriceStep(sellPrice, false);
    await sleep(getDelayBeforeDefaultRequest(true));
    const result = await sendItemToAuctionHouseRequest(itemId, minSellPrice, sellPrice, HOUR_IN_SECONDS);
    if (result?.id) {
      return {
        itemId,
        minSellPrice,
        sellPrice,
      };
    }
  } catch (e) {
    if (e instanceof CustomFutError) {
      return {
        error: e,
      };
    }
    throw e;
  }
};

export const sellPlayers = async (boughtItems, movedItems) => {
  let boughtAndMovedToTransferListItems = boughtItems.filter(boughtItem => movedItems.find(movedItem => movedItem.id === boughtItem.itemData.id));
  const sellResult = [];
  const { tradepile } = await syncTradepile(boughtAndMovedToTransferListItems);
  for (let i = 0; i < boughtAndMovedToTransferListItems.length; i++) {
    const item = boughtAndMovedToTransferListItems[i];
    const itemInTradepile = tradepile.auctionInfo.find(auctionItem => auctionItem.itemData.id === item.itemData.id);
    const marketDataMinPrice = itemInTradepile?.itemData?.marketDataMinPrice;
    const marketDataMaxPrice = itemInTradepile?.itemData?.marketDataMaxPrice;
    const definitionId = itemInTradepile?.itemData?.assetId;

    if (marketDataMinPrice && marketDataMaxPrice) {
      const sentToAucitonHouseItem = await sellPlayer(item.itemData.id, definitionId, item.buyNowPrice, marketDataMinPrice, marketDataMaxPrice);
      if (sentToAucitonHouseItem) {
        sellResult.push(sentToAucitonHouseItem);
      }
    }
  }
  return sellResult;
};
