import { reject, equals, isEmpty, dissoc } from 'ramda';

import { addFilterSubject, openModalSubject } from '../contentScript';
import { MODALS, FUT } from '../constants';
import { match, parseStringToInt } from './string.serivce';
import { debounce, uuid } from './helper.service';
import { openUTNotification } from './notification.service';
import { saveToStorage, getFromStorage } from './storage.service';
import PLAYERS from '../data/players.json';

export const searchPlayers = (name) => {
  name = name.toLowerCase();
  const foundPlayers = PLAYERS.Players.filter(player => (player.l || '').toLowerCase().includes(name) || (player.f || '').toLowerCase().includes(name) || (player.c || '').toLowerCase().includes(name));
  const foundLegends = PLAYERS.LegendsPlayers.filter(player => (player.l || '').toLowerCase().includes(name) || (player.f || '').toLowerCase().includes(name) || (player.c || '').toLowerCase().includes(name));
  return [...foundLegends, ...foundPlayers]
    .sort((a, b) => b.r - a.r)
    .slice(0, 50);
};

const getPlayerInfo = () => {
  const playerInput = $(FUT.PAGE_SELECTORS.customPlayerInfoBlock);
  const [playerName, playerRating] = playerInput.val().split(' / ');
  const id = playerInput.attr('data-id');
  return {
    value: id || null,
    title: playerName,
    rating: playerRating,
  };
};

const getQuality = () => {
  const input = $(FUT.PAGE_SELECTORS.qualityInput);
  const isSelected = input.hasClass(FUT.CLASSES.inputHasSelection);
  const src = input.find('img').attr('src');
  const title = input.find('span.label').text();
  const value = FUT.QUALITIES[title.toLowerCase()];

  return isSelected && value ? {
    value,
    title,
    img: src,
  } : {};
};

const getRarity = () => {
  const input = $(FUT.PAGE_SELECTORS.rarityInput);
  const isSelected = input.hasClass(FUT.CLASSES.inputHasSelection);
  const src = input.find('img').attr('src');
  const title = input.find('span.label').text();

  return isSelected ? {
    value: match(src, /(\d*)_(\d*)\.(png|jpeg|jpg)$/),
    title,
    img: src,
  } : {};
};

const getPosition = () => {
  const input = $(FUT.PAGE_SELECTORS.positionInput);
  const isSelected = input.hasClass(FUT.CLASSES.inputHasSelection);
  const title = input.find('span.label').text();

  const value = FUT.POSITIONS[title.toLowerCase()];
  return isSelected && value ? {
    value,
    title,
  } : {};
};

const getNation = () => {
  const input = $(FUT.PAGE_SELECTORS.nationInput);
  const isSelected = input.hasClass(FUT.CLASSES.inputHasSelection);
  const src = input.find('img').attr('src');
  const title = input.find('span.label').text();

  return isSelected ? {
    value: match(src, /(\d*)\.(png|jpeg|jpg)$/),
    title,
    img: src,
  } : null;
};

const getLeague = () => {
  const input = $(FUT.PAGE_SELECTORS.leagueInput);
  const isSelected = input.hasClass(FUT.CLASSES.inputHasSelection);
  const src = input.find('img').attr('src');
  const title = input.find('span.label').text();

  return isSelected ? {
    value: match(src, /(\d*)\.(png|jpeg|jpg)$/),
    title,
    img: src,
  } : null;
};

const getTeam = () => {
  const input = $(FUT.PAGE_SELECTORS.teamInput);
  const isSelected = input.hasClass(FUT.CLASSES.inputHasSelection);
  const src = input.find('img').attr('src');
  const title = input.find('span.label').text();

  return isSelected ? {
    value: match(src, /(\d*)\.(png|jpeg|jpg)$/),
    title,
    img: src,
  } : null;
};

const getMaxBuyNow = () => {
  const value = $(FUT.PAGE_SELECTORS.maxBuyNowInput).val();
  return value ? parseStringToInt(value) : null;
};

