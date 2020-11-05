export const convertSecondsToMs = (s) => (s || 0) * 1000;

export const sleep = (seconds) => {
  return new Promise((resolve) => setTimeout(resolve, convertSecondsToMs(seconds)));
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
