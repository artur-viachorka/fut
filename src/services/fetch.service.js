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
  return await sendRequest({
    url: ROUTES.TRANSFERMARKET.url,
    method: ROUTES.TRANSFERMARKET.method,
    params,
  });
};

export const bidPlayerRequest = async (player) => {
  return await sendRequest({
    url: ROUTES.BID.url,
    method: ROUTES.BID.method,
    body: { bid: player.buyNowPrice },
    urlParams: [{ name: 'tradeId', value: player.tradeId }],
  });
};

export const sendItemToTransferListRequest = async (itemId) => {
  return await sendRequest({
    url: ROUTES.ITEM.url,
    method: ROUTES.ITEM.method,
    body: { itemData: [{ id: itemId, pile: 'trade' }] },
  });
};

export const getLiteRequest = async (tradeIds = []) => {
  return await sendRequest({
    url: ROUTES.LITE.url + `?tradeIds=${tradeIds.join(',')}`,
    method: ROUTES.LITE.method,
  });
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
