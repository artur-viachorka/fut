export const HOST = 'https://utas.external.s2.fut.ea.com/ut/game/fifa21/';
export const ROUTES = {
  TRANSFERMARKET: {
    url: 'transfermarket',
    method: 'GET',
  },
  BID: {
    url: 'trade/{tradeId}/bid',
    method: 'PUT',
  },
  ITEM: {
    url: 'item',
    method: 'PUT',
  },
  LITE: {
    url: 'trade/status/lite',
    method: 'GET',
  },
  AUCTIONHOUSE: {
    url: 'auctionhouse',
    method: 'POST',
  },
  PRICELIMITS: {
    url: 'pricelimits',
    method: 'GET',
  },
  TRADEPILE: {
    url: 'tradepile',
    method: 'GET',
  },
};
export const COIN_ICON_SRC = 'images/coinIcon.png';
export const BACKGROUND_1 = 'images/backgrounds/BG_Tablet-Web-1080p.jpg';

export const REACT_CONTAINER_ID = 'react-app-container';

export const DND_TYPES = {
  FILTER: 'Filter',
  STEP: 'Step',
};

export const BUY_INPUT_SETTINGS = {
  min: 200,
  max: 15000000,
  minBid: 150,
  priceInputRange: {
    min: 400,
    max: 1515000000,
  },
  bidSteps: [
    {
      min: 150,
      max: 1000,
      step: 50,
    },
    {
      min: 1000,
      max: 10000,
      step: 100,
    },
    {
      min: 10000,
      max: 50000,
      step: 250,
    },
    {
      min: 50000,
      max: 100000,
      step: 500,
    },
    {
      min: 100000,
      max: 14999000,
      step: 1000,
    },
  ],
  steps: [
    {
      min: 200,
      max: 1000,
      step: 50,
    },
    {
      min: 1000,
      max: 10000,
      step: 100,
    },
    {
      min: 10000,
      max: 50000,
      step: 250,
    },
    {
      min: 50000,
      max: 100000,
      step: 500,
    },
    {
      min: 100000,
      max: 15000000,
      step: 1000,
    },
  ]
};

export const MAX_SCENARIO_DURATION_IN_HOURS = 20;

export const MARK_COLORS = ['#60bd4e', '#f2d600', '#ff9e19', '#eb5b46', '#c278e0', '#0379bf', '#03c2df'];

export const MODALS = {
  SCENARIO_CONSTRUCTOR: 'scenario_constructor',
  RUNNER: 'runner',
};

export const SEARCH_REQUEST_INTERVAL_RANGE_IN_SECONDS = {
  from: 2.3,
  to: 3.2,
};
export const SEARCH_REQUEST_RANGE_BETWEEN_PAGES_IN_SECONDS = {
  from: 1,
  to: 1.5,
};

export const DELAY_BEFORE_DEFAULT_REQUEST_RANGE = {
  from: 0.7,
  to: 1.3,
};

export const PAUSE_BETWEEN_FOUNDED_RESULT_AND_BUY_REQUEST_IN_SECONDS = 1;
export const PAUSE_BEFORE_MOVING_TO_TRANSFER_LIST = 2;

export const MAX_PAGES_TO_SEARCH_ON = 4;
export const SEARCH_ITEMS_THAT_SIGNAL_ABOUT_PAGINATION = 21;
export const SEARCH_ITEMS_PAGE_SIZE = 20;

export const PERCENT_AFTER_WHICH_RESET_MIN_BUY = 40;
export const MIN_BUY_AFTER_WHICH_RESET_MIN_BUY = {
  min: 350,
  max: 30000
};

export const FUT = {
  PILE: {
    club: 'club',
    trade: 'trade',
  },
  PAGE_SELECTORS: {
    customPlayerInfoBlock: '.ut-player-search-control--input-container input.ut-text-input-control.fut-player-name',
    selectPlayerContainer:  '.inline-list-select.ut-player-search-control',
    selectPlayerInput: '.ut-text-input-control',
    clearPlayerButton: '.flat.inline-list-btn.icon_close.fut_icon.exit-btn',
    playerResultsListContainer: '.inline-list',
    playerResultsList: '.playerResultsList',
    qualityInput: '.ut-item-search-view .inline-list-select.ut-search-filter-control:nth(0)',
    rarityInput: '.ut-item-search-view .inline-list-select.ut-search-filter-control:nth(1)',
    positionInput: '.ut-item-search-view .inline-list-select.ut-search-filter-control:nth(2)',
    nationInput: '.ut-item-search-view .inline-list-select.ut-search-filter-control:nth(4)',
    leagueInput: '.ut-item-search-view .inline-list-select.ut-search-filter-control:nth(5)',
    teamInput: '.ut-item-search-view .inline-list-select.ut-search-filter-control:nth(6)',
    maxBuyNowInput: '.search-prices > div:nth-child(6) input',
    itemSearchView: '.ut-item-search-view',
    actionButton: '.ut-market-search-filters-view .button-container .btn-standard:first',
    actionButtonsContainer: '.ut-market-search-filters-view .button-container',
    credits: '.view-navbar-currency > .view-navbar-currency-coins:first',
    notificationLayer: '#NotificationLayer',
  },
  CLASSES: {
    inputHasSelection: 'has-selection',
  },
  QUALITIES: {
    'special': { rare: 'SP' },
    'gold': { lev: 'gold' },
    'silver': { lev: 'silver' },
    'bronze': { lev: 'bronze' },
  },
  POSITIONS: {
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
  },
};
