import { Subject } from 'rxjs';
import { initSearchMarketPage } from './services/marketSearchCriteria.service';
import { waitUntilElementExists, setMutationObserver } from './services/ui.service';
import { initConstructor } from './scenariosConstructor';

export const addFilterSubject = new Subject();

$(() => {
  initConstructor();
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
