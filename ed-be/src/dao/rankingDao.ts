import { AppDataSource } from '../data-source.js';
import { Ranking } from '../entity/ranking.js';
import { UpdateResult } from 'typeorm';
import { NewPositions } from '../models/index.js';

const rankingRepository = AppDataSource.getRepository(Ranking);

const addPlayerInRanking = (playerId: number): Promise<Ranking> => {
	return rankingRepository.save({
		player: {
			id: playerId
		}
	});
};

const getPlayersPoints = (): Promise<Array<Ranking>> => {
	return rankingRepository
		.createQueryBuilder('ranking')
		.select(['ranking.sumPoints', 'ranking.averagePoints', 'ranking.dinozCount'])
		.addSelect(['player.id'])
		.leftJoin('ranking.player', 'player')
		.getMany();
};

const getPlayersAverageRanking = (page: number): Promise<Array<Ranking>> => {
	return rankingRepository
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
		.getMany();
};

const getPlayersSumRanking = (page: number): Promise<Array<Ranking>> => {
	return rankingRepository
		.createQueryBuilder('ranking')
		.select([
			'ranking.sumPosition',
			'ranking.sumPointsDisplayed',
			'ranking.dinozCountDisplayed',
			'ranking.averagePointsDisplayed'
		])
		.addSelect(['player.id', 'player.name'])
		.leftJoin('ranking.player', 'player')
		.where('"averagePosition" >= (:page - 1) * 20 + 1 AND "averagePosition" <= :page * 20', { page: page })
		.getMany();
};

const updatePoints = async (
	playerId: number,
	sumPoints: number,
	averagePoints: number,
	dinozCount: number
): Promise<UpdateResult> => {
	return rankingRepository
		.createQueryBuilder('ranking')
		.update(Ranking)
		.set({
			sumPoints: sumPoints,
			averagePoints: averagePoints,
			dinozCount: dinozCount
		})
		.where('player.id = :pId', { pId: playerId })
		.execute();
};

const updateRanking = (newPositions: NewPositions): Promise<UpdateResult> => {
	return rankingRepository
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
};

export {
	addPlayerInRanking,
	getPlayersAverageRanking,
	getPlayersPoints,
	getPlayersSumRanking,
	updatePoints,
	updateRanking
};
