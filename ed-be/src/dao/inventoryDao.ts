import { ItemOwn } from '../models/index.js';

const createItemDataRequest = (item: ItemOwn): Promise<ItemOwn> => {
	return ItemOwn.create(item);
};

const updateItemDataRequest = (
	playerId: number,
	itemId: number,
	newQuantity: number
): Promise<[number, Array<ItemOwn>]> => {
	return ItemOwn.update(
		{
			quantity: newQuantity
		},
		{
			where: { playerId: playerId, itemId: itemId }
		}
	);
};

export { createItemDataRequest, updateItemDataRequest };
