import { reject, equals } from 'ramda';

import { match } from './string.serivce';
import { debounce, uuid } from './helper.service';
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
  const quality = $('.ut-item-search-view .inline-list-select.ut-search-filter-control:first span.label').text();
  const parsedQuality = QUALITIES[quality.toLowerCase()];
  return parsedQuality ? {
    value: parsedQuality,
    title: quality,
  } : {};
};

const getRarity = () => {
  const src = $('.ut-item-search-view .inline-list-select.ut-search-filter-control:nth(1) img').attr('src');
  const title = $('.ut-item-search-view .inline-list-select.ut-search-filter-control:nth(1) span.label').text();
  return {
    value: match(src, /(\d*)_(\d*)\.(png|jpeg|jpg)$/),
    title,
  };
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

  const position = $('.ut-item-search-view .inline-list-select.ut-search-filter-control:nth(2) span.label').text();

  const parsedPosition = POSITIONS[position.toLowerCase()];
  return parsedPosition ? {
    value: parsedPosition,
    title: position,
  } : {};
};

const getNation = () => {
  const src = $('.ut-item-search-view .inline-list-select.ut-search-filter-control:nth(4) img').attr('src');
  const title = $('.ut-item-search-view .inline-list-select.ut-search-filter-control:nth(4) span.label').text();
  return {
    value: match(src, /(\d*)\.(png|jpeg|jpg)$/),
    title,
  };
};

const getLeague = () => {
  const src = $('.ut-item-search-view .inline-list-select.ut-search-filter-control:nth(5) img').attr('src');
  const title = $('.ut-item-search-view .inline-list-select.ut-search-filter-control:nth(5) span.label').text();
  return {
    value: match(src, /(\d*)\.(png|jpeg|jpg)$/),
    title,
  };
};

const getTeam = () => {
  const src = $('.ut-item-search-view .inline-list-select.ut-search-filter-control:nth(6) img').attr('src');
  const title = $('.ut-item-search-view .inline-list-select.ut-search-filter-control:nth(6) span.label').text();
  return {
    value: match(src, /(\d*)\.(png|jpeg|jpg)$/),
    title,
  };
};

const getMaxBuyNow = () => {
  const value = $('.search-prices > div:nth-child(6) input').val();
  return value ? parseInt(value.replace(/\,/g, '')) : null;
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
  const nation = getNation();
  const league = getLeague();
  const team = getTeam();
  const rarity = getRarity();

  if (playerInfo.value) {
    nation.value = null;
    nation.title = null;
    league.value = null;
    league.title = null;
    team.value = null;
    team.title = null;
  }

  const params = {
    num: 21,
    start: 0,
    type: 'player',
    maskedDefId: playerInfo.value,
    ...position.value,
    ...quality.value,
    nat: nation.value,
    leag: league.value,
    team: team.value,
    maxb: getMaxBuyNow(),
    rarityIds: rarity.value,
  };

  return {
    id: uuid(),
    titles: {
      playerName: playerInfo.title,
      playerRating: playerInfo.rating,
      quality: quality.title,
      position: position.title,
      nation: nation.title,
      leag: league.title,
      team: team.title,
      rarity: rarity.title,
    },
    requestParams: reject(equals(null))(params)
  };
};

const saveSearchFilterToStorage = async () => {
  const newFilter = getMarketSearchCriteria();

  let { filters = [] } = await getFromStorage('filters');
  await saveToStorage({
    filters: filters.concat(newFilter),
  });
};

export const initSearchMarketPage = () => {
  if (!$('.fut-add-filter-custom-button').length) {
    copySearchInput();
    addSaveFilterButton();
    addConfigureScenariosButton();
  }
};
