import React from 'react';
import ReactDOM from 'react-dom';
import { REACT_CONTAINER_ID } from '../constants';
import MainNavigation from './Components/MainNavigation';
import './styles.css';

export const initReactApp = () => {
  const root = $(`<div id="${REACT_CONTAINER_ID}"></div>`);
  $(document.body).append(root);
  ReactDOM.render(<MainNavigation/>, root[0]);
};
