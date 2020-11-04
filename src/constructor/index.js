import React from 'react';
import ReactDOM from 'react-dom';
import Board from './Board';

export const initConstructor = () => {
  const rootEl = document.createElement('div');
  rootEl.id = 'react-constructor';
  document.body.appendChild(rootEl);
  ReactDOM.render(<Board/>, rootEl);
};
