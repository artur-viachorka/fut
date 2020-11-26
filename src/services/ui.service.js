import { sleep } from './helper.service';
import { FUT, REACT_CONTAINER_ID } from '../constants';

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
  if (show) {
    $('.ut-click-shield').addClass('showing');
    $('.ut-click-shield > .loaderIcon').css('display', 'block');
  } else {
    $('.ut-click-shield').removeClass('showing');
    $('.ut-click-shield > .loaderIcon').css('display', 'none');
  }
};

export const getCreditsFromUi = () => $(FUT.PAGE_SELECTORS.credits).text();

export const initFUTApp = () => {
  $(`#${REACT_CONTAINER_ID}`).css('display', 'block');
};
