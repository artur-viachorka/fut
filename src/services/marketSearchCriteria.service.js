import { dissoc } from 'ramda';

import { addFilterSubject } from '../contentScript';
import { FUT } from '../constants';
import { parseStringToInt } from './string.serivce';
import { openUTNotification } from './notification.service';
import { uuid } from './helper.service';
import { saveToStorage, getFromStorage } from './storage.service';
import { waitUntilElementExists } from './ui.service';

const getPlayerInfo = () => {
  const playerAttr = $(FUT.PAGE_SELECTORS.selectPlayerContainer).attr(FUT.CUSTOM_ATTRS.selectedPlayer);
  let playerName = null;
  let playerRating = null;
  if (playerAttr) {
    [playerName, playerRating] = playerAttr.split('/');
  }
  return playerName ? {
    name: playerName,
    rating: playerRating,
  } : null;
};

const getQuality = () => {
  const input = $(FUT.PAGE_SELECTORS.qualityInput);
  const isSelected = input.hasClass(FUT.CLASSES.inputHasSelection);
  const src = input.find('img').attr('src');
  const title = input.find('span.label').text();

  return isSelected ? {
    title,
    img: src,
  } : null;
};

const getRarity = () => {
  const input = $(FUT.PAGE_SELECTORS.rarityInput);
  const isSelected = input.hasClass(FUT.CLASSES.inputHasSelection);
  const src = input.find('img').attr('src');
  const title = input.find('span.label').text();

  return isSelected ? {
    title,
    img: src,
  } : null;
};

const getPosition = () => {
  const input = $(FUT.PAGE_SELECTORS.positionInput);
  const isSelected = input.hasClass(FUT.CLASSES.inputHasSelection);
  const title = input.find('span.label').text();
  const src = input.find('img').attr('src');

  return isSelected ? {
    title,
    src,
  } : null;
};

const getNation = () => {
  const input = $(FUT.PAGE_SELECTORS.nationInput);
  const isSelected = input.hasClass(FUT.CLASSES.inputHasSelection);
  const src = input.find('img').attr('src');
  const title = input.find('span.label').text();

  return isSelected ? {
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
    title,
    img: src,
  } : null;
};

const getMaxBuyNow = () => {
  const value = $(FUT.PAGE_SELECTORS.maxBuyNowInput).val();
  return value ? parseStringToInt(value) : null;
};

export const overridePlayerSearch = async () => {
  waitUntilElementExists(FUT.PAGE_SELECTORS.playerResultsList)
    .then(() => {
      $(FUT.PAGE_SELECTORS.selectPlayerContainer)
        .find(FUT.PAGE_SELECTORS.clearPlayerButton)
        .on('click', () => $(FUT.PAGE_SELECTORS.selectPlayerContainer).removeAttr(FUT.CUSTOM_ATTRS.selectedPlayer));
      $(FUT.PAGE_SELECTORS.selectPlayerInput)
        .on('input', function (e) {
          if ($(e.target).val() == '') {
            $(FUT.PAGE_SELECTORS.selectPlayerContainer).removeAttr(FUT.CUSTOM_ATTRS.selectedPlayer);
          }
        });
      $(FUT.PAGE_SELECTORS.playerResultsList)
        .on('click', function(e) {
          const target = $(e.target);
          const button = target.is('span') ? target.parent() : target;
          const name = button.find('.btn-text').text();
          const rating = button.find('.btn-subtext').text();
          $(FUT.PAGE_SELECTORS.selectPlayerContainer).attr(FUT.CUSTOM_ATTRS.selectedPlayer, `${name}/${rating}`);
        });
    });
};

export const addSaveFilterButton = () => {
  const newButton = $(FUT.PAGE_SELECTORS.actionButton).clone();
  newButton.text('Save Filter');
  newButton.addClass(FUT.CUSTOM_CLASSES.addFilterButton);
  newButton.css('background-color', '#257d67');
  newButton.on('click', async () => {
    await saveSearchFilterToStorage();
  });
  $(FUT.PAGE_SELECTORS.actionButtonsContainer).append(newButton);
};

const getMarketSearchCriteria = async () => {
  const player = await getPlayerInfo();
  const position = getPosition();
  const quality = getQuality();
  const rarity = getRarity();
  const maxBuy = getMaxBuyNow();
  let nation = getNation();
  let league = getLeague();
  let team = getTeam();

  return {
    id: uuid(),
    player,
    position,
    quality,
    rarity,
    nation,
    league,
    team,
    maxBuy,
  };
};

const saveSearchFilterToStorage = async () => {
  try {
    const newFilter = await getMarketSearchCriteria();
    const isValid = Object.values(dissoc('maxBuy', dissoc('id', newFilter))).filter(Boolean).length > 0 && newFilter.maxBuy;

    if (!isValid) {
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
    maxBuy: newMaxBuy,
  } : filter);
  await saveToStorage({
    filters
  });
  return filters;
};

export const initSearchMarketPage = () => {
  if (!$(`.${FUT.CUSTOM_CLASSES.addFilterButton}`).length) {
    overridePlayerSearch();
    addSaveFilterButton();
  }
};
