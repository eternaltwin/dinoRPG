import { AppDataSource } from '../data-source.js';
import { Ranking } from '../entity/ranking.js';
import { UpdateResult } from 'typeorm';
import { NewPositions } from '@drpg/core/models/player/NewPositions';

export async function addPlayerInRanking(playerId: number): Promise<Ranking> {
	return AppDataSource.getRepository(Ranking).save({
		player: {
			id: playerId
		}
	});
}

export async function getSpecificPlayerPoints(playerId: number): Promise<Ranking | null> {
	return AppDataSource.getRepository(Ranking)
		.createQueryBuilder('ranking')
		.select()
		.addSelect(['player.id'])
		.leftJoin('ranking.player', 'player')
		.where('player.id = :pId', { pId: playerId })
		.getOne();
}

export async function getPlayersPoints(): Promise<Array<Ranking>> {
	return AppDataSource.getRepository(Ranking)
		.createQueryBuilder('ranking')
		.select(['ranking.sumPoints', 'ranking.averagePoints', 'ranking.dinozCount'])
		.addSelect(['player.id'])
		.leftJoin('ranking.player', 'player')
		.getMany();
}

export async function getPlayersAverageRanking(page: number): Promise<Array<Ranking>> {
	return AppDataSource.getRepository(Ranking)
		.createQueryBuilder('ranking')
		.select([
			'ranking.averagePosition',
			'ranking.sumPointsDisplayed',
			'ranking.dinozCountDisplayed',
			'ranking.averagePointsDisplayed'
		])
		.addSelect(['player.id', 'player.name'])
		.leftJoin('ranking.player', 'player')
		.where('"averagePosition" >= (:page - 1) * 20 + 1 AND "averagePosition" <= :page * 20', { page: page })
		.orderBy('ranking.averagePosition', 'ASC')
		.getMany();
}

export async function getPlayersSumRanking(page: number): Promise<Array<Ranking>> {
	return AppDataSource.getRepository(Ranking)
		.createQueryBuilder('ranking')
		.select([
			'ranking.sumPosition',
			'ranking.sumPointsDisplayed',
			'ranking.dinozCountDisplayed',
			'ranking.averagePointsDisplayed'
		])
		.addSelect(['player.id', 'player.name'])
		.leftJoin('ranking.player', 'player')
		.where('"sumPosition" >= (:page - 1) * 20 + 1 AND "sumPosition" <= :page * 20', { page: page })
		.orderBy('ranking.sumPosition', 'ASC')
		.getMany();
}

export async function updatePoints(
	playerId: number,
	sumPoints: number,
	averagePoints: number,
	dinozCount: number
): Promise<UpdateResult> {
	return AppDataSource.getRepository(Ranking)
		.createQueryBuilder('ranking')
		.update(Ranking)
		.set({
			sumPoints: sumPoints,
			averagePoints: averagePoints,
			dinozCount: dinozCount
		})
		.where('player.id = :pId', { pId: playerId })
		.execute();
}

export async function updateRanking(newPositions: NewPositions): Promise<UpdateResult> {
	return AppDataSource.getRepository(Ranking)
		.createQueryBuilder('ranking')
		.update(Ranking)
		.set({
			sumPosition: newPositions.sumPosition,
			averagePosition: newPositions.averagePosition,
			sumPointsDisplayed: newPositions.sumPointsDisplayed,
			averagePointsDisplayed: newPositions.averagePointsDisplayed,
			dinozCountDisplayed: newPositions.dinozCountDisplayed
		})
		.where('player.id = :pId', { pId: newPositions.id })
		.execute();
}
