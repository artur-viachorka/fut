import { convertSecondsToMs, sleep } from './helper.service';
import { searchPlayersOnMarket } from './fut.service';
import { Subject } from 'rxjs';
import { first } from 'rxjs/operators';

const pauseRunnerSubject = new Subject();
const finishWorkingStepSubject = new Subject();
const finishIdleStepSubject = new Subject();
const stopRunnerSubject = new Subject();

export const RUNNER_STATUS = {
  WORKING: 'working',
  IDLE: 'idle',
  PAUSE: 'pause',
  STOP: 'stop',
};

export const executeStep = async (step, requestInterval) => {
  requestInterval = convertSecondsToMs(requestInterval);
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
          await sleep(3);
          setTimeout(work, requestInterval);
        }
      },
      requestInterval,
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
