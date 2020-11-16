import { bidPlayerRequest, searchOnTransfermarketRequest } from './fetch.service';
import { convertSecondsToMs } from './helper.service';
import { SEARCH_REQUEST_INTERVAL_RANGE_IN_SECONDS, MAX_PAGES_TO_SEARCH_ON } from '../constants';
import { getRandomNumberInRange, sleep } from './helper.service';
import { pauseRunnerSubject, stopRunnerSubject } from './runner.service';
import { first } from 'rxjs/operators';
const getSearchRequestInterval = () => {
  return getRandomNumberInRange(SEARCH_REQUEST_INTERVAL_RANGE_IN_SECONDS.from, SEARCH_REQUEST_INTERVAL_RANGE_IN_SECONDS.to);
};

export const getSearchRequestIntervalInMs = () => {
  return convertSecondsToMs(getSearchRequestInterval());
};

const searchPlayersOnMarketPaginated = async (params) => {
  // update min buy now on every step
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
    if (auctionInfo.length === 20) {
      for (let i = 0; i < MAX_PAGES_TO_SEARCH_ON; i++) {
        if (!isWorking) {
          return null;
        }
        params = {
          ...params,
          start: params.start + 20,
        };
        await sleep(getSearchRequestInterval());
        let items = await searchOnTransfermarketRequest(params);
        auctionInfo = auctionInfo.concat(items?.auctionInfo || []);
        if (items?.auctionInfo?.length !== 20) {
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
    return await bidPlayerRequest(player);
  } catch (e) {
    console.error('purchase failed');
    return false;
  }
};
