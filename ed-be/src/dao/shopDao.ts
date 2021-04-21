import { DinozRace, DinozShop, Player, Skill } from '../models';

const getDinozFromDinozShopRequest = (
	playerId: number
): Promise<Array<DinozShop>> => {
	return DinozShop.findAll({
		attributes: ['id', 'display'],
		include: {
			model: DinozRace,
			attributes: [
				'raceId',
				'name',
				'nbrFireCase',
				'nbrWoodCase',
				'nbrWaterCase',
				'nbrLightCase',
				'nbrAirCase',
				'price',
			],
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
		attributes: ['display'],
		include: [
			{
				model: Player,
				attributes: ['playerId', 'money'],
				required: false,
			},
			{
				model: DinozRace,
				attributes: [
					'raceId',
					'nbrFireCase',
					'nbrWoodCase',
					'nbrWaterCase',
					'nbrLightCase',
					'nbrAirCase',
					'price',
				],
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
