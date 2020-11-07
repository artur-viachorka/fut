import React, { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import styled from 'styled-components';
import Filter from './Filter';
import update from 'immutability-helper';

import { getSearchFilters, setSearchFilters } from '../services/marketSearchCriteria.service';
import { addFilterSubject } from '../contentScript';
import { DND_TYPES } from './constants';

const Hint = styled.span`
  font-size: 12px;
  color: grey;
  font-style: italic;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  height: 100%;
  padding: 15px;
`;

const FiltersList = () => {
  const [filters, setFilters] = useState(null);
  const [, drop] = useDrop({ accept: DND_TYPES.FILTER });

  const loadFilters = async () => {
    setFilters(await getSearchFilters());
  };

  useEffect(() => {
    loadFilters();
    if (addFilterSubject) {
      addFilterSubject.subscribe(() => {
        loadFilters();
      });
    }
    return addFilterSubject.unsubscribe;
  }, []);

  const moveFilter = (id, atIndex) => {
    const { filter, index } = findFilter(id);
    setFilters(update(filters, {
      $splice: [
        [index, 1],
        [atIndex, 0, filter],
      ],
    }));
  };

  const findFilter = (id) => {
    const filter = filters.filter((filter) => filter.id === id)[0];
    return {
      filter,
      index: filters.indexOf(filter),
    };
  };

  return (
    <Container ref={drop}>
      {filters && !filters.length && (
        <Hint>
          Use search the transfer market form to add filter
        </Hint>
      )}
      {(filters || []).map((filter) => (
        <Filter filter={filter} setFilters={setFilters} moveFilter={moveFilter} findFilter={findFilter} onDragAndDropEnd={() => setSearchFilters(filters)} key={filter.id}/>
      ))}
    </Container>
  );
};

export default FiltersList;
