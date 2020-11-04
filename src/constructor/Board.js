import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import FiltersList from './FiltersList';

const Board = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <FiltersList/>
    </DndProvider>
  );
};

export default Board;
