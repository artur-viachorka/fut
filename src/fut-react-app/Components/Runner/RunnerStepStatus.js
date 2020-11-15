import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { FaAngleRight } from 'react-icons/fa';
import CountdownTimer from '../CountdownTimer';
import Dots from '../Dots';

const Container = styled.div`
  display: flex;
  width: 215px;
  flex-direction: column;
  background: #1e1e20;
  padding: 10px;
  border-left: 1px solid #1e1e20;
`;

const Hint = styled.span`
  font-size: 12px;
  color: grey;
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-self: flex-end;
  width: 100%;
  border-bottom: 1px solid #282238;
  padding: 5px;
  border-radius: 4px;
  background: #282238;
  margin-bottom: 5px;

  > span {
    color: white;
    display: flex;
    align-items: center;
    color: white;
    font-size: 14px;
    height: 20px;

    > title {
      display: flex;
      align-items: center;
      margin-left: 3px;
    }
    
  }

  .countdown-time {
    font-size: 16px;
  }

  .countdown-icon {
    font-size: 20px;
  }
`;

const Logs = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  font-size: 11px;

  > li {
    margin-bottom: 2px;
    display: flex;
    align-items: center;
    text-transform: capitalize;

    > span {
      max-width: 90%;
    }
  }
`;

const RunnerStepStatus = ({
  isPaused,
  isStepRunning,
  isWorking,
  isIdle,
  workingSeconds,
  idleSeconds,
  onWorkingTimerExceeded,
  onWorkingTimerPaused,
  onIdleTimerExceeded,
  onIdleTimerPaused,
  logs,
}) => {
  return (
    <Container isStepRunning={isStepRunning}>
      {isWorking && (
        <Header>
          <span>
            <FaAngleRight/>
            <title>
              {isPaused ? 'Paused' : 'Working'}
              {!isPaused && <Dots/>}
            </title>
          </span>
          <CountdownTimer
              isPaused={isPaused || !isStepRunning}
              onTimerPaused={onWorkingTimerPaused}
              onTimerExceeded={onWorkingTimerExceeded}
              timerSeconds={workingSeconds}
          />
        </Header>
      )}
      {isIdle && (
        <Header>
          <span>
            <FaAngleRight/>
            <title>
              {isPaused ? 'Paused' : 'Idle'}
              {!isPaused && <Dots/>}
            </title>
          </span>
          <CountdownTimer
              isPaused={isPaused || !isStepRunning}
              onTimerPaused={onIdleTimerPaused}
              onTimerExceeded={onIdleTimerExceeded}
              timerSeconds={idleSeconds}
          />
        </Header>
      )}
      {!!logs?.length && (
        <Logs>
          {logs.map((log, index) => (
            <li key={index} title={log}>
              <FaAngleRight/>
              <span>{log}</span>
            </li>
          ))}
        </Logs>
      )}
      {!isWorking && !isIdle && !logs?.length && (
        <Hint>Working Status</Hint>
      )}
    </Container>
  );
};

RunnerStepStatus.propTypes = {
  isPaused: PropTypes.bool,
  isStepRunning: PropTypes.bool,
  isWorking: PropTypes.bool,
  isIdle: PropTypes.bool,
  workingSeconds: PropTypes.number,
  idleSeconds: PropTypes.number,
  onWorkingTimerExceeded: PropTypes.func.isRequired,
  onWorkingTimerPaused: PropTypes.func.isRequired,
  onIdleTimerExceeded: PropTypes.func.isRequired,
  onIdleTimerPaused: PropTypes.func.isRequired,
  logs: PropTypes.arrayOf(PropTypes.string),
};

export default RunnerStepStatus;
