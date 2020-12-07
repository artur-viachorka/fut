import { waitUntilElementExists } from './ui.service';
import { click } from './helper.service';
import { FUT } from '../constants';

export const goToSearchMarketPage = async () => {
  const isAlreadyOnMarketPage = $(FUT.PAGE_SELECTORS.searchMarketView).length > 0;
  if (!isAlreadyOnMarketPage) {
    await waitUntilElementExists(FUT.PAGE_SELECTORS.mainNavTransfersButton);
    click(FUT.PAGE_SELECTORS.mainNavTransfersButton);
    const transferMarketTileButton = `${FUT.PAGE_SELECTORS.transferHub} ${FUT.PAGE_SELECTORS.transferMarketTile}`;
    await waitUntilElementExists(transferMarketTileButton);
    click(transferMarketTileButton);
  }
  await waitUntilElementExists(FUT.PAGE_SELECTORS.searchMarketView);
  return $(FUT.PAGE_SELECTORS.searchMarketView);
};

export const goToTransfersPage = async () => {
  const isAlreadyOnTransfersPage = $(FUT.PAGE_SELECTORS.transfersView).length > 0;
  if (!isAlreadyOnTransfersPage) {
    await waitUntilElementExists(FUT.PAGE_SELECTORS.mainNavTransfersButton);
    click(FUT.PAGE_SELECTORS.mainNavTransfersButton);
    const transfersTileButton = `${FUT.PAGE_SELECTORS.transferHub} ${FUT.PAGE_SELECTORS.transfersTile}`;

    await waitUntilElementExists(transfersTileButton);
    click(transfersTileButton);
  }
  await waitUntilElementExists(FUT.PAGE_SELECTORS.transfersView);
  return $(FUT.PAGE_SELECTORS.transfersView);
};
