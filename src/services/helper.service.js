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
