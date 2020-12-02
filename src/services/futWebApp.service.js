import { FUT_WEB_APP_DATA_TYPE } from '../constants';

export const pinEvent = async (pageId) => {
  const result = await sendMessage({ type: FUT_WEB_APP_DATA_TYPE.PIN, payload: pageId });
  alert(`${result} - outer`);
};

export const getAppGUID = (() => {
  let storedAppId = null;
  return async () => {
    if (!storedAppId) {
      storedAppId = await sendMessage({ type: FUT_WEB_APP_DATA_TYPE.APP_GUID });
    }
    return storedAppId;
  };
})();

export const getSessionId = (() => {
  let storedSessionId = null;
  return async () => {
    if (!storedSessionId) {
      storedSessionId = await sendMessage({ type: FUT_WEB_APP_DATA_TYPE.SESSION_ID });
    }
    return storedSessionId;
  };
})();

const sendMessage = async ({ type, payload }) => {
  return new Promise((resolve) => {
    window.postMessage({ type, payload }, '*');
    window.addEventListener('message', (e) => {
      if (e.data.type === `${type}-answer`) {
        resolve(e.data.payload);
      }
    });
  });
};
