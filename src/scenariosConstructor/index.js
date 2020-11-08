import React from 'react';
import ReactDOM from 'react-dom';
import { REACT_CONTAINER_ID } from './constants';
import Board from './Components/Board';
import './styles.css';

export const initConstructor = () => {
  const root = $(`<div id="${REACT_CONTAINER_ID}"></div>`).css('display', 'block');
  $(document.body).append(root);
  ReactDOM.render(<Board/>, root[0]);
};
