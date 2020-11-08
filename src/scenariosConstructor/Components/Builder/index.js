import React, { useState } from 'react';
import { path } from 'ramda';
import { useDrop } from 'react-dnd';
import styled from 'styled-components';
import { FaTrash } from 'react-icons/fa';
import { uuid } from '../../../services/helper.service';
import { DND_TYPES } from '../../constants';
import { getSearchFilter } from '../../../services/marketSearchCriteria.service';
import Filter from '../Filters/Filter';

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

const Step = styled.div`
  width: 100%;
  margin-bottom: 10px;
`;

const Hint = styled.span`
  font-size: 12px;
  color: grey;
  font-style: italic;
  display: flex;
  align-items: center;
`;

const StepAction = styled.span`
  cursor: pointer;
  font-size: 20px;
`;

const Builder = () => {
  const [scenario, setScenario] = useState(null);
  const [, drop] = useDrop({
    accept: DND_TYPES.FILTER,
    drop: async ({ id }) => {
      const droppedFilter = await getSearchFilter(id);
      if (!droppedFilter) {
        return;
      }
      const newStep = {
        id: uuid(),
        filter: droppedFilter,
      };
      if (scenario) {
        setScenario({
          ...scenario,
          steps: [...(scenario.steps || []), newStep],
        });
      } else {
        setScenario({
          name: 'New Scenario',
          steps: [newStep],
        });
      }
    }
  });

  const removeStep = (id) => {
    const steps = scenario.steps.filter(step => step.id !== id);
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
              <span>Color picker</span>
              <span>clear board</span>
              <span>revert scenario</span>
              <span>save(create/update) scenario</span>
            </ScenarioHeader>
            <Steps>
              {scenario.steps.map(({ filter, id }) => (
                <Step key={id}>
                  <span>work timer</span>
                  <span>Pause after step</span>
                  <span>sell button group (send to market(filter will stop after transferlist maximum), sell buy futbin price, sell buy own price)</span>
                  <Filter filter={filter}/>
                  <StepAction title="Remove step" onClick={() => removeStep(id)}>
                    <FaTrash/>
                  </StepAction>
                </Step>
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

export default Builder;
