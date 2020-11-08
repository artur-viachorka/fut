import React from 'react';
import PropTypes from 'prop-types';
import { useDrag, useDrop } from 'react-dnd';
import styled from 'styled-components';
import { FaRegCopy, FaTrash } from 'react-icons/fa';

import BuyNowField from '../Fields/BuyNowField';

import { DND_TYPES } from '../../constants';

const Container = styled.div`
  align-items: center;
  position: relative;
  display: flex;
  flex-direction: row;
  width: 100%;
  border-radius: 5px;
  border: 1px solid #414141;
  font-size: 18px;
  text-transform: uppercase;
  margin-bottom: 10px;
`;

const Position = styled.span`

`;

const PlayerInfo = styled.span`
  
`;

const FilterHeader = styled.header`
  margin-bottom: 5px;
  font-size: 13px;
  text-transform: capitalize;
`;

const FIlterTypeImage = styled.img`
  width: 40px;
  height: 40px;
  object-fit: contain;
`;

const AdditionalFilterTypes = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;

  > img {
    margin-right: 10px;
    &:last-child {
      margin-right: 0;
    }
  }
`;

const Main = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 5px;
  height: 100%;
`;

const FilterActions = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 40px;
  padding: 5px;
  border-left: 1px solid #2f2f2f;
  background: #2f2f2f;
  height: 100%;
`;

const FilterAction = styled.span`
  cursor: pointer;
  font-size: 19px;
  background-color: #7b797b;
  color: white;
  padding: 8px;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #7b797b;
  transition: all 0.5s ease-out;

  &:first-child {
    margin-bottom: 10px;
  }

  &:hover {
    border-color: #7b797b;
    background-color: transparent;
  }
`;

const InputContainer = styled.div`
  width: 100%;
  margin-top: 5px;
`;

const Filter = ({ filter, isDragging, drag, drop, onEditMaxBuy, onDelete, onCopy }) => {
  const handleInputChange = (value) => {
    if (onEditMaxBuy) {
      onEditMaxBuy(filter.id, value || null);
    }
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
      <Main>
        {(filter.meta.position || filter.meta.player) && (
          <FilterHeader>
            {filter.meta.position && <Position>{filter.meta.position}</Position>}
            {filter.meta.player && <PlayerInfo>{`${filter.meta.player.name || ''} ${filter.meta.player.rating || ''}`}</PlayerInfo>}
          </FilterHeader>
        )}
        <AdditionalFilterTypes>
          {
            [filter.meta.quality, filter.meta.rarity, filter.meta.nation, filter.meta.league, filter.meta.team]
              .filter(Boolean)
              .map(filterType => <FIlterTypeImage title={filterType.title} key={filterType.title} src={filterType.img} alt={filterType.title}/>)
          }
        </AdditionalFilterTypes>
        <InputContainer>
          <BuyNowField placeholder="Max buy now" value={filter.meta.maxBuy} onChange={handleInputChange}/>
        </InputContainer>
      </Main>
      {(onCopy || onDelete) && (
        <FilterActions>
          {onDelete && (
            <FilterAction title="Remove filter" onClick={() => onDelete(filter.id)}>
              <FaTrash/>
            </FilterAction>
          )}
          {onCopy && (
            <FilterAction title="Copy filter" onClick={async () => onCopy(filter.id)}>
              <FaRegCopy/>
            </FilterAction>
          )}
        </FilterActions>
      )}
    </Container>
  );
};

export const DNDFilter = ({ filter, findFilter, moveFilter, onDragAndDropEnd, onEditMaxBuy, onDelete, onCopy }) => {
  const originalIndex = findFilter(filter.id).index;

  const [{ isDragging }, drag] = useDrag({
    item: { type: DND_TYPES.FILTER, id: filter.id, originalIndex },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (dropResult, monitor) => {
      const { id: droppedId, originalIndex } = monitor.getItem();
      const didDrop = monitor.didDrop();
      if (!didDrop) {
        moveFilter(droppedId, originalIndex);
      } else if (onDragAndDropEnd) {
        onDragAndDropEnd();
      }
    },
  });

  const [, drop] = useDrop({
    accept: DND_TYPES.FILTER,
    canDrop: () => false,
    hover({ id: draggedId }) {
      if (draggedId !== filter.id) {
        const { index: overIndex } = findFilter(filter.id);
        moveFilter(draggedId, overIndex);
      }
    },
  });

  return (
    <Filter
        onEditMaxBuy={onEditMaxBuy}
        onDelete={onDelete}
        onCopy={onCopy}
        drag={drag}
        drop={drop}
        filter={filter}
        isDragging={isDragging}
    />
  );
};

DNDFilter.propTypes = {
  filter: PropTypes.object.isRequired,
  findFilter: PropTypes.func.isRequired,
  moveFilter: PropTypes.func.isRequired,
  onDragAndDropEnd: PropTypes.func,
  onEditMaxBuy: PropTypes.func,
  onDelete: PropTypes.func,
  onCopy: PropTypes.func,
};

Filter.propTypes = {
  filter: PropTypes.object.isRequired,
  onEditMaxBuy: PropTypes.func,
  onDelete: PropTypes.func,
  onCopy: PropTypes.func,
  isDragging: PropTypes.bool,
  drag: PropTypes.func,
  drop: PropTypes.func,
};

export default Filter;
