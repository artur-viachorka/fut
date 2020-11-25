import { getPlayers } from './fetch.service';
import { saveToStorage, getFromStorage } from './storage.service';
import { getSearchFilters, setSearchFilters } from './marketSearchCriteria.service';
import { getScenarios, setScenarios } from './scenario.service';
import { openUTNotification } from './notification.service';

const syncFilter = async (filter, players) => {
  if (filter.requestParams.maskedDefId && filter?.meta.player) {
    const newId = await getPlayerId(filter.meta.player.name, filter.meta.player.rating, players);
    filter.requestParams.maskedDefId = newId;
    filter.isExpired = !newId;
  }
  return filter;
};

const syncSteps = async (steps, players) => {
  for (let i = 0; i < steps.length; i++) {
    const filter = await syncFilter(steps[i].filter, players);
    steps[i] = {
      ...steps[i],
      filter,
    };
  }
  return steps;
};

const syncAllStoredFilters = async (players) => {
  let filters = await getSearchFilters();
  for (let i = 0; i < filters.length; i++) {
    filters[i] = await syncFilter(filters[i], players);
  }
  await setSearchFilters(filters);
  let scenarios = await getScenarios();
  for (let i = 0; i < scenarios.length; i++) {
    scenarios[i] = {
      ...scenarios[i],
      steps: await syncSteps(scenarios[i].steps, players),
    };
  }
  await setScenarios(scenarios);
};

const getAllPlayersCached = () => {
  let cachedPlayers = null;
  return async (shouldUpdate) => {
    if (shouldUpdate) {
      try {
        players = await getPlayers();
        await saveToStorage({ players });
        await syncAllStoredFilters(players);
        cachedPlayers = { ...players };
        openUTNotification({ text: 'Players List was successfully updated. All expired filters were marked.', success: true});
      } catch (e) {
        openUTNotification({ text: 'Error while syncing players list. Please, try again later.', error: true });
      }
      return;
    }
    if (cachedPlayers) {
      return cachedPlayers;
    }
    let { players } = await getFromStorage('players');
    if (!players) {
      players = await getPlayers();
      await saveToStorage({ players });
    }
    cachedPlayers = { ...players };
    return players;
  };
};

export const getAllPlayers = getAllPlayersCached();

const getPlayerFilterHandler = (name, rating) => {
  name = name.toLowerCase();
  return (player) => {
    const lastName = (player.l || '').toLowerCase();
    const firstName = (player.f || '').toLowerCase();
    const middleName = (player.c || '').toLowerCase();
    return (firstName.includes(name) || lastName.includes(name) || middleName.includes(name) || (name.includes(firstName) && name.includes(lastName))) && player.r == rating;
  };
};

export const getPlayerId = async (name, rating, players) => {
  const filter = getPlayerFilterHandler(name, rating);
  const allPlayers = players || await getAllPlayers();
  if (allPlayers) {
    const foundPlayer = (allPlayers?.players || []).find(filter);
    const foundLegend = (allPlayers?.legendsPlayers || []).find(filter);
    return foundPlayer?.id || foundLegend?.id;
  }
};

export const isPlayerExist = async (id, name, rating) => {
  const playerId = await getPlayerId(name, rating);
  return playerId == id;
};
