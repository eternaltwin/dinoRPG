import { DinozShop, Player, Ranking } from '../models/index.js';

const getDinozFromDinozShopRequest = (
	playerId: number
): Promise<Array<DinozShop>> => {
	return DinozShop.findAll({
		attributes: ['id', 'display', 'raceId'],
		where: { playerId: playerId }
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
				include: [
					{
						model: Ranking,
						attributes: [
							'dinozCount',
							'sumPointsDisplayed',
							'sumPoints',
							'averagePointsDisplayed',
							'averagePoints'
						]
					}
				]
			}
		],
		where: { id: dinozId }
	});
};

const deleteDinozInShopRequest = (playerId: number): Promise<number> => {
	return DinozShop.destroy({
		where: { playerId: playerId }
	});
};

export {
	getDinozFromDinozShopRequest,
	createMultipleDinoz,
	getDinozDetailsRequest,
	deleteDinozInShopRequest
};
