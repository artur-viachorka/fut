import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlay, FaPause, FaStop } from 'react-icons/fa';

import ScenarioBuilder from '../ScenarioBuilder/ScenarioBuilder';
import ScenariosList from '../Scenarios/ScenariosList';

import { selectScenarioSubject } from '../../../contentScript';

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
`;

const Header = styled.div`
  height: 100px;
  display: flex;
  flex-direction: row;
  border-bottom: 1px solid #414141;
`;

const ScenariosContainer = styled.div`
  display: flex;
  flex: 1;
  padding: 0 10px;
  max-width: 70%;
`;

const RunnerInfo = styled.div`
  min-width: 300px;
  border: 1px solid #414141;
  margin: 10px auto;
  padding: 10px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  flex-direction: row;
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

  useEffect(() => {
    if (selectScenarioSubject) {
      selectScenarioSubject.subscribe(({ scenario }) => {
        setSelectedScenario(scenario);
      });
    }
    return selectScenarioSubject.unsubscribe;
  }, []);

  return (
    <Container>
      <Header>
        <ScenariosContainer>
          <ScenariosList/>
        </ScenariosContainer>
        <RunnerInfo>
          <RunnerActions>
            {!isPaused && !isRunning && (
              <RunnerAction
                  title="Run"
                  onClick={() => setIsRunning(true)}
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
        </RunnerInfo>
      </Header>
      <ScenarioBuilder hint="Select scenario to manage runner." isReadOnly={isRunning || isPaused} fromRunner={true}/>
    </Container>
  );
};

export default Runner;
