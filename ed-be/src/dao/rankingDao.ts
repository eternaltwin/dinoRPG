import { prisma } from '../prisma.js';

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
			points: true
		}
	});
}

export async function getPlayersAverageRanking(page: number) {
	return prisma.ranking.findMany({
		select: {
			points: true,
			average: true,
			dinozCount: true,
			player: {
				select: {
					id: true,
					name: true
				}
			}
		},
		orderBy: [{ average: 'desc' }, { player: { name: 'asc' } }],
		take: 20,
		skip: (page - 1) * 20
	});
}

export async function getPlayersSumRanking(page: number) {
	return prisma.ranking.findMany({
		select: {
			points: true,
			average: true,
			dinozCount: true,
			player: {
				select: {
					id: true,
					name: true
				}
			}
		},
		orderBy: [{ points: 'desc' }, { player: { name: 'asc' } }],
		take: 20,
		skip: (page - 1) * 20
	});
}

export async function updatePoints(playerId: number, points: number) {
	const ranking = await prisma.ranking.findUnique({
		where: {
			playerId
		},
		select: {
			points: true,
			dinozCount: true
		}
	});

	if (!ranking) {
		throw new Error('Player ranking not found');
	}

	const newPoints = ranking.points + points;

	await prisma.ranking.update({
		where: {
			playerId
		},
		data: {
			points: newPoints,
			average: Math.round(newPoints / ranking.dinozCount)
		}
	});
}

export async function updateDinozCount(playerId: number, dinozCount: number) {
	const ranking = await prisma.ranking.findUnique({
		where: {
			playerId
		},
		select: {
			points: true,
			dinozCount: true
		}
	});

	if (!ranking) {
		throw new Error('Player ranking not found');
	}

	await prisma.ranking.update({
		where: {
			playerId
		},
		data: {
			dinozCount: ranking.dinozCount + dinozCount,
			average: Math.round((ranking.points + dinozCount) / ranking.dinozCount)
		}
	});
}

export async function getPlayerPositionDAO(playerId: number) {
	const playerRanking = await prisma.ranking.findUnique({
		where: {
			playerId
		},
		select: {
			points: true,
			player: {
				select: {
					name: true
				}
			}
		}
	});

	if (playerRanking === null) {
		throw new Error('Player ranking not found');
	}

	const above = await prisma.ranking.count({
		where: {
			OR: [
				{
					points: {
						gt: playerRanking.points
					}
				},
				{
					points: {
						equals: playerRanking.points
					},
					player: {
						name: {
							lt: playerRanking.player?.name ?? ''
						}
					}
				}
			]
		}
	});

	return above + 1;
}
