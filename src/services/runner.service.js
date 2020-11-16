import { Subject } from 'rxjs';
import { first } from 'rxjs/operators';
import { searchPlayersOnMarket, buyPlayer, getSearchRequestIntervalInMs, calculateMinBuyNow, calculateMaxBid } from './fut.service';
import { BUY_INPUT_SETTINGS, PAUSE_BETWEEN_FOUNDED_RESULT_AND_BUY_REQUEST_IN_SECONDS } from '../constants';
import { sleep } from './helper.service';

export const pauseRunnerSubject = new Subject();
export const finishWorkingStepSubject = new Subject();
export const finishIdleStepSubject = new Subject();
export const stopRunnerSubject = new Subject();
export const logRunnerSubject = new Subject();

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
          const params = { ...step.filter.requestParams };
          if (params.maxb < BUY_INPUT_SETTINGS.useMaxBidApproachBefore) {
            maxBid = calculateMaxBid(maxBid, params.maxb);
          } else {
            minBuyNow = calculateMinBuyNow(minBuyNow, params.maxb);
          }
          if (minBuyNow) {
            params.minb = minBuyNow;
          }
          if (maxBid) {
            params.macr = maxBid;
          }
          const players = await searchPlayersOnMarket(params);

          if (players?.length) {
            logRunnerSubject.next({
              stepId: step.id,
              isPlayerFound: true,
            });
            await sleep(PAUSE_BETWEEN_FOUNDED_RESULT_AND_BUY_REQUEST_IN_SECONDS);
            const buyResult = await buyPlayer(players[0]);

            if (buyResult) {
              if (step.shouldSkipAfterPurchase) {
                resolve({ skip: true });
                return;
              }
              logRunnerSubject.next({
                stepId: step.id,
                isPlayerBought: true,
              });
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
