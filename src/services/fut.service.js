import { first } from 'rxjs/operators';
import { convertSecondsToMs } from './helper.service';
import { getRandomNumberInRange, sleep } from './helper.service';
import { pauseRunnerSubject, stopRunnerSubject } from './runner.service';
import {
  bidPlayerRequest,
  searchOnTransfermarketRequest,
  sendItemToTransfermarketRequest,
  sendItemToAuctionHouseRequest,
  getPriceLimitsRequest,
} from './fetch.service';
import {
  SEARCH_REQUEST_INTERVAL_RANGE_IN_SECONDS,
  MAX_PAGES_TO_SEARCH_ON,
  BUY_INPUT_SETTINGS,
  PERCENT_AFTER_WHICH_RESET_MIN_BUY,
  SEARCH_ITEMS_THAT_SIGNAL_ABOUT_PAGINATION,
  SEARCH_ITEMS_PAGE_SIZE,
} from '../constants';

const getSearchRequestInterval = () => {
  return getRandomNumberInRange(SEARCH_REQUEST_INTERVAL_RANGE_IN_SECONDS.from, SEARCH_REQUEST_INTERVAL_RANGE_IN_SECONDS.to);
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
  if (newMinBuyNow >= maxBuyNow || newMinBuyNow >= (maxBuyNow * PERCENT_AFTER_WHICH_RESET_MIN_BUY / 100)) {
    newMinBuyNow = 0;
  }
  return newMinBuyNow;
};

export const calculateMaxBid = (currentValue, maxBuyNow) => {
  if (currentValue == null) {
    return 0;
  }
  let newMaxBid = (currentValue || BUY_INPUT_SETTINGS.maxBid) - getFutPriceStep(currentValue, false);
  if (newMaxBid <= maxBuyNow) {
    newMaxBid = BUY_INPUT_SETTINGS.maxBid;
  }
  return newMaxBid;
};

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
    let auctionInfo = [...(result?.auctionInfo || [])];
    if (auctionInfo.length === SEARCH_ITEMS_THAT_SIGNAL_ABOUT_PAGINATION) {
      for (let i = 0; i < MAX_PAGES_TO_SEARCH_ON; i++) {
        if (!isWorking) {
          return null;
        }
        params = {
          ...params,
          start: params.start + SEARCH_ITEMS_PAGE_SIZE,
        };
        await sleep(getSearchRequestInterval());
        let items = await searchOnTransfermarketRequest(params);
        auctionInfo = auctionInfo.concat(items?.auctionInfo || []);
        if (items?.auctionInfo?.length !== SEARCH_ITEMS_THAT_SIGNAL_ABOUT_PAGINATION) {
          break;
        }
      }
    }
    return auctionInfo;
  } catch (e) {
    console.error('Search player on market failed!', e);
    return null;
  }
};

export const searchPlayersOnMarket = async (params) => {
  let results = await searchPlayersOnMarketPaginated(params);
  if (!results) {
    return null;
  }
  results = results
    .filter(item => item && item.buyNowPrice)
    .sort((a, b) => a.buyNowPrice - b.buyNowPrice);

  return results;
};

export const buyPlayer = async (player) => {
  if (!player?.buyNowPrice || !player?.tradeId || player?.tradeState !== 'active') {
    return false;
  }
  try {
    const bidResult = await bidPlayerRequest(player);
    const auctionInfo = (bidResult?.auctionInfo || [])[0];
    if (auctionInfo?.tradeId && auctionInfo?.itemData?.id) {
      return {
        auctionInfo,
        credits: bidResult.credits,
      };
    }
    return false;
  } catch (e) {
    console.error('purchase failed', e);
    return false;
  }
};

export const sellPlayer = async (bidInfo) => {
  console.log(bidInfo);
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
