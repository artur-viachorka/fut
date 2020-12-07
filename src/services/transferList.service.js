import { sleep } from './helper.service';
import { getDefaultDelay } from './delay.service';
import { openUTNotification } from './notification.service';
import { getFromStorage, saveToStorage } from './storage.service';

import { FUT } from '../constants';

export const isUniq = (item, duplicates) => {
  return !duplicates.find(duplicateItem => duplicateItem?.itemId === item?.itemData?.id);
};

export const saveTransferListLimit = async (transferListLimit) => {
  return await saveToStorage({ transferListLimit });
};

export const getTransferListLimit = async () => {
  const { transferListLimit } = await getFromStorage('transferListLimit');
  return transferListLimit;
};

export const syncTransferListItems = async (shouldNotify, skipItemIds = []) => {
  try {
    await sleep(getDefaultDelay());

    let tradepile = await getTradePile();
    if (!tradepile?.auctionInfo?.length) {
      return;
    }
    let shouldClearSoldItems = false;
    let updatedAuctionInfo = [...tradepile.auctionInfo];
    let sendToClub = [];
    for (let i = 0; i < tradepile.auctionInfo.length; i++) {
      const tradeItem = tradepile.auctionInfo[i];
      if (skipItemIds.includes(tradeItem.itemData.id)) {
        continue;
      }
      if ((tradeItem.tradeState == FUT.TRADE_STATE.expired || tradeItem.tradeState === null) && isUniq(tradeItem, tradepile.duplicateItemIdList)) {
        sendToClub.push(tradeItem.itemData.id);
        updatedAuctionInfo = updatedAuctionInfo.filter(info => info.itemData.id !== tradeItem.itemData.id);
      }
      if (tradeItem.tradeState === FUT.TRADE_STATE.closed && tradeItem.currentBid > 0) {
        updatedAuctionInfo = updatedAuctionInfo.filter(info => info.itemData.id !== tradeItem.itemData.id);
        shouldClearSoldItems = true;
      }
    }
    if (sendToClub.length) {
      await sleep(getDefaultDelay());
      await sendItemToClub(sendToClub);
    }
    if (shouldClearSoldItems) {
      await sleep(getDefaultDelay());
      await clearSoldItems();
    }
    if (shouldNotify) {
      openUTNotification({ text: 'Transfer list was successfully synced.', success: true });
    }
    await sleep(getDefaultDelay());
    return {
      ...tradepile,
      auctionInfo: updatedAuctionInfo,
    };
  } catch (e) {
    openUTNotification({ text: 'Error while syncing transfer list items.', error: true });
  }
};
