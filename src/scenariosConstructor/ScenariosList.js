import React, { useState, useEffect } from 'react';
import { getFromStorage } from '../services/storage.service';

const ScenariosList = () => {
  const [scenarios, setScenarios] = useState([]);
  const loadScenarios = async () => {
    const { scenarios } = await getFromStorage('scenarios');
    setScenarios(scenarios || []);
  };

  useEffect(() => {
    loadScenarios();
  }, []);

  return (
    <>
      {scenarios.map((scenario) => (
        <div key={scenario.id}>
          {scenario.name}
        </div>
      ))}
    </>
  );
};

export default ScenariosList;
