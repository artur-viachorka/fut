import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import TextField from './TextField';
import { parseStringToInt } from '../../../services/string.serivce';
import { COIN_ICON_SRC } from '../../../constants';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 12px;
  color: #868686;
`;

const InputContainer = styled.div`
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

  &.left {
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
  }

  &.right {
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
  }

  &[disabled] {
    background-color: #643acc;
  }
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

export const NumberField = ({
  onChange,
  onBlur,
  onUpdateValueByStep,
  value,
  isReduceDisabled,
  isIncreaseDisabled,
  getStep,
  placeholder,
  imageSource,
  renderIcon,
  label,
  min,
  max,
}) => {
  const updateValueByStep = (increasing) => {
    const parsedValue = parseStringToInt(value) || 0;
    const step = getStep(parsedValue, increasing);
    const newValue = increasing ? parsedValue + step : parsedValue - step;
    onUpdateValueByStep(newValue || null);
  };
  const onBlurHandler = (min != null && max != null && onBlur) ? (e) => {
    let num = parseStringToInt(e.target.value);
    if (num >= max) {
      num = max;
    }
    if (num <= min) {
      num = null;
    }
    onBlur(num);
  } : onBlur;

  return (
    <Container>
      {label && <Label>{label}</Label>}
      <InputContainer>
        {getStep && (
          <StyledButton
              className="left"
              disabled={isReduceDisabled}
              onClick={() => updateValueByStep()}
          >
            -
          </StyledButton>
        )}
        <Main>
          <ImageContainer>
            {imageSource && <img src={COIN_ICON_SRC}/>}
            {!imageSource && renderIcon && renderIcon()}
          </ImageContainer>
          <TextField
              value={value == null ? '' : value}
              type="number"
              placeholder={placeholder}
              onChange={onChange}
              onBlur={onBlurHandler}
          />
        </Main>
        {getStep && (
          <StyledButton
              className="right"
              disabled={isIncreaseDisabled}
              onClick={() => updateValueByStep(true)}
          >
            +
          </StyledButton>
        )}
      </InputContainer>
    </Container>
  );
};

NumberField.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  onBlur : PropTypes.func,
  onUpdateValueByStep: PropTypes.func,
  isReduceDisabled: PropTypes.bool,
  isIncreaseDisabled: PropTypes.bool,
  getStep: PropTypes.func,
  placeholder: PropTypes.string,
  imageSource: PropTypes.string,
  label: PropTypes.string,
  min: PropTypes.number,
  max: PropTypes.number,
  renderIcon: PropTypes.func,
};

export default NumberField;
