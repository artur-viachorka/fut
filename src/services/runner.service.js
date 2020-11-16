import { searchPlayersOnMarket, buyPlayer, getSearchRequestIntervalInMs } from './fut.service';
import { Subject } from 'rxjs';
import { first } from 'rxjs/operators';

export const pauseRunnerSubject = new Subject();
export const finishWorkingStepSubject = new Subject();
export const finishIdleStepSubject = new Subject();
export const stopRunnerSubject = new Subject();

export const RUNNER_STATUS = {
  WORKING: 'working',
  IDLE: 'idle',
  PAUSE: 'pause',
  STOP: 'stop',
};

export const executeStep = async (step) => {
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
          const players = await searchPlayersOnMarket(step.filter.requestParams);
          if (players?.length) {
            // todo: add logs that players found
            const buyResult = await buyPlayer(players[0]);
            // todo: add logs that players bought or not according to result
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
