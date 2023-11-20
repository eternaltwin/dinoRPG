import { Ranking } from "@drpg/prisma";
import { prisma } from "../prisma.js";

export async function addPlayerInRanking(playerId: number) {
	return prisma.ranking.create({
		data: {
			playerId
		}
	});
}

export async function getPlayersPoints() {
	return prisma.ranking.findMany({
		select: {
			sumPoints: true,
			averagePoints: true,
			dinozCount: true,
			player: {
				select: {
					id: true
				}
			}
		}
	});
}

export async function getPlayersAverageRanking(page: number) {
	return prisma.ranking.findMany({
		select: {
			averagePosition: true,
			sumPointsDisplayed: true,
			dinozCountDisplayed: true,
			averagePointsDisplayed: true,
			player: {
				select: {
					id: true,
					name: true
				}
			}
		},
		where: {
			averagePosition: {
				gte: (page - 1) * 20 + 1,
				lte: page * 20
			}
		},
		orderBy: {
			averagePosition: 'asc'
		}
	});
}

export async function getPlayersSumRanking(page: number) {
	return prisma.ranking.findMany({
		select: {
			sumPosition: true,
			sumPointsDisplayed: true,
			dinozCountDisplayed: true,
			averagePointsDisplayed: true,
			player: {
				select: {
					id: true,
					name: true
				}
			}
		},
		where: {
			sumPosition: {
				gte: (page - 1) * 20 + 1,
				lte: page * 20
			}
		},
		orderBy: {
			sumPosition: 'asc'
		}
	});
}

export async function updatePoints(
	playerId: number,
	sumPoints: number,
	averagePoints: number,
	dinozCount: number
) {
	return prisma.ranking.update({
		where: {
			playerId
		},
		data: {
			sumPoints,
			averagePoints,
			dinozCount
		}
	});
}

export async function updateRanking(newRanking: Ranking) {
	return prisma.ranking.update({
		where: {
			id: newRanking.id
		},
		data: {
			sumPosition: newRanking.sumPosition,
			averagePosition: newRanking.averagePosition,
			sumPointsDisplayed: newRanking.sumPointsDisplayed,
			averagePointsDisplayed: newRanking.averagePointsDisplayed,
			dinozCountDisplayed: newRanking.dinozCountDisplayed
		}
	});
}
