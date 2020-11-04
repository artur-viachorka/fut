import { timeout } from './helper.service';

export const waitUntilElementExists = async (selector) => {
  if ($(selector).length === 0) {
    await timeout(1);
    return waitUntilElementExists(selector);
  } else {
    return Promise.resolve($(selector));
  }
};

export const setMutationObserver = (observeSelector, mutationType, condition, action) => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation[mutationType]) {
        [...mutation[mutationType]].forEach((node) => {
          if (condition(node) && action) {
            action();
          }
        });
      }
    });
  });
  observer.observe(document.querySelector(observeSelector), {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false,
  });
};
