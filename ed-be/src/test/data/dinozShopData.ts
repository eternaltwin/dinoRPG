import { DinozShop } from '../../models';
import { dinozId, player } from '../utils/constants';

export const DinozFromShop = {
	id: dinozId,
	display: 'sdf8s165fs',
	player: {
		playerId: player.id_1,
		money: 200000,
	},
	raceId: 1,
} as DinozShop;

export const DinozShopArray = [
	DinozFromShop,
	DinozFromShop

] as Array<DinozShop>;
