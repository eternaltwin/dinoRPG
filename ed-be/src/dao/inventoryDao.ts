import { ItemOwn } from '../models/index.js';

const getAllItemsDataRequest = (
	playerId: number
): Promise<Array<ItemOwn> | null> => {
	return ItemOwn.findAll({
		attributes: ['itemId', 'quantity'],
		where: { playerId: playerId }
	});
};

export { getAllItemsDataRequest };
