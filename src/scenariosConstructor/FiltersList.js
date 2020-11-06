import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Filter from './Filter';

import { getSearchFilters } from '../services/marketSearchCriteria.service';
import { addFilterSubject } from '../contentScript';

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
  padding: 15px;
`;

const FiltersList = () => {
  const [filters, setFilters] = useState(null);

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

  return (
    <Container>
      {filters && !filters.length && (
        <Hint>
          Use search the transfer market form to add filter
        </Hint>
      )}
      {(filters || []).map((filter) => (
        <Filter filter={filter} setFilters={setFilters} key={filter.id}/>
      ))}
    </Container>
  );
};

export default FiltersList;
