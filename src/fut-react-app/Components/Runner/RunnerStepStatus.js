import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { setWorkingStatusSubject } from '../../../services/runner.service';

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
  margin-bottom: 25px;
  position: relative;
  ${props => props.withStatus && `
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  `}

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

const WorkingStatus = styled.div`
  position: absolute;
  left: 0px;
  right: 0px;
  background: #643acb;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  text-transform: capitalize;
  bottom: -20px;
  padding: 0px 0px 0px 10px;
  height: 20px;
  align-items: center;
  font-size: 12px;
  display: flex;

  > span {
    white-space: nowrap;
    overflow: hidden;
    color: white;
  }

  > div {
    padding-bottom: 6px;
  }
`;

const Logs = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  font-size: 11px;
`;

const Log = styled.li`
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  
  > *:first-child {
    font-size: 13px;
    ${props => props.success && 'color: #2fa02f;'}
    ${props => props.error && 'color: #9e2424;'}
  }

  > span {
    max-width: 90%;
  }
`;

const AlwaysScrollToBottom = () => {
  const elementRef = useRef();
  useEffect(() => elementRef.current.scrollIntoView());
  return <div ref={elementRef}/>;
};

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
  const [workingStatus, setWorkingStatus] = useState(null);
  useEffect(() => {
    const setWorkingStatusSubjectSubscription = setWorkingStatusSubject.subscribe(({ status }) => {
      setWorkingStatus(status);
    });
    return () => {
      setWorkingStatusSubjectSubscription.unsubscribe();
    };
  }, []);
  return (
    <Container isStepRunning={isStepRunning}>
      {isWorking && (
        <Header withStatus>
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
          <WorkingStatus title={workingStatus}>
            <span>{workingStatus || <Hint>Working Status</Hint>}</span>
            {workingStatus && <Dots/>}
          </WorkingStatus>
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
            <Log success={log.success} error={log.error} key={index} title={log.text}>
              <FaAngleRight/>
              <span>{log.text}</span>
            </Log>
          ))}
          <AlwaysScrollToBottom/>
        </Logs>
      )}
      {!isWorking && !isIdle && !logs?.length && (
        <Hint>Working Logs</Hint>
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
