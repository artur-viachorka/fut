import { callAsPromise } from './helper.service';

const chrome = window.chrome;

export const saveToStorage = async (val) => {
  try {
    await callAsPromise(chrome.storage.sync, chrome.storage.sync.set, val);
    return true;
  } catch (e) {
    console.error('Error on set to sync storage');
    return new Error('Error on set to sync storage');
  }
};

export const getFromStorage = async (...keys) => {
  try {
    return await callAsPromise(chrome.storage.sync, chrome.storage.sync.get, keys);
  } catch (e) {
    console.error('Error on get from sync storage');
    return new Error('Error on get from sync storage');
  }
};

$(async() => {
  const currentStorageVersion = 1;
  if (chrome && chrome.storage) {
    const { storageVersion } = await getFromStorage('storageVersion');
    if (storageVersion !== currentStorageVersion) {
      window.chrome.storage.sync.clear(() => {
        saveToStorage({ 'storageVersion': currentStorageVersion });
      });
    }
  }
});
