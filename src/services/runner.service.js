import { updateExecutableRunnerDataObject } from '../contentScript';
import { convertMinutesToSeconds, convertSecondsToMs } from './helper.service';
import { Subject } from 'rxjs';
import { first } from 'rxjs/operators';

const pauseRunnerSubject = new Subject();
const stopRunnerSubject = new Subject();

export const stepSleep = (currentStepId, seconds) => {
  return new Promise((resolve, reject) => {
    let timeout = null;
    pauseRunnerSubject
      .pipe(first())
      .subscribe(({ status }) => {
        if (timeout) {
          clearTimeout(timeout);
        }
        reject({ status, currentStepId });
      });
    stopRunnerSubject
      .pipe(first())
      .subscribe(({ status }) => {
        if (timeout) {
          clearTimeout(timeout);
        }
        reject({ status });
      });
    timeout = setTimeout(resolve, convertSecondsToMs(seconds));
  });
};

const setTimeOnSteps = (steps, workerTimeLeftOnStep) => {
  return steps.map(step => ({
    ...step,
    workingSeconds: step.id === workerTimeLeftOnStep?.stepId && workerTimeLeftOnStep?.workingSecondsLeft != null ? workerTimeLeftOnStep.workingSecondsLeft : convertMinutesToSeconds(step.workingMinutes),
    pauseAfterStepSeconds: step.id === workerTimeLeftOnStep?.stepId && workerTimeLeftOnStep?.pauseAfterStepSecondsLeft != null ? workerTimeLeftOnStep.pauseAfterStepSecondsLeft : convertMinutesToSeconds(step.pauseAfterStep),
  }));
};

export const EXECUTOR_STATUS = {
  PROGRESS: 'progress',
  IDLE: 'idle',
  PAUSE: 'pause',
  STOP: 'stop',
};

export const executeRunner = async (scenario, workerTimeLeftOnStep) => {
  const steps = setTimeOnSteps(scenario.steps, workerTimeLeftOnStep);
  let stepIndexToStartFrom = steps.findIndex(step => step.id === workerTimeLeftOnStep?.stepId);
  stepIndexToStartFrom = stepIndexToStartFrom === -1 ? 0 : stepIndexToStartFrom;
  try {
    for (let i = stepIndexToStartFrom; i < steps.length; i++) {
      const step = steps[i];
      if (workerTimeLeftOnStep && step.workingSeconds + step.pauseAfterStepSeconds <= 1) {
        continue;
      }
      updateExecutableRunnerDataObject.next({
        currentStepId: step.id,
        status: EXECUTOR_STATUS.PROGRESS,
      });
      await stepSleep(step.id, step.workingSeconds);
      updateExecutableRunnerDataObject.next({
        currentStepId: step.id,
        status: EXECUTOR_STATUS.IDLE,
      });
      await stepSleep(step.id, step.pauseAfterStepSeconds);
    }
    updateExecutableRunnerDataObject.next({
      status: EXECUTOR_STATUS.STOP,
    });
  } catch ({ status, currentStepId }) {
    updateExecutableRunnerDataObject.next({
      status: status,
      currentStepId,
    });
    console.error(status);
  }
};

// export const executeStep = async (step) => {
//   console.log('SEARCH PLAYER');
//   await sleep(2000);
//   if ()
// };

export const continueRunner = (scenario, workerTimeLeftOnStep) => {
  executeRunner(scenario, workerTimeLeftOnStep);
};

export const pauseRunner = () => {
  pauseRunnerSubject.next({ status: EXECUTOR_STATUS.PAUSE });
};

export const stopRunner = () => {
  stopRunnerSubject.next({ status: EXECUTOR_STATUS.STOP });
  updateExecutableRunnerDataObject.next({
    status: EXECUTOR_STATUS.STOP
  });
};
