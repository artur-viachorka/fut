import { sleep } from './helper.service';
import { REACT_CONTAINER_ID, FUT, LOADER_GIF } from '../constants';

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

export const waitUntilOneOfElementsExists = async (...selectors) => {
  const existingSelector = selectors.filter(selector => $(selector).length)[0];
  if (existingSelector) {
    return Promise.resolve(existingSelector);
  } else {
    await sleep(1);
    return waitUntilOneOfElementsExists(...selectors);
  }
};

export const waitUntilOneOfElementsExistAndConditionIsTrue = async (...items) => {
  const existingItem = items.map(item => {
    const elem = $(item.selector);
    return elem.length && item.condition(elem) ? {
      value: item.getReturnValue(elem),
    } : null;
  }).filter(Boolean)[0];
  if (existingItem) {
    return Promise.resolve(existingItem.value);
  } else {
    await sleep(1);
    return waitUntilOneOfElementsExistAndConditionIsTrue(...items);
  }
};

export const setMutationObserver = (observeSelector, mutationType, configs) => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation[mutationType]) {
        [...mutation[mutationType]].forEach((node) => {
          configs.forEach(config => {
            if (config.condition(node) && config.action) {
              config.action();
            }
          });
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

export const setLoaderVisibility = (show) => {
  const loader = $(`<div class="${FUT.CUSTOM_CLASSES.loader}"></div>`).append(`<img src="${LOADER_GIF}"/>`);
  if (show) {
    $('body').append(loader);
  } else {
    $(`.${FUT.CUSTOM_CLASSES.loader}`).remove();
  }
};

export const initFUTApp = () => {
  $(`#${REACT_CONTAINER_ID}`).css('display', 'block');
};
