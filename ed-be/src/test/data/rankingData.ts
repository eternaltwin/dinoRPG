import { PlayerRanking } from '../../models/index.js';
import { Ranking } from '../../entity/index.js';
import { player } from '../utils/constants.js';

export const playerRanking = {
	dinozCount: 2,
	sumPointsDisplayed: 5,
	sumPoints: 5,
	averagePointsDisplayed: 4,
	averagePoints: 4,
	player: { name: 'Biocat' }
} as Ranking;

export const playersRankingSum = [
	{
		dinozCountDisplayed: 7,
		sumPointsDisplayed: 14,
		player: {
			name: 'Biocat',
			id: 1
		},
		averagePointsDisplayed: 2,
		sumPosition: 1
	},
	{
		dinozCountDisplayed: 4,
		sumPointsDisplayed: 12,
		player: {
			name: 'Jolu',
			id: 1
		},
		averagePointsDisplayed: 3,
		sumPosition: 2
	}
] as Array<Ranking>;

export const playersToUpdatePoints = [
	{
		dinozCount: 7,
		sumPoints: 11,
		player: {
			id: player.id_1
		},
		averagePoints: 2
	},
	{
		dinozCount: 4,
		sumPoints: 12,
		player: {
			id: player.id_2
		},
		averagePoints: 3
	}
] as Array<Ranking>;

export const playersRankingAverage = [
	{
		dinozCountDisplayed: 7,
		sumPointsDisplayed: 14,
		player: {
			name: 'Biocat',
			id: 1
		},
		averagePointsDisplayed: 2,
		sumPosition: 2
	},
	{
		dinozCountDisplayed: 4,
		sumPointsDisplayed: 12,
		player: {
			name: 'Jolu',
			id: 1
		},
		averagePointsDisplayed: 3,
		sumPosition: 1
	}
] as Array<Ranking>;

export const playersRankingSumResult = [
	{
		dinozCount: 7,
		pointCount: 14,
		playerName: 'Biocat',
		playerId: 1,
		pointAverage: 2,
		position: 1
	},
	{
		dinozCount: 4,
		pointCount: 12,
		playerName: 'Jolu',
		playerId: 1,
		pointAverage: 3,
		position: 2
	}
] as Array<PlayerRanking>;

export const playersRankingAverageResult = [
	{
		dinozCount: 7,
		pointCount: 14,
		playerName: 'Biocat',
		playerId: 1,
		pointAverage: 2,
		position: 2
	},
	{
		dinozCount: 4,
		pointCount: 12,
		playerName: 'Jolu',
		playerId: 1,
		pointAverage: 3,
		position: 1
	}
] as Array<PlayerRanking>;
