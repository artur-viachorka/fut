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
import { getCredits } from './marketSearchCriteria.service';
import { move } from 'ramda';

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

export const executeStep = async (step, config) => {
  return new Promise((resolve, reject) => {
    let isWorking = true;
    let minBuyNow = config?.minBuyNow || null;
    let minBid = config?.minBid || null;

    pauseRunnerSubject
      .pipe(first())
      .subscribe(() => {
        isWorking = false;
        reject({
          status: RUNNER_STATUS.PAUSE,
          config : { minBuyNow, minBid },
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
        credits,
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
      config.credits = remainingCredits || config.credits;
      if (tooLowCredits) {
        return { skip: true, ...config };
      }
      if (boughtItems?.length) {
        const movedItems = await sendItemsToTransferList(
          boughtItems,
          (movingResult) => logRunnerSubject.next({
            stepId: step.id,
            text: movingResult ? 'Player was moved to transfer list.' : 'Cant move player to transfer list.'
          }),
        );

        if (movedItems?.length) {

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
    //       
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
    return { success: true, ...config };
  } catch (e) {
    console.error('Error in runner', e);
    openUTNotification({ text: e?.errorText || 'Something went wrong in runner. Please, try later.', error: true });
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
