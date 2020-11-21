import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useDrag, useDrop } from 'react-dnd';
import styled from 'styled-components';
import { AiFillCloseCircle } from 'react-icons/ai';
import { IoIosTimer, IoIosStarOutline } from 'react-icons/io';

import NumberField from '../Fields/NumberField';
import CheckboxField from '../Fields/CheckboxField';
import Filter from '../Filters/Filter';
import { DND_TYPES, STEP_INFO } from '../../../constants';
import { parseStringToInt } from '../../../services/string.serivce';

const Container = styled.div`
  display: flex;
  position: relative;
  flex-direction: row;
  width: 100%;
  height: 160px;
  margin-bottom: 10px;
  border-radius: 3px;
  border: 1px solid ${(props) => props.isActive ? 'rgb(126 67 245)' : 'rgb(45 45 45)'};
  background: rgba(21, 21, 23, 0.88);
  opacity: ${(props) => props.isDragging ? '0' : '1'};
`;

const StepAction = styled.span`
  cursor: pointer;
  font-size: 18px;
  position: absolute;
  right: 3px;
  top: 3px;
`;

const StepNumber = styled.span`
  width: 50px;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 25px;
  background: rgb(45 45 45);
  ${(props) => props.isActive && `
  background: #7e43f5;
`}
`;

const Main = styled.main`
  display: flex;
  flex: 1;
  padding: 0 10px;
  justify-content: space-around;
`;

const Inputs = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 10px;
  padding: 18px;
  justify-content: space-around;
`;

const Row = styled.div`
  width: 100%;
  margin: 3px 0;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;

  &:first-child {
    flex-direction: column;
    flex: 1;
    justify-content: center;
  }
`;

const NumberFieldContainer = styled.div`
  width: 48%;
  min-width: 150px;
  margin: 3px 0;
`;

const FilterContainer = styled.div`
  max-width: 400px;
  display: flex;
  align-items: center;
  > div {
    margin: 0;
    border-color: #6b5897;
  }
