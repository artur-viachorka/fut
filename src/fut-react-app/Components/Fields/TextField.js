import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex: 1;
  input {
    width: 100%;
    padding: 0 10px;

    &::selection {
      color: white;
      background: #7e43f5 !important;
    }
  }
`;
const TextField = ({ value, onChange, type, focusOnInit, placeholder, isReadOnly, ...rest }) => {
  const inputReference = useRef(null);

  useEffect(() => {
    if (focusOnInit) {
      inputReference.current?.focus();
    }
  }, []);

  return (
    <Container>
      <input disabled={isReadOnly} ref={inputReference} value={value} type={type} placeholder={placeholder} onChange={onChange} {...rest}/>
    </Container>
  );
};

TextField.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  type: PropTypes.string,
  focusOnInit: PropTypes.bool,
  isReadOnly: PropTypes.bool,
};

export default TextField;
