import { first } from 'rxjs/operators';
import { getRandomNumberInRange, sleep, getSortHandler } from './helper.service';
import { pauseRunnerSubject, stopRunnerSubject, syncTradepile } from './runner.service';
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
  DELAY_AFTER_FOUNDED_RESULT_AND_BUY_REQUEST_RANGE,
  MIN_BUY_AFTER_WHICH_RESET_MIN_BUY,
  SHORT_DELAY_BEFORE_DEFAULT_REQUEST_RANGE,
  LONG_DELAY_BEFORE_DEFAULT_REQUEST_RANGE,
  DELAY_BEFORE_MOVING_TO_TRANSFER_LIST_RANGE,
  FUT,
  MIN_EXPIRES_TO_BUY,
  SEARCH_ITEMS_ORDER_CONFIG,
  HOUR_IN_SECONDS,
  MAX_PLAYERS_TO_BUY_IN_ONE_STEP,
} from '../constants';

import { saveToStorage, getFromStorage } from './storage.service';

export const getSearchRequestDelay = () => {
  return getRandomNumberInRange(SEARCH_REQUEST_INTERVAL_RANGE_IN_SECONDS.from, SEARCH_REQUEST_INTERVAL_RANGE_IN_SECONDS.to);
};

const getDelayBeforeMovingToTransferList = () => {
  return getRandomNumberInRange(DELAY_BEFORE_MOVING_TO_TRANSFER_LIST_RANGE.from, DELAY_BEFORE_MOVING_TO_TRANSFER_LIST_RANGE.to);
};

const getDelayAfterFoundedResultAndBuyRequest = () => {
  return getRandomNumberInRange(DELAY_AFTER_FOUNDED_RESULT_AND_BUY_REQUEST_RANGE.from, DELAY_AFTER_FOUNDED_RESULT_AND_BUY_REQUEST_RANGE.to);
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
  let isWorking = true;
  pauseRunnerSubject
    .pipe(first())
    .subscribe(() => isWorking = false);

  stopRunnerSubject
    .pipe(first())
    .subscribe(() => isWorking = false);
  await sleep(getDelayBeforeDefaultRequest());
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
  const sortedAuctionInfo = auctionInfo
    .filter(item =>
      item
      && item.buyNowPrice
      && item.expires > MIN_EXPIRES_TO_BUY
      && item.tradeState === FUT.TRADE_STATE.active
      && (step.rating ? item.itemData.rating === step.rating : true)
    )
    .sort(getSortHandler(SEARCH_ITEMS_ORDER_CONFIG));
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
  await sleep(getDelayAfterFoundedResultAndBuyRequest());
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
    await sleep(getDelayBeforeDefaultRequest());
    const boughtResult = await buyPlayer(player);
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

const calculateSellPrice = (buyNowPrice, minPrice, maxPrice) => {
  return buyNowPrice; // calc buy now
};

export const sellPlayer = async (itemId, buyNowPrice, minPrice, maxPrice) => {
  const sellPrice = calculateSellPrice(buyNowPrice, minPrice, maxPrice);
  const minSellPrice = minPrice; // сalculate min sell price
  await sleep(getDelayBeforeDefaultRequest(true));
  const result = await sendItemToAuctionHouseRequest(itemId, minSellPrice, sellPrice, HOUR_IN_SECONDS);
  if (result?.id) {
    return {
      itemId,
      minSellPrice,
      sellPrice,
    };
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
    if (marketDataMinPrice && marketDataMaxPrice) {
      const sentToAucitonHouseItem = await sellPlayer(item.itemData.id, item.buyNowPrice, marketDataMinPrice, marketDataMaxPrice);
      if (sentToAucitonHouseItem) {
        sellResult.push(sentToAucitonHouseItem);
      }
    }
  }
  return sellResult;
};
