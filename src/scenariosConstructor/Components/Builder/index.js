import React, { useState } from 'react';
import { path } from 'ramda';
import { useDrop } from 'react-dnd';
import styled from 'styled-components';
import { AiFillCloseCircle } from 'react-icons/ai';
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
  display: flex;
  position: relative;
  flex-direction: row;
  width: 100%;
  margin-bottom: 10px;
  border-radius: 3px;
  border: 1px solid rgb(45 45 45);
  background: rgba(21, 21, 23, 0.88);
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
  font-size: 18px;
  position: absolute;
  right: -8px;
  top: -8px;
`;

const StepNumber = styled.span`
  width: 50px;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 25px;
  background: rgb(45 45 45);
  margin-right: 10px;
`;

const Main = styled.main`
  display: flex;
  flex: 1;
  padding: 10px;
`;

const FilterContainer = styled.div`
  width: 50%;

  > div {
    margin: 0;
    border-color: #6b5897;
  }
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
              {/* <span>Color picker</span>
              <span>clear board</span>
              <span>revert scenario</span>
              <span>save(create/update) scenario</span> */}
            </ScenarioHeader>
            <Steps>
              {scenario.steps.map(({ filter, id }, index) => (
                <Step key={id}>
                  {/* <span>work timer</span>
                  <span>Pause after step</span>
                  <span>sell button group (send to market(filter will stop after transferlist maximum), sell buy futbin price, sell buy own price)</span> */}
                  <StepNumber>{index + 1}</StepNumber>
                  <Main>
                    <FilterContainer>
                      <Filter filter={filter}/>
                    </FilterContainer>
                    <StepAction title="Remove step" onClick={() => removeStep(id)}>
                      <AiFillCloseCircle/>
                    </StepAction>
                  </Main>
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
