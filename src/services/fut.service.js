import { first } from 'rxjs/operators';
import { convertSecondsToMs } from './helper.service';
import { getRandomNumberInRange, sleep } from './helper.service';
import { pauseRunnerSubject, stopRunnerSubject } from './runner.service';
import {
  bidPlayerRequest,
  searchOnTransfermarketRequest,
  sendItemToTransferListRequest,
  sendItemToAuctionHouseRequest,
  getPriceLimitsRequest,
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
  DELAY_BEFORE_DEFAULT_REQUEST_RANGE,
  DELAY_BEFORE_MOVING_TO_TRANSFER_LIST_RANGE,
  FUT,
} from '../constants';

import { saveToStorage, getFromStorage } from './storage.service';

export const getSearchRequestDelay = (inMs) => {
  const delay = getRandomNumberInRange(SEARCH_REQUEST_INTERVAL_RANGE_IN_SECONDS.from, SEARCH_REQUEST_INTERVAL_RANGE_IN_SECONDS.to);
  return inMs ? convertSecondsToMs(delay) : delay;
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

export const getDelayBeforeDefaultRequest = () => {
  return getRandomNumberInRange(DELAY_BEFORE_DEFAULT_REQUEST_RANGE.from, DELAY_BEFORE_DEFAULT_REQUEST_RANGE.to);
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

export const searchPlayersOnMarket = async (params) => {
  let auctionInfo = await searchPlayersOnMarketPaginated(params);
  if (!auctionInfo?.length) {
    return null;
  }
  let sortedAuctionInfo = auctionInfo
    .filter(item => item && item.buyNowPrice && item.expires > 20 && item.tradeState === FUT.TRADE_STATE.active)
    .sort((a, b) => a.buyNowPrice === b.buyNowPrice ? b.pageNumber - a.pageNumber : a.buyNowPrice - b.buyNowPrice);
  let cheapestItem = sortedAuctionInfo[0];
  if (isPageLast(cheapestItem.pageNumber, auctionInfo.length)) {
    return cheapestItem;
  }
  await sleep(getSearchRequestDelayBetweenPages());
  await searchOnTransfermarketRequest({
    ...params,
    start: cheapestItem.pageNumber * SEARCH_ITEMS_PAGE_SIZE,
    micr: 150,
  });
  await sleep(getDelayBeforeDefaultRequest());
  const liteData = await getLiteRequest([cheapestItem.tradeId]);
  const activeTrade = (liteData?.auctionInfo || []).find(item => item.tradeId === cheapestItem.tradeId && item.tradeState === FUT.TRADE_STATE.active);
  return activeTrade || null;
};

export const buyPlayer = async (player) => {
  if (!player?.buyNowPrice || !player?.tradeId || player?.tradeState !== 'active') {
    return;
  }
  await sleep(getDelayAfterFoundedResultAndBuyRequest());
  const bidResult = await bidPlayerRequest(player);
  const auctionInfo = (bidResult?.auctionInfo || [])[0];
  if (auctionInfo?.tradeId && auctionInfo?.itemData?.id) {
    return {
      auctionInfo,
      credits: bidResult.credits,
    };
  }
};

export const sendItemToTransferList = async (itemData) => {
  if (!itemData?.id) {
    return;
  }
  await sleep(getDelayBeforeMovingToTransferList());
  const result = await sendItemToTransferListRequest(itemData.id);
  if (result?.itemData && result?.itemData[0]?.success) {
    return {
      itemId: result.itemData[0].id,
    };
  }
};

export const saveTransferListLimit = async (transferListLimit) => {
  return await saveToStorage({ transferListLimit });
};

export const getTransferListLimit = async () => {
  const { transferListLimit } = await getFromStorage('transferListLimit');
  return transferListLimit;
};

export const sellPlayer = async (itemId) => {
  console.log(itemId);
  // if (!bidInfo?.buyNowPrice || !player?.tradeId || player?.tradeState !== 'active') {
  //   return false;
  // }

  // sendItemToAuctionHouseRequest,
  // getPriceLimitsRequest,
};
