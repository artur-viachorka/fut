import React, { useState, useEffect } from 'react';
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
  const [timerIntervalId, setTimerIntervalId] = useState(null);

  const clearTimerInterval = () => {
    clearInterval(timerIntervalId);
    setTimerIntervalId(null);
  };

  const resetTimerInterval = (func) => {
    const intervalId = setInterval(func, 1000);
    setTimerIntervalId(intervalId);
  };

  const getIntrevalHandler = () => {
    let countDownDate = new Date();
    countDownDate.setSeconds(countDownDate.getSeconds() + timerSeconds);
    countDownDate = countDownDate.getTime();
    return () => {
      const now = new Date().getTime();
      const distance = countDownDate - now;
      let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      let seconds = Math.floor((distance % (1000 * 60)) / 1000);
      if (seconds <= 0 && hours <= 0 && minutes <= 0) {
        if (onTimerExceeded) {
          onTimerExceeded();
        }
        clearTimerInterval();
        hours = 0;
        minutes = 0;
        seconds = 0;
      }
      setTimer({
        hours, minutes, seconds,
      });
    };
  };

  useEffect(() => {
    if (isPaused) {
      clearTimerInterval();
      if (onTimerPaused && timer) {
        const left = ((timer.hours || 0) * 3600) + ((timer.minutes || 0) * 60) + timer.seconds;
        onTimerPaused(left);
      }
    } else {
      resetTimerInterval(getIntrevalHandler());
    }
    return clearTimerInterval;
  }, [isPaused]);

  if (!timer) {
    return null;
  }

  return (
    <Container>
      <div>{`${addZero(timer.hours)}:${addZero(timer.minutes)}:${addZero(timer.seconds)}`}</div>
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
