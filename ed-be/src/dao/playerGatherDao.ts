import { AppDataSource } from '../data-source.js';
import { PlayerGather } from '../entity/index.js';

const gatherRepository = AppDataSource.getRepository(PlayerGather);

export async function updateGrid(playerId: number, placeId: number, type: number, grid: Array<Array<number>>) {
	return gatherRepository
		.createQueryBuilder('gather')
		.update(PlayerGather)
		.set({ grid: grid })
		.where('place = :plId AND player.id = :pId AND type = :type', { plId: placeId, pId: playerId, type: type })
		.execute();
}

export async function getCommonGatherInfo(playerId: number): Promise<Array<PlayerGather>> {
	return gatherRepository
		.createQueryBuilder('gather')
		.select(['gather.place', 'gather.grid', 'gather.type', 'gather.id'])
		.addSelect(['player.id'])
		.leftJoin('gather.player', 'player')
		.where('gather.player.id = :pId', { pId: playerId })
		.getMany();
}

export async function setGrid(grid: PlayerGather): Promise<PlayerGather> {
	return gatherRepository.save(grid);
}
