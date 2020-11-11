import { updateExecutableRunnerDataObject } from '../contentScript';
import { getStepDurationInSeconds } from './scenario.service';
import { sleep } from './helper.service';

export const executeScenario = async (scenario) => {
  for (let i = 0; i < scenario.steps.length; i++) {
    const step = scenario.steps[i];
    const duration = getStepDurationInSeconds(step);
    updateExecutableRunnerDataObject.next({
      currentStepId: step.id,
    });
    executeStep(step);
    await sleep(step.workingMinutes * 60);
    if (step.pauseAfterStep) {
      updateExecutableRunnerDataObject.next({
        currentStepId: step.id,
        idle: true,
      });
      await sleep(step.pauseAfterStep * 60);
    }
  }
};

export const executeStep = (step) => {
  console.log(step);
};
