import { Subject } from 'rxjs';
import { first } from 'rxjs/operators';
import {
  searchPlayersOnMarket,
  buyPlayer,
  sellPlayer,
  sendItemToTransferList,
  getSearchRequestDelay,
  calculateMinBuyNowAndMinBid,
} from './fut.service';
import { openUTNotification } from './notification.service';
import { getCredits } from './marketSearchCriteria.service';

export const pauseRunnerSubject = new Subject();
export const finishWorkingStepSubject = new Subject();
export const finishIdleStepSubject = new Subject();
export const stopRunnerSubject = new Subject();
export const logRunnerSubject = new Subject();

let credits = null;

export const setUserCredits = (coins) => credits = coins || getCredits();

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
    let minBid = null;

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
          const result = await stepTickHandler(step, { minBuyNow, credits, minBid });
          credits = result?.credits == null ? credits : result.credits;
          minBuyNow = result?.minBuyNow == null ? minBuyNow : result.minBuyNow;
          minBid = result?.minBid == null ? minBid : result.minBid;
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

const stepTickHandler = async (step, config) => {
  try {
    let params = { ...step.filter.requestParams };
    [config.minBuyNow, config.minBid] = calculateMinBuyNowAndMinBid(config.minBuyNow, config.minBid, params.maxb);
    if (config.minBuyNow) {
      params.minb = config.minBuyNow;
    }
    if (config.minBid) {
      params.micr = config.minBid;
    }
    const player = await searchPlayersOnMarket(params, step);
    if (player) {
      logRunnerSubject.next({
        stepId: step.id,
        isPlayerFound: true,
        meta: {
          buyNowPrice: player.buyNowPrice,
        }
      });
      if (config.credits < player.buyNowPrice) {
        logRunnerSubject.next({
          stepId: step.id,
          isNotEnoughCredits: true,
          meta: {
            buyNowPrice: player.buyNowPrice,
          }
        });
        return { skip: true, ...config };
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
        config.credits = bidResult.credits;
        if (step.shouldSkipAfterPurchase) {
          return ({ skip: true, ...config });
        }
        const movingResult = await sendItemToTransferList(bidResult?.auctionInfo?.itemData);
        logRunnerSubject.next({
          stepId: step.id,
          movedToTransferList: !!movingResult,
        });
        if (!movingResult) {
          openUTNotification({ text: 'Can`t move to market list. List is full or there was an error. Try loter.', error: true });
          return ({ stop: true, ...config });
        }
        if (step.shouldSellOnMarket && movingResult?.itemId) {
          await sellPlayer(movingResult?.itemId);
        }
      }
    }
    return { success: true, ...config };
  } catch (e) {
    console.error('Error in runner', e);
    return { stop: true, ...config };
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
