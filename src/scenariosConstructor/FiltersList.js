import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import TextField from './Inputs/TextField';

import { debounce } from '../services/helper.service';
import { getFromStorage } from '../services/storage.service';
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
  overflow-y: auto;
`;

const Filter = styled.div`
  align-items: center;
  justify-content: center;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  width: 100%;
  min-height: 70px;
  border-radius: 5px;
  border: 1px solid #414141;
  font-size: 18px;
  text-transform: uppercase;
  overflow: hidden;
  margin-bottom: 10px;
  padding: 15px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Position = styled.span`

`;

const PlayerInfo = styled.span`
  
`;

const FilterHeader = styled.header``;

const FIlterTypeImage = styled.img`
  width: 50px;
  height: 50px;
  object-fit: contain;
`;

const FiltersList = () => {
  const [filters, setFilters] = useState(null);
  const loadFilters = async () => {
    const { filters } = await getFromStorage('filters');
    setFilters(filters || []);
  };

  useEffect(() => {
    loadFilters();
    if(addFilterSubject) {
      addFilterSubject.subscribe(() => {
        loadFilters();
      });
    }
    return addFilterSubject.unsubscribe;
  }, []);

  const changeFilterMaxBuy = debounce((val) => {
    console.log(val);
  })

  return (
    <Container>
      {filters && !filters.length && (
        <Hint>
          Use search the transfer market form to add filter
        </Hint>
      )}
      {(filters || []).map((filter) => (
        <Filter key={filter.id}>
          <FilterHeader>
            {filter.meta.position && <Position>{filter.meta.position}</Position>}
            {filter.meta.player && <PlayerInfo>{`${filter.meta.player.name || ''} ${filter.meta.player.rating || ''}`}</PlayerInfo>}
          </FilterHeader>
          <div>
            {
              [filter.meta.quality, filter.meta.rarity, filter.meta.nation, filter.meta.league, filter.meta.team]
              .filter(Boolean)
              .map(filterType => (
                <FIlterTypeImage title={filterType.title} key={filterType.title} src={filterType.img} alt={filterType.title}/>
              ))
            }
          </div>
          {filter.meta.maxBuy && <TextField size="small" variant="outlined" label="Max buy" value={filter.meta.maxBuy} onChange={changeFilterMaxBuy}/>}
        </Filter>
      ))}
    </Container>
  );
};

export default FiltersList;
