import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Runner from '../Runner/Runner';
import Modal from './Modal';

const Container = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const RunnerModal = ({ onClose }) => {
  return (
    <Modal onClose={onClose} title="Runner">
      <Container>
        <Runner/>
      </Container>
    </Modal>
  );
};

RunnerModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default RunnerModal;
