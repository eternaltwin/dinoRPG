import { Dinoz } from '../../models';
import { player, dinozId } from '../utils/constants';

export const BasicDinoz = {
	id: dinozId,
	player: {
		playerId: BigInt(player.id_1),
	},
	race: {
		price: 20000,
	},
} as Dinoz;
