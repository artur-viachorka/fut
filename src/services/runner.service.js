import { Subject } from 'rxjs';
import { first } from 'rxjs/operators';
import {
  searchPlayersOnMarket,
  buyPlayers,
  sellPlayers,
  sendItemsToTransferList,
  getSearchRequestDelay,
  calculateMinBuyNowAndMinBid,
} from './fut.service';
import { CAPTCHA_ERROR_CODE } from '../constants';
import { openUTNotification } from './notification.service';
import { syncTransferListItems } from './transferList.service';
import {
  getLoggerForStep,
} from './logger.service';

export const pauseRunnerSubject = new Subject();
export const finishWorkingStepSubject = new Subject();
export const finishIdleStepSubject = new Subject();
export const stopRunnerSubject = new Subject();

let runnerState = {
  credits: null,
  freeSlotsInTransferList: null,
  transferListLimit: null,
  skippedStep: null,
  minBuyNow: null,
  minBid: null,
};

const resetRunningState = () => {
  runnerState = {
    credits: runnerState.credits,
    freeSlotsInTransferList: runnerState.freeSlotsInTransferList,
    transferListLimit: runnerState.transferListLimit,
    skippedStep: null,
    minBuyNow: null,
    minBid: null,
  };
};

export const syncTradepile = async (transferListLimit) => {
  const tradepile = await syncTransferListItems();
  if (!tradepile) {
    runnerState.freeSlotsInTransferList = null;
  }
  runnerState.credits = tradepile.credits;
  const itemsInTransferList = tradepile.auctionInfo?.length || transferListLimit;
  runnerState.freeSlotsInTransferList = transferListLimit - itemsInTransferList;
  return {
    freeSlotsInTransferList: runnerState.freeSlotsInTransferList,
    tradepile,
  };
};

export const RUNNER_STATUS = {
  WORKING: 'working',
  IDLE: 'idle',
  PAUSE: 'pause',
  STOP: 'stop',
};

export const executeStep = async (step, transferListLimit) => {
  if (runnerState.transferListLimit !== transferListLimit) {
    runnerState.transferListLimit = transferListLimit;
    await syncTradepile(transferListLimit);
  }
  return new Promise((resolve, reject) => {
    let isWorking = true;
    pauseRunnerSubject
      .pipe(first())
      .subscribe(() => {
        isWorking = false;
        reject({
          status: RUNNER_STATUS.PAUSE,
        });
      });

    stopRunnerSubject
      .pipe(first())
      .subscribe(() => {
        isWorking = false;
        resetRunningState();
        reject({
          status: RUNNER_STATUS.STOP,
        });
      });

    finishWorkingStepSubject
      .pipe(first())
      .subscribe(({ stepId }) => {
        if (stepId === step.id) {
          isWorking = false;
          resetRunningState();
          resolve();
        }
      });

    const work = async () => {
      if (!isWorking) {
        resolve();
        return;
      }
      if (runnerState.skippedStep === step.id) {
        resolve({ skip: true });
        return;
      }
      const result = await stepTickHandler(step, getLoggerForStep(step.id));
      if (result?.skip) {
        resetRunningState();
        runnerState.skippedStep = step.id; // needed for case when step should be skipped after purchase and pause was pressed.
      }
      if (result?.success) {
        return setTimeout(work, getSearchRequestDelay(true));
      }
      resolve(result);
    };
    work();
  });
};

const stepTickHandler = async (step, logger) => {
  try {
    let params = { ...step.filter.requestParams };
    [runnerState.minBuyNow, runnerState.minBid] = calculateMinBuyNowAndMinBid(runnerState.minBuyNow, runnerState.minBid, params.maxb);
    if (runnerState.minBuyNow) {
      params.minb = runnerState.minBuyNow;
    }
    if (runnerState.minBid) {
      params.micr = runnerState.minBid;
    }

    const searchResult = await searchPlayersOnMarket(
      params,
      step,
    );
    if (searchResult) {
      logger.logSearchResult(searchResult.cheapestPlayers);
      const { credits: remainingCredits, tooLowCredits, boughtItems } = await buyPlayers(
        searchResult,
        params,
        step.shouldSkipAfterPurchase,
        runnerState.credits,
      );
      logger.logBoughtResult(boughtItems);
      runnerState.credits = remainingCredits != null ? remainingCredits : runnerState.credits;
      if (tooLowCredits) {
        logger.logNotEnoughCreditsResult();
        return { skip: true };
      }
      if (boughtItems?.length) {
        if (!runnerState.freeSlotsInTransferList) {
          await syncTradepile();
        }
        if (runnerState.freeSlotsInTransferList) {
          const moveToTransferListResult = await sendItemsToTransferList(
            boughtItems,
          );
          logger.logMoveToTransferListResult(moveToTransferListResult);
          const movedItems = moveToTransferListResult.filter(item => item.success);
          if (movedItems.length) {
            runnerState.freeSlotsInTransferList -= movedItems.length;
            if (step.shouldSellOnMarket) {
              const sellResult = await sellPlayers(boughtItems, movedItems);
              logger.logSentToAuctionHouseResult(sellResult);
            }
          }
        }
        if (step.shouldSkipAfterPurchase) {
          return { skip: true };
        }
      }
    }
    return { success: true };
  } catch (e) {
    console.error('Error in runner', e);
    if (e.status === CAPTCHA_ERROR_CODE) {
      openUTNotification({ text: 'Captcha needed. Reload page and enter captcha.', error: true });
      return { stop: true };
    }
    openUTNotification({ text: e?.errorText || 'Something went wrong in runner. Please, try later.', error: true });
    return { stop: true };
  }
};

export const executeStepIdle = (step) => {
  return new Promise((resolve, reject) => {
    pauseRunnerSubject
      .pipe(first())
      .subscribe(() => {
        reject({
          status: RUNNER_STATUS.PAUSE,
        });
      });

    stopRunnerSubject
      .pipe(first())
      .subscribe(() => {
        reject({
          status: RUNNER_STATUS.STOP,
        });
      });

    finishIdleStepSubject
      .pipe(first())
      .subscribe(({ stepId }) => {
        if (stepId === step.id) {
          resolve();
        }
      });
  });
};

export const finishStepWork = (step) => {
  finishWorkingStepSubject.next({ stepId: step?.id });
};

export const finishStepIdle = (step) => {
  finishIdleStepSubject.next({ stepId: step?.id });
};

export const stopStep = () => {
  stopRunnerSubject.next();
};

export const pauseStep = () => {
  pauseRunnerSubject.next();
};
