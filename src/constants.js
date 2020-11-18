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
  from: 2,
  to: 2.5,
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
