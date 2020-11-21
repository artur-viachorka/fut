import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { IoIosTimer, IoIosStarOutline } from 'react-icons/io';

import Modal from '../Modals/Modal';
import NumberField from '../Fields/NumberField';
import CheckboxField from '../Fields/CheckboxField';
import { STEP_INFO } from '../../../constants';
import { parseStringToInt } from '../../../services/string.serivce';

const Inputs = styled.div`
  display: flex;
  flex-direction: column;
  padding: 15px 15px 0 15px;
  justify-content: center;
  align-items: center;

  > * {
    margin-bottom: 10px;
    width: 300px;
  }
`;

const Actions = styled.div`
  width: 100%;
  padding: 10px 0 20px 0;
  justify-content: center;
  align-items: center;
  display: flex;
`;

const Button = styled.button`
  width: 90px;
  height: 30px;
  color: white;
  font-size: 13px;
  border-radius: 3px;
  border: 1px solid #7e43f5;
  transition: all 0.5s ease-out;

  &:first-child {
    margin-right: 10px;
  }

  &:hover {
    background: #7e43f5;
  }
`;

const StepSettingsModal = ({ step, isReadOnly, onClose, onSave }) => {
  const [pauseAfterStep, setPauseAfterStep] = useState(step.pauseAfterStep);
  const [workingMinutes, setWorkingMinutes] = useState(step.workingMinutes);
  const [rating, setRating] = useState(step.rating);
  const [shouldSellOnMarket, setShouldSellOnMarket] = useState(step.shouldSellOnMarket);
  const [shouldSkipAfterPurchase, setShouldSkipAfterPurchase] = useState(step.shouldSkipAfterPurchase);

  const save = () => {
    onSave({
      pauseAfterStep,
      workingMinutes,
      rating,
      shouldSellOnMarket,
      shouldSkipAfterPurchase,
    });
  };

  return (
    <Modal width="600px" minHeight="auto" height="auto" onClose={onClose} title="Step Settings">
      <Inputs>
        <CheckboxField
            label="Automatically Sell on Market"
            checked={!!shouldSellOnMarket}
            onChange={setShouldSellOnMarket}
            isReadOnly={isReadOnly}
        />
        <CheckboxField
            label="Skip Step After Purchase"
            checked={!!shouldSkipAfterPurchase}
            onChange={setShouldSkipAfterPurchase}
            isReadOnly={isReadOnly}
        />
        <NumberField
            onChange={(e) => {
              const value = parseStringToInt(e.target.value);
              setWorkingMinutes(value);
            }}
            onBlur={setWorkingMinutes}
            min={STEP_INFO.workingMinutes.min}
            max={STEP_INFO.workingMinutes.max}
            isReadOnly={isReadOnly}
            value={workingMinutes}
            isReduceDisabled={workingMinutes <= STEP_INFO.workingMinutes.min}
            isIncreaseDisabled={workingMinutes >= STEP_INFO.workingMinutes.max}
            onUpdateValueByStep={setWorkingMinutes}
            getStep={() => 1}
            label="Working Minutes *"
            placeholder="Minutes"
            renderIcon={() => <IoIosTimer/>}
        />
        <NumberField
            onChange={(e) => {
              const value = parseStringToInt(e.target.value || null);
              setPauseAfterStep(value);
            }}
            onBlur={setPauseAfterStep}
            min={STEP_INFO.pauseAfterStep.min}
            max={STEP_INFO.pauseAfterStep.max}
            isReadOnly={isReadOnly}
            value={pauseAfterStep}
            isReduceDisabled={!pauseAfterStep}
            isIncreaseDisabled={pauseAfterStep >= STEP_INFO.pauseAfterStep.max}
            onUpdateValueByStep={setPauseAfterStep}
            getStep={() => 1}
            label="Pause after step"
            placeholder="Minutes"
            renderIcon={() => <IoIosTimer/>}
        />
        <NumberField
            onChange={(e) => {
              const value = parseStringToInt(e.target.value);
              setRating(value);
            }}
            onBlur={setRating}
            min={STEP_INFO.rating.min}
            max={STEP_INFO.rating.max}
            isReadOnly={isReadOnly}
            value={rating}
            isReduceDisabled={rating <= STEP_INFO.rating.min}
            isIncreaseDisabled={rating >= STEP_INFO.rating.max}
            onUpdateValueByStep={(value) => setRating(value < STEP_INFO.rating.min && value > 0 ? STEP_INFO.rating.min : value)}
            getStep={() => 1}
            label="Rating"
            placeholder="Rating"
            renderIcon={() => <IoIosStarOutline/>}
        />
      </Inputs>
      <Actions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={save}>Save</Button>
      </Actions>
    </Modal>
  );
};

StepSettingsModal.propTypes = {
  step: PropTypes.object.isRequired,
  isReadOnly: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default StepSettingsModal;
