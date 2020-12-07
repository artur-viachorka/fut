export const COIN_ICON_SRC = 'images/coinIcon.png';
export const LOADER_GIF = 'images/loader.gif';
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
  from: 2.3,
  to: 3.2,
};

export const PURCHASE_DELAY = {
  from: 1,
  to: 1.5,
};

export const SEARCH_REQUEST_RANGE_BETWEEN_PAGES_IN_SECONDS = {
  from: 1,
  to: 1.5,
};

export const SHORT_DELAY_RANGE = {
  from: 0.5,
  to: 1,
};

export const LONG_DELAY_RANGE = {
  from: 2.5,
  to: 3.5,
};

export const DELAY_BEFORE_MOVING_TO_TRANSFER_LIST_RANGE = {
  from: 2,
  to: 2.5,
};
export const FUT_COMMISSION_IN_PERCENT = 5;

export const MAX_PAGES_TO_SEARCH_ON = 4;
export const SEARCH_ITEMS_THAT_SIGNAL_ABOUT_PAGINATION = 21;
export const SEARCH_ITEMS_PAGE_SIZE = 20;

export const SEARCH_ITEMS_PAGE_SIZE_ON_PRICE_CHECK = 47;
export const MAX_PAGES_TO_SEARCH_ON_PRICE_CHECK = 10;

export const PRICE_CACHE_LIFE_MINUTES = 7;

export const MAX_PLAYERS_TO_BUY_IN_ONE_STEP = 1;

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
  TRADE_STATE: {
    active: 'active',
    closed: 'closed',
    expired: 'expired',
  },
  PAGE_SELECTORS: {
    selectPlayerContainer:  '.inline-list-select.ut-player-search-control',
    selectPlayerInput: '.inline-list-select.ut-player-search-control input',
    clearPlayerButton: '.flat.inline-list-btn.icon_close.fut_icon.exit-btn',
    playerResultsList: '.playerResultsList',
    playerResultsListButton: '.playerResultsList button',
    qualityInput: '.ut-item-search-view .inline-list-select.ut-search-filter-control:nth(0)',
    rarityInput: '.ut-item-search-view .inline-list-select.ut-search-filter-control:nth(1)',
    positionInput: '.ut-item-search-view .inline-list-select.ut-search-filter-control:nth(2)',
    nationInput: '.ut-item-search-view .inline-list-select.ut-search-filter-control:nth(4)',
    leagueInput: '.ut-item-search-view .inline-list-select.ut-search-filter-control:nth(5)',
    teamInput: '.ut-item-search-view .inline-list-select.ut-search-filter-control:nth(6)',
    maxBuyNowInput: '.search-prices > div:nth-child(6) input',
    minBuyNowInput: '.search-prices > div:nth-child(5) input',
    minBidInput: '.search-prices > div:nth-child(2) input',
    itemSearchView: '.ut-item-search-view',
    transferHub: '.TransfersHub',
    transferMarketTile: '.ut-tile-transfer-market',
    transfersTile: '.ut-tile-transfer-list',
    mainNavTransfersButton: '.ut-tab-bar-item.icon-transfer',
    searchMarketView: '.ut-market-search-filters-view',
    transfersView: '.ut-transfer-list-view',
    actionButton: '.ut-market-search-filters-view .button-container .btn-standard:first',
    actionButtonsContainer: '.ut-market-search-filters-view .button-container',
    credits: '.view-navbar-currency > .view-navbar-currency-coins:first',
    notificationLayer: '#NotificationLayer',
    rootView: '.ut-root-view',
    openHomeButton: '.ut-tab-bar-item.icon-home',
    appHeader: '.ut-fifa-header-view',
    resetButton: '.ut-market-search-filters-view .button-container .btn-standard:first',
    searchButton: '.ut-market-search-filters-view .button-container .btn-standard.call-to-action:first',
    searchResultsContainer: '.SearchResults',
    searchResultsListItem: '.SearchResults .ut-pinned-list > ul > li',
    searchNoResults: '.SearchResults .ut-no-results-view',
    nextButton: '.pagingContainer > .flat.pagination.next',
    prevButton: '.pagingContainer > .flat.pagination.prev',
    playerOverviewRating: '.ut-item-view .playerOverview .rating',
    playerBuyNow: '.auction > div:nth-child(3) > span.currency-coins',
    buyNowActionButton: '.DetailPanel > .bidOptions .btn-standard.buyButton.currency-coins',
    confirmBuyModalOkButton: '.dialog-body > .ut-button-group > button:first-child',
    playerDetails: {
      inSlide: '.DetailView .tns-slide-active .player.item',
      inCarousel: '.DetailView .detail-carousel .slider .player.item',
    },
    playerOverviewActions: '.DetailView .DetailPanel .ut-button-group > button:visible > .btn-text',
    transferListSection: '.ut-transfer-list-view .sectioned-item-list',
    transferListSectionHeaderAction: '.ut-section-header-view .btn-standard.call-to-action',
    transferListSectionItems: '.itemList > li',
    transferListEmptySection: '.ut-empty-section-view',
  },
  CLASSES: {
    inputHasSelection: 'has-selection',
    marketSearchView: 'ut-market-search-filters-view',
  },
  CUSTOM_CLASSES: {
    headerActionsContainer: 'header-custom-buttons-container',
    addFilterButton: 'custom-button-add-filter',
    loader: 'custom-fut-loader',
  },
  CUSTOM_ATTRS: {
    selectedPlayer: 'data-selected-player',
  },
};

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

export const FILTERS_FIELDS = {
  PLAYER: 'player',
  POSITION: 'position',
  QUALITY: 'quality',
  RARITY: 'rarity',
  NATION: 'nation',
  LEAGUE: 'league',
  TEAM: 'team',
  MAX_BUY: 'maxBuy',
  MIN_BUY: 'minBuy',
  MIN_BID: 'minBid',
};
