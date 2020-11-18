import React, { useState } from 'react';
import PropTypes from 'prop-types';
import NumberField from './NumberField';
import { COIN_ICON_SRC, BUY_INPUT_SETTINGS } from '../../../constants';
import { parseStringToInt } from '../../../services/string.serivce';
import { roundNumber } from '../../../services/helper.service';

const getRoundOnValue = (value) => {
  let step = 0;
  BUY_INPUT_SETTINGS.steps.forEach((stepInfo) => {
    if (value >= stepInfo.min && value <= stepInfo.max) {
      step = stepInfo.step;
    }
  });
  return step;
};

export const BuyNowField = ({ value, onChange, placeholder, isReadOnly }) => {
  const [buyNowValue, setBuyNowValue] = useState(value);

  const updateValue = (num) => {
    num = num ? roundNumber(num, getRoundOnValue(num)) : null;
    setBuyNowValue(num);
    onChange(num);
  };

  const getFutPriceStep = (value, increasing) => {
    let step = BUY_INPUT_SETTINGS.priceInputRange.min;
    if (value >= BUY_INPUT_SETTINGS.priceInputRange.max && increasing) {
      return 0;
    }
    if (value <= BUY_INPUT_SETTINGS.priceInputRange.min && !increasing) {
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

  return (
    <NumberField
        onChange={(e) => setBuyNowValue(parseStringToInt(e.target.value) || null)}
        min={BUY_INPUT_SETTINGS.priceInputRange.min}
        max={BUY_INPUT_SETTINGS.priceInputRange.max}
        onBlur={updateValue}
        onUpdateValueByStep={updateValue}
        value={buyNowValue}
        isReduceDisabled={!buyNowValue}
        isIncreaseDisabled={buyNowValue >= BUY_INPUT_SETTINGS.max}
        getStep={getFutPriceStep}
        placeholder={placeholder}
        imageSource={COIN_ICON_SRC}
        isReadOnly={isReadOnly}
    />
  );
};

BuyNowField.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isReadOnly: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

export default BuyNowField;
