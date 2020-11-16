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

export const sendRequest = async (route, params, urlParams) => {
  const userId = executeOnPageSpace('window.services.Authentication._sessionUtas.id');
  if (!userId) {
    return;
  }
  if (urlParams) {
    route = replaceUrlParams(route, urlParams);
  }
  const url = new URL(HOST + route);

  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  const response = await fetch(url.href, {
    headers: {
      'Content-Type': 'application/json',
      'X-UT-SID': userId,
    },
  });
  return await response.json();
};

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
      tradeId: 2,
      buyNowPrice: 400,
    }
  ]
};

const bidResultMock = {
  bid: 'true',
};

export const searchOnTransfermarketRequest = async (params) => {
  return mockedSearchResult;
  return await sendRequest(ROUTES.TRANSFERMARKET, params);
};

export const bidPlayerRequest = async (player) => {
  return bidResultMock;
  return await sendRequest(ROUTES.BID, { bid: player.buyNowPrice }, [{ name: 'tradeId', value: player.tradeId }]);
};
