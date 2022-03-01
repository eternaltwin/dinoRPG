import { DinozShop } from '../../models';
import { raceList } from '../../constants';
import { dinozId, player } from '../utils/constants';

export const DinozFromShop = {
	id: dinozId,
	display: 'sdf8s165fs',
	player: {
		playerId: player.id_1,
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
} as DinozShop;

export const DinozShopArray = [
	DinozFromShop,
	DinozFromShop
] as Array<DinozShop>;
