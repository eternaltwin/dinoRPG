import { DinozShop } from '../../models';
import { dinozId, player } from '../utils/constants';

export const DinozFromShop = {
	id: dinozId,
	display: 'sdf8s165fs',
	player: {
		playerId: player.id_1,
		money: 200000,
	},
	race: {
		raceId: 1,
		nbrFireCase: 0,
		nbrWoodCase: 2,
		nbrWaterCase: 5,
		nbrLightCase: 3,
		nbrAirCase: 4,
		price: 200,
	},
} as DinozShop;

export const DinozShopArray = [
	DinozFromShop,
	DinozFromShop,
] as Array<DinozShop>;
