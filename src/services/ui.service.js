import { sleep } from './helper.service';

export const waitUntilTrue = async (conditionCheck, valueToReturn) => {
  if (conditionCheck()) {
    return Promise.resolve(valueToReturn);
  } else {
    await sleep(1);
    return waitUntilTrue(conditionCheck, valueToReturn);
  }
};

export const waitUntilElementExists = async (selector) => {
  return await waitUntilTrue(() => $(selector).length, $(selector));
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
