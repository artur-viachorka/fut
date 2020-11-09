import React from 'react';
import styled from 'styled-components';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { REACT_CONTAINER_ID } from '../constants';
import FiltersList from './Filters/FiltersList';
import ScenariosList from './Scenarios/ScenariosList';
import ScenarioBuilder from './ScenarioBuilder/ScenarioBuilder';
import Modal from './Modal';

const Container = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const Left = styled.div`
  width: 30%;
  height: 100%;
  min-width: 330px;
  border-right: 1px solid #414141;
  overflow-y: auto;
`;

const Right = styled.div`
  display: flex;
  flex: 1;
  width: 70%;
  flex-direction: column;
`;

const RightHeader = styled.div`
  height: 100px;
  display: flex;
  padding: 5px 10px;
  border-bottom: 1px solid #414141;
`;

const Board = () => {
  return (
    <Modal onClose={() => $(`#${REACT_CONTAINER_ID}`).css('display', 'none')}>
      <DndProvider backend={HTML5Backend}>
        <Container>
          <Left>
            <FiltersList/>
          </Left>
          <Right>
            <RightHeader>
              <ScenariosList/>
            </RightHeader>
            <ScenarioBuilder/>
          </Right>
        </Container>
      </DndProvider>
    </Modal>
  );
};

export default Board;
