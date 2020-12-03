import { getTradePile, sendItemToClub, clearSoldItems } from './fetch.service';
import { sleep } from './helper.service';
import { getDelayBeforeDefaultRequest } from './fut.service';
import { pinEvents } from './futWebApp.service';
import { openUTNotification } from './notification.service';

import { FUT, FUT_WEB_APP_EVENTS } from '../constants';

export const isUniq = (item, duplicates) => {
  return !duplicates.find(duplicateItem => duplicateItem?.itemId === item?.itemData?.id);
};

export const syncTransferListItems = async (shouldNotify, skipItemIds = []) => {
  try {
    await sleep(getDelayBeforeDefaultRequest());
    await pinEvents([FUT_WEB_APP_EVENTS.TRANSFERS_HUB]);
    await pinEvents([FUT_WEB_APP_EVENTS.TRANSFERS_LIST, FUT_WEB_APP_EVENTS.ITEM_DETAIL_VIEW]);

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
      await sleep(getDelayBeforeDefaultRequest());
      await sendItemToClub(sendToClub);
    }
    if (shouldClearSoldItems) {
      await sleep(getDelayBeforeDefaultRequest());
      await clearSoldItems();
    }
    if (shouldNotify) {
      openUTNotification({ text: 'Transfer list was successfully synced.', success: true });
    }
    await sleep(getDelayBeforeDefaultRequest());
    return {
      ...tradepile,
      auctionInfo: updatedAuctionInfo,
    };
  } catch (e) {
    openUTNotification({ text: 'Error while syncing transfer list items.', error: true });
  }
};
