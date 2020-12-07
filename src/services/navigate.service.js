import { waitUntilElementExists } from './ui.service';
import { click } from './helper.service';

export const goToSearchMarketPage = async () => {
  const isAlreadyOnMarketPage = $('.ut-market-search-filters-view').length > 0;
  if (!isAlreadyOnMarketPage) {
    await waitUntilElementExists('.ut-tab-bar-item.icon-transfer');
    click('.ut-tab-bar-item.icon-transfer');
    await waitUntilElementExists('.TransfersHub .ut-tile-transfer-market');
    click('.TransfersHub .ut-tile-transfer-market');
  }
  await waitUntilElementExists('.ut-market-search-filters-view');
  return $('.ut-market-search-filters-view');
};
