import { Subject } from 'rxjs';
import { first } from 'rxjs/operators';
import {
  searchPlayersOnMarket,
  buyPlayer,
  sellPlayer,
  sendItemToTransferList,
  getSearchRequestIntervalInMs,
  calculateMinBuyNow,
} from './fut.service';
import { openUTNotification } from './notification.service';
import { getCredits } from './marketSearchCriteria.service';

export const pauseRunnerSubject = new Subject();
export const finishWorkingStepSubject = new Subject();
export const finishIdleStepSubject = new Subject();
export const stopRunnerSubject = new Subject();
export const logRunnerSubject = new Subject();

let credits = null;

export const setUserCredits = () => credits = getCredits();

export const RUNNER_STATUS = {
  WORKING: 'working',
  IDLE: 'idle',
  PAUSE: 'pause',
  STOP: 'stop',
};

export const executeStep = async (step) => {
  return new Promise((resolve, reject) => {
    let isWorking = true;
    let minBuyNow = null;
    let maxBid = null;

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
          let params = { ...step.filter.requestParams };
          minBuyNow = calculateMinBuyNow(minBuyNow, params.maxb);
          if (minBuyNow) {
            params.minb = minBuyNow;
          }
          if (maxBid) {
            params.macr = maxBid;
          }
          const player = await searchPlayersOnMarket(params);
          if (player) {
            logRunnerSubject.next({
              stepId: step.id,
              isPlayerFound: true,
              meta: {
                buyNowPrice: player.buyNowPrice,
              }
            });
            if (credits < player.buyNowPrice) {
              logRunnerSubject.next({
                stepId: step.id,
                isNotEnoughCredits: true,
                meta: {
                  buyNowPrice: player.buyNowPrice,
                }
              });
              resolve({ skip: true });
              return;
            }

            const bidResult = await buyPlayer(player);

            logRunnerSubject.next({
              stepId: step.id,
              isPlayerBought: !!bidResult,
              meta: {
                buyNowPrice: bidResult?.auctionInfo?.buyNowPrice,
              }
            });
            if (bidResult) {
              credits = bidResult.credits;
              if (step.shouldSkipAfterPurchase) {
                resolve({ skip: true });
                return;
              }
              const movingResult = await sendItemToTransferList(bidResult?.auctionInfo?.itemData);
              logRunnerSubject.next({
                stepId: step.id,
                movedToTransferList: !!movingResult,
              });
              if (!movingResult) {
                openUTNotification({ text: 'Can`t move to market list. List is full or there was an error. Try loter.', error: true });
                resolve({ stop: true });
                return;
              }
              if (step.shouldSellOnMarket && movingResult?.itemId) {
                await sellPlayer(movingResult?.itemId);
              }
            }
          }
          setTimeout(work, getSearchRequestIntervalInMs());
        }
      },
      getSearchRequestIntervalInMs(),
    );
  });
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
