import { reject, equals } from 'ramda';
import { match } from '../services/string.serivce';
import PLAYERS from '../data/players.json';

const getPlayerId = () => {
  const name = $('.ut-player-search-control--input-container input.ut-text-input-control').val();
  let player = PLAYERS.Players.find(player => name.includes(player.l) && name.includes(player.f) || name === player.c);
  if (!player) {
    player = PLAYERS.LegendsPlayers.find(player => name.includes(player.l) && name.includes(player.f) || name === player.c);
  }
  return player ? player.id : null;
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
  return parseInt((value || '').replace(/\,/g, ''));
};

export const getMarketSearchCriteria = () => {
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
  return reject(equals(null))(params);
};
