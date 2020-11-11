import { uuid } from './helper.service';
import { openUTNotification } from './notification.service';
import { editScenarioSubject } from '../contentScript';
import { saveToStorage, getFromStorage } from './storage.service';
import { MAX_SCENARIO_DURATION_IN_HOURS } from '../fut-react-app/constants';

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

export const getScenarios = async () => {
  const { scenarios } = await getFromStorage('scenarios');
  return scenarios || [];
};

export const isScenarioInputsInvalid = (scenario, shouldNotify) => {
  const isInvalid = scenario.steps.some(step => !step?.filter?.requestParams?.maxb || !step.workingMinutes);
  if (isInvalid && shouldNotify) {
    openUTNotification({ text: 'Max Buy and Working Minutes are required for every step', error: true });
  }
  return isInvalid;
};

export const checkIsMaxDurationExceeded = (scenario, shouldNotify) => {
  const isInvalid = getScenarioDurationInSeconds(scenario) / 3600 > MAX_SCENARIO_DURATION_IN_HOURS;
  if (isInvalid && shouldNotify) {
    openUTNotification({ text: `Scenario duration is too long. Max duration is ${MAX_SCENARIO_DURATION_IN_HOURS} hours`, error: true });
  }
  return isInvalid;
};

export const saveScenario = async (updatedScenario, withoutReseting) => {
  try {
    if (isScenarioInputsInvalid(updatedScenario, true) || checkIsMaxDurationExceeded(updatedScenario, true)) {
      return;
    }
    let scenarios = await getScenarios();
    const existingScenario = scenarios.find(scenario => scenario.id === updatedScenario.id);
    if (existingScenario) {
      scenarios = scenarios.map(scenario => scenario.id === updatedScenario.id ? updatedScenario : scenario);
      openUTNotification({ text: 'Scenario was successfully edited', success: true });
    } else {
      scenarios = [{ id: uuid(), ...updatedScenario }, ...scenarios];
      openUTNotification({ text: 'Scenario was successfully created', success: true });
    }
    await setScenarios(scenarios);
    editScenarioSubject.next({ withoutReseting });
    return true;
  } catch (e) {
    console.error(e);
    openUTNotification({ text: 'There was an error while saving scenario. Try later.', error: true });
    return false;
  }
};

export const setScenarios = async (scenarios) => {
  await saveToStorage({ scenarios });
};

export const getScenarioDurationInSeconds = (scenario) => {
  return (scenario?.steps || []).reduce((accumulator, step) => accumulator + step.workingMinutes + (step.pauseAfterStep || 0), 0) * 60;
};

export const deleteScenario = async (scenarioId) => {
  try {
    let scenarios = await getScenarios();
    scenarios = scenarios.filter(scenario => scenario.id !== scenarioId);
    await saveToStorage({
      scenarios,
    });
    openUTNotification({ text: 'Scenario was successfully deleted', success: true });
    editScenarioSubject.next();
    return true;
  } catch (e) {
    console.error(e);
    openUTNotification({ text: 'There was an error while deleting scenario. Try later.', error: true });
    return false;
  }
};

export const copyScenario = async (scenarioToCopy) => {
  try {
    if (isScenarioInputsInvalid(scenarioToCopy, true) || checkIsMaxDurationExceeded(scenarioToCopy, true)) {
      return;
    }
    let scenarios = await getScenarios();
    if (scenarioToCopy?.id) {
      scenarios = [{
        ...scenarioToCopy,
        steps: scenarioToCopy.steps.map(step => ({
          ...step,
          id: uuid(),
        })),
        id: uuid(),
      }, ...scenarios];
      await saveToStorage({
        scenarios
      });
      openUTNotification({ text: 'Scenario was successfully copied', success: true });
      editScenarioSubject.next();
      return true;
    }
    return false;
  } catch (e) {
    console.error(e);
    openUTNotification({ text: 'There was an error while copying scenario. Try later.', error: true });
    return false;
  }
};
