import React from 'react';
import styled from 'styled-components';

import FiltersList from '../Filters/FiltersList';
import ScenariosList from '../Scenarios/ScenariosList';
import ScenarioBuilder from './ScenarioBuilder';

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
  overflow: hidden;
`;

const Right = styled.div`
  display: flex;
  flex: 1;
  width: 70%;
  overflow: hidden;
  flex-direction: column;
`;

const RightHeader = styled.div`
  height: 100px;
  display: flex;
  padding: 5px 10px;
  border-bottom: 1px solid #414141;
`;

const ScenarioBuilderContainer = () => {
  return (
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
  );
};

export default ScenarioBuilderContainer;
