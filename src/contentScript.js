import { checkTransferMarket } from './services/fetch.service';
import { getMarketSearchCriteria } from './services/marketSearchCriteria.service';

$(() => {
  const searchOnMarket = async () => {
    await checkTransferMarket(getMarketSearchCriteria());
  };
  const searchOnMarketButton = $('<input/>').attr({
    type: 'button',
    id: 'searchOnMarke',
    value: 'Search on market',
  }).on('click', searchOnMarket);

  $('body').append(searchOnMarketButton);
});
