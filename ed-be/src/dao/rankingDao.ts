import { prisma } from '../prisma.js';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';

export async function addPlayerInRanking(playerId: string) {
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

export async function getPlayersCompletionRanking(page: number) {
	return prisma.ranking.findMany({
		select: {
			points: true,
			completion: true,
			dinozCount: true,
			player: {
				select: {
					id: true,
					name: true
				}
			}
		},
		orderBy: [{ completion: 'desc' }, { player: { name: 'asc' } }],
		take: 20,
		skip: (page - 1) * 20
	});
}

export async function getPlayersDojoRanking(page: number) {
	const pageSize = 20;

	return prisma.ranking.findMany({
		select: {
			dojo: true,
			player: {
				select: {
					id: true,
					name: true,
					Dojo: {
						select: {
							DojoChallengeHistory: true
						}
					}
				}
			}
		},
		orderBy: [{ dojo: 'desc' }, { player: { name: 'asc' } }],
		take: pageSize,
		skip: (page - 1) * pageSize
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

// Increment player points by the provided value.
// If the value is negative, this effectively decrements the player's points.
export async function updatePoints(playerId: string, points: number) {
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
		throw new ExpectedError('Player ranking not found');
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

export async function updateCompletion(playerId: string, completion: number) {
	await prisma.ranking.update({
		where: {
			playerId
		},
		data: {
			completion: completion
		}
	});
}

export async function updateDojoPoints(playerId: string, dojo: number) {
	await prisma.ranking.update({
		where: {
			playerId
		},
		data: {
			dojo: dojo
		}
	});
}

export async function updateDinozCount(playerId: string, dinozCount: number) {
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
		throw new ExpectedError('Player ranking not found');
	}

	await prisma.ranking.update({
		where: {
			playerId
		},
		data: {
			dinozCount: ranking.dinozCount + dinozCount
		}
	});
}

export async function getPlayerPositionDAO(playerId: string) {
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
		throw new ExpectedError('Player ranking not found');
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

export async function getPlayerPositionDojoDAO(playerId: string) {
	const playerRanking = await prisma.ranking.findUnique({
		where: {
			playerId
		},
		select: {
			dojo: true,
			player: {
				select: {
					name: true
				}
			}
		}
	});

	if (playerRanking === null) {
		throw new ExpectedError('Player ranking not found');
	}

	const above = await prisma.ranking.count({
		where: {
			OR: [
				{
					dojo: {
						gt: playerRanking.dojo
					}
				},
				{
					dojo: {
						equals: playerRanking.dojo
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
