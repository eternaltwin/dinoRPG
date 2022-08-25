import { PlayerItem } from '../entity/index.js';
import { AppDataSource } from '../data-source.js';
import { UpdateResult } from 'typeorm';

const itemRepository = AppDataSource.getRepository(PlayerItem);

const createItemDataRequest = (newItem: PlayerItem): Promise<PlayerItem> => {
	return itemRepository.save(newItem);
};

const updateItemDataRequest = (playerId: number, itemId: number, newQuantity: number): Promise<UpdateResult> => {
	return itemRepository
		.createQueryBuilder('item')
		.update(PlayerItem)
		.set({ quantity: newQuantity })
		.where('itemId = :iId AND player.id = :pId', { iId: itemId, pId: playerId })
		.execute();
};

export { createItemDataRequest, updateItemDataRequest };
