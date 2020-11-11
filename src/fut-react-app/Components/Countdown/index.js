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

const Countdown = ({ timerSeconds, onTimerPaused, onTimerExceeded, isPaused }) => {
  const [timer, setTimer] = useState(null);
  const isDestroyedRef = useRef(false);

  const pausedRef = useRef(isPaused);
  pausedRef.current = isPaused;

  const startTimer = (func) => {
    const timerResult = func();
    setTimer(timerResult);

    const isTimerExceeded = timerResult.seconds <= 0 && timerResult.hours <= 0 && timerResult.minutes <= 0;

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
      const left = ((timerResult.hours || 0) * 3600) + ((timerResult.minutes || 0) * 60) + timerResult.seconds;
      onTimerPaused(left);
      return;
    }
    setTimeout(startTimer, 1000, func);
  };

  const getTimerHandler = () => {
    let countDownDate = new Date();
    countDownDate.setSeconds(countDownDate.getSeconds() + timerSeconds);
    countDownDate = countDownDate.getTime();
    return () => {
      const now = new Date().getTime();
      const distance = countDownDate - now;
      let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      let seconds = Math.ceil((distance % (1000 * 60)) / 1000);
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
    }
  }, [isPaused]);

  useEffect(() => {
    return () => isDestroyedRef.current = true;
  }, []);

  if (!timer) {
    return null;
  }

  return (
    <Container>
      <div>{`${timer.hours ? `${addZero(timer.hours)}:` : ''}${addZero(timer.minutes)}:${addZero(timer.seconds)}`}</div>
      <Icon>
        <IoIosTimer/>
      </Icon>
    </Container>
  );
};

Countdown.propTypes = {
  timerSeconds: PropTypes.number.isRequired,
  onTimerPaused: PropTypes.func,
  onTimerExceeded: PropTypes.func,
  isPaused: PropTypes.bool,
};

export default Countdown;
