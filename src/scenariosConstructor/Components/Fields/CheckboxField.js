import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  border: 0;
  clip: rect(0 0 0 0);
  clippath: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`;

const Icon = styled.svg`
  fill: none;
  stroke: white;
  stroke-width: 2px;
`;

const StyledCheckbox = styled.div`
  width: 16px;
  height: 16px;
  background: ${props => props.checked ? '#643acb;' : '#d9d9ff'};
  border-radius: 3px;
  transition: all 150ms;

  ${Icon} {
    visibility: ${props => props.checked ? 'visible' : 'hidden'}
  }

  ${HiddenCheckbox}:focus + & {
    box-shadow: 0 0 0 3px #40409f;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  margin-right: 5px;
`;

const Container = styled.label`
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 12px;
`;

const CheckboxField = ({ checked, label, onChange, ...props }) => (
  <Container>
    <CheckboxContainer>
      <HiddenCheckbox checked={checked} onChange={(e) => onChange(e.target.checked)} {...props}/>
      <StyledCheckbox checked={checked}>
        <Icon viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12"/>
        </Icon>
      </StyledCheckbox>
    </CheckboxContainer>
    <span>{label}</span>
  </Container>
);

CheckboxField.propTypes = {
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
};

export default CheckboxField;
