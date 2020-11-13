import { sendRequest } from './fetch.service';
import { ROUTES } from '../constants';

export const searchPlayersOnMarket = async (params) => {
  return await sendRequest(ROUTES.TRANSFERMARKET, params);
};
