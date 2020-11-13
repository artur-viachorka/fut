import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import CountdownTimer from '../CountdownTimer';

const Container = styled.div`
  display: flex;
  flex: 1;
  margin: 10px;
  min-width: 200px;
`;

const Wrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 15px;
  border: 1px solid ${props => props.isStepRunning ? '#7e43f5' : 'rgb(70 70 70)'};
  border-radius: 5px;
`;

const Hint = styled.span`
  font-size: 12px;
  color: grey;
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
    <Container>
      <Wrapper isStepRunning={isStepRunning}>
        {!isWorking && !isIdle && (
          <Hint>Status Bar</Hint>
        )}
        {isWorking && (
          <>
            <CountdownTimer
                isPaused={isPaused || !isStepRunning}
                onTimerPaused={onWorkingTimerPaused}
                onTimerExceeded={onWorkingTimerExceeded}
                timerSeconds={workingSeconds}
            />
            <span>working...</span>
          </>
        )}
        {isIdle && (
          <>
            <CountdownTimer
                isPaused={isPaused || !isStepRunning}
                onTimerPaused={onIdleTimerPaused}
                onTimerExceeded={onIdleTimerExceeded}
                timerSeconds={idleSeconds}
            />
            <span>idle...</span>
          </>
        )}
      </Wrapper>
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
