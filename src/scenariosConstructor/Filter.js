import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { AiFillCloseCircle } from 'react-icons/ai';
import { FaRegCopy } from 'react-icons/fa';

import { deleteSearchFilter, editSearchFilterMaxBuy, copySearchFilter } from '../services/marketSearchCriteria.service';

import TextField from './Inputs/TextField';

import { debounce } from '../services/helper.service';

const Container = styled.div`
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

const AdditionalFilterTypes = styled.div`
  display: flex;
  flex-direction: row;

  > img {
    margin-right: 10px;
    &:last-child {
      margin-right: 0;
    }
  }
`;

const FilterAction = styled.span`
  cursor: pointer;
`;

const Filter = ({ filter, setFilters }) => {
  const [maxBuy, setMaxBuy] = useState(filter.meta.maxBuy || '');

  const changeFilterMaxBuyDebounced = useCallback(debounce(async (filterId, price) => {
    setFilters(await editSearchFilterMaxBuy(filterId, price));
  }, 0.5), []);

  const handleInputChange = (e) => {
    setMaxBuy(e.target.value);
    changeFilterMaxBuyDebounced(filter.id, e.target.value);
  };

  return (
    <Container>
      <FilterAction>
        <AiFillCloseCircle onClick={async () => setFilters(await deleteSearchFilter(filter.id))}/>
      </FilterAction>
      <FilterAction>
        <FaRegCopy onClick={async () => setFilters(await copySearchFilter(filter.id))}/>
      </FilterAction>
      <FilterHeader>
        {filter.meta.position && <Position>{filter.meta.position}</Position>}
        {filter.meta.player && <PlayerInfo>{`${filter.meta.player.name || ''} ${filter.meta.player.rating || ''}`}</PlayerInfo>}
      </FilterHeader>
      <AdditionalFilterTypes>
        {
          [filter.meta.quality, filter.meta.rarity, filter.meta.nation, filter.meta.league, filter.meta.team]
            .filter(Boolean)
            .map(filterType => <FIlterTypeImage title={filterType.title} key={filterType.title} src={filterType.img} alt={filterType.title}/>)
        }
      </AdditionalFilterTypes>
      <TextField id="max-buy" size="small" type="number" color="secondary" variant="outlined" label="Max buy" value={maxBuy} onChange={handleInputChange}/>
    </Container>
  );
};

Filter.propTypes = {
  filter: PropTypes.object.isRequired,
  setFilters: PropTypes.func.isRequired,
};

export default Filter;
