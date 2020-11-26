import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FaAngleDoubleRight, FaAngleDoubleLeft } from 'react-icons/fa';
import { getFromStorage, saveToStorage } from '../../services/storage.service';

const Container = styled.div`
  position: absolute;
  left: 90px;
  top: 0;
  height: 48px;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 45px 0 15px;
  background: #211f21;
`;

const Name = styled.span`
  background: #7e43f5;
  color: white;
  border-radius: 5px;
  padding: 3px;
  display: flex;
  align-items: center;
  margin-right: 10px;
`;

const ExpandButton = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 30px;
  background: #1b171b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.5s ease-out;

  &:hover {
    color: #7e43f5;
  }
`;

const Button = styled.button`
  color: white;
  border: 2px solid #8b37a6;
  background: #7e43f547;
  padding: 5px;
  font-size: 27px;
  max-width: 98px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-right: 8px;
  height: 35px;
  border-radius: 5px;
  transition: all 0.5s ease-out;

  > span {
    font-size: 10px;
    text-transform: uppercase;
    margin-left: 3px;
  }

  &:hover {
    border-color: #7e43f5;
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: row;
`;

const ActionButtonsGroup = styled.div`
  display: flex;
  flex-direction: row;
  > button {
    border-radius: 0;
    margin: 0;
    
    &:first-child {
      border-top-left-radius: 5px;
      border-bottom-left-radius: 5px;
      border-right-width: 1px;
    }

    &:last-child {
      border-top-right-radius: 5px;
      border-bottom-right-radius: 5px;
      border-left-width: 1px;
    }
  }
`;

const ActionButton = ({ action, isExpanded }) => (
  <Button id={action.name} onClick={action.onClick} title={action.name}>
    <action.Icon/>
    {isExpanded && <span>{action.name}</span>}
  </Button>
);

ActionButton.propTypes = {
  action: PropTypes.shape({
    name: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
  }),
  isExpanded: PropTypes.bool,
};

const ActionsPopup = ({ actions }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const checkIsExpanded = async () => {
      const { isActionsPopupExpanded } = await getFromStorage('isActionsPopupExpanded');
      setIsExpanded(isActionsPopupExpanded);
    };
    checkIsExpanded();
  }, []);

  const expand = useCallback(async () => {
    await saveToStorage({ isActionsPopupExpanded: !isExpanded });
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  return (
    <Container>
      <Name>EXTENDED FUT</Name>
      <Content>
        {actions.map(action => action.group ? (
            <ActionButtonsGroup key={action.name}>
              {action.group.map((action) => <ActionButton isExpanded={isExpanded} key={action.name} action={action}/>)}
            </ActionButtonsGroup>
          ) : <ActionButton isExpanded={isExpanded} key={action.name} action={action}/>)
        }
      </Content>
      <ExpandButton onClick={expand}>
        {isExpanded ? <FaAngleDoubleLeft/> : <FaAngleDoubleRight/>}
      </ExpandButton>
    </Container>
  );
};

ActionsPopup.propTypes = {
  actions: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    group: PropTypes.array,
  })),
};

export default ActionsPopup;
