import { checkTransferMarket } from './services/fetch.service';
import { getMarketSearchCriteria } from './services/marketSearchCriteria.service';

$(document).ready(() => {
  const searchOnMarket = async () => {
    await checkTransferMarket(getMarketSearchCriteria());
  };
  const searchOnMarketButton = $('<input/>').attr({
    type: 'button',
    id: 'searchOnMarke',
    value: 'Search on market',
  }).click(searchOnMarket);

  $('body').append(searchOnMarketButton);
});
