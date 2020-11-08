import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import styled from 'styled-components';
import { uuid } from '../../../services/helper.service';
import { DND_TYPES } from '../../constants';
import { getSearchFilter } from '../../../services/marketSearchCriteria.service';
import Filter from '../Filters/Filter';

const Container = styled.div`
  display: flex;
  flex: 1;
  padding: 15px;
  overflow-y: auto;
`;

const Steps = styled.div`

`;

const Builder = () => {
  const [scenario, setScenario] = useState(null);
  const [, drop] = useDrop({
    accept: DND_TYPES.FILTER,
    drop: async ({ id }) => {
      const droppedFilter = await getSearchFilter(id);
      if (!droppedFilter) {
        return;
      }
      const newStep = {
        id: uuid(),
        filter: droppedFilter,
      };
      if (scenario) {
        setScenario({
          ...scenario,
          steps: [...(scenario.steps || []), newStep],
        });
      } else {
        setScenario({
          name: 'New Scenario',
          steps: [newStep],
        });
      }
    }
  });
  return (
    <Container ref={drop}>
      {scenario
        ? (
          <>
            <header>{scenario.name}</header>
            <Steps>
              {scenario.steps.map(({ filter }) => <Filter key={filter.id} filter={filter}/>)}
            </Steps>
          </>
        )
        : (
          <span>Drop filter on board to build new scenario.</span>
        )
      }
    </Container>
  );
};

export default Builder;
