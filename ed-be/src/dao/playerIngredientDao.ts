import { PlayerIngredient } from '../entity/index.js';
import { AppDataSource } from '../data-source.js';
import { UpdateResult } from 'typeorm';

const ingredientRepository = AppDataSource.getRepository(PlayerIngredient);

const getAllIngredientsDataRequest = async (playerId: number): Promise<Array<PlayerIngredient>> => {
	return await ingredientRepository
		.createQueryBuilder('ingredient')
		.innerJoin('ingredient.player', 'player', 'player.id = :pId', { pId: playerId })
		.getMany();
};

export async function addIngredient(itemId: number, quantity: number, playerId: number): Promise<UpdateResult> {
	return ingredientRepository
		.createQueryBuilder('ingredient')
		.update(PlayerIngredient)
		.set({ quantity: () => 'quantity + :addQuantity' })
		.setParameter('addQuantity', quantity)
		.where('ingredientId = :iId AND player.id = :pId', { iId: itemId, pId: playerId })
		.execute();
}

export async function createIngredient(item: PlayerIngredient): Promise<PlayerIngredient> {
	return ingredientRepository.save(item);
}

export { getAllIngredientsDataRequest };
