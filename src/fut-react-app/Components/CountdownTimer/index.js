import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { IoIosTimer } from 'react-icons/io';
import styled from 'styled-components';
import { addZero } from '../../../services/helper.service';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  flex-wrap: wrap;
  color: white;
  font-size: 20px;
  font-weight: 600;
`;

const Icon = styled.span`
  color: white;
  font-size: 28px;
  margin-left: 3px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CountdownTimer = ({ timerSeconds, onTimerPaused, onTimerExceeded, isPaused }) => {
  const [time, setTime] = useState(null);
  const isDestroyedRef = useRef(false);

  const pausedRef = useRef(isPaused);
  pausedRef.current = isPaused;

  const convertTimeToSeconds = (time) => {
    return ((time.hours || 0) * 3600) + ((time.minutes || 0) * 60) + time.seconds;
  };

  const startTimer = (func) => {
    const timeResult = func();
    setTime(timeResult);

    const isTimerExceeded = timeResult.seconds <= 0 && timeResult.hours <= 0 && timeResult.minutes <= 0;

    if (isTimerExceeded) {
      if (onTimerExceeded) {
        onTimerExceeded();
      }
      return;
    }
    if (isDestroyedRef.current) {
      return;
    }
    if (pausedRef.current) {
      if (onTimerPaused) {
        onTimerPaused(convertTimeToSeconds(timeResult));
      }
      return;
    }
    setTimeout(startTimer, 1000, func);
  };

  const getTimerHandler = () => {
    let countDownDate = new Date();
    const left = time ? convertTimeToSeconds(time) : timerSeconds;
    countDownDate.setSeconds(countDownDate.getSeconds() + left);
    countDownDate = countDownDate.getTime();
    return () => {
      const now = new Date().getTime();
      const distance = countDownDate - now;
      let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      let seconds = Math.ceil((distance % (1000 * 60)) / 1000);
      if (seconds === 60) {
        minutes += 1;
        if (minutes >= 60) {
          hours += 1;
          minutes = 0;
        }
        seconds = 0;
      }
      return {
        hours: hours < 0 ? 0 : hours,
        minutes: minutes < 0 ? 0 : minutes,
        seconds: seconds < 0 ? 0 : seconds,
      };
    };
  };

  useEffect(() => {
    if (!isPaused) {
      startTimer(getTimerHandler());
    } else {
      setTime(getTimerHandler()());
    }
  }, [isPaused]);

  useEffect(() => {
    return () => isDestroyedRef.current = true;
  }, []);

  if (!time) {
    return null;
  }

  return (
    <Container>
      <div>{`${time.hours ? `${addZero(time.hours)}:` : ''}${addZero(time.minutes)}:${addZero(time.seconds)}`}</div>
      <Icon>
        <IoIosTimer/>
      </Icon>
    </Container>
  );
};

CountdownTimer.propTypes = {
  timerSeconds: PropTypes.number.isRequired,
  onTimerPaused: PropTypes.func,
  onTimerExceeded: PropTypes.func,
  isPaused: PropTypes.bool,
};

export default CountdownTimer;
