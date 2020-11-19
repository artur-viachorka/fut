import { HOST, ROUTES, FUT } from '../constants';
import {
  transformFutItemFromFUT,
  transformAuctionInfoFromFUT,
  transformSearchResultFromFUT,
  transformSearchParamsToFUT,
  transformPlayerToBidPlayerBodyRequest,
  transformPlayerToBidPlayerUrlParams,
  transformBidPlayerResultFromFUT,
  transformSendItemToBodyRequest,
  transformToLiteQueryParams,
} from './transform.service';

const executeOnPageSpace = (code) => {
  var script = document.createElement('script');
  script.id = 'tmpScript';
  script.textContent =
  'document.getElementById("tmpScript").textContent = JSON.stringify(' + code + ')';
  document.documentElement.appendChild(script);
  let result = document.getElementById('tmpScript').textContent;
  script.remove();
  return JSON.parse(result);
};

const replaceUrlParams = (url, params) => {
  params.forEach(param => url = url.replace(`{${param.name}}`, param.value));
  return url;
};

export const sendRequest = async ({ url, params, urlParams, body, method = 'GET' }) => {
  const userId = executeOnPageSpace('window.services.Authentication._sessionUtas.id');
  if (!userId) {
    return;
  }
  if (urlParams) {
    url = replaceUrlParams(url, urlParams);
  }
  url = new URL(HOST + url);

  if (params) {
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  }
  if (body) {
    body = JSON.stringify(body);
  }

  const response = await fetch(url.href, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-UT-SID': userId,
    },
    body,
  });
  return await response.json();
};

export const searchOnTransfermarketRequest = async (params) => {
  try {
    const result = await sendRequest({
      url: ROUTES.TRANSFERMARKET.url,
      method: ROUTES.TRANSFERMARKET.method,
      params: transformSearchParamsToFUT(params),
    });
    return transformSearchResultFromFUT(result);
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
    return transformBidPlayerResultFromFUT(result);
  } catch (e) {
    console.error('Bidding error', e);
  }
};

export const sendItemTo = async (id, pile) => {
  try {
    return await sendRequest({
      url: ROUTES.ITEM.url,
      method: ROUTES.ITEM.method,
      body: transformSendItemToBodyRequest(id, pile),
    });
  } catch (e) {
    console.error('Error sending item to', e);
  }
};

export const sendItemToTransferListRequest = async (itemId) => {
  return await sendItemTo(itemId, FUT.PILE.trade);
};

export const sendItemToClub = async (itemId) => {
  return await sendItemTo(itemId, FUT.PILE.club);
};

export const getLiteRequest = async (tradeIds = []) => {
  try {
    const result = await sendRequest({
      url: ROUTES.LITE.url + `?${transformToLiteQueryParams(tradeIds)}`,
      method: ROUTES.LITE.method,
    });
    return transformSearchResultFromFUT(result);
  } catch (e) {
    console.error('Error when get lite', e);
    throw e;
  }
};

export const sendItemToAuctionHouseRequest = async (itemId, startingBid, buyNowPrice, duration) => {
  return await sendRequest({
    url: ROUTES.AUCTIONHOUSE.url,
    method: ROUTES.AUCTIONHOUSE.method,
    body: {
      buyNowPrice,
      duration,
      itemData: {
        id: itemId
      },
      startingBid,
    },
  });
};

export const getPriceLimitsRequest = async (itemId) => {
  return await sendRequest({
    url: ROUTES.PRICELIMITS.url,
    method: ROUTES.PRICELIMITS.method,
    params: {
      itemIdList: itemId,
    },
  });
};
