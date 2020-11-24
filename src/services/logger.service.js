import { prop } from 'ramda';
import { Subject } from 'rxjs';

import { TRANSFERLIST_FULL } from '../constants';

export const logRunnerSubject = new Subject();

const logFoundResult = (stepId) => (players) => {
  if (!players.length) {
    return;
  }
  const text = `Found ${players.length} player(s) for ${players.map(prop('buyNowPrice'))} coins.`;
  logRunnerSubject.next({
    stepId,
    text,
  });
};

const logBoughtResult = (stepId) => (boughtItems) => {
  if (!boughtItems.length) {
    logRunnerSubject.next({
      stepId,
      text: 'Attempt to buy players failed.',
    });
    return;
  }
  const text = `Bought ${boughtItems.length} player(s) for ${boughtItems.map(prop('buyNowPrice'))} coins.`;
  logRunnerSubject.next({
    stepId,
    text,
  });
};

const logNotEnoughCreditsResult = (stepId) => () => {
  logRunnerSubject.next({
    stepId,
    text: 'Not enough credits to buy player',
  });
};

const logMoveToTransferListResult = (stepId) => (movingResult) => {
  const movedItems = movingResult.filter(item => item.success);
  if (movedItems.length) {
    logRunnerSubject.next({
      stepId,
      text: `Moved ${movedItems.length} player(s) to transfer list.`,
    });
  }

  const notMovedItems = movingResult.filter(item => !item.success);
  if (notMovedItems.length) {
    logRunnerSubject.next({
      stepId,
      text: `Failed to move ${notMovedItems.length} player(s) to transfer list.`,
    });
  }
  const isListFull = movingResult.find(item => !item.success && item.reason === TRANSFERLIST_FULL.reason && item.errorCode === TRANSFERLIST_FULL.errorCode);
  if (isListFull) {
    logRunnerSubject.next({
      stepId,
      text: 'Transfer list is full.',
    });
  }
};

const logSentToAuctionHouseResult = (stepId) => (movedToAuctionHouse) => {
  if (movedToAuctionHouse.length) {
    let text = `Moved ${movedToAuctionHouse.length} player(s) for ${movedToAuctionHouse.map(prop('sellPrice'))} coins to auction house list.`;
    logRunnerSubject.next({
      stepId,
      text,
    });
  } else {
    logRunnerSubject.next({
      stepId,
      text: 'Attempt to move players to auction house failed.',
    });
  }
};

export const getLoggerForStep = (stepId) => {
  return {
    logSearchResult: logFoundResult(stepId),
    logBoughtResult: logBoughtResult(stepId),
    logNotEnoughCreditsResult: logNotEnoughCreditsResult(stepId),
    logMoveToTransferListResult: logMoveToTransferListResult(stepId),
    logSentToAuctionHouseResult: logSentToAuctionHouseResult(stepId),
  };
};
