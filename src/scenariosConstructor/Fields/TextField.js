import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex: 1;
  input {
    width: 100%;
    padding: 10px;
  }
`;
const TextField = ({ value, onChange, type, placeholder, ...rest }) => {
  return (
    <Container>
      <input value={value} type={type} placeholder={placeholder} onChange={onChange} {...rest}/>
    </Container>
  );
};

TextField.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  type: PropTypes.string,
};

export default TextField;
