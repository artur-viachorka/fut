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
  padding: 15px;
  border-left: 1px solid ${props => props.isStepRunning ? '#7e43f5' : 'rgb(70 70 70)'};
`;

const Hint = styled.span`
  font-size: 12px;
  color: grey;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-self: flex-end;
  width: 100%;
  border-bottom: 1px solid #212121;
  padding-bottom: 2px;

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
      {!isWorking && !isIdle && (
        <Hint>Status Bar</Hint>
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
};

export default RunnerStepStatus;
