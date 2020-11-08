import React, { useState, useEffect, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import styled from 'styled-components';
import { DNDFilter } from './Filter';
import update from 'immutability-helper';

import { getSearchFilters, setSearchFilters } from '../../../services/marketSearchCriteria.service';
import { deleteSearchFilter, editSearchFilterMaxBuy, copySearchFilter } from '../../../services/marketSearchCriteria.service';
import { debounce } from '../../../services/helper.service';
import { addFilterSubject } from '../../../contentScript';
import { DND_TYPES } from '../../constants';

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
  padding: 10px;
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

  const changeFilterMaxBuyDebounced = useCallback(debounce(async (filterId, price) => {
    setFilters(await editSearchFilterMaxBuy(filterId, price));
  }, 0.5), []);

  return (
    <Container ref={drop}>
      {filters && !filters.length && (
        <Hint>
          Use search the transfer market form to add filter
        </Hint>
      )}
      {(filters || []).map((filter) => (
        <DNDFilter
            filter={filter}
            onDelete={async () => setFilters(await deleteSearchFilter(filter.id))}
            onEditMaxBuy={changeFilterMaxBuyDebounced}
            onCopy={async () => setFilters(await copySearchFilter(filter.id))}
            moveFilter={moveFilter}
            findFilter={findFilter}
            onDragAndDropEnd={() => setSearchFilters(filters)}
            key={filter.id}
        />
      ))}
    </Container>
  );
};

export default FiltersList;
