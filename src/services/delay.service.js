import { getRandomNumberInRange } from './helper.service';

import {
  SEARCH_REQUEST_INTERVAL_RANGE_IN_SECONDS,
  SEARCH_REQUEST_RANGE_BETWEEN_PAGES_IN_SECONDS,
  SHORT_DELAY_RANGE,
  LONG_DELAY_RANGE,
  DELAY_BEFORE_MOVING_TO_TRANSFER_LIST_RANGE,
  PURCHASE_DELAY,
} from '../constants';

export const getSearchRequestDelay = () => {
  return getRandomNumberInRange(SEARCH_REQUEST_INTERVAL_RANGE_IN_SECONDS.from, SEARCH_REQUEST_INTERVAL_RANGE_IN_SECONDS.to);
};

export const getPurchaseDelay = () => {
  return getRandomNumberInRange(PURCHASE_DELAY.from, PURCHASE_DELAY.to);
};

export const getDelayBeforeMovingToTransferList = () => {
  return getRandomNumberInRange(DELAY_BEFORE_MOVING_TO_TRANSFER_LIST_RANGE.from, DELAY_BEFORE_MOVING_TO_TRANSFER_LIST_RANGE.to);
};

export const getSearchRequestDelayBetweenPages = () => {
  return getRandomNumberInRange(SEARCH_REQUEST_RANGE_BETWEEN_PAGES_IN_SECONDS.from, SEARCH_REQUEST_RANGE_BETWEEN_PAGES_IN_SECONDS.to);
};

export const getDefaultDelay = (isLong) => {
  return getRandomNumberInRange(
    isLong? LONG_DELAY_RANGE.from : SHORT_DELAY_RANGE.from,
    isLong? LONG_DELAY_RANGE.to : SHORT_DELAY_RANGE.to,
  );
};
