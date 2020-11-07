import { reject, equals, isEmpty } from 'ramda';

import { addFilterSubject } from '../contentScript';
import { match, parseStringToInt } from './string.serivce';
import { debounce, uuid } from './helper.service';
import { openUTNotification } from './notification.service';
import { saveToStorage, getFromStorage } from './storage.service';
import { REACT_CONTAINER_ID } from '../scenariosConstructor/constants';
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
  const playerInput = $('.ut-player-search-control--input-container input.ut-text-input-control.fut-player-name');
  const [playerName, playerRating] = playerInput.val().split(' / ');
  const id = playerInput.attr('data-id');
  return {
    value: id || null,
    title: playerName,
    rating: playerRating,
  };
};

const getQuality = () => {
  const QUALITIES = {
    'special': { rare: 'SP' },
    'gold': { lev: 'gold' },
    'silver': { lev: 'silver' },
    'bronze': { lev: 'bronze' },
  };
  const input = $('.ut-item-search-view .inline-list-select.ut-search-filter-control:nth(0)');
  const isSelected = input.hasClass('has-selection');
  const src = input.find('img').attr('src');
  const title = input.find('span.label').text();
  const value = QUALITIES[title.toLowerCase()];

  return isSelected && value ? {
    value,
    title,
    img: src,
  } : {};
};

const getRarity = () => {
  const input = $('.ut-item-search-view .inline-list-select.ut-search-filter-control:nth(1)');
  const isSelected = input.hasClass('has-selection');
  const src = input.find('img').attr('src');
  const title = input.find('span.label').text();

  return isSelected ? {
    value: match(src, /(\d*)_(\d*)\.(png|jpeg|jpg)$/),
    title,
    img: src,
  } : {};
};

const getPosition = () => {
  const POSITIONS = {
    'defenders': { zone: 'defense' },
    'midfielders': { zone: 'midfield' },
    'attackers': { zone: 'attacker' },
    'gk': { pos: 'GK' },
    'rwb': { pos: 'RWB' },
    'lwb': { pos: 'LWB' },
    'rb': { pos: 'RB' },
    'lb': { pos: 'LB' },
    'cb': { pos: 'CB' },
    'cdm': { pos: 'CDM' },
    'cm': { pos: 'CM' },
    'cam': { pos: 'CAM' },
    'rm': { pos: 'RM' },
    'lm': { pos: 'LM' },
    'rw': { pos: 'RW' },
    'lw': { pos: 'LW' },
    'cf': { pos: 'CF' },
    'lf': { pos: 'LF' },
    'rf': { pos: 'RF' },
    'st': { pos: 'ST' },
  };

  const input = $('.ut-item-search-view .inline-list-select.ut-search-filter-control:nth(2)');
  const isSelected = input.hasClass('has-selection');
  const title = input.find('span.label').text();

  const value = POSITIONS[title.toLowerCase()];
  return isSelected && value ? {
    value,
    title,
  } : {};
};

const getNation = () => {
  const input = $('.ut-item-search-view .inline-list-select.ut-search-filter-control:nth(4)');
  const isSelected = input.hasClass('has-selection');
  const src = input.find('img').attr('src');
  const title = input.find('span.label').text();

  return isSelected ? {
    value: match(src, /(\d*)\.(png|jpeg|jpg)$/),
    title,
    img: src,
  } : null;
};

const getLeague = () => {
  const input = $('.ut-item-search-view .inline-list-select.ut-search-filter-control:nth(5)');
  const isSelected = input.hasClass('has-selection');
  const src = input.find('img').attr('src');
  const title = input.find('span.label').text();

  return isSelected ? {
    value: match(src, /(\d*)\.(png|jpeg|jpg)$/),
    title,
    img: src,
  } : null;
};

const getTeam = () => {
  const input = $('.ut-item-search-view .inline-list-select.ut-search-filter-control:nth(6)');
  const isSelected = input.hasClass('has-selection');
  const src = input.find('img').attr('src');
  const title = input.find('span.label').text();

  return isSelected ? {
    value: match(src, /(\d*)\.(png|jpeg|jpg)$/),
    title,
    img: src,
  } : null;
};

const getMaxBuyNow = () => {
  const value = $('.search-prices > div:nth-child(6) input').val();
  return value ? parseStringToInt(value) : null;
};

export const copySearchInput = async () => {
  let playerSearchContainer = $('.inline-list-select.ut-player-search-control').clone();
  let searchInput = playerSearchContainer.find('.ut-text-input-control');
  searchInput.addClass('fut-player-name');
  playerSearchContainer.find('.flat.inline-list-btn.icon_close.fut_icon.exit-btn').on('click', () => {
    if (playerSearchContainer.hasClass('has-selection')) {
      searchInput.attr('data-id', null);
      searchInput.val('');
      playerSearchContainer.removeClass('has-selection');
    }
  });
  searchInput.attr('placeholder', 'Search player in FUT');
  const onSearchInputChanged = debounce((e) => {
    const searchText = $(e.target).val();
    const playerResultsListContainer = playerSearchContainer.find('.inline-list');
    const playerResultsList = playerSearchContainer.find('.playerResultsList');

    searchInput.attr('data-id', null);

    playerResultsListContainer.css('display', 'none');
    playerResultsList.empty();
    playerSearchContainer.removeClass('has-selection');

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
            playerSearchContainer.addClass('has-selection');
            playerResultsList.empty();
            searchInput.val(`${playerTitle} / ${player.r}`);
            searchInput.attr('data-id', player.id);
          });
        playerResultsList.append(playerButton);
      });
    }
  }, 0.5);
  searchInput.on('input', onSearchInputChanged);
  $('.ut-item-search-view').prepend(playerSearchContainer);
};

export const addSaveFilterButton = () => {
  const newButton = $('.ut-market-search-filters-view .button-container .btn-standard:first').clone();
  newButton.text('Save Filter');
  newButton.addClass('fut-add-filter-custom-button');
  newButton.css('background-color', '#257d67');
  newButton.on('click', async () => {
    await saveSearchFilterToStorage();
  });
  $('.ut-market-search-filters-view .button-container').append(newButton);
};

export const addConfigureScenariosButton = () => {
  const newButton = $('.ut-market-search-filters-view .button-container .btn-standard:first').clone();
  newButton.text('Configure Scenarios');
  newButton.addClass('fut-configure-scenarios-custom-button');
  newButton.css('background-color', '#6b2121');
  newButton.on('click', async () => {
    $(`#${REACT_CONTAINER_ID}`).css('display', 'block');
  });
  $('.ut-market-search-filters-view .button-container').append(newButton);
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
    noChanges: Object.values(params).filter(Boolean).length === 0,
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

export const getSearchFilters = async () => {
  const { filters } = await getFromStorage('filters');
  return filters || [];
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
  }
};
