import React from 'react';
import styled from 'styled-components';
import MaterialUiTextField from '@material-ui/core/TextField';

const Container = styled.div`
  width: 100%;
  .MuiTextField-root {
    color: #ababab;
    width: 100%;

    label {
      color: #ababab;
    }

    fieldset {
      border-color: #ababab !important;
    }

    input {
      color: #ababab;
      &::placeholder: {
        color: #ababab;
      }
    }
  }
`;
const TextField = (props) => {
  return (
    <Container>
      <MaterialUiTextField {...props}/>
    </Container>
  );
};

export default TextField;
