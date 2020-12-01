import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDrop } from 'react-dnd';
import styled from 'styled-components';
import update from 'immutability-helper';
import { FaRegSave } from 'react-icons/fa';

import Step, { DNDStep } from './Step';
import MarkColorPicker from './MarkColorPicker';
import TextField from '../Fields/TextField';
import { DND_TYPES } from '../../../constants';
import { getSearchFilter } from '../../../services/marketSearchCriteria.service';
import {
  createNewScenario,
  addNewStepToScenario,
  copyStepInScenario,
  removeStepFromScenario,
  saveScenario,
  copyScenario,
  deleteScenario,
} from '../../../services/scenario.service';
import { FaRegCopy, FaTrash } from 'react-icons/fa';
import { selectScenarioSubject, editScenarioWithoutSavingSubject } from '../../../contentScript';

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 15px;
  overflow-y: auto;
`;

const ScenarioName = styled.span`
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 25px;
`;

const ScenarioHeader = styled.header`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 15px;
  min-height: 30px;
`;

const Steps = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 10px;
`;

const Hint = styled.span`
  color: grey;
  font-style: italic;
  display: flex;
  align-items: center;
  flex: 1;
  font-size: 20px;
  justify-content: center;
  flex-direction: column;

  > div {
    text-align: center;
  }
`;

const EditNameInput = styled.div`
  width: 125px;
  height: 100%;
  > * {
    height: 100%;
  }
  input {
    background: transparent;
    color: #c7c4c8;
    border: 1px solid #7e43f5;
    border-radius: 3px;
  }
`;

const ScenarioAction = styled.div`
  cursor: pointer;
  font-size: 19px;
  background-color: #7b797b;
  color: white;
  padding: 8px;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #7b797b;
  transition: all 0.5s ease-out;

  margin-right: 10px;

  &:last-child {
    margin-right: 0;
  }

  &:hover {
    border-color: #7b797b;
    background-color: transparent;
  }
`;

const ScenarioActions = styled.div`
  display: flex;
  flex-direction: row;
`;

const ScenarioBuilder = ({ isReadOnly, fromRunner, hint, renderStepStatusBar, activeStepId }) => {
  const [scenario, setScenario] = useState(null);
  const [isNameEditting, setIsNameEditting] = useState(false);
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

  useEffect(() => {
    const selectScenarioSubscription = selectScenarioSubject.subscribe(({ scenario }) => {
      setScenario(scenario);
    });
    return () => {
      selectScenarioSubscription.unsubscribe();
    };
  }, []);

  const removeStep = (id) => {
    const newScenario = removeStepFromScenario(scenario, id);
    setScenario(newScenario);
    editScenarioWithoutSavingSubject.next({ scenario: newScenario });
  };

  const copyStep = (id) => {
    const newScenario = copyStepInScenario(scenario, id);
    setScenario(newScenario);
    editScenarioWithoutSavingSubject.next({ scenario: newScenario });
  };

  const moveStep = (id, atIndex) => {
    const { step, index } = findStep(id);
    const steps = update(scenario.steps, {
      $splice: [
        [index, 1],
        [atIndex, 0, step],
      ],
    });
    const newScenario = {
      ...scenario,
      steps,
    };
    setScenario(newScenario);
    editScenarioWithoutSavingSubject.next({ scenario: newScenario });
  };

  const findStep = (id) => {
    const step = scenario.steps.filter((step) => step.id === id)[0];
    return {
      step,
      index: scenario.steps.indexOf(step),
    };
  };

  const editStep = (editedStep) => {
    const steps = scenario.steps.map((step) => step.id === editedStep.id ? editedStep : step);
    const newScenario = {
      ...scenario,
      steps,
    };
    editScenarioWithoutSavingSubject.next({ scenario: newScenario });
    setScenario(newScenario);
  };

  const setScenarioMarkColor = (markColor) => {
    setScenario({
      ...scenario,
      markColor
    });
  };

  const setScenarioName = (value) => {
    setScenario({
      ...scenario,
      name: value,
    });
  };

  return (
    <Container ref={drop}>
      {scenario?.steps?.length
        ? (
          <>
            <ScenarioHeader>
              <ScenarioName>
                {!isNameEditting && <span onClick={() => setIsNameEditting(!isReadOnly)}>{scenario.name}</span>}
                {isNameEditting && (
                  <EditNameInput>
                    <TextField
                        focusOnInit
                        value={scenario.name}
                        onChange={(e) => {
                          setScenarioName(e.target.value);
                        }}
                        onBlur={() => {
                          setScenarioName(scenario.name || 'Scenario');
                          setIsNameEditting(false);
                        }}
                        placeholder="Scenario name"
                    />
                  </EditNameInput>
                )}
              </ScenarioName>
              {!isReadOnly && (
                <ScenarioActions>
                  <ScenarioAction
                      onClick={async () => {
                        const isSaved = await saveScenario(scenario, fromRunner);
                        if (isSaved && !fromRunner) {
                          setScenario(null);
                        }
                      }}
                  >
                    <FaRegSave/>
                  </ScenarioAction>
                  {scenario.id && !fromRunner && (
                    <>
                      <ScenarioAction
                          onClick={async () => {
                            const isCopied = await copyScenario(scenario);
                            if (isCopied) {
                              setScenario(null);
                            }
                          }}
                      >
                        <FaRegCopy/>
                      </ScenarioAction>
                      <ScenarioAction
                          onClick={async () => {
                            const isDeleted = await deleteScenario(scenario.id);
                            if (isDeleted) {
                              setScenario(null);
                            }
                          }}
                      >
                        <FaTrash/>
                      </ScenarioAction>
                    </>
                  )}
                </ScenarioActions>
              )}
            </ScenarioHeader>
            <MarkColorPicker activeColor={scenario.markColor} onMarkPicked={(value) => setScenarioMarkColor(isReadOnly ? scenario.markColor : value)}/>
            <Steps>
              {scenario.steps.map((step, index) => (
                isReadOnly ? (
                  <Step
                      key={step.id}
                      step={step}
                      index={index}
                      renderStatusBar={renderStepStatusBar}
                      isReadOnly={isReadOnly}
                      isActive={activeStepId === step.id}
                  />
                ) : (
                  <DNDStep
                      edit={editStep}
                      moveStep={moveStep}
                      findStep={findStep}
                      remove={removeStep}
                      copy={copyStep}
                      key={step.id}
                      step={step}
                      renderStatusBar={renderStepStatusBar}
                      index={index}
                      isActive={activeStepId === step.id}
                  />
                )
              ))}
            </Steps>
          </>
        )
        : (
          <Hint>
            {hint ? <div>{hint}</div> : (
              <>
                <div>Drag and drop filter from left side to create worker scenario.</div>
                <div>Or select it in the header to edit.</div>
              </>
            )}
          </Hint>
        )
      }
    </Container>
  );
};

ScenarioBuilder.propTypes = {
  isReadOnly: PropTypes.bool,
  activeStepId: PropTypes.string,
  fromRunner: PropTypes.bool,
  hint: PropTypes.string,
  renderStepStatusBar: PropTypes.func,
};

export default ScenarioBuilder;