export const copySearchInput = async () => {
  let playerSearchContainer = $(FUT.PAGE_SELECTORS.selectPlayerContainer).clone();
  let searchInput = playerSearchContainer.find(FUT.PAGE_SELECTORS.selectPlayerInput);
  searchInput.addClass('fut-player-name');
  playerSearchContainer.find(FUT.PAGE_SELECTORS.clearPlayerButton).on('click', () => {
    if (playerSearchContainer.hasClass(FUT.CLASSES.inputHasSelection)) {
      searchInput.attr('data-id', null);
      searchInput.val('');
      playerSearchContainer.removeClass(FUT.CLASSES.inputHasSelection);
    }
  });
  searchInput.attr('placeholder', 'Search player in FUT');
  const onSearchInputChanged = debounce((e) => {
    const searchText = $(e.target).val();
    const playerResultsListContainer = playerSearchContainer.find(FUT.PAGE_SELECTORS.playerResultsListContainer);
    const playerResultsList = playerSearchContainer.find(FUT.PAGE_SELECTORS.playerResultsList);

    searchInput.attr('data-id', null);

    playerResultsListContainer.css('display', 'none');
    playerResultsList.empty();
    playerSearchContainer.removeClass(FUT.CLASSES.inputHasSelection);

    if (!searchText) {
      return;
    }

    const players = searchPlayers(searchText);

    if (players.length) {
      playerResultsListContainer.css('display', 'block').css('z-index', '999');
      players.forEach(player => {
        const playerTitle = player.c || `${player.f} ${player.l}`;
        const playerButton = $(`<button><span class="btn-text">${playerTitle}</span><span class="btn-subtext">${player.r}</span></button>`)
          .on('mouseenter', (e) => $(e.target).addClass('hover'))
          .on('mouseleave', (e) => $(e.target).removeClass('hover'))
          .on('click', () => {
            playerResultsListContainer.css('display', 'none');
            playerSearchContainer.addClass(FUT.CLASSES.inputHasSelection);
            playerResultsList.empty();
            searchInput.val(`${playerTitle} / ${player.r}`);
            searchInput.attr('data-id', player.id);
          });
        playerResultsList.append(playerButton);
      });
    }
  }, 0.5);
  searchInput.on('input', onSearchInputChanged);
  $(FUT.PAGE_SELECTORS.itemSearchView).prepend(playerSearchContainer);
};

export const addSaveFilterButton = () => {
  const newButton = $(FUT.PAGE_SELECTORS.actionButton).clone();
  newButton.text('Save Filter');
  newButton.addClass('fut-add-filter-custom-button');
  newButton.css('background-color', '#257d67');
  newButton.on('click', async () => {
    await saveSearchFilterToStorage();
  });
  $(FUT.PAGE_SELECTORS.actionButtonsContainer).append(newButton);
};

export const addConfigureScenariosButton = () => {
  const newButton = $(FUT.PAGE_SELECTORS.actionButton).clone();
  newButton.text('Configure Scenarios');
  newButton.addClass('fut-configure-scenarios-custom-button');
  newButton.css('background-color', '#6b2121');
  newButton.on('click', () => openModalSubject.next({ modal: MODALS.SCENARIO_CONSTRUCTOR }));
  $(FUT.PAGE_SELECTORS.actionButtonsContainer).append(newButton);
};

export const addOpenRunnerButton = () => {
  const newButton = $(FUT.PAGE_SELECTORS.actionButton).clone();
  newButton.text('Open Runner');
  newButton.addClass('fut-open-runner-custom-button');
  newButton.css('background-color', '#0379bf');
  newButton.on('click', () => openModalSubject.next({ modal: MODALS.RUNNER }));
  $(FUT.PAGE_SELECTORS.actionButtonsContainer).append(newButton);
};

