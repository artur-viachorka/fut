import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { COIN_ICON_SRC } from '../../constants';
import { numberWithCommas } from '../../services/string.serivce';
import { getCreditsFromUi } from '../../services/ui.service';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  padding: 5px;
  > span {
    margin-right: 5px;
  }
  > img {
    width: 20px;
    height: 20px;
    object-fit: contain;
  }
`;

const Coins = ({ credits }) => (
  <Container>
    <span>{credits == null ? getCreditsFromUi() : numberWithCommas(credits)}</span>
    <img src={COIN_ICON_SRC}/>
  </Container>
);

Coins.propTypes = {
  credits: PropTypes.number,
};

export default Coins;
