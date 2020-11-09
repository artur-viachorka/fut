import React, { useState } from 'react';
import { path } from 'ramda';
import { useDrop } from 'react-dnd';
import styled from 'styled-components';
import update from 'immutability-helper';

import { DNDStep } from './Step';
import { DND_TYPES } from '../../constants';
import { getSearchFilter } from '../../../services/marketSearchCriteria.service';
import { createNewScenario, addNewStepToScenario, removeStepFromScenario } from '../../../services/scenario.service';

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 15px;
  overflow-y: auto;
`;

const ScenarioHeader = styled.header`
  margin-bottom: 10px;
  font-size: 15px;
`;

const Steps = styled.div`
  display: flex;
  flex-direction: column;
`;

const Hint = styled.span`
  font-size: 12px;
  color: grey;
  font-style: italic;
  display: flex;
  align-items: center;
`;

const ScenarioBuilder = () => {
  const [scenario, setScenario] = useState(null);
  const [, drop] = useDrop({
    accept: [DND_TYPES.FILTER, DND_TYPES.STEP],
    drop: async ({ id }, monitor) => {
      if (monitor.getItemType() === DND_TYPES.STEP) {
        return;
      }
      const droppedFilter = await getSearchFilter(id);
      if (!droppedFilter) {
        return;
      }
      if (scenario) {
        setScenario(addNewStepToScenario(scenario, droppedFilter));
      } else {
        setScenario(createNewScenario(droppedFilter));
      }
    }
  });

  const removeStep = (id) => {
    setScenario(removeStepFromScenario(scenario, id));
  };

  const moveStep = (id, atIndex) => {
    const { step, index } = findStep(id);
    const steps = update(scenario.steps, {
      $splice: [
        [index, 1],
        [atIndex, 0, step],
      ],
    });
    setScenario({
      ...scenario,
      steps,
    });
  };

  const findStep = (id) => {
    const step = scenario.steps.filter((step) => step.id === id)[0];
    return {
      step,
      index: scenario.steps.indexOf(step),
    };
  };

  const editStep = (edittedStep) => {
    const steps = scenario.steps.map((step) => step.id === edittedStep.id ? edittedStep : step);
    setScenario({
      ...scenario,
      steps,
    });
  };

  return (
    <Container ref={drop}>
      {path(['steps', 'length'], scenario || {})
        ? (
          <>
            <ScenarioHeader>
              <span>{scenario.name}</span>
              {/* <span>Color picker</span>
              <span>clear board</span>
              <span>revert scenario</span>
              <span>save(create/update) scenario</span> */}
            </ScenarioHeader>
            <Steps>
              {scenario.steps.map((step, index) => (
                <DNDStep
                    edit={editStep}
                    moveStep={moveStep}
                    findStep={findStep}
                    remove={removeStep}
                    key={step.id}
                    step={step}
                    index={index}
                />
              ))}
            </Steps>
          </>
        )
        : (
          <Hint>Drop filter on board to build new scenario.</Hint>
        )
      }
    </Container>
  );
};

export default ScenarioBuilder;
