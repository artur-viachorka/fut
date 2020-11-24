import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaPlay, FaPause, FaStop } from 'react-icons/fa';
import { BiTransferAlt } from 'react-icons/bi';

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
import { logRunnerSubject } from '../../../services/logger.service';
import { convertMinutesToSeconds } from '../../../services/helper.service';
import { SEARCH_REQUEST_INTERVAL_RANGE_IN_SECONDS, TRANSFER_LIST_LIMIT } from '../../../constants';
import { getTransferListLimit, saveTransferListLimit } from '../../../services/fut.service';
import { parseStringToInt } from '../../../services/string.serivce';
import { openUTNotification } from '../../../services/notification.service';
import { getLoggerForStep } from '../../../services/logger.service';

import CountdownTimer from '../CountdownTimer';
import NumberField from '../Fields/NumberField';

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
`;

const Header = styled.div`
  height: 105px;
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

const Right = styled.div`
  min-width: 250px;
  margin: 10px 0;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: space-between;
`;

const RunnerInfo = styled.div`
  min-width: 250px;
  border: 1px solid #414141;
  border-radius: 5px;
  display: flex;
  padding: 5px;
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
  const runningStepRef = useRef(null);
  runningStepRef.current = runningStep;
  const [logs, setLogs] = useState({});
  const logsRef = useRef({});
  logsRef.current = logs;
  const [runningStatus, setRunningStatus] = useState(null);
  const [scenarioDurationLeft, setScenarioDurationLeft] = useState(null);
  const [transferListLimit, setTransferListLimit] = useState(null);

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

  const updateRunningScenarioDuration = (steps, requestInterval) => {
    const duration = steps
      .reduce((accumulator, step) =>accumulator + (step.workingSeconds <= requestInterval ? 0 : step.workingSeconds) + step.pauseAfterStepSeconds, 0);
    setScenarioDurationLeft(duration);
  };

  const start = async (runningStep, transferLimit) => {
    const requestInterval = SEARCH_REQUEST_INTERVAL_RANGE_IN_SECONDS.to;
    const steps = getLeftoverSteps(selectedScenario.steps, runningStep, requestInterval);
    try {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const logger = getLoggerForStep(step.id);
        setRunningStep(step);
        updateRunningScenarioDuration(steps.slice(i), requestInterval);

        if (step.workingSeconds > requestInterval) {
          setRunningStatus(RUNNER_STATUS.WORKING);
          const executionResult = await executeStep(step, transferLimit, logger);
          if (executionResult?.skip) {
            continue;
          }
          if (executionResult?.stop) {
            break;
          }
        }
        if (step.pauseAfterStepSeconds > 0) {
          setRunningStatus(RUNNER_STATUS.IDLE);
          await executeStepIdle(step);
        }
        logger.logFinishedStep();
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
    const loadTransferListLimit = async () => setTransferListLimit(await getTransferListLimit());
    const selectScenarioSubscription = selectScenarioSubject.subscribe(({ scenario }) => {
      resetScenario(scenario);
    });
    const editStepWithoutSavingSubscription = editStepWithoutSavingSubject.subscribe(({ scenario }) => {
      resetScenario(scenario);
    });

    const loggerSubjectSubscription = logRunnerSubject.subscribe(({ stepId, text }) => {
      if (text) {
        setLogs({
          ...logsRef.current,
          [stepId]: [...(logsRef.current[stepId] || []), text],
        });
      }
    });
    loadTransferListLimit();
    return () => {
      selectScenarioSubscription.unsubscribe();
      editStepWithoutSavingSubscription.unsubscribe();
      loggerSubjectSubscription.unsubscribe();
      stopStep();
    };
  }, []);

  return (
    <Container>
      <Header>
        <ScenariosContainer>
          <ScenariosList isReadOnly={isRunning}/>
        </ScenariosContainer>
        <Right>
          <NumberField
              onChange={(e) => {
                const value = parseStringToInt(e.target.value);
                setTransferListLimit(value);
              }}
              onBlur={async (value) => {
                setTransferListLimit(value);
                await saveTransferListLimit(value);
              }}
              min={TRANSFER_LIST_LIMIT.min}
              max={TRANSFER_LIST_LIMIT.max}
              isReadOnly={isRunning}
              value={transferListLimit}
              isReduceDisabled={transferListLimit <= TRANSFER_LIST_LIMIT.min}
              isIncreaseDisabled={transferListLimit >= TRANSFER_LIST_LIMIT.max}
              onUpdateValueByStep={async (value) => {
                if (value > 0 && value < TRANSFER_LIST_LIMIT.min) {
                  value = TRANSFER_LIST_LIMIT.min;
                }
                setTransferListLimit(value);
                await saveTransferListLimit(value);
              }}
              getStep={() => 5}
              placeholder="Transfer list limit"
              renderIcon={() => <BiTransferAlt/>}
          />
          <RunnerInfo>
            <RunnerActions>
              {!isPaused && !isRunning && (
                <RunnerAction
                    title="Run"
                    disabled={!selectedScenario}
                    onClick={() => {
                      if (!transferListLimit) {
                        return openUTNotification({ text: 'Provide transfer list limit to start runner.', error: true });
                      }
                      if (!selectedScenario || isScenarioInputsInvalid(selectedScenario, true) || checkIsMaxDurationExceeded(selectedScenario, true)) {
                        return;
                      }
                      setLogs({});
                      setIsRunning(true);
                      start(null, transferListLimit);
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
                      start(runningStep, transferListLimit);
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
        </Right>
      </Header>
      <ScenarioBuilder
          renderStepStatusBar={(step) => {
            const isStepRunning = step.id === runningStepRef?.current?.id;
            return (
              <RunnerStepStatus
                  isPaused={isPaused}
                  isIdle={isStepRunning && runningStatus === RUNNER_STATUS.IDLE}
                  isWorking={isStepRunning && runningStatus === RUNNER_STATUS.WORKING}
                  idleSeconds={isStepRunning ? runningStep?.pauseAfterStepSeconds : convertMinutesToSeconds(step.pauseAfterStep)}
                  workingSeconds={isStepRunning ? runningStep?.workingSeconds : convertMinutesToSeconds(step.workingMinutes)}
                  isStepRunning={isStepRunning && isRunning}
                  logs={logs[step.id]}
                  onWorkingTimerExceeded={() => {
                    finishStepWork(step);
                    setRunningStep({
                      ...runningStepRef.current,
                      workingSeconds: 0,
                    });
                  }}
                  onIdleTimerExceeded={() => {
                    finishStepIdle(step);
                    setRunningStep({
                      ...runningStepRef.current,
                      pauseAfterStepSeconds: 0,
                    });
                  }}
                  onWorkingTimerPaused={(secondsLeft) => {
                    pauseStep(step);
                    setRunningStep({
                      ...runningStepRef.current,
                      workingSeconds: secondsLeft,
                    });
                  }}
                  onIdleTimerPaused={(secondsLeft) => {
                    pauseStep(step);
                    setRunningStep({
                      ...runningStepRef.current,
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
