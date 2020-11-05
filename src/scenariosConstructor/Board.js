import React from 'react';
import styled from 'styled-components';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { REACT_CONTAINER_ID } from './constants';
import FiltersList from './FiltersList';
import ScenariosList from './ScenariosList';
import Modal from './Modal';

const Container = styled.div`
  display: flex;
  flex: 1;
`;

const Left = styled.div`
  width: 30%;
  height: 100%;
  background: #1d1d1d;
  border-right: 1px solid #414141;
`;

const Right = styled.div`
  display: flex;
  flex: 1;
  width: 70%;
  flex-direction: column;
`;

const FiltersListContainer = styled.div`
  background: #1d1d1d;
  height: 100px;
  display: flex;
  padding: 5px 10px;
  border-bottom: 1px solid #414141;
`;

const ScenarioConstructor = styled.div`
  display: flex;
  flex: 1;
`;

const Board = () => {
  return (
    <Modal onClose={() => $(`#${REACT_CONTAINER_ID}`).css('display', 'none')}>
      <DndProvider backend={HTML5Backend}>
        <Container>
          <Left>
            <ScenariosList/>
          </Left>
          <Right>
            <FiltersListContainer>
              <FiltersList/>
            </FiltersListContainer>
            <ScenarioConstructor>
              test constructor
            </ScenarioConstructor>
          </Right>
        </Container>
      </DndProvider>
    </Modal>
  );
};

export default Board;
