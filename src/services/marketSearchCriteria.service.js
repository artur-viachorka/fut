import { reject, equals } from 'ramda';

import { match } from './string.serivce';
import { debounce } from './helper.service';
import { sendRequest } from './fetch.service';

import { ROUTES } from '../constants';

import PLAYERS from '../data/players.json';

export const searchPlayers = (name) => {
  name = name.toLowerCase();
  const foundPlayers = PLAYERS.Players.filter(player => (player.l || '').toLowerCase().includes(name) || (player.f || '').toLowerCase().includes(name) || (player.c || '').toLowerCase().includes(name));
  const foundLegends = PLAYERS.LegendsPlayers.filter(player => (player.l || '').toLowerCase().includes(name) || (player.f || '').toLowerCase().includes(name) || (player.c || '').toLowerCase().includes(name));
  return [...foundLegends, ...foundPlayers]
    .sort((a, b) => b.r - a.r)
    .slice(0, 50);
};

const getPlayerId = () => {
  const id = $('.ut-player-search-control--input-container input.ut-text-input-control.fut-player-name').attr('data-id');
  return id || null;
};

const getQuality = () => {
  const QUALITIES = {
    'special': { rare: 'SP' },
    'gold': { lev: 'gold' },
    'silver': { lev: 'silver' },
    'bronze': { lev: 'bronze' },
  };
  const quality = $('.ut-item-search-view .inline-list-select.ut-search-filter-control:first span.label').text();
  return QUALITIES[quality.toLowerCase()] || {};
};

const getRarityIds = () => {
  const src = $('.ut-item-search-view .inline-list-select.ut-search-filter-control:nth(1) img').attr('src');
  return match(src, /(\d*)_(\d*)\.(png|jpeg|jpg)$/);
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
  return POSITIONS[position.toLowerCase()] || {};
};

const getNation = () => {
  const src = $('.ut-item-search-view .inline-list-select.ut-search-filter-control:nth(4) img').attr('src');
  return match(src, /(\d*)\.(png|jpeg|jpg)$/);
};

const getLeague = () => {
  const src = $('.ut-item-search-view .inline-list-select.ut-search-filter-control:nth(5) img').attr('src');
  return match(src, /(\d*)\.(png|jpeg|jpg)$/);
};

const getTeam = () => {
  const src = $('.ut-item-search-view .inline-list-select.ut-search-filter-control:nth(6) img').attr('src');
  return match(src, /(\d*)\.(png|jpeg|jpg)$/);
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
    await checkTransferMarket();
  });
  $('.ut-market-search-filters-view .button-container').append(newButton);
};

const getMarketSearchCriteria = () => {
  const params = {
    num: 21,
    start: 0,
    type: 'player',
    maskedDefId: getPlayerId(),
    ...getPosition(),
    ...getQuality(),
    nat: getNation(),
    leag: getLeague(),
    team: getTeam(),
    maxb: getMaxBuyNow(),
    rarityIds: getRarityIds(),
  };
  if (params.maskedDefId) {
    params.nat = null;
    params.leag = null;
    params.team = null;
  }
  return reject(equals(null))(params);
};

const checkTransferMarket = async () => {
  const searchCriteria = getMarketSearchCriteria();
  return await sendRequest(ROUTES.TRANSFERMARKET, searchCriteria);
};

export const initSearchMarketPage = () => {
  if (!$('.fut-add-filter-custom-button').length) {
    copySearchInput();
    addSaveFilterButton();
  }
};
