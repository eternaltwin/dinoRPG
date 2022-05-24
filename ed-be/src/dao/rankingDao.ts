import pkg from 'sequelize';
const { Op } = pkg;
import { NewPositions, Player, Ranking } from '../models/index.js';

const addPlayerInRanking = (playerId: number): Promise<Ranking> => {
	return Ranking.create({
		playerId: playerId
	});
};

const updatePoints = (
	playerId: number,
	sumPoints: number,
	averagePoints: number,
	dinozCount: number
): Promise<[number, Array<Ranking>]> => {
	return Ranking.update(
		{
			sumPoints: sumPoints,
			averagePoints: averagePoints,
			dinozCount: dinozCount
		},
		{
			where: { playerId: playerId }
		}
	);
};

const updateRanking = (newPositions: NewPositions): Promise<[number, Array<Ranking>]> => {
	return Ranking.update(
		{
			sumPosition: newPositions.sumPosition,
			averagePosition: newPositions.averagePosition,
			sumPointsDisplayed: newPositions.sumPointsDisplayed,
			averagePointsDisplayed: newPositions.averagePointsDisplayed,
			dinozCountDisplayed: newPositions.dinozCountDisplayed
		},
		{
			where: { playerId: newPositions.playerId }
		}
	);
};

const getPlayersPoints = (): Promise<Array<Ranking>> => {
	return Ranking.findAll({
		attributes: ['playerId', 'sumPoints', 'averagePoints', 'dinozCount']
	});
};

const getPlayersSumRanking = (page: number): Promise<Array<Ranking>> => {
	return Ranking.findAll({
		attributes: ['playerId', 'sumPosition', 'sumPointsDisplayed', 'dinozCountDisplayed', 'averagePointsDisplayed'],
		include: [
			{
				model: Player,
				attributes: ['name']
			}
		],
		where: {
			sumPosition: {
				[Op.between]: [(page - 1) * 20 + 1, page * 20]
			}
		},
		order: ['sumPosition']
	});
};

const getPlayersAverageRanking = (page: number): Promise<Array<Ranking>> => {
	return Ranking.findAll({
		attributes: ['playerId', 'averagePosition', 'sumPointsDisplayed', 'dinozCountDisplayed', 'averagePointsDisplayed'],
		include: [
			{
				model: Player,
				attributes: ['name']
			}
		],
		where: {
			averagePosition: {
				[Op.between]: [(page - 1) * 20 + 1, page * 20]
			}
		},
		order: ['averagePosition']
	});
};

export {
	addPlayerInRanking,
	updatePoints,
	updateRanking,
	getPlayersPoints,
	getPlayersSumRanking,
	getPlayersAverageRanking
};
