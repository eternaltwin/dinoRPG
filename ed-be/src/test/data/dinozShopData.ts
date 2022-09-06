import { PlayerDinozShop } from '../../entity/index.js';
import { raceList } from '../../constants/index.js';
import { dinozId, player } from '../utils/constants.js';

export const DinozFromShop: PlayerDinozShop = {
	id: dinozId,
	display: 'sdf8s165fs',
	player: {
		id: player.id_1,
		money: 200000,
		rank: {
			dinozCount: 2,
			sumPointsDisplayed: 5,
			sumPoints: 5,
			averagePointsDisplayed: 4,
			averagePoints: 4,
			player: { name: 'Biocat' }
		}
	},
	// Use a race with a skill for the test
	raceId: raceList.WINKS.raceId
} as PlayerDinozShop;

export const DinozShopArray = [DinozFromShop, DinozFromShop] as Array<PlayerDinozShop>;
