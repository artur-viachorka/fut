import { prop } from 'ramda';
import { Subject } from 'rxjs';

import { TRANSFERLIST_FULL } from '../constants';
import { CustomFutError } from './error.service';

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
  const movedItems = movedToAuctionHouse.filter(item => !item.error);
  const notMovedItemsWithCustomError = movedToAuctionHouse.filter(item => item.error && item.error instanceof CustomFutError);
  const notMovedItemsWithUnknownError = movedToAuctionHouse.filter(item => item.error && !(item.error instanceof CustomFutError));

  if (movedItems.length) {
    let text = `Moved ${movedItems.length} player(s) for ${movedItems.map(prop('sellPrice'))} coins to auction house list.`;
    logRunnerSubject.next({
      stepId,
      text,
    });
  }
  if (notMovedItemsWithCustomError.length) {
    let text = `Not moved ${notMovedItemsWithCustomError.length} player(s) to auction house in reasons of ${notMovedItemsWithCustomError.map(item => item?.error?.message).filter(Boolean).join(', ')}.`;
    logRunnerSubject.next({
      stepId,
      text,
    });
  }
  if (notMovedItemsWithUnknownError.length) {
    logRunnerSubject.next({
      stepId,
      text: `Attempt to move ${notMovedItemsWithUnknownError.length} player(s) to auction house failed.`,
    });
  }
};

const logLeftInUnassign = (stepId) => (movedToUnassign) => {
  let text = `Moved ${movedToUnassign.length} player(s) in unassign list.`;
  logRunnerSubject.next({
    stepId,
    text,
  });
};

const logFinishedStep = (stepId) => () => {
  logRunnerSubject.next({
    stepId,
    text: 'Step work finished.',
  });
};

const logTransferListFull = (stepId) => () => {
  logRunnerSubject.next({
    stepId,
    text: 'Transfer list is full for now.',
  });
};

export const getLoggerForStep = (stepId) => {
  return {
    logSearchResult: logFoundResult(stepId),
    logBoughtResult: logBoughtResult(stepId),
    logNotEnoughCreditsResult: logNotEnoughCreditsResult(stepId),
    logMoveToTransferListResult: logMoveToTransferListResult(stepId),
    logSentToAuctionHouseResult: logSentToAuctionHouseResult(stepId),
    logFinishedStep: logFinishedStep(stepId),
    logLeftInUnassign: logLeftInUnassign(stepId),
    logTransferListFull: logTransferListFull(stepId),
  };
};
