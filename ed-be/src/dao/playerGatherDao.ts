import { AppDataSource } from '../data-source.js';
import { PlayerGather } from '../entity/index.js';

const gatherRepository = AppDataSource.getRepository(PlayerGather);

export async function updateGrid(playerId: number, placeId: number, grid: Array<Array<number>>) {
	return gatherRepository
		.createQueryBuilder('gather')
		.update(PlayerGather)
		.set({ grid: grid })
		.where('place = :plId AND player.id = :pId', { plId: placeId, pId: playerId })
		.execute();
}