`;

const Step = ({ remove, step, index, isDragging, drag, drop, edit, isReadOnly, renderStatusBar, isActive }) => {
  const [pauseAfterStep, setPauseAfterStep] = useState(step.pauseAfterStep);
  const [workingMinutes, setWorkingMinutes] = useState(step.workingMinutes);
  const [rating, setRating] = useState(step.rating);
  const [shouldSellOnMarket, setShouldSellOnMarket] = useState(step.shouldSellOnMarket);
  const [shouldSkipAfterPurchase, setShouldSkipAfterPurchase] = useState(step.shouldSkipAfterPurchase);

  const editWorkingMinutes = (value) => {
    setWorkingMinutes(value);
    edit({
      ...step,
      workingMinutes: value,
    });
  };

  const editRating = (value) => {
    setRating(value);
    edit({
      ...step,
      rating: value,
    });
  };

  const editPauseAfterStep = (value) => {
    setPauseAfterStep(value);
    edit({
      ...step,
      pauseAfterStep: value,
    });
  };

  const editShouldSellOnMarket = (value) => {
    setShouldSellOnMarket(value);
    edit({
      ...step,
      shouldSellOnMarket: value,
    });
  };

  const editShouldSkipAfterPurchase = (value) => {
    setShouldSkipAfterPurchase(value);
    edit({
      ...step,
      shouldSkipAfterPurchase: value,
    });
  };

  const changeFilterMaxBuyDebounced = (price) => {
    edit({
      ...step,
      filter: {
        ...step.filter,
        requestParams: {
          ...step?.filter?.requestParams,
          maxb: price,
        },
        meta: {
          ...step?.filter?.meta,
          maxBuy: price,
        }
      }
    });
  };

  return (
    <Container
        ref={(node) => {
          if (drag && drop) {
            drag(drop(node));
          }
        }}
        isActive={isActive}
        isDragging={isDragging}
    >
      <StepNumber isActive={isActive}>{index + 1}</StepNumber>
      <Main>
        <FilterContainer>
          <Filter isReadOnly={isReadOnly} filter={step.filter} onEditMaxBuy={(filterId, price) => changeFilterMaxBuyDebounced(price)}/>
        </FilterContainer>
        <Inputs>
          <Row>
            <CheckboxField
                label="Automatically Sell on Market"
                checked={!!shouldSellOnMarket}
                onChange={editShouldSellOnMarket}
                isReadOnly={isReadOnly}
            />
            <CheckboxField
                label="Skip Step After Purchase"
                checked={!!shouldSkipAfterPurchase}
                onChange={editShouldSkipAfterPurchase}
                isReadOnly={isReadOnly}
            />
          </Row>
          <Row>
            <NumberFieldContainer>
              <NumberField
                  onChange={(e) => {
                    const value = parseStringToInt(e.target.value);
                    setRating(value);
                  }}
                  onBlur={editRating}
                  min={STEP_INFO.rating.min}
                  max={STEP_INFO.rating.max}
                  isReadOnly={isReadOnly}
                  value={rating}
                  isReduceDisabled={rating <= STEP_INFO.rating.min}
                  isIncreaseDisabled={rating >= STEP_INFO.rating.max}
                  onUpdateValueByStep={(value) => editRating(value < STEP_INFO.rating.min && value > 0 ? STEP_INFO.rating.min : value)}
                  getStep={() => 1}
                  label="Rating"
                  placeholder="Rating"
                  renderIcon={() => <IoIosStarOutline/>}
              />
            </NumberFieldContainer>
            <NumberFieldContainer>
              <NumberField
                  onChange={(e) => {
                    const value = parseStringToInt(e.target.value);
                    setWorkingMinutes(value);
                  }}
                  onBlur={editWorkingMinutes}
                  min={STEP_INFO.workingMinutes.min}
                  max={STEP_INFO.workingMinutes.max}
                  isReadOnly={isReadOnly}
                  value={workingMinutes}
                  isReduceDisabled={workingMinutes <= STEP_INFO.workingMinutes.min}
                  isIncreaseDisabled={workingMinutes >= STEP_INFO.workingMinutes.max}
                  onUpdateValueByStep={editWorkingMinutes}
                  getStep={() => 1}
                  label="Working Minutes *"
                  placeholder="Minutes"
                  renderIcon={() => <IoIosTimer/>}
              />
            </NumberFieldContainer>
            <NumberFieldContainer>
              <NumberField
                  onChange={(e) => {
                    const value = parseStringToInt(e.target.value || null);
                    setPauseAfterStep(value);
                  }}
                  onBlur={editPauseAfterStep}
                  min={STEP_INFO.pauseAfterStep.min}
                  max={STEP_INFO.pauseAfterStep.max}
                  isReadOnly={isReadOnly}
                  value={pauseAfterStep}
                  isReduceDisabled={!pauseAfterStep}
                  isIncreaseDisabled={pauseAfterStep >= STEP_INFO.pauseAfterStep.max}
                  onUpdateValueByStep={editPauseAfterStep}
                  getStep={() => 1}
                  label="Pause after step"
                  placeholder="Minutes"
                  renderIcon={() => <IoIosTimer/>}
              />
            </NumberFieldContainer>
          </Row>
        </Inputs>
        {remove && (
          <StepAction title="Remove step" onClick={() => remove(step.id)}>
            <AiFillCloseCircle/>
          </StepAction>
        )}
      </Main>
      {renderStatusBar && renderStatusBar(step)}
    </Container>
  );
};

export const DNDStep = ({ edit, remove, step, index, onDragAndDropEnd, findStep, moveStep, isReadOnly, renderStatusBar, isActive }) => {
  const originalIndex = findStep(step.id).index;

  const [{ isDragging }, drag] = useDrag({
    item: { type: DND_TYPES.STEP, id: step.id, originalIndex },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (dropResult, monitor) => {
      const { id: droppedId, originalIndex } = monitor.getItem();
      const didDrop = monitor.didDrop();
      if (!didDrop) {
        moveStep(droppedId, originalIndex);
      } else if (onDragAndDropEnd) {
        onDragAndDropEnd();
      }
    },
  });

  const [, drop] = useDrop({
    accept: DND_TYPES.STEP,
    canDrop: () => false,
    hover({ id: draggedId }) {
      if (draggedId !== step.id) {
        const { index: overIndex } = findStep(step.id);
        moveStep(draggedId, overIndex);
      }
    },
  });

  return (
    <Step
        remove={remove}
        drag={drag}
        drop={drop}
        step={step}
        index={index}
        isDragging={isDragging}
        edit={edit}
        isReadOnly={isReadOnly}
        renderStatusBar={renderStatusBar}
        isActive={isActive}
    />
  );
};

DNDStep.propTypes = {
  edit: PropTypes.func,
  remove: PropTypes.func,
  step: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  onDragAndDropEnd: PropTypes.func,
  findStep: PropTypes.func.isRequired,
  moveStep: PropTypes.func.isRequired,
  isReadOnly: PropTypes.bool,
  renderStatusBar: PropTypes.func,
  isActive: PropTypes.bool,
};

Step.propTypes = {
  remove: PropTypes.func,
  step: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  isReadOnly: PropTypes.bool,
  isDragging: PropTypes.bool,
  drag: PropTypes.func,
  drop: PropTypes.func,
  edit: PropTypes.func,
  renderStatusBar: PropTypes.func,
  isActive: PropTypes.bool,
};

export default Step;
