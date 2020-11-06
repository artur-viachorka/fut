import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getFromStorage } from '../services/storage.service';

const Hint = styled.span`
  font-size: 12px;
  color: grey;
  font-style: italic;
`;

const ScenariosList = () => {
  const [scenarios, setScenarios] = useState(null);
  const loadScenarios = async () => {
    const { scenarios } = await getFromStorage('scenarios');
    setScenarios(scenarios || []);
  };

  useEffect(() => {
    loadScenarios();
  }, []);

  return (
    <>
      {scenarios && !scenarios.length && (
        <Hint>
          Drag filter on board to create your first scenario.
        </Hint>
      )}
      {(scenarios || []).map((scenario) => (
        <div key={scenario.id}>
          {scenario.name}
        </div>
      ))}
    </>
  );
};

export default ScenariosList;
