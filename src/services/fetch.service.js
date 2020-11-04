import { HOST } from '../constants';

const executeOnPageSpace = (code) => {
  var script = document.createElement('script');
  script.id = 'tmpScript';
  script.textContent =
  'document.getElementById("tmpScript").textContent = JSON.stringify(' + code + ')';
  document.documentElement.appendChild(script);
  let result = document.getElementById('tmpScript').textContent;
  script.remove();
  return JSON.parse(result);
};

export const sendRequest = async (route, params) => {
  const userId = executeOnPageSpace('window.services.Authentication._sessionUtas.id');
  if (!userId) {
    return;
  }
  const url = new URL(HOST + route);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  const response = await fetch(url.href, {
    headers: {
      'Content-Type': 'application/json',
      'X-UT-SID': userId,
    },
  });
  return await response.json();
};
