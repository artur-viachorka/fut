import { Subject } from 'rxjs';
import { initSearchMarketPage } from './services/marketSearchCriteria.service';
import { waitUntilElementExists, setMutationObserver, initFUTAdditionalActions } from './services/ui.service';
import { FUT } from './constants';
import { initReactApp } from './fut-react-app';

export const addFilterSubject = new Subject();
export const editScenarioSubject = new Subject();
export const selectScenarioSubject = new Subject();
export const openModalSubject = new Subject();
export const editStepWithoutSavingSubject = new Subject();

$(() => {
  initReactApp();
  waitUntilElementExists(FUT.PAGE_SELECTORS.rootView)
    .then(() => {
      setMutationObserver(
        FUT.PAGE_SELECTORS.rootView,
        'addedNodes',
        [
          {
            condition: (node) => $(node).hasClass(FUT.CLASSES.marketSearchView),
            action: initSearchMarketPage,
          },
          {
            condition: (node) => $(node).is(FUT.PAGE_SELECTORS.openHomeButton),
            action: initFUTAdditionalActions,
          }
        ]
      );
    });
});
