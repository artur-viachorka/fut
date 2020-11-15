import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlay, FaPause, FaStop } from 'react-icons/fa';

import ScenarioBuilder from '../ScenarioBuilder/ScenarioBuilder';
import ScenariosList from '../Scenarios/ScenariosList';
import RunnerStepStatus from './RunnerStepStatus';

import { selectScenarioSubject, editStepWithoutSavingSubject } from '../../../contentScript';
import { isScenarioInputsInvalid, checkIsMaxDurationExceeded } from '../../../services/scenario.service';
import {
  executeStep,
  executeStepIdle,
  pauseStep,
  finishStepWork,
  finishStepIdle,
  stopStep,
  RUNNER_STATUS,
} from '../../../services/runner.service';

import CountdownTimer from '../CountdownTimer';
import { convertMinutesToSeconds } from '../../../services/helper.service';

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
  const [runningStep, setRunningStep] = useState(null);
  const [runningStatus, setRunningStatus] = useState(null);
  const [scenarioDurationLeft, setScenarioDurationLeft] = useState(null);

  const resetScenario = (scenario) => {
    scenario = scenario ? {
      ...scenario,
      steps: scenario.steps.map(step => ({
        ...step,
        workingSeconds: convertMinutesToSeconds(step.workingMinutes),
        pauseAfterStepSeconds: convertMinutesToSeconds(step.pauseAfterStep)
      }))
    } : null;
    setSelectedScenario(scenario);
  };

  const stop = () => {
    setRunningStep(null);
    setRunningStatus(null);
    setIsRunning(false);
    setIsPaused(false);
  };

  const getLeftoverSteps = (steps, runningStep, requestIntervalInSeconds) => {
    let stepIndexToStartFrom = steps.findIndex(step => step.id === runningStep?.id);
    stepIndexToStartFrom = stepIndexToStartFrom === -1 ? 0 : stepIndexToStartFrom;
    return steps
      .slice(stepIndexToStartFrom)
      .map((step) => step.id === runningStep?.id ? runningStep : step)
      .filter((step) => step.workingSeconds > requestIntervalInSeconds || (step.workingSeconds <= requestIntervalInSeconds && step.pauseAfterStepSeconds > 0));
  };

  const start = async (runningStep) => {
    const REQUEST_INTERVAL_IN_SECONDS = 2;
    const steps = getLeftoverSteps(selectedScenario.steps, runningStep, REQUEST_INTERVAL_IN_SECONDS);
    const duration = steps
      .reduce((accumulator, step) =>accumulator + (step.workingSeconds <= REQUEST_INTERVAL_IN_SECONDS ? 0 : step.workingSeconds) + step.pauseAfterStepSeconds, 0);
    setScenarioDurationLeft(duration);
    try {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        setRunningStep(step);
        if (step.workingSeconds > REQUEST_INTERVAL_IN_SECONDS) {
          setRunningStatus(RUNNER_STATUS.WORKING);
          await executeStep(step, REQUEST_INTERVAL_IN_SECONDS);
        }
        if (step.pauseAfterStepSeconds > 0) {
          setRunningStatus(RUNNER_STATUS.IDLE);
          await executeStepIdle(step);
        }
      }
      stop();
    } catch (e) {
      if (e?.status === RUNNER_STATUS.STOP) {
        stop();
      }
      console.error(e);
    }
  };

  useEffect(() => {
    const selectScenarioSubscription = selectScenarioSubject.subscribe(({ scenario }) => {
      resetScenario(scenario);
    });
    const editStepWithoutSavingSubscription = editStepWithoutSavingSubject.subscribe(({ scenario }) => {
      resetScenario(scenario);
    });

    return () => {
      selectScenarioSubscription.unsubscribe();
      editStepWithoutSavingSubscription.unsubscribe();
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
                    start();
                  }}
              >
                <FaPlay/>
              </RunnerAction>
            )}
            {isRunning && !isPaused && (
              <RunnerAction
                  title="Pause"
                  onClick={() => {
                    setIsPaused(true);
                  }}
              >
                <FaPause/>
              </RunnerAction>
            )}
            {isRunning && isPaused && (
              <RunnerAction
                  title="Continue"
                  onClick={() => {
                    setIsRunning(true);
                    setIsPaused(false);
                    start(runningStep);
                  }}
              >
                <FaPlay/>
              </RunnerAction>
            )}
            <RunnerAction
                title="Stop"
                disabled={!isRunning}
                onClick={() => {
                  if (isRunning || isPaused) {
                    setIsRunning(false);
                    setIsPaused(false);
                    stopStep();
                    stop();
                  }
                }}
            >
              <FaStop/>
            </RunnerAction>
          </RunnerActions>
          {selectedScenario && isRunning && scenarioDurationLeft && (
            <CountdownTimer
                isPaused={isPaused}
                key={scenarioDurationLeft}
                timerSeconds={scenarioDurationLeft}
            />
          )}
        </RunnerInfo>
      </Header>
      <ScenarioBuilder
          renderStepStatusBar={(step) => {
            const isStepRunning = step.id === runningStep?.id;
            return (
              <RunnerStepStatus
                  isPaused={isPaused}
                  isIdle={isStepRunning && runningStatus === RUNNER_STATUS.IDLE}
                  isWorking={isStepRunning && runningStatus === RUNNER_STATUS.WORKING}
                  idleSeconds={isStepRunning ? runningStep?.pauseAfterStepSeconds : convertMinutesToSeconds(step.pauseAfterStep)}
                  workingSeconds={isStepRunning ? runningStep?.workingSeconds : convertMinutesToSeconds(step.workingMinutes)}
                  isStepRunning={isStepRunning}
                  onWorkingTimerExceeded={() => {
                    finishStepWork(step);
                    setRunningStep({
                      ...runningStep,
                      workingSeconds: 0,
                    });
                  }}
                  onIdleTimerExceeded={() => {
                    finishStepIdle(step);
                    setRunningStep({
                      ...runningStep,
                      pauseAfterStepSeconds: 0,
                    });
                  }}
                  onWorkingTimerPaused={(secondsLeft) => {
                    pauseStep(step);
                    setRunningStep({
                      ...runningStep,
                      workingSeconds: secondsLeft,
                    });
                  }}
                  onIdleTimerPaused={(secondsLeft) => {
                    pauseStep(step);
                    setRunningStep({
                      ...runningStep,
                      pauseAfterStepSeconds: secondsLeft,
                    });
                  }}
              />
            );
          }}
          activeStepId={runningStep?.id}
          hint="Select scenario to manage runner."
          isReadOnly={isRunning || isPaused}
          fromRunner={true}
      />
    </Container>
  );
};

export default Runner;
