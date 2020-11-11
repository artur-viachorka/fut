import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { getStepDurationInSeconds } from '../../../services/scenario.service';
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

const RunnerStepStatus = ({ step, isPaused, isStepRunning }) => {
  return (
    <Container>
      <Wrapper isStepRunning={isStepRunning}>
        <CountdownTimer
            isPaused={isPaused || !isStepRunning}
            timerSeconds={getStepDurationInSeconds(step)}
        />
      </Wrapper>
    </Container>
  );
};

RunnerStepStatus.propTypes = {
  step: PropTypes.object.isRequired,
  isPaused: PropTypes.bool,
  isStepRunning: PropTypes.bool,
};

export default RunnerStepStatus;
