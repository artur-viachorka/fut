import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import ConstructorModal from './Modals/ConstructorModal';
import RunnerModal from './Modals/RunnerModal';

import { openModalSubject } from '../../contentScript';
import { MODALS } from '../../constants';

const App = () => {
  useEffect(() => {
    const openModalSubscription = openModalSubject.subscribe(({ modal }) => {
      if (modal === MODALS.RUNNER) {
        setIsRunnerModalVisible(true);
      }
      if (modal === MODALS.SCENARIO_CONSTRUCTOR) {
        setIsConstructorModalVisible(true);
      }
    });
    return openModalSubscription.unsubscribe;
  }, []);
  const [isConstructorModalVisible, setIsConstructorModalVisible] = useState(false);
  const [isRunnerModalVisible, setIsRunnerModalVisible] = useState(false);
  return (
    <DndProvider backend={HTML5Backend}>
      {isConstructorModalVisible && <ConstructorModal onClose={() => setIsConstructorModalVisible(false)}/>}
      {isRunnerModalVisible && <RunnerModal onClose={() => setIsRunnerModalVisible(false)}/>}
    </DndProvider>
  );
};

export default App;
