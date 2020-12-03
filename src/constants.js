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
  SOLD: {
    url: 'trade/sold',
    method: 'DELETE',
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
    url: 'marketdata/item/pricelimits',
    method: 'GET',
  },
  PLAYERS: {
    host: 'https://www.ea.com/fifa/ultimate-team/web-app/',
    url: 'content/{appGuid}/2021/fut/items/web/players.json',
    method: 'GET',
  },
  TRADEPILE: {
    url: 'tradepile',
    method: 'GET',
  },
};
export const CAPTCHA_ERROR_CODE = 458;
export const TRANSFERLIST_FULL = {
  errorCode: 473,
  reason: 'Destination Full',
};

export const COIN_ICON_SRC = 'images/coinIcon.png';
export const BACKGROUND_1 = 'images/backgrounds/BG_Tablet-Web-1080p.jpg';

export const HOUR_IN_SECONDS = 3600;

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

export const STEP_INFO = {
  rating: {
    min: 40,
    max: 99
  },
  workingMinutes: {
    min: 1,
    max: 20,
  },
  pauseAfterStep: {
    min: 0,
    max: 50,
  }
};

export const TRANSFER_LIST_LIMIT = {
  min: 25,
  max: 100,
};

export const MAX_SCENARIO_DURATION_IN_HOURS = 20;
export const DEFAULT_WORKING_MINUTES = 1;

export const MARK_COLORS = ['#60bd4e', '#f2d600', '#ff9e19', '#eb5b46', '#c278e0', '#0379bf', '#03c2df'];

export const MODALS = {
  SCENARIO_CONSTRUCTOR: 'scenario_constructor',
  RUNNER: 'runner',
};

export const RUNNER_STATUS = {
  WORKING: 'working',
  IDLE: 'idle',
  PAUSE: 'pause',
  STOP: 'stop',
  SEARCHING_PLAYERS: 'Searching players',
  CALCULATING_SELL_PRICE: 'calculating sell price',
  SYNCING_TRANSFERS: 'syncing transfers',
  MOVING_TO_AUCTION: 'moving to auction',
  BUYING: 'buying',
  SENDING_TO_TRANSFER_LIST: 'sending to transfers',
};

export const SEARCH_REQUEST_INTERVAL_RANGE_IN_SECONDS = {
  from: 3,
  to: 4.3,
};

export const PURCHASE_DELAY = {
  from: 0.2,
  to: 0.6,
};

export const SEARCH_REQUEST_RANGE_BETWEEN_PAGES_IN_SECONDS = {
  from: 1,
  to: 1.5,
};

export const SHORT_DELAY_BEFORE_DEFAULT_REQUEST_RANGE = {
  from: 1,
  to: 1.5,
};

export const LONG_DELAY_BEFORE_DEFAULT_REQUEST_RANGE = {
  from: 2.5,
  to: 3.5,
};

export const DELAY_BEFORE_MOVING_TO_TRANSFER_LIST_RANGE = {
  from: 2,
  to: 2.5,
};
export const PIN_EVENT_DELAY = 2;

export const FUT_COMMISSION_IN_PERCENT = 5;

export const MAX_PAGES_TO_SEARCH_ON = 4;
export const SEARCH_ITEMS_THAT_SIGNAL_ABOUT_PAGINATION = 21;
export const SEARCH_ITEMS_PAGE_SIZE = 20;

export const SEARCH_ITEMS_PAGE_SIZE_ON_PRICE_CHECK = 47;
export const MAX_PAGES_TO_SEARCH_ON_PRICE_CHECK = 10;

export const PRICE_CACHE_LIFE_MINUTES = 7;

export const MAX_PLAYERS_TO_BUY_IN_ONE_STEP = 2;

export const PERCENT_AFTER_WHICH_RESET_MIN_BUY = 40;
export const MIN_BUY_AFTER_WHICH_RESET_MIN_BUY = {
  min: 350,
  max: 30000
};

export const MIN_EXPIRES_TO_BUY = 15;

export const FUT = {
  PILE: {
    club: 'club',
    trade: 'trade',
  },
  TRADE_STATE: {
    active: 'active',
    closed: 'closed',
    expired: 'expired',
  },
  PAGE_SELECTORS: {
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
    rootView: '.ut-root-view',
    openHomeButton: '.ut-tab-bar-item.icon-home',
    appHeader: '.ut-fifa-header-view',
  },
  CLASSES: {
    inputHasSelection: 'has-selection',
    marketSearchView: 'ut-market-search-filters-view',
  },
  CUSTOM_CLASSES: {
    headerActionsContainer: 'header-custom-buttons-container',
    addFilterButton: 'custom-button-add-filter',
  },
  CUSTOM_ATTRS: {
    selectedPlayer: 'data-selected-player',
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

export const SEARCH_ITEMS_ORDER_CONFIG = [
  {
    path: ['buyNowPrice'],
    isAscending: true,
  },
  {
    path: ['itemData', 'rating'],
  },
  {
    path: ['itemData', 'owners'],
    isAscending: true,
  },
  {
    path: ['pageNumber'],
  },
];

export const WEB_APP_BUNDLE_URL = './futWebApp.bundle.js';

export const FUT_WEB_APP_DATA_TYPE = {
  PIN: 'pin',
  SESSION_ID: 'session-id',
  APP_GUID: 'app-guid',
};

export const FUT_WEB_APP_EVENTS = {
  TRANSFERS_HUB: 'Hub - Transfers',
  TRANSFERS_LIST: 'Transfer List - List View',
  TRANSFER_MARKET_SEARCH: 'Transfer Market Search',
  TRANSFER_MARKET_SEARCH_RESULT: 'Transfer Market Results - List View',
  ITEM_DETAIL_VIEW: 'Item - Detail View',
};
