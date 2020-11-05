import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getFromStorage } from '../services/storage.service';
import { getFirstSymbols } from '../services/string.serivce';

import { EXTENSION_ACTIONS } from '../constants';

import { Tooltip } from '@material-ui/core';

const Hint = styled.span`
  font-size: 12px;
  color: grey;
  font-style: italic;
`;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex: 1;
  overflow-x: auto;
`;

const Filter = styled.div`
  align-items: center;
  justify-content: center;
  display: flex;
  flex-wrap: wrap;
  min-width: 75px;
  min-height: 75px;
  border-radius: 50%;
  background: #124738;
  font-size: 18px;
  text-transform: uppercase;
  overflow: hidden;
  margin-right: 10px;

  &:last-child {
    margin-right: 0;
  }
`;

const FiltersList = () => {
  const [filters, setFilters] = useState([]);
  const loadFilters = async () => {
    const { filters } = await getFromStorage('filters');
    setFilters(filters || []);
  };

  useEffect(() => {
    loadFilters();
  }, []);

  return (
    <Container>
      {!filters.length && (
        <Hint>
          Use search the transfer market form to add filter
        </Hint>
      )}
      {filters.map((filter) => (
        <Tooltip key={filter.id} title={<span>Info</span>}>
          <Filter>
            <span>{`${getFirstSymbols(filter.titles.playerName)} ${filter.titles.playerRating || ''}`}</span>
          </Filter>
        </Tooltip>
      ))}
    </Container>
  );
};

export default FiltersList;
