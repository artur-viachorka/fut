import { Subject } from 'rxjs';
import { first } from 'rxjs/operators';
import {
  searchPlayersOnMarket,
  buyPlayers,
  sellPlayers,
  sendItemsToTransferList,
  getSearchRequestDelay,
  getDelayBeforeDefaultRequest,
  calculateMinBuyNowAndMinBid,
} from './fut.service';
import { CAPTCHA_ERROR_CODE, RUNNER_STATUS } from '../constants';
import { openUTNotification } from './notification.service';
import { syncTransferListItems } from './transferList.service';
import { sleep } from './helper.service';

export const pauseRunnerSubject = new Subject();
export const finishWorkingStepSubject = new Subject();
export const finishIdleStepSubject = new Subject();
export const stopRunnerSubject = new Subject();
export const setCreditsSubject = new Subject();
export const setWorkingStatusSubject = new Subject();

const runnerState = {
  credits: null,
  freeSlotsInTransferList: null,
  transferListLimit: null,
  skippedStep: null,
  minBuyNow: null,
  minBid: null,
};

const setCredits = (credits) => {
  runnerState.credits = credits;
  setCreditsSubject.next({ credits });
};

const resetRunningState = () => {
  runnerState.skippedStep = null;
  runnerState.minBuyNow = null;
  runnerState.minBid = null;
};

export const syncTradepile = async (skipItems) => {
  setWorkingStatus(RUNNER_STATUS.SYNCING_TRANSFERS);
  skipItems = (skipItems || []).map(item => item.itemData.id);
  const tradepile = await syncTransferListItems(false, skipItems);
  if (!tradepile) {
    runnerState.freeSlotsInTransferList = null;
    setCredits(null);
  } else {
    setCredits(tradepile.credits);
    const itemsInTransferList = tradepile.auctionInfo?.length || runnerState.transferListLimit;
    runnerState.freeSlotsInTransferList = runnerState.transferListLimit - itemsInTransferList;
  }
  return {
    freeSlotsInTransferList: runnerState.freeSlotsInTransferList,
    tradepile,
  };
};

export const executeStep = async (step, transferListLimit, logger) => {
  return new Promise((resolve, reject) => {
    let isWorking = true;
    pauseRunnerSubject
      .pipe(first())
      .subscribe(() => {
        setWorkingStatus();
        isWorking = false;
        reject({
          status: RUNNER_STATUS.PAUSE,
        });
      });

    stopRunnerSubject
      .pipe(first())
      .subscribe(() => {
        setWorkingStatus();
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
          setWorkingStatus();
          isWorking = false;
          resetRunningState();
          resolve();
        }
      });

    const work = async () => {
      console.log('IS WORKING', isWorking); // remove after tested
      if (!isWorking) {
        resolve();
        return;
      }
      if (runnerState.skippedStep === step.id) {
        resolve({ skip: true });
        return;
      }
      const result = await stepTickHandler(step, logger, transferListLimit);
      if (result?.skip) {
        resetRunningState();
        runnerState.skippedStep = step.id; // needed for case when step should be skipped after purchase and pause was pressed.
      }
      if (result?.success) {
        await sleep(getSearchRequestDelay());
        work();
        return;
      }
      setWorkingStatus();
      resolve(result);
    };
    setTimeout(work, getDelayBeforeDefaultRequest());
  });
};

export const setWorkingStatus = (status = null) => {
  setWorkingStatusSubject.next({ status });
};

const stepTickHandler = async (step, logger, transferListLimit) => {
  try {
    if (runnerState.transferListLimit !== transferListLimit) {
      runnerState.transferListLimit = transferListLimit;
      await syncTradepile();
    }
    let params = { ...step.filter.requestParams };
    setWorkingStatus(RUNNER_STATUS.SEARCHING_PLAYERS);
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
      setWorkingStatus(RUNNER_STATUS.BUYING);
      const { credits: remainingCredits, tooLowCredits, boughtItems } = await buyPlayers(
        searchResult,
        params,
        step.shouldSkipAfterPurchase,
        runnerState.credits,
      );
      logger.logBoughtResult(boughtItems);
      setCredits(remainingCredits != null ? remainingCredits : runnerState.credits);
      if (tooLowCredits) {
        logger.logNotEnoughCreditsResult();
        return { skip: true };
      }
      if (boughtItems?.length) {
        if (step.leftInUnassign) {
          logger.logLeftInUnassign(boughtItems);
          return { success: true };
        }
        if (!runnerState.freeSlotsInTransferList) {
          await syncTradepile(boughtItems);
        }
        if (runnerState.freeSlotsInTransferList) {
          setWorkingStatus(RUNNER_STATUS.SENDING_TO_TRANSFER_LIST);
          const moveToTransferListResult = await sendItemsToTransferList(
            boughtItems,
          );
          logger.logMoveToTransferListResult(moveToTransferListResult);
          const movedItems = moveToTransferListResult.filter(item => item.success);
          const notMovedItems = moveToTransferListResult.filter(item => !item.success);
          if (notMovedItems.length) {
            logger.logLeftInUnassign(notMovedItems);
          }
          if (movedItems.length) {
            runnerState.freeSlotsInTransferList -= movedItems.length;
            if (step.shouldSellOnMarket) {
              const sellResult = await sellPlayers(boughtItems, movedItems);
              logger.logSentToAuctionHouseResult(sellResult);
            }
          }
        } else {
          logger.logTransferListFull();
        }
        if (step.shouldSkipAfterPurchase) {
          return { skip: true };
        }
      }
    }
    return { success: true };
  } catch (e) {
    console.error('Error in runner', e);
    const isCaptcha = e.status === CAPTCHA_ERROR_CODE;
    openUTNotification({
      text: isCaptcha ? 'Captcha needed. Reload page and enter captcha.' : 'Something went wrong in runner. Please, try later.',
      error: true,
      infinite: isCaptcha,
    });
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
