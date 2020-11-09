import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { MARK_COLORS } from '../../constants';
import { FaCheck } from 'react-icons/fa';

const Container = styled.div`
  display: flex;
  flex-direction: row;
`;

const Color = styled.div`
  width: 25px;
  height: 25px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 5px;
  ${props => `background-color: ${props.color};`}
`;

const MarkColorPicker = ({ onMarkPicked, activeColor }) => {
  return (
    <Container>
      {MARK_COLORS.map(color => (
        <Color key={color} onClick={() => onMarkPicked(color)} color={color}>
          {activeColor === color && <FaCheck/>}
        </Color>
      ))}
    </Container>
  );
};

MarkColorPicker.propTypes = {
  onMarkPicked: PropTypes.func.isRequired,
  activeColor: PropTypes.string.isRequired,
};

export default MarkColorPicker;
