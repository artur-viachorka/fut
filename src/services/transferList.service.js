import { getTradePile, sendItemToClub, clearSoldItems } from './fetch.service';
import { sleep } from './helper.service';
import { getDelayBeforeDefaultRequest } from './fut.service';
import { openUTNotification } from './notification.service';

import { FUT } from '../constants';

export const isUniq = (item, duplicates) => {
  return !duplicates.find(duplicateItem => duplicateItem?.itemId === item?.itemData?.id);
};

export const syncTransferListItems = async (shouldNotify, skipItemIds = []) => {
  try {
    await sleep(getDelayBeforeDefaultRequest());
    let tradepile = await getTradePile();
    if (!tradepile?.auctionInfo?.length) {
      return;
    }
    let shouldClearSoldItems = false;
    let updatedAuctionInfo = [...tradepile.auctionInfo];

    for (let i = 0; i < tradepile.auctionInfo.length; i++) {
      const tradeItem = tradepile.auctionInfo[i];
      if (skipItemIds.includes(tradeItem.itemData.id)) {
        continue;
      }
      if ((tradeItem.tradeState == FUT.TRADE_STATE.expired || tradeItem.tradeState === null) && isUniq(tradeItem, tradepile.duplicateItemIdList)) {
        await sleep(getDelayBeforeDefaultRequest());
        await sendItemToClub(tradeItem.itemData.id);
        updatedAuctionInfo = updatedAuctionInfo.filter(info => info.itemData.id !== tradeItem.itemData.id);
      }
      if (tradeItem.tradeState === FUT.TRADE_STATE.closed && tradeItem.currentBid > 0) {
        updatedAuctionInfo = updatedAuctionInfo.filter(info => info.itemData.id !== tradeItem.itemData.id);
        shouldClearSoldItems = true;
      }
    }
    if (shouldClearSoldItems) {
      await sleep(getDelayBeforeDefaultRequest());
      await clearSoldItems();
    }
    if (shouldNotify) {
      openUTNotification({ text: 'Transfer list was successfully synced.', success: true });
    }
    return {
      ...tradepile,
      auctionInfo: updatedAuctionInfo,
    };
  } catch (e) {
    openUTNotification({ text: 'Error while syncing transfer list items.', error: true });
  }
};
