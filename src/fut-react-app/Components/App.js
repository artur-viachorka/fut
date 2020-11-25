import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import Modal from './Modal';
import ScenarioBuilder from './ScenarioBuilder';
import Runner from './Runner';

import { openModalSubject } from '../../contentScript';
import { MODALS } from '../../constants';

const App = () => {
  useEffect(() => {
    const openModalSubscription = openModalSubject.subscribe(({ modal }) => {
      setActiveModalId(modal);
    });
    return openModalSubscription.unsubscribe;
  }, []);
  const [activeModalId, setActiveModalId] = useState(false);
  if (!activeModalId) {
    return null;
  }
  return (
    <DndProvider backend={HTML5Backend}>
      <Modal
          activeTabId={activeModalId}
          onClose={() => setActiveModalId(null)}
          tabs={
            [
              {
                id: MODALS.RUNNER,
                title: 'Runner',
                onSelect: () => setActiveModalId(MODALS.RUNNER),
              },
              {
                id: MODALS.SCENARIO_CONSTRUCTOR,
                title: 'Manage Scenarios',
                onSelect: () => setActiveModalId(MODALS.SCENARIO_CONSTRUCTOR),
              }
            ]
          }
      >
        {activeModalId === MODALS.SCENARIO_CONSTRUCTOR && <ScenarioBuilder/>}
        {activeModalId === MODALS.RUNNER && <Runner/>}
      </Modal>
    </DndProvider>
  );
};

export default App;
