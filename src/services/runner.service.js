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
};

const updateRunnerState = (newState) => {
  runnerState.credits = newState?.credits == null ? runnerState.credits : newState.credits;
  runnerState.freeSlotsInTransferList = newState?.freeSlotsInTransferList == null ? runnerState.freeSlotsInTransferList : newState.freeSlotsInTransferList;
  runnerState.minBuyNow = newState?.minBuyNow;
  runnerState.minBid = newState?.minBid;
};

export const setUserCredits = (coins) => runnerState.credits = coins;

export const syncTradepile = async (transferListLimit) => {
  const tradepile = await syncTransferListItems();
  if (!tradepile) {
    runnerState.freeSlotsInTransferList = null;
  }
  setUserCredits(tradepile.credits);
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

export const executeStep = async (step, storedRunnerState) => {
  return new Promise((resolve, reject) => {
    let isWorking = true;
    updateRunnerState(storedRunnerState);
    pauseRunnerSubject
      .pipe(first())
      .subscribe(() => {
        isWorking = false;
        reject({
          status: RUNNER_STATUS.PAUSE,
          runnerState: { ...runnerState },
        });
      });

    stopRunnerSubject
      .pipe(first())
      .subscribe(() => {
        isWorking = false;
        reject({
          status: RUNNER_STATUS.STOP,
        });
      });

    finishWorkingStepSubject
      .pipe(first())
      .subscribe(({ stepId }) => {
        if (stepId === step.id) {
          isWorking = false;
          resolve();
        }
      });

    setTimeout(
      async function work() {
        if (!isWorking) {
          resolve();
        } else {
          const result = await stepTickHandler(step, runnerState);
          updateRunnerState(result.runnerState);
          if (result?.success) {
            return setTimeout(work, getSearchRequestDelay(true));
          }
          resolve(result);
        }
      },
      getSearchRequestDelay(true),
    );
  });
};

const stepTickHandler = async (step, currentRunningState) => {
  try {
    let params = { ...step.filter.requestParams };
    [currentRunningState.minBuyNow, currentRunningState.minBid] = calculateMinBuyNowAndMinBid(currentRunningState.minBuyNow, currentRunningState.minBid, params.maxb);
    if (currentRunningState.minBuyNow) {
      params.minb = currentRunningState.minBuyNow;
    }
    if (currentRunningState.minBid) {
      params.micr = currentRunningState.minBid;
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
        currentRunningState.credits,
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
      currentRunningState.credits = remainingCredits || currentRunningState.credits;
      if (tooLowCredits) {
        return { skip: true, runnerState: currentRunningState };
      }
      if (boughtItems?.length) {
        if (currentRunningState.freeSlotsInTransferList) {
          const sentResult = await sendItemsToTransferList(
            boughtItems,
            (movingResult) => logRunnerSubject.next({
              stepId: step.id,
              text: movingResult ? 'Player was moved to transfer list.' : 'Cant move player to transfer list.'
            }),
          );
          if (sentResult.length) {
            currentRunningState.freeSlotsInTransferList -= sentResult.filter(item => item.success).length;
          }
        }
        if (step.shouldSkipAfterPurchase) {
          return { skip: true, runnerState: currentRunningState };
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
    return { success: true, runnerState: currentRunningState };
  } catch (e) {
    console.error('Error in runner', e);
    openUTNotification({ text: e?.errorText || 'Something went wrong in runner. Please, try later.', error: true });
    return { stop: true, runnerState: currentRunningState };
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
