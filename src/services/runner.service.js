import { Subject } from 'rxjs';
import { first } from 'rxjs/operators';
import {
  searchPlayersOnMarket,
  buyPlayers,
  sellPlayer,
  sendItemsToTransferList,
  getSearchRequestDelay,
  calculateMinBuyNowAndMinBid,
} from './fut.service';
import { CAPTCHA_ERROR_CODE } from '../constants';
import { openUTNotification } from './notification.service';
import { syncTransferListItems } from './transferList.service';

export const pauseRunnerSubject = new Subject();
export const finishWorkingStepSubject = new Subject();
export const finishIdleStepSubject = new Subject();
export const stopRunnerSubject = new Subject();
export const logRunnerSubject = new Subject();

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
  return runnerState.freeSlotsInTransferList;
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
      const result = await stepTickHandler(step);
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

const stepTickHandler = async (step) => {
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
      (player) => {
        logRunnerSubject.next({
          stepId: step.id,
          text: `Player found${player?.buyNowPrice ? ` for ${player.buyNowPrice}` : ''}.`,
        });
      },
    );
    if (searchResult) {
      const { credits: remainingCredits, tooLowCredits, boughtItems } = await buyPlayers(
        searchResult,
        params,
        step.shouldSkipAfterPurchase,
        runnerState.credits,
        (bidResult) => logRunnerSubject.next({
          stepId: step.id,
          text: `Player ${!bidResult ? 'not' : ''} bought${bidResult?.auctionInfo?.buyNowPrice ? ` for ${bidResult?.auctionInfo?.buyNowPrice}` : ''}.`,
        }),
        (player) => {
          logRunnerSubject.next({
            stepId: step.id,
            text: `Not enough credits to buy player ${player.buyNowPrice ? ` for ${player.buyNowPrice}` : ''}.`,
          });
        }
      );
      runnerState.credits = remainingCredits || runnerState.credits;
      if (tooLowCredits) {
        return { skip: true };
      }
      if (boughtItems?.length) {
        if (runnerState.freeSlotsInTransferList) {
          const sentResult = await sendItemsToTransferList(
            boughtItems,
            (movingResult) => logRunnerSubject.next({
              stepId: step.id,
              text: movingResult ? 'Player was moved to transfer list.' : 'Cant move player to transfer list.'
            }),
          );
          if (sentResult.length) {
            runnerState.freeSlotsInTransferList -= sentResult.filter(item => item.success).length;
          }
        }
        if (step.shouldSkipAfterPurchase) {
          return { skip: true };
        }
      }
    }
    // if (players?.length) {
    //     let player = players[i];
    //     if (bidResult) {
    //       config.credits = bidResult.credits;
    //       if (step.shouldSkipAfterPurchase) {
    //         return ({ skip: true, ...config });
    //       }
    //       if (!movingResult) {
    //         openUTNotification({ text: 'Can`t move to market list. List is full or there was an error. Try loter.', error: true });
    //         return ({ stop: true, ...config });
    //       }
    //       if (step.shouldSellOnMarket) {
    //         const sellResult = await sellPlayer(bidResult?.auctionInfo?.itemData, bidResult?.auctionInfo?.buyNowPrice);
    // (isSentToAuctionHouse) => {
    //   logRunnerSubject.next({
    //     stepId: step.id,
    //     text: `Player ${!isSentToAuctionHouse ? 'wasnt' : 'was'} moved to auction house.`,
    //   });
    // }
    //       }
    //     }
    //   }
    // }
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
