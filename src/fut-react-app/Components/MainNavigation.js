import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import Modal from './Modal';
import ScenarioBuilder from './ScenarioBuilder';
import Runner from './Runner';

import { syncTransferListItems } from '../../services/transferList.service';
import { setLoaderVisibility } from '../../services/ui.service';
import { MODALS } from '../../constants';
import ActionsPopup from './ActionsPopup';
import { AiOutlineFileSync } from 'react-icons/ai';
import { VscRunAll } from 'react-icons/vsc';
import { FaCogs } from 'react-icons/fa';

const MainNavigation = () => {
  const [activeModalId, setActiveModalId] = useState(false);
  const actions = [
    {
      name: 'Manage Scenarios',
      onClick: () => setActiveModalId(MODALS.SCENARIO_CONSTRUCTOR),
      Icon: FaCogs,
    },
    {
      name: 'Runner',
      onClick: () => setActiveModalId(MODALS.RUNNER),
      Icon: VscRunAll,
    },
    {
      name: 'Sync Transfers',
      onClick: async () => {
        setLoaderVisibility(true);
        await syncTransferListItems(true);
        setLoaderVisibility(false);
      },
      Icon: AiOutlineFileSync,
    },
  ];

  return (
    <DndProvider backend={HTML5Backend}>
      <ActionsPopup actions={actions}/>
      {activeModalId && (
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
      )}
    </DndProvider>
  );
};

export default MainNavigation;
