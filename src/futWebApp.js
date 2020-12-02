import { FUT_WEB_APP_DATA_TYPE } from './constants';

const pinEvent = async (pageId) => {
  alert('pin event', pageId);
  window.services.PIN.sendData(window.PINEventType.PAGE_VIEW, {
    type: window.PIN_PAGEVIEW_EVT_TYPE,
    pgid: pageId,
  });
  window.sendMessage({ type: `${FUT_WEB_APP_DATA_TYPE.PIN}-answer`, payload: true });
};

const getSessionId = () => {
  return window.services.Authentication.sessionUtas.id;
};

const getAppGUID = () => {
  return window.APP_GUID;
};

window.addEventListener('message', async (e) => {
  let result = null;
  switch (e.data.type) {
    case FUT_WEB_APP_DATA_TYPE.PIN:
      result = await pinEvent(e.data.pageId);
      break;
    case FUT_WEB_APP_DATA_TYPE.SESSION_ID:
      result = getSessionId();
      break;
    case FUT_WEB_APP_DATA_TYPE.APP_GUID:
      result = getAppGUID();
      break;
    default:
      return;
  }
  window.postMessage({ type: `${e.data.type}-answer`, payload: result });
});
