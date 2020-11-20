import { getTradePile, sendItemToClub, clearSoldItems } from './fetch.service';
import { sleep } from './helper.service';
import { getDelayBeforeDefaultRequest } from './fut.service';
import { openUTNotification } from './notification.service';
import { setUserCredits } from './runner.service';

import { FUT } from '../constants';

export const isUniq = (item, duplicates) => {
  return !duplicates.find(duplicateItem => duplicateItem?.itemId === item?.itemData?.id);
};

export const updateTransferListItems = async () => {
  try {
    const tradepile = await getTradePile();
    if (tradepile?.credits) {
      setUserCredits(tradepile.credits);
    }
    if (!tradepile?.auctionInfo?.length) {
      return;
    }
    let shouldClearSoldItems = false;
    for (let i = 0; i < tradepile.auctionInfo.length; i++) {
      const tradeItem = tradepile.auctionInfo[i];
      if ((tradeItem.tradeState == FUT.TRADE_STATE.expired || tradeItem.tradeState === null) && isUniq(tradeItem, tradepile.duplicateItemIdList)) {
        await sleep(getDelayBeforeDefaultRequest());
        await sendItemToClub(tradeItem.itemData.id);
      }
      if (tradeItem.tradeState === FUT.TRADE_STATE.closed && tradeItem.currentBid > 0) {
        shouldClearSoldItems = true;
      }
    }
    if (shouldClearSoldItems) {
      await sleep(getDelayBeforeDefaultRequest());
      await clearSoldItems();
    }
    openUTNotification({ text: 'Transfer list was successfully synced.', success: true });
  } catch (e) {
    openUTNotification({ text: 'Error while syncing transfer list items.', error: true });
  }
};
