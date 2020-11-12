import { updateExecutableRunnerDataObject } from '../contentScript';
import { convertMinutesToSeconds, convertSecondsToMs } from './helper.service';
import { Subject } from 'rxjs';

const pauseRunnerSubject = new Subject();

const runnerState = {
  currentStepId: null,
};

export const stepSleep = (seconds) => {
  return new Promise((resolve, reject) => {
    let timeout = null;
    const subscription = pauseRunnerSubject.subscribe(() => {
      if (timeout) {
        clearTimeout(timeout);
      }
      reject();
      if (subscription) {
        subscription.unsubscribe();
      }
    });
    setTimeout(resolve, convertSecondsToMs(seconds));
  });
};

export const executeRunner = async (scenario, startFromStepId, runnerJobSecondsLeftForCurrentStep) => {
  const steps = scenario.steps.map(step => ({
    ...step,
    workingSeconds: runnerJobSecondsLeftForCurrentStep && step.id === startFromStepId ? runnerJobSecondsLeftForCurrentStep.workingSecondsLeft : convertMinutesToSeconds(step.workingMinutes),
    pauseAfterStepSeconds: runnerJobSecondsLeftForCurrentStep && step.id === startFromStepId ?runnerJobSecondsLeftForCurrentStep.pauseAfterStepSecondsLeft : convertMinutesToSeconds(step.pauseAfterStep),
  }));
  const stepToStartFrom = steps.find(step => step.id === startFromStepId);
  const foundedIndex = steps.indexOf(stepToStartFrom);
  const stepIndexToStartFrom = foundedIndex === -1 ? 0 : foundedIndex;
  try {
    for (let i = stepIndexToStartFrom; i < steps.length; i++) {
      const step = steps[i];
      runnerState.currentStepId = step.id;
      updateExecutableRunnerDataObject.next({
        currentStepId: step.id,
      });
      await stepSleep(step.workingSeconds);
      await stepSleep(step.pauseAfterStepSeconds);
    }
    runnerState.currentStepId = null;
  } catch (e) {
    console.error('STOPPED');
  }
};

// export const executeStep = async (step) => {
//   console.log('SEARCH PLAYER');
//   await sleep(2000);
//   if ()
// };

export const continueRunner = (scenario, runnerJobSecondsLeft) => {
  executeRunner(scenario, runnerState.currentStepId, runnerJobSecondsLeft[runnerState.currentStepId]);
};

export const pauseRunner = () => {
  pauseRunnerSubject.next();
};

export const stopRunner = () => {
  pauseRunnerSubject.next();
};
