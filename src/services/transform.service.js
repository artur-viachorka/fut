import { reject, anyPass, isEmpty, isNil } from 'ramda';

const removeEmptyItems = (obj) => reject(anyPass([isEmpty, isNil]))(obj);

export const transformFutItemFromFUT = (result) => ({
  id: result.id,
  lastSalePrice: result.lastSalePrice,
  owners: result.owners,
  rating: result.rating,
  marketDataMaxPrice: result.marketDataMaxPrice,
  marketDataMinPrice: result.marketDataMinPrice,
});

export const transformAuctionInfoFromFUT = (result) => ({
  bidState: result.bidState,
  buyNowPrice: result.buyNowPrice,
  confidenceValue: result.confidenceValue,
  currentBid: result.currentBid,
  expires: result.expires,
  itemData: transformFutItemFromFUT(result.itemData),
  offers: result.offers,
  sellerEstablished: result.sellerEstablished,
  sellerId: result.sellerId,
  sellerName: result.sellerName,
  startingBid: result.startingBid,
  tradeId: result.tradeId,
  tradeIdStr: result.tradeIdStr,
  tradeOwner: result.tradeOwner,
  tradeState: result.tradeState,
  watched: result.watched,
});

export const transformSearchResultFromFUT = (result) => ({
  auctionInfo: result.auctionInfo.map(transformAuctionInfoFromFUT)
});

export const transformSearchParamsToFUT = (params) => removeEmptyItems({
  num: params.num,
  start: params.start,
  type: params.type,
  maskedDefId: params.maskedDefId,
  zone: params.zone,
  pos: params.pos,
  lev: params.lev,
  rare: params.rare,
  nat: params.nat,
  leag: params.leag,
  team: params.team,
  rarityIds: params.rarityIds,
  micr: params.micr,
  macr: params.macr,
  minb: params.minb,
  maxb: params.maxb,
});

export const transformPlayerToBidPlayerBodyRequest = (player) => ({
  bid: player.buyNowPrice,
});

export const transformPlayerToBidPlayerUrlParams = (player) => ({
  name: 'tradeId',
  value: player.tradeId,
});

export const transformBidPlayerResultFromFUT = (result) => ({
  auctionInfo: result.auctionInfo.map(transformAuctionInfoFromFUT),
  credits: result.credits,
  duplicateItemIdList: result?.duplicateItemIdList ? result.duplicateItemIdList.map(item => ({ itemId: item.itemId, duplicateItemId: item.duplicateItemId })) : [],
});

export const transformSendItemsToBodyRequest = (ids, pile) => ({
  itemData: ids.map(id => ({ id, pile })),
});

export const transformToLiteQueryParams = (tradeIds) => `tradeIds=${tradeIds.join(',')}`;

export const transformSendItemDataFromFUT = (result) => ({
  itemData: (result.itemData || []).map(item => ({
    id: item.id,
    pile: item.pile,
    success: item.success,
    errorCode: item.errorCode,
    reason: item.reason,
  })),
});

export const transformPriceLimitsFromFUT = (result) => (result || []).map(item => ({
  defId: item.defId,
  itemId: item.itemId,
  maxPrice: item.maxPrice,
  minPrice: item.minPrice,
  source: item.source,
}));

export const transformToPriceLimitsParams = (itemId) => ({
  itemIdList: itemId,
});

export const transformAuctionHouseBody = (itemId, startingBid, buyNowPrice, duration) => ({
  itemData: {
    id: itemId
  },
  startingBid,
  duration,
  buyNowPrice,
});

export const transformAuctionHouseFromFUT = (result) => ({
  id: result.id
});
