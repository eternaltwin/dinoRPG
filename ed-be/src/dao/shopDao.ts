import { DinozRace, DinozShop, Player, Skill } from '../models/index.js';

const getDinozFromDinozShopRequest = (
	playerId: number
): Promise<Array<DinozShop>> => {
	return DinozShop.findAll({
		attributes: ['id', 'display'],
		include: {
			model: DinozRace,
			attributes: ['raceId', 'name'],
			required: false,
			include: [
				{
					model: Skill,
					attributes: ['name'],
					required: false,
				},
			],
		},
		where: { playerId: playerId },
	});
};

const createMultipleDinoz = (
	dinozArray: Array<DinozShop>
): Promise<Array<DinozShop>> => {
	return DinozShop.bulkCreate(dinozArray);
};

const getDinozDetailsRequest = (dinozId: number): Promise<DinozShop | null> => {
	return DinozShop.findOne({
		attributes: ['display', 'raceId'],
		include: [
			{
				model: Player,
				attributes: ['playerId', 'money'],
				required: false,
			},
		],
		where: { id: dinozId },
	});
};

const deleteDinozInShopRequest = (playerId: number): Promise<number> => {
	return DinozShop.destroy({
		where: { playerId: playerId },
	});
};

export {
	getDinozFromDinozShopRequest,
	createMultipleDinoz,
	getDinozDetailsRequest,
	deleteDinozInShopRequest,
};
