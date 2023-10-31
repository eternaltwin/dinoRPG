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

const changeItemQuantity = (playerId: number, itemId: number, quantity: number): Promise<UpdateResult> => {
	return itemRepository
		.createQueryBuilder('item')
		.update(PlayerItem)
		.set({ quantity: () => 'quantity + :addQuantity' })
		.setParameter('addQuantity', quantity)
		.where('itemId = :iId AND player.id = :pId', { iId: itemId, pId: playerId })
		.execute();
};

export async function useItemDataRequest(playerId: number, itemId: number): Promise<UpdateResult> {
	return itemRepository
		.createQueryBuilder('item')
		.update(PlayerItem)
		.set({ quantity: () => 'quantity - 1' })
		.where('itemId = :iId AND player.id = :pId', { iId: itemId, pId: playerId })
		.execute();
}

export async function setMultipleItem(item: Array<Partial<PlayerItem>>): Promise<Array<PlayerItem>> {
	return itemRepository.save(item);
}

export { createItemDataRequest, updateItemDataRequest, changeItemQuantity };
