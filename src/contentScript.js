import { Subject } from 'rxjs';
import { initSearchMarketPage } from './services/marketSearchCriteria.service';
import { waitUntilElementExists, setMutationObserver } from './services/ui.service';
import { initReactApp } from './fut-react-app';

export const addFilterSubject = new Subject();
export const editScenarioSubject = new Subject();
export const selectScenarioSubject = new Subject();
export const openModalSubject = new Subject();
export const editStepWithoutSavingSubject = new Subject();
export const updateExecutableRunnerDataObject = new Subject();

$(() => {
  initReactApp();
  waitUntilElementExists('.ut-root-view')
    .then(() => {
      setMutationObserver(
        '.ut-root-view',
        'addedNodes',
        (node) => $(node).hasClass('ut-market-search-filters-view'),
        initSearchMarketPage
      );
    });
});
