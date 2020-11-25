import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { AiFillCloseCircle } from 'react-icons/ai';

const Wrapper = styled.div`
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 0px;
  left: 0px;
  bottom: 0px;
  right: 0px;
  background: rgb(0 0 0 / 72%);
  z-index: 1000;
  overflow: auto;
`;

const Container = styled.div`
  width: ${props => props.width || '95%'};
  height: ${props => props.height || '95%'};
  min-width: ${props => props.minWidth || '600px'};
  min-height: ${props => props.minHeight || '600px'};
  background-size: cover;
  display: flex;
  flex-direction: column;
  border-radius: 5px;
  border: 1px solid #4b4b4b;
`;

const Header = styled.header`
  height: 50px;
  padding: 0 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  color: white;
  font-size: 17px;
  background: rgb(34 39 66 / 72%);
`;

const Tabs = styled.div`
  height: 80%;
  display: flex;
  flex-direction: row;
  align-self: flex-end;
`;

const TabItem = styled.span`
  height: 100%;
  justify-content: center;
  align-items: center;
  display: flex;
  padding: 10px;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  margin-right: 10px;
  transition: all 0.5s ease-out 0s;
  background: ${props => props.isActive ? '#7e43f5' : '#0e101e'};

  &:hover {
    color: ${props => props.isActive ? 'white' : '#7e43f5'};
    cursor: pointer;
  }
`;

const CloseIconWrapper = styled.span`
  cursor: pointer;
`;

const Main = styled.div`
  background: #0e111f;
  display: flex;
  flex: 1;
  overflow: hidden;
  flex-direction: column;
`;

const AppModal = ({ children, onClose, width, height, minWidth, minHeight, tabs, activeTabId, title }) => {
  return (
    <Wrapper onClick={onClose}>
      <Container width={width} height={height} minWidth={minWidth} minHeight={minHeight} onClick={(e) => e.stopPropagation()}>
        <Header>
          {tabs && (
            <Tabs>
              {(tabs || []).map(tab => (
                <TabItem isActive={tab.id === activeTabId} key={tab.id} onClick={tab.onSelect}>{tab.title}</TabItem>
              ))}
            </Tabs>
          )}
          {title && <span>{title}</span>}
          <CloseIconWrapper>
            <AiFillCloseCircle onClick={onClose}/>
          </CloseIconWrapper>
        </Header>
        <Main>
          {children}
        </Main>
      </Container>
    </Wrapper>
  );
};

AppModal.propTypes = {
  activeTabId: PropTypes.string,
  tabs: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    onSelect: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
  })),
  title: PropTypes.string,
  children: PropTypes.node,
  onClose: PropTypes.func.isRequired,
  width: PropTypes.string,
  height: PropTypes.string,
  minWidth: PropTypes.string,
  minHeight: PropTypes.string,
};

export default AppModal;
