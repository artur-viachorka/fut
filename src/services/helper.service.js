import { parseStringToInt } from './string.serivce';
import { path } from 'ramda';

export const convertSecondsToMs = (s) => (s || 0) * 1000;
export const convertMinutesToSeconds = (m) => (m || 0) * 60;
export const convertMsToMinutes = (ms) => (ms / 1000) / 60;

export const sleep = (seconds) => {
  return new Promise((resolve) => setTimeout(resolve, convertSecondsToMs(seconds)));
};

export const triggerMouseEvent = (node, eventType) => {
  const clickEvent = document.createEvent('MouseEvents');
  clickEvent.initEvent(eventType, true, true);
  node.dispatchEvent(clickEvent);
};

export const triggerEvent = (selector, eventType) => {
  const node = $(selector)[0];
  if (node) {
    const event = document.createEvent('Event');
    event.initEvent(eventType, true, true);
    node.dispatchEvent(event);
  }
};

export const click = (selector) => {
  const node = typeof selector === 'string' ? $(selector)[0] : selector;
  if (node) {
    triggerMouseEvent(node, 'mousedown');
    triggerMouseEvent(node, 'mouseup');
  }
};

export function debounce(func, seconds, immediate) {
  let timeout;
  return function(...args) {
    const context = this;
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, convertSecondsToMs(seconds));
    if (callNow) func.apply(context, args);
  };
}

export function callAsPromise(context, handler, ...args) {
  return new Promise((resolve) => {
    return handler.call(context || this, ...args, (res) => {
      resolve(res);
    });
  });
}

export const uuid = function() {
  const buf = new Uint32Array(4);
  window.crypto.getRandomValues(buf);
  let idx = -1;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    idx++;
    let r = (buf[idx>>3] >> ((idx%8)*4))&15;
    let v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
};

export const roundNumber = (value, roundOn) => {
  return (parseStringToInt(value) / roundOn).toFixed() * roundOn;
};

export const addZero = (num) => num < 10 ? `0${num}` : num;

export const getRandomNumberInRange = (min, max) => (Math.random() * (max - min) + min).toFixed(3);

export const getTheMostRepeatableNumber = (arr) => {
  if (!arr?.length) {
    return null;
  }
  const occurrences = {};
  arr.forEach(num => {
    occurrences[num] = (occurrences[num] || 0) + 1;
  });
  const sortedItems = Object.entries(occurrences).sort((a, b) => b[1] - a[1]);
  return parseFloat(sortedItems[0][0]);
};

export const getSortHandler = (config) => {
  return (a, b) => {
    let i = 0;
    let result = 0;
    let resultOrder = 0;

    while (result === 0 && i < config.length) {
      const isAscending = config[i].isAscending;
      const fieldPath = config[i].path;
      let aValue = path(fieldPath, a);
      let bValue = path(fieldPath, b);

      if (aValue < bValue) {
        resultOrder = isAscending ? - 1 : 1;
      } else if (aValue > bValue) {
        resultOrder = isAscending ? 1 : -1;
      } else {
        resultOrder = 0;
      }

      if (resultOrder != 0) {
        break;
      }
      i++;
    }
    return resultOrder;
  };
};
