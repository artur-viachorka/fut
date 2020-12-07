import { sleep, click } from './helper.service';
import { getDefaultDelay } from './delay.service';
import { openUTNotification } from './notification.service';
import { getFromStorage, saveToStorage } from './storage.service';
import { goToTransfersPage } from './navigate.service';
import { FUT } from '../constants';
import { waitUntilElementExists, waitUntilOneOfElementsExists } from './ui.service';
import { areStringsEqual } from './string.serivce';

export const saveTransferListLimit = async (transferListLimit) => {
  return await saveToStorage({ transferListLimit });
};

export const getTransferListLimit = async () => {
  const { transferListLimit } = await getFromStorage('transferListLimit');
  return transferListLimit;
};

const getSendToClubButton = () => {
  const buttons = $(FUT.PAGE_SELECTORS.playerOverviewActions).toArray();
  return buttons.find(button => areStringsEqual($(button).text(), 'Send to My Club'));
};

const sendItemsToClub = async (sectionOrderNumber) => {
  await waitUntilOneOfElementsExists(
    `${FUT.PAGE_SELECTORS.transferListSection}:nth(${sectionOrderNumber}) ${FUT.PAGE_SELECTORS.transferListSectionItems}`,
    `${FUT.PAGE_SELECTORS.transferListSection}:nth(${sectionOrderNumber}) ${FUT.PAGE_SELECTORS.transferListEmptySection}`
  );
  let initialLength = $(`${FUT.PAGE_SELECTORS.transferListSection}:nth(${sectionOrderNumber}) ${FUT.PAGE_SELECTORS.transferListSectionItems}`).length;
  let i = 0;
  while (i < initialLength) {
    const item = $(`${FUT.PAGE_SELECTORS.transferListSection}:nth(${sectionOrderNumber}) ${FUT.PAGE_SELECTORS.transferListSectionItems}:nth(${i})`);
    if (!item.length) {
      break;
    }
    click(item);
    await sleep(getDefaultDelay());
    const sendToClubButton = getSendToClubButton();
    if (sendToClubButton) {
      click(sendToClubButton);
    } else {
      i++;
    }
    await sleep(getDefaultDelay());
  }
};

const SECTION_ORDER_NUMBER = {
  SOLD: 0,
  UNSOLD: 1,
  AVAILABLE: 2,
};

export const syncTransferListItems = async (shouldNotify) => {
  try {
    await goToTransfersPage();
    await waitUntilElementExists(`${FUT.PAGE_SELECTORS.transferListSection}:nth(${SECTION_ORDER_NUMBER.SOLD})`);
    const soldButton = $(`${FUT.PAGE_SELECTORS.transferListSection}:nth(${SECTION_ORDER_NUMBER.SOLD}) ${FUT.PAGE_SELECTORS.transferListSectionHeaderAction}`);
    if (areStringsEqual(soldButton.text(), 'Clear Sold')) {
      click(soldButton);
    }
    await sendItemsToClub(SECTION_ORDER_NUMBER.UNSOLD);
    await sendItemsToClub(SECTION_ORDER_NUMBER.AVAILABLE);
    if (shouldNotify) {
      openUTNotification({ text: 'Transfer list was successfully synced.', success: true });
    }
  } catch (e) {
    console.error(e);
    openUTNotification({ text: 'Error while syncing transfer list items.', error: true });
  }
};
