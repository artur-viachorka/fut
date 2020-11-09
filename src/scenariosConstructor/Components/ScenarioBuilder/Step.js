import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useDrag, useDrop } from 'react-dnd';
import styled from 'styled-components';
import { AiFillCloseCircle } from 'react-icons/ai';
import { IoIosTimer } from 'react-icons/io';

import NumberField from '../Fields/NumberField';
import CheckboxField from '../Fields/CheckboxField';
import Filter from '../Filters/Filter';
import { DND_TYPES } from '../../constants';
import { parseStringToInt } from '../../../services/string.serivce';

const Container = styled.div`
  display: flex;
  position: relative;
  flex-direction: row;
  width: 100%;
  margin-bottom: 10px;
  border-radius: 3px;
  border: 1px solid rgb(45 45 45);
  background: rgba(21, 21, 23, 0.88);
`;

const StepAction = styled.span`
  cursor: pointer;
  font-size: 18px;
  position: absolute;
  right: -8px;
  top: -8px;
`;

const StepNumber = styled.span`
  width: 50px;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 25px;
  background: rgb(45 45 45);
  margin-right: 10px;
`;

const Main = styled.main`
  display: flex;
  flex: 1;
  padding: 10px;
`;

const Inputs = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  margin-left: 15px;
`;

const Row = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-around;

  &.grow {
    flex: 1;
  }

  > * {
    width: 48%;
  }
`;

const FilterContainer = styled.div`
  width: 50%;
  min-width: 320px;
  > div {
    margin: 0;
    border-color: #6b5897;
  }
`;

const Step = ({ remove, step, index, isDragging, drag, drop, edit }) => {
  const [pauseAfterStep, setPauseAfterStep] = useState(step.pauseAfterStep);
  const [workingHours, setWorkingHours] = useState(step.workingHours);
  const [shouldSellOnMarket, setShouldSellOnMarket] = useState(step.shouldSellOnMarket);

  const editWorkingHours = (value) => {
    setWorkingHours(value);
    edit({
      ...step,
      workingHours: value,
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

  return (
    <Container
        ref={(node) => {
          if (drag && drop) {
            drag(drop(node));
          }
        }}
        style={{ opacity: isDragging ? 0 : 1 }}
    >
      <StepNumber>{index + 1}</StepNumber>
      <Main>
        <FilterContainer>
          <Filter filter={step.filter}/>
        </FilterContainer>
        <Inputs>
          <Row>
            <NumberField
                onChange={(e) => {
                  const value = parseStringToInt(e.target.value);
                  setWorkingHours(value);
                }}
                onBlur={editWorkingHours}
                min={0}
                max={15}
                value={workingHours}
                isReduceDisabled={!workingHours}
                isIncreaseDisabled={workingHours >= 15}
                onUpdateValueByStep={editWorkingHours}
                getStep={() => 1}
                label="Working Hours *"
                placeholder="Minutes"
                renderIcon={() => <IoIosTimer/>}
            />
            <NumberField
                onChange={(e) => {
                  const value = parseStringToInt(e.target.value || null);
                  setPauseAfterStep(value);
                }}
                onBlur={editPauseAfterStep}
                min={0}
                max={50}
                value={pauseAfterStep}
                isReduceDisabled={!pauseAfterStep}
                isIncreaseDisabled={pauseAfterStep >= 50}
                onUpdateValueByStep={editPauseAfterStep}
                getStep={() => 1}
                label="Pause after step"
                placeholder="Minutes"
                renderIcon={() => <IoIosTimer/>}
            />
          </Row>
          <Row className="grow">
            <CheckboxField
                label="Sell on Market"
                checked={!!shouldSellOnMarket}
                onChange={editShouldSellOnMarket}
            />
          </Row>
        </Inputs>
        {remove && (
          <StepAction title="Remove step" onClick={() => remove(step.id)}>
            <AiFillCloseCircle/>
          </StepAction>
        )}
      </Main>
    </Container>
  );
};

export const DNDStep = ({ edit, remove, step, index, onDragAndDropEnd, findStep, moveStep }) => {
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
};

Step.propTypes = {
  remove: PropTypes.func,
  step: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  isDragging: PropTypes.bool,
  drag: PropTypes.func,
  drop: PropTypes.func,
  edit: PropTypes.func,
};

export default Step;
