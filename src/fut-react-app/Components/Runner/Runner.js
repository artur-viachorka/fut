import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlay, FaPause, FaStop } from 'react-icons/fa';

import ScenarioBuilder from '../ScenarioBuilder/ScenarioBuilder';
import ScenariosList from '../Scenarios/ScenariosList';
import RunnerStepStatus from './RunnerStepStatus';

import { selectScenarioSubject, editStepWithoutSavingSubject, updateExecutableRunnerDataObject } from '../../../contentScript';
import { getScenarioDurationInSeconds, isScenarioInputsInvalid, checkIsMaxDurationExceeded } from '../../../services/scenario.service';
import { executeScenario } from '../../../services/runner.service';

import CountdownTimer from '../CountdownTimer';

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
`;

const Header = styled.div`
  height: 100px;
  display: flex;
  padding-right: 10px;
  flex-direction: row;
  justify-content: space-between;
  border-bottom: 1px solid #414141;
`;

const ScenariosContainer = styled.div`
  display: flex;
  padding: 0 10px;
  overflow: hidden;
`;

const RunnerInfo = styled.div`
  min-width: 250px;
  border: 1px solid #414141;
  margin: 10px 0;
  padding: 10px 25px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
`;

const RunnerAction = styled.div`
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

  &[disabled] {
    border-color: grey;
    color: grey;
    background-color: transparent;
    cursor: default;
  }
`;

const RunnerActions = styled.div`
  display: flex;
  flex-direction: row;
`;

const Runner = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [selectedScenario, setSelectedScenario] = useState(null);
  const [executableRunnerData, setExecutableRunnerData] = useState(null);

  const resetScenario = (scenario) => {
    setSelectedScenario(scenario);
  };

  useEffect(() => {
    const selectScenarioSubscription = selectScenarioSubject.subscribe(({ scenario }) => {
      resetScenario(scenario);
    });
    const editStepWithoutSavingSubscription = editStepWithoutSavingSubject.subscribe(({ scenario }) => {
      resetScenario(scenario);
    });

    const updateExecutableRunnerDataSubscription = updateExecutableRunnerDataObject.subscribe((runner) => {
      setExecutableRunnerData(runner);
    });

    return () => {
      selectScenarioSubscription.unsubscribe();
      editStepWithoutSavingSubscription.unsubscribe();
      updateExecutableRunnerDataSubscription.unsubscribe();
    };
  }, []);

  return (
    <Container>
      <Header>
        <ScenariosContainer>
          <ScenariosList isReadOnly={isRunning}/>
        </ScenariosContainer>
        <RunnerInfo>
          <RunnerActions>
            {!isPaused && !isRunning && (
              <RunnerAction
                  title="Run"
                  disabled={!selectedScenario}
                  onClick={() => {
                    if (!selectedScenario || isScenarioInputsInvalid(selectedScenario, true) || checkIsMaxDurationExceeded(selectedScenario, true)) {
                      return;
                    }
                    setIsRunning(true);
                    executeScenario(selectedScenario);
                  }}
              >
                <FaPlay/>
              </RunnerAction>
            )}
            {isRunning && !isPaused && (
              <RunnerAction
                  title="Pause"
                  onClick={() => setIsPaused(true)}
              >
                <FaPause/>
              </RunnerAction>
            )}
            {isRunning && isPaused && (
              <RunnerAction
                  title="Continue"
                  onClick={() => setIsPaused(false)}
              >
                <FaPlay/>
              </RunnerAction>
            )}
            <RunnerAction
                title="Stop"
                disabled={!isRunning}
                onClick={() => {
                  if (isRunning || isPaused) {
                    setIsPaused(false);
                    setIsRunning(false);
                  }
                }}
            >
              <FaStop/>
            </RunnerAction>
          </RunnerActions>
          {selectedScenario && isRunning && (
            <CountdownTimer
                isPaused={isPaused}
                timerSeconds={getScenarioDurationInSeconds(selectedScenario)}
                onTimerExceeded={() => {
                  setIsRunning(false);
                  setIsPaused(false);
                }}
            />
          )}
        </RunnerInfo>
      </Header>
      <ScenarioBuilder
          renderStepStatusBar={(step) => (
            <RunnerStepStatus
                isPaused={isPaused}
                isStepRunning={isRunning && step.id === executableRunnerData?.currentStepId}
                step={step}
            />
          )}
          hint="Select scenario to manage runner."
          isReadOnly={isRunning || isPaused}
          fromRunner={true}
      />
    </Container>
  );
};

export default Runner;
