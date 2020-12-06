import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useDrag, useDrop } from 'react-dnd';
import styled from 'styled-components';
import { AiFillCloseCircle, AiFillEdit } from 'react-icons/ai';
import { IoIosCheckmarkCircle, IoMdCloseCircle } from 'react-icons/io';
import { FaRegCopy } from 'react-icons/fa';

import Filter from '../Filters/Filter';
import { DND_TYPES } from '../../../constants';
import StepSettingsModal from './StepSettingsModal';

const Container = styled.div`
  display: flex;
  position: relative;
  flex-direction: row;
  width: 100%;
  height: 170px;
  min-width: 500px;
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
  justify-content: center;
  padding: 10px;
`;

const FilterContainer = styled.div`
  width: 80%;
  min-width: 230px;
  display: flex;
  align-items: center;
  > div {
    margin: 0;
    border-color: #6b5897;
  }
`;

const Settings = styled.div`
  display: flex;
  flex-direction: column;
  width: auto;
  padding: 10px 15px 0 15px;
  background: #191a1d;
  position: relative;
  min-width: 164px;

  > div {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
    font-size: 12px;
    
    > span {
      &:first-child {
        margin-right: 10px;
      }
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const Setting = styled.div`
  color: ${(props) => props.isValid ? '#29b29b' : '#b22929'};
`;

const Actions = styled.span`
  font-size: 17px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 7px;

  > span {
    margin-right: 5px;
    border: 1px solid #7e43f5;
    padding: 1px;
    border-radius: 7px;
    width: 25px;
    height: 25px;
    justify-content: center;
    display: flex;
    align-items: center;
    transition: 0.5s linear all;
    cursor: pointer;

    &:hover {
      background: #7e43f5;
    }
    ${props => props.isDisabled && `
      color: grey;
      cursor: default;
    `}
    &:last-child {
      margin-right: 0;
    }
  }
`;

const Checkmark = styled.span`
  color: ${(props) => props.isActive ? '#29b29b' : '#b22929'};
`;

const Step = ({ remove, step, copy, index, isDragging, drag, drop, edit, isReadOnly, renderStatusBar, isActive }) => {
  const [isStepSettingsModalVisible, setIsStepSettingsModalVisible] = useState(false);
  const saveStepSettings = (stepSettings) => {
    edit({
      ...step,
      ...stepSettings,
    });
    setIsStepSettingsModalVisible(false);
  };
  const changeFilterMaxBuyDebounced = (price) => {
    edit({
      ...step,
      filter: {
        ...step.filter,
        maxBuy: price,
      }
    });
  };

  return (
    <>
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
        <Settings>
          <Actions title="Copy" isDisabled={isReadOnly}>
            <span onClick={() => copy(step.id)}>
              <FaRegCopy/>
            </span>
            <span title="Edit" onClick={() => !isReadOnly && setIsStepSettingsModalVisible(true)}>
              <AiFillEdit/>
            </span>
          </Actions>
          <div>
            <span>Sell on market</span>
            <Checkmark isActive={step.shouldSellOnMarket}>{step.shouldSellOnMarket ? <IoIosCheckmarkCircle/> : <IoMdCloseCircle/>}</Checkmark>
          </div>
          <div>
            <span>Left in unassign</span>
            <Checkmark isActive={step.leftInUnassign}>{step.leftInUnassign ? <IoIosCheckmarkCircle/> : <IoMdCloseCircle/>}</Checkmark>
          </div>
          <div>
            <span>Skip after purchase</span>
            <Checkmark isActive={step.shouldSkipAfterPurchase}>{step.shouldSkipAfterPurchase ? <IoIosCheckmarkCircle/> : <IoMdCloseCircle/>}</Checkmark>
          </div>
          <Setting isValid={!!step.workingMinutes}>
            <span>Working time *</span>
            <span>{step.workingMinutes ? `${step.workingMinutes} mins` : '-'}</span>
          </Setting>
          <div>
            <span>Pause after step</span>
            <span>{step.pauseAfterStep ? `${step.pauseAfterStep} mins` : '-'}</span>
          </div>
          <div>
            <span>Rating</span>
            <span>{step.rating || '-'}</span>
          </div>
        </Settings>
        <Main>
          <FilterContainer>
            <Filter isReadOnly={isReadOnly} filter={step.filter} onEditMaxBuy={(filterId, price) => changeFilterMaxBuyDebounced(price)}/>
          </FilterContainer>
          {remove && (
            <StepAction title="Remove step" onClick={() => remove(step.id)}>
              <AiFillCloseCircle/>
            </StepAction>
          )}
        </Main>
        {renderStatusBar && renderStatusBar(step)}
      </Container>
      {isStepSettingsModalVisible && <StepSettingsModal step={step} isReadOnly={isReadOnly} onSave={saveStepSettings} onClose={() => setIsStepSettingsModalVisible(false)}/>}
    </>
  );
};

export const DNDStep = ({ edit, remove, copy, step, index, onDragAndDropEnd, findStep, moveStep, isReadOnly, renderStatusBar, isActive }) => {
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
        copy={copy}
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
  copy: PropTypes.func,
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
  copy: PropTypes.func,
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
