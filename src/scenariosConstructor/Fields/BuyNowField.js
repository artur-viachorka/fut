import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import TextField from './TextField';
import { BUY_INPUT_SETTINGS } from '../constants';
import { parseStringToInt } from '../../services/string.serivce';
import { roundNumber } from '../../services/helper.service';
import { COIN_ICON_SRC } from '../../constants';

const Container = styled.div`
  width: 100%;
  height: 35px;
  display: flex;
  flex-direction: row;

  input {
    border-radius: 0;
    border-top: 1px solid #7e42f5;
    border-bottom: 1px solid #7e42f5;
    border-left: 0;
    border-right: 0;
    background-color: transparent;
    color: white;
    padding-right: 30px;
  }
`;

const StyledButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 25px;
  width: 35px;
  background-color: #7e42f5;
  color: #29ffc9;
`;

const ImageContainer = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  width: 30px;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    width: 20px;
    height: 20px;
    object-fit: contain;
  }
`;

const Main = styled.div`
  position: relative;
  display: flex;
  flex: 1;
`;
const getStep = (value, increasing) => {
  let step = BUY_INPUT_SETTINGS.min;
  if (value >= BUY_INPUT_SETTINGS.max && increasing) {
    return 0;
  }
  if (value <= BUY_INPUT_SETTINGS.min && !increasing) {
    return step;
  }
  BUY_INPUT_SETTINGS.steps.forEach((stepInfo, index) => {
    if (value >= stepInfo.min && value <= stepInfo.max) {
      if (!increasing && value === stepInfo.min) {
        const prev = BUY_INPUT_SETTINGS.steps[index - 1];
        step = prev ? prev.step : 0;
        return;
      }
      if (increasing && value === stepInfo.max) {
        const next = BUY_INPUT_SETTINGS.steps[index + 1];
        step = next ? next.step : 0;
        return;
      }
      step = stepInfo.step;
    }
  });
  return step;
};

const getRoundOnValue = (value) => {
  let step = 0;
  BUY_INPUT_SETTINGS.steps.forEach((stepInfo) => {
    if (value >= stepInfo.min && value <= stepInfo.max) {
      step = stepInfo.step;
    }
  });
  return step;
};

export const BuyNowField = ({ value, onChange, placeholder }) => {
  const inputValue = parseStringToInt(value) || '';
  return (
    <Container>
      <StyledButton
          disabled={!value}
          onClick={() => {
            const step = getStep(inputValue, false);
            onChange(inputValue - step);
          }}
      >
        -
      </StyledButton>
      <Main>
        <ImageContainer>
          <img src={COIN_ICON_SRC}/>
        </ImageContainer>
        <TextField
            value={inputValue}
            type="number"
            placeholder={placeholder}
            onChange={(e) => {
              onChange(parseStringToInt(e.target.value));
            }}
            onBlur={(e) => {
              const num = parseStringToInt(e.target.value);
              if (num >= BUY_INPUT_SETTINGS.max) {
                return onChange(BUY_INPUT_SETTINGS.max);
              }
              onChange(roundNumber(num, getRoundOnValue(num)));
            }}
        />
      </Main>
      <StyledButton
          disabled={inputValue >= BUY_INPUT_SETTINGS.max}
          onClick={() => {
            const step = getStep(inputValue, true);
            onChange(inputValue + step);
          }}
      >
        +
      </StyledButton>
    </Container>
  );
};

BuyNowField.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

export default BuyNowField;
