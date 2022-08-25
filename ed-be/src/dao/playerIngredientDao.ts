import { PlayerIngredient } from '../entity/index.js';
import { AppDataSource } from '../data-source.js';

const ingredientRepository = AppDataSource.getRepository(PlayerIngredient);

const getAllIngredientsDataRequest = async (playerId: number): Promise<Array<PlayerIngredient>> => {
	return await ingredientRepository
		.createQueryBuilder('ingredient')
		.innerJoin('ingredient.player', 'player', 'player.id = :pId', { pId: playerId })
		.getMany();
};

export { getAllIngredientsDataRequest };
