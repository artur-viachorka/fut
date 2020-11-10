import { uuid } from './helper.service';
import { openUTNotification } from './notification.service';
import { editScenarioSubject } from '../contentScript';
import { saveToStorage, getFromStorage } from './storage.service';

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

const isScenarioInvalid = (scenario) => {
  return scenario.steps.some(step => !step?.filter?.requestParams?.maxb || !step.workingMinutes);
};

export const saveScenario = async (updatedScenario, withoutReseting) => {
  try {
    if (isScenarioInvalid(updatedScenario)) {
      return openUTNotification({ text: 'Max Buy and Working Minutes are required for every step', error: true });
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
    if (isScenarioInvalid(scenarioToCopy)) {
      return openUTNotification({ text: 'Max Buy and Working Minutes are required for every step', error: true });
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
