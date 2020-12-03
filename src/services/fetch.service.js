import { HOST, ROUTES, FUT } from '../constants';
import {
  transformPriceLimitsFromFUT,
  transformSearchResultFromFUT,
  transformSearchParamsToFUT,
  transformPlayerToBidPlayerBodyRequest,
  transformPlayerToBidPlayerUrlParams,
  transformBidPlayerResultFromFUT,
  transformSendItemsToBodyRequest,
  transformToLiteQueryParams,
  transformSendItemDataFromFUT,
  transformToPriceLimitsParams,
  transformAuctionHouseBody,
  transformAuctionHouseFromFUT,
  transformPlayersFromFUT,
} from './transform.service';

import { getAppGUID, getSessionId } from './futWebApp.service';

const replaceUrlParams = (url, params) => {
  params.forEach(param => url = url.replace(`{${param.name}}`, param.value));
  return url;
};

export const sendRequest = async ({ host, url, params, urlParams, body, method = 'GET', credentials, skipXUtSid }) => {
  const userId = await getSessionId();
  if (!userId) {
    return;
  }
  if (urlParams) {
    url = replaceUrlParams(url, urlParams);
  }
  url = new URL((host || HOST) + url);
  if (params) {
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  }
  if (body) {
    body = JSON.stringify(body);
  }

  const requestConfig = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  };

  if (credentials) {
    requestConfig.credentials = credentials;
  }

  if (!skipXUtSid) {
    requestConfig.headers['X-UT-SID'] = userId;
  }

  const response = await fetch(url.href, requestConfig);
  if (!response?.ok) {
    throw response;
  }
  try {
    return await response.json();
  } catch (e) {
    return null;
  }
};

export const searchOnTransfermarketRequest = async (params) => {
  try {
    const result = await sendRequest({
      url: ROUTES.TRANSFERMARKET.url,
      method: ROUTES.TRANSFERMARKET.method,
      params: transformSearchParamsToFUT(params),
    });
    return result ? transformSearchResultFromFUT(result) : result;
  } catch (e) {
    console.error('Search on market failed', e);
    throw e;
  }
};

export const bidPlayerRequest = async (player) => {
  try {
    const result = await sendRequest({
      url: ROUTES.BID.url,
      method: ROUTES.BID.method,
      body: transformPlayerToBidPlayerBodyRequest(player),
      urlParams: [transformPlayerToBidPlayerUrlParams(player)],
    });
    return result ? transformBidPlayerResultFromFUT(result) : result;
  } catch (e) {
    console.error('Bidding error', e);
  }
};

export const sendItemsTo = async (itemIds, pile) => {
  try {
    const result = await sendRequest({
      url: ROUTES.ITEM.url,
      method: ROUTES.ITEM.method,
      body: transformSendItemsToBodyRequest(itemIds, pile),
    });
    return result ? transformSendItemDataFromFUT(result) : result;
  } catch (e) {
    console.error('Error sending item to', e);
  }
};

export const sendItemsToTransferListRequest = async (itemIds) => {
  return await sendItemsTo(itemIds, FUT.PILE.trade);
};

export const sendItemToClub = async (itemIds) => {
  const result = await sendItemsTo(itemIds, FUT.PILE.club);
  if (!result) {
    throw new Error();
  }
  return result;
};

export const clearSoldItems = async () => {
  try {
    return await sendRequest({
      url: ROUTES.SOLD.url,
      method: ROUTES.SOLD.method,
    });
  } catch (e) {
    console.error('Error while clear sold items', e);
    throw e;
  }
};

export const getLiteRequest = async (tradeIds = []) => {
  try {
    const result = await sendRequest({
      url: ROUTES.LITE.url + `?${transformToLiteQueryParams(tradeIds)}`,
      method: ROUTES.LITE.method,
    });
    return result ? transformSearchResultFromFUT(result) : result;
  } catch (e) {
    console.error('Error while getting lite', e);
    throw e;
  }
};

export const getTradePile = async () => {
  try {
    const tradepile = await sendRequest({
      url: ROUTES.TRADEPILE.url,
      method: ROUTES.TRADEPILE.method,
    });
    return tradepile ? transformBidPlayerResultFromFUT(tradepile) : tradepile;
  } catch (e) {
    console.error('Error while getting tradepile', e);
    throw e;
  }
};

export const sendItemToAuctionHouseRequest = async (itemId, startingBid, buyNowPrice, duration) => {
  try {
    const result = await sendRequest({
      url: ROUTES.AUCTIONHOUSE.url,
      method: ROUTES.AUCTIONHOUSE.method,
      body: transformAuctionHouseBody(itemId, startingBid, buyNowPrice, duration),
    });
    return result ? transformAuctionHouseFromFUT(result) : result;
  } catch (e) {
    console.error('Error while sedning to auction house', e);
    throw e;
  }
};

export const getPriceLimitsRequest = async (itemId) => {
  try {
    const result = await sendRequest({
      url: ROUTES.PRICELIMITS.url,
      method: ROUTES.PRICELIMITS.method,
      params: transformToPriceLimitsParams(itemId),
    });
    return result ? transformPriceLimitsFromFUT(result) : result;
  } catch (e) {
    console.error('Error while getting price limits', e);
    throw e;
  }
};

export const getPlayers = async () => {
  try {
    const appGuid = await getAppGUID();
    if (!appGuid) {
      return null;
    }
    const result = await sendRequest({
      url: ROUTES.PLAYERS.url,
      host: ROUTES.PLAYERS.host,
      method: ROUTES.PLAYERS.method,
      credentials: 'same-origin',
      skipXUtSid: true,
      urlParams: [{ name: 'appGuid', value: appGuid }],
      params: {
        _: 21052,
      },
    });
    return result ? transformPlayersFromFUT(result) : result;
  } catch (e) {
    console.error('Error while getting players', e);
    throw e;
  }
};
