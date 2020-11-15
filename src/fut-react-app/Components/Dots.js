import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding-left: 10px;
  padding-bottom: 3px;
  display: flex;
  width: 25px;
  align-self: flex-end;
`;

const StyledDots = styled.div`
  position: relative;
  width: 3px;
  height: 3px;
  border-radius: 2px;
  background-color: white;
  color: white;
  animation: dotFlashing 1s infinite linear alternate;
  animation-delay: .5s;

  &::before, &::after {
    content: '';
    display: inline-block;
    position: absolute;
    top: 0;
  }

  &::before {
    left: -6px;
    width: 3px;
    height: 3px;
    border-radius: 2px;
    background-color: white;
    color: white;
    animation: dotFlashing 1s infinite alternate;
    animation-delay: 0s;
  }

  &::after {
    left: 6px;
    width: 3px;
    height: 3px;
    border-radius: 2px;
    background-color: white;
    color: white;
    animation: dotFlashing 1s infinite alternate;
    animation-delay: 1s;
  }

  @keyframes dotFlashing {
    0% {
      background-color: #7e43f5;
    }
    50%,
    100% {
      background-color: white;
    }
  }
`;

const Dots = () => (
  <Container><StyledDots/></Container>
);

export default Dots;
