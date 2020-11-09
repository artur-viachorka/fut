import { uuid } from './helper.service';

export const createNewScenario = (filter) => {
  const newStep = {
    id: uuid(),
    filter,
  };
  return {
    name: 'New Scenario',
    steps: [newStep],
  };
};

export const addNewStepToScenario = (scenario, filter) => {
  const newStep = {
    id: uuid(),
    filter,
  };
  return {
    ...scenario,
    steps: scenario.steps.concat(newStep),
  };
};

export const removeStepFromScenario = (scenario, stepId) => {
  const steps = scenario.steps.filter(step => step.id !== stepId);
  return {
    ...scenario,
    steps,
  };
};
