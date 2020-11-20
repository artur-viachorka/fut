import { sleep } from './helper.service';
import { openModalSubject } from '../contentScript';
import { FUT, MODALS } from '../constants';
import { updateTransferListItems } from './transferList.service';

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

const setLoaderVisibility = (show) => {
  if (show) {
    $('.ut-click-shield').addClass('showing');
    $('.ut-click-shield > .loaderIcon').css('display', 'block');
  } else {
    $('.ut-click-shield').removeClass('showing');
    $('.ut-click-shield > .loaderIcon').css('display', 'none');
  }
};

const createActionButton = (className, text, handler) => {
  const newButton = $('<button/>')
    .text(text)
    .attr('title', text)
    .addClass(className)
    .on('click', handler);
  return newButton;
};

const getOpenConfigureScenariosButton = () => createActionButton(FUT.CUSTOM_CLASSES.editScenariosButton, 'Set Scenarios', async () => openModalSubject.next({ modal: MODALS.SCENARIO_CONSTRUCTOR }));
const getOpenRunnerButton = () => createActionButton(FUT.CUSTOM_CLASSES.openRunnerButton, 'Runner', async () => openModalSubject.next({ modal: MODALS.RUNNER }));
const getSyncTransferseButton = () => createActionButton(FUT.CUSTOM_CLASSES.syncTransfersButton, 'Sync Transfers', async () => {
  setLoaderVisibility(true);
  await updateTransferListItems();
  setLoaderVisibility(false);
});

export const initFUTAdditionalActions = () => {
  if ($(`.${FUT.CUSTOM_CLASSES.headerActionsContainer}`).length) {
    return;
  }
  const container = $('<div/>')
    .addClass(FUT.CUSTOM_CLASSES.headerActionsContainer)
    .append(
      getSyncTransferseButton(),
      getOpenConfigureScenariosButton(),
      getOpenRunnerButton(),
    );
  $(FUT.PAGE_SELECTORS.appHeader).append(container);
};
