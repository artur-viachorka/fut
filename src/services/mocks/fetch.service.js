/* eslint-disable */
import { HOST, ROUTES } from '../constants';

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

export const sendRequest = async ({ url, params, urlParams, body, method = 'GET' }, mockedResult) => {
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
  console.log(url.href, body, method);
  return mockedResult;
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
  const mockedSearchResult = {
    auctionInfo: [
      {
        tradeState: 'active',
        tradeId: 1,
        buyNowPrice: 200,
      },
      {
        tradeState: 'active',
        tradeId: 2,
        buyNowPrice: 300,
      },
      {
        tradeState: 'active',
        tradeId: 3,
        buyNowPrice: 400,
      }
    ]
  };
  return await sendRequest({
    url: ROUTES.TRANSFERMARKET.url,
    method: ROUTES.TRANSFERMARKET.method,
    params,
  }, mockedSearchResult);
};

export const bidPlayerRequest = async (player) => {
  const mockedResult = {
    credits: 6000,
    auctionInfo: [{
      tradeId: 1,
      buyNowPrice: 200,
      tradeState: 'closed',
      itemData: {
        id: 999,
      }
    }]
  };
  return await sendRequest({
    url: ROUTES.BID.url,
    method: ROUTES.BID.method,
    body: { bid: player.buyNowPrice },
    urlParams: [{ name: 'tradeId', value: player.tradeId }],
  }, mockedResult);
};

export const sendItemToTransferListRequest = async (itemId) => {
  const mockedResult = {
    itemData: [{id: itemId, pile: 'trade', success: true}],
  };

  return await sendRequest({
    url: ROUTES.ITEM.url,
    method: ROUTES.ITEM.method,
    body: { itemData: [{ id: itemId, pile: 'trade' }] },
  }, mockedResult);
};

export const sendItemToAuctionHouseRequest = async (itemId, startingBid, buyNowPrice, duration) => {
  const mockedResult = {
    id: itemId,
  };
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
  }, mockedResult);
};

export const getPriceLimitsRequest = async (itemId) => {
  const mockedResult = {
    itemId,
    maxPrice: 10000,
    minPrice: 150,
    source: 'ITEM_DEFINITION',
  };
  return await sendRequest({
    url: ROUTES.PRICELIMITS.url,
    method: ROUTES.PRICELIMITS.method,
    params: {
      itemIdList: itemId,
    },
  }, mockedResult);
};
