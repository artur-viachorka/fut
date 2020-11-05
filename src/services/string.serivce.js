export const match = (str, regx) => {
  if (!str) {
    return null;
  }
  const matched = str.match(regx);
  if (matched) {
    const result = matched[1];
    return result == null || result == '' ? null : result;
  }
  return null;
};

export const getFirstSymbols = (str) => {
  return str ? `${str.split(' ').map(word => word[0].toUpperCase()).join('.')}.` : '';
};