const getMarketSearchCriteria = () => {
  const playerInfo = getPlayerInfo();
  const quality = getQuality();
  const position = getPosition();
  const rarity = getRarity();
  const maxBuy = getMaxBuyNow();
  let nation = getNation();
  let league = getLeague();
  let team = getTeam();

  if (playerInfo.value) {
    nation = null;
    league = null;
    team = null;
  }

  const params = {
    maskedDefId: playerInfo.value,
    ...position.value,
    ...quality.value,
    nat: nation ? nation.value : null,
    leag: league ? league.value : null,
    team: team ? team.value : null,
    maxb: maxBuy,
    rarityIds: rarity.value,
  };

  return {
    noChanges: Object.values(dissoc('maxb', params)).filter(Boolean).length === 0,
    id: uuid(),
    meta: {
      player: playerInfo.value ? {
        name: playerInfo.title,
        rating: playerInfo.rating,
      } : null,
      quality: !isEmpty(quality) ? {
        title: quality.title,
        img: quality.img,
      } : null,
      rarity: !isEmpty(rarity) ? {
        title: rarity.title,
        img: rarity.img
      } : null,
      position: position.title,
      nation: nation ? {
        title: nation.title,
        img: nation.img,
      } : null,
      league: league ? {
        title: league.title,
        img: league.img,
      } : null,
      team: team ? {
        title: team.title,
        img: team.img,
      } : null,
      maxBuy,
    },
    requestParams: reject(equals(null))({
      num: 21,
      start: 0,
      type: 'player',
      ...params,
    })
  };
};

const saveSearchFilterToStorage = async () => {
  try {
    const newFilter = getMarketSearchCriteria();
    if (newFilter.noChanges) {
      openUTNotification({ text: 'Nothing to add. Select something.', error: true });
      return;
    }
    let { filters = [] } = await getFromStorage('filters');
    await saveToStorage({
      filters: [newFilter, ...filters],
    });
    addFilterSubject.next();
    openUTNotification({ text: 'filter successfully added', success: true });
  } catch (e) {
    console.error(e);
    openUTNotification({ text: 'Eror while adding filter. Try Later.', error: true });
  }
};

export const getCredits = async () => {
  const credits = $(FUT.PAGE_SELECTORS.credits).text();
  return parseStringToInt(credits || 0);
};

export const getSearchFilters = async () => {
  const { filters } = await getFromStorage('filters');
  return filters || [];
};

export const getSearchFilter = async (id) => {
  const { filters } = await getFromStorage('filters');
  return (filters || []).find(filter => filter.id === id);
};

export const setSearchFilters = async (filters) => {
  await saveToStorage({ filters });
};

export const deleteSearchFilter = async (filterId) => {
  let { filters } = await getFromStorage('filters');
  filters = filters.filter(filter => filter.id !== filterId);
  await saveToStorage({
    filters,
  });
  return filters;
};

export const copySearchFilter = async (filterId) => {
  let { filters } = await getFromStorage('filters');
  const filterToCopy = filters.find(filter => filter.id === filterId);
  if (filterToCopy) {
    filters = [{
      ...filterToCopy,
      id: uuid(),
    }, ...filters];
    await saveToStorage({
      filters
    });
  }
  return filters;
};

export const editSearchFilterMaxBuy = async (filterId, newMaxBuy) => {
  let { filters } = await getFromStorage('filters');
  filters = filters.map(filter => filter.id === filterId ? {
    ...filter,
    meta: {
      ...filter.meta,
      maxBuy: newMaxBuy,
    },
    requestParams: {
      ...filter.requestParams,
      maxb: parseStringToInt(newMaxBuy),
    }
  } : filter);
  await saveToStorage({
    filters
  });
  return filters;
};

export const initSearchMarketPage = () => {
  if (!$('.fut-add-filter-custom-button').length) {
    copySearchInput();
    addSaveFilterButton();
    addConfigureScenariosButton();
    addOpenRunnerButton();
  }
};
