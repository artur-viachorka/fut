import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getScenarios } from '../../../services/scenario.service';
import { selectScenarioSubject, editScenarioSubject } from '../../../contentScript';
import { MARK_COLORS } from '../../constants';

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  overflow-y: auto;
  align-items: center;
`;

const Hint = styled.span`
  font-size: 16px;
  justify-content: center;
  color: grey;
  font-style: italic;
  display: flex;
  align-items: center;
  flex: 1;
`;

const Scenario = styled.div`
  display: flex;
  border-radius: 50%;
  min-width: 74px;
  min-height: 74px;
  text-align: center;
  justify-content: center;
  align-items: center;
  background: ${(props) => props.markColor || MARK_COLORS[0]};
  border: 3px solid ${(props) => props.isSelected ? 'white' : (props.markColor || MARK_COLORS[0])};
  transition: all 0.5s ease-out;
  padding: 5px;
  border-radius: 5px;
  margin-right: 5px;

  &:hover {
    border-color: white;
  }
`;

const ScenariosList = () => {
  const [scenarios, setScenarios] = useState(null);
  const [selectedScenarioId, setSelectedScenario] = useState(null);
  const loadScenarios = async () => {
    const scenarios = await getScenarios();
    setScenarios(scenarios);
  };

  useEffect(() => {
    loadScenarios();
    if (editScenarioSubject) {
      editScenarioSubject.subscribe((res) => {
        loadScenarios();
        if (!res?.withoutReseting) {
          setSelectedScenario(null);
        }
      });
    }
    return editScenarioSubject.unsubscribe;
  }, []);

  useEffect(() => {
    loadScenarios();
  }, []);

  return (
    <Container>
      {scenarios && !scenarios.length && (
        <Hint>
          Drag and drop filter on board to create your first scenario.
        </Hint>
      )}
      {(scenarios || []).map((scenario) => (
        <Scenario
            title={scenario.name}
            isSelected={scenario.id === selectedScenarioId}
            onClick={() => {
              if (scenario.id === selectedScenarioId) {
                setSelectedScenario(null);
                selectScenarioSubject.next({ scenario: null });
              } else {
                setSelectedScenario(scenario.id);
                selectScenarioSubject.next({ scenario: null });
                selectScenarioSubject.next({ scenario });
              }
            }}
            markColor={scenario.markColor}
            key={scenario.id}
        >
          {scenario.name}
        </Scenario>
      ))}
    </Container>
  );
};

export default ScenariosList;
