import { callAsPromise } from './helper.service';

const chrome = window.chrome;

export const saveToStorage = async (val) => {
  try {
    await callAsPromise(chrome.storage.local, chrome.storage.local.set, val);
    return true;
  } catch (e) {
    console.error('Error on set to local storage');
    return new Error('Error on set to local storage');
  }
};

export const getFromStorage = async (...keys) => {
  try {
    return await callAsPromise(chrome.storage.local, chrome.storage.local.get, keys);
  } catch (e) {
    console.error('Error on get from local storage');
    return new Error('Error on get from local storage');
  }
};

$(async() => {
  const currentStorageVersion = 4;
  if (chrome && chrome.storage) {
    const { storageVersion } = await getFromStorage('storageVersion');
    if (storageVersion !== currentStorageVersion) {
      window.chrome.storage.local.clear(() => {
        saveToStorage({ 'storageVersion': currentStorageVersion });
      });
    }
  }
});
