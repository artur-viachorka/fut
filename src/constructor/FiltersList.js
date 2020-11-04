import React, { useState, useEffect } from 'react';
import { getFromStorage } from '../services/storage.service';

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
    <>
      {filters.map((filter, i) => (
        <div key={i}>
          {filter.playerName}
        </div>
      ))}
    </>
  );
};

export default FiltersList;
