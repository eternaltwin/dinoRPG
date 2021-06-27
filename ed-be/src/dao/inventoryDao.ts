import { Inventory } from '../models/index.js';

const getAllItemsDataRequest = (
	playerId: number
): Promise<Array<Inventory> | null> => {
	return Inventory.findAll({
		attributes: ['itemId', 'quantity'],
		where: { playerId: playerId },
	});
};

export { getAllItemsDataRequest };
