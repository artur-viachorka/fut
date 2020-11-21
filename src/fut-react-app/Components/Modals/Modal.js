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
  background-color: #0e0f1d;
  background-size: cover;
  display: flex;
  flex-direction: column;
  border-radius: 5px;
  border: 1px solid #4b4b4b;
`;

const Header = styled.header`
  height: 80px;
  padding: 10px 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  color: white;
  font-size: 17px;
  border-bottom: 1px solid #414141;
`;

const CloseIconWrapper = styled.span`
  cursor: pointer;
`;

const Modal = ({ children, onClose, title, width, height, minWidth, minHeight }) => {
  return (
    <Wrapper onClick={onClose}>
      <Container width={width} height={height} minWidth={minWidth} minHeight={minHeight} onClick={(e) => e.stopPropagation()}>
        <Header>
          <span>{title}</span>
          <CloseIconWrapper>
            <AiFillCloseCircle onClick={onClose}/>
          </CloseIconWrapper>
        </Header>
        {children}
      </Container>
    </Wrapper>
  );
};

Modal.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  onClose: PropTypes.func.isRequired,
  width: PropTypes.string,
  height: PropTypes.string,
  minWidth: PropTypes.string,
  minHeight: PropTypes.string,
};

export default Modal;
