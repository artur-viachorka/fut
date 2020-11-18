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
  PAUSE_BETWEEN_FOUNDED_RESULT_AND_BUY_REQUEST_IN_SECONDS,
  MIN_BUY_AFTER_WHICH_RESET_MIN_BUY,
  PAUSE_BEFORE_MOVING_TO_TRANSFER_LIST,
  DELAY_BEFORE_DEFAULT_REQUEST_RANGE,
} from '../constants';

const getSearchRequestInterval = () => {
  return getRandomNumberInRange(SEARCH_REQUEST_INTERVAL_RANGE_IN_SECONDS.from, SEARCH_REQUEST_INTERVAL_RANGE_IN_SECONDS.to);
};

const getSearchRequestIntervalBetweenPages = () => {
  return getRandomNumberInRange(SEARCH_REQUEST_RANGE_BETWEEN_PAGES_IN_SECONDS.from, SEARCH_REQUEST_RANGE_BETWEEN_PAGES_IN_SECONDS.to);
};

const getDelayBeforeDefaultRequest = () => {
  return getRandomNumberInRange(DELAY_BEFORE_DEFAULT_REQUEST_RANGE.from, DELAY_BEFORE_DEFAULT_REQUEST_RANGE.to);
};

export const getSearchRequestIntervalInMs = () => {
  return convertSecondsToMs(getSearchRequestInterval());
};

const getFutPriceStep = (value, increasing) => {
  let step = BUY_INPUT_SETTINGS.min;
  if (value >= BUY_INPUT_SETTINGS.max && increasing) {
    return 0;
  }
  if (value <= BUY_INPUT_SETTINGS.min && !increasing) {
    return step;
  }
  BUY_INPUT_SETTINGS.steps.forEach((stepInfo, index) => {
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

export const calculateMinBuyNow = (currentValue, maxBuyNow) => {
  if (currentValue == null) {
    return 0;
  }
  let newMinBuyNow = (currentValue || 0) + getFutPriceStep(currentValue, true);
  const shouldResetMinBuy = newMinBuyNow >= maxBuyNow || newMinBuyNow >= (maxBuyNow * PERCENT_AFTER_WHICH_RESET_MIN_BUY / 100) || newMinBuyNow > MIN_BUY_AFTER_WHICH_RESET_MIN_BUY.max;
  if (newMinBuyNow > MIN_BUY_AFTER_WHICH_RESET_MIN_BUY.min && shouldResetMinBuy) {
    newMinBuyNow = 0;
  }
  return newMinBuyNow;
};

const mapAuctionInfoItems = (result, pageNumber) => {
  return (result?.auctionInfo || []).map(item => ({
    ...item,
    pageNumber,
  }));
};

const isPageLast = (pageNumber, listLength) => pageNumber === Math.ceil((listLength / 20) - 1);

const searchPlayersOnMarketPaginated = async (params) => {
  try {
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
        if (!isWorking) {
          return null;
        }
        params = {
          ...params,
          start: (params.start || 0) + SEARCH_ITEMS_PAGE_SIZE,
        };
        await sleep(getSearchRequestIntervalBetweenPages());
        let searchResult = await searchOnTransfermarketRequest(params);
        const mappedAuctionInfo = mapAuctionInfoItems(searchResult, i);
        if (mappedAuctionInfo.length !== SEARCH_ITEMS_THAT_SIGNAL_ABOUT_PAGINATION) {
          break;
        }
        auctionInfo = auctionInfo.concat(mappedAuctionInfo);
      }
    }
    return auctionInfo;
  } catch (e) {
    console.error('Search player on market failed!', e);
    return null;
  }
};

export const searchPlayersOnMarket = async (params) => {
  let auctionInfo = await searchPlayersOnMarketPaginated(params);
  if (!auctionInfo?.length) {
    return null;
  }
  let sortedAuctionInfo = auctionInfo
    .filter(item => item && item.buyNowPrice && item.expires > 20 && item.tradeState === 'active')
    .sort((a, b) => a.buyNowPrice === b.buyNowPrice ? b.pageNumber - a.pageNumber : a.buyNowPrice - b.buyNowPrice);
  let cheapestItem = sortedAuctionInfo[0];
  if (isPageLast(cheapestItem.pageNumber, auctionInfo.length)) {
    return cheapestItem;
  }
  await sleep(getSearchRequestIntervalBetweenPages());
  await searchOnTransfermarketRequest({
    ...params,
    start: cheapestItem.pageNumber * SEARCH_ITEMS_PAGE_SIZE,
    micr: 150,
  });
  await sleep(getDelayBeforeDefaultRequest());
  const liteData = await getLiteRequest([cheapestItem.tradeId]);
  const activeTrade = (liteData?.auctionInfo || []).find(item => item.tradeId === cheapestItem.tradeId && item.tradeState === 'active');
  return activeTrade || null;
};

export const buyPlayer = async (player) => {
  if (!player?.buyNowPrice || !player?.tradeId || player?.tradeState !== 'active') {
    return;
  }
  try {
    await sleep(PAUSE_BETWEEN_FOUNDED_RESULT_AND_BUY_REQUEST_IN_SECONDS);
    const bidResult = await bidPlayerRequest(player);
    const auctionInfo = (bidResult?.auctionInfo || [])[0];
    if (auctionInfo?.tradeId && auctionInfo?.itemData?.id) {
      return {
        auctionInfo,
        credits: bidResult.credits,
      };
    }
  } catch (e) {
    console.error('purchase failed', e);
  }
};

export const sendItemToTransferList = async (itemData) => {
  try {
    if (!itemData?.id) {
      return;
    }
    await sleep(PAUSE_BEFORE_MOVING_TO_TRANSFER_LIST);
    const result = await sendItemToTransferListRequest(itemData.id);
    if (result?.itemData && result?.itemData[0]?.success) {
      return {
        itemId: result.itemData[0].id,
      };
    }
  } catch (e) {
    console.error('failed to move to transfer list', e);
  }
};

export const sellPlayer = async (itemId) => {
  console.log(itemId);
  // if (!bidInfo?.buyNowPrice || !player?.tradeId || player?.tradeState !== 'active') {
  //   return false;
  // }

  // sendItemToTransfermarketRequest,
  // sendItemToAuctionHouseRequest,
  // getPriceLimitsRequest,

  // try {
  //   return await bidPlayerRequest(player);
  // } catch (e) {
  //   console.error('purchase failed');
  //   return false;
  // }
};
