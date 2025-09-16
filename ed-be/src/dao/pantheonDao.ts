import { prisma } from '../prisma.js';
import { PantheonMotif, Dinoz, Player, Prisma } from '@drpg/prisma';

export async function getPantheonFromType(type: PantheonMotif) {
	return await prisma.pantheon.findMany({
		where: {
			motif: type
		},
		select: {
			player: {
				select: {
					rewards: {
						select: {
							rewardId: true
						}
					}
				}
			},
			dinoz: {
				select: {
					raceId: true
				}
			},
			indicator: true
		}
	});
}

export async function addDinozToPantheon(
	type: PantheonMotif,
	dinoz: Pick<Dinoz, 'playerId' | 'id' | 'level'> & { player: Pick<Player, 'id' | 'name'> },
	display: Buffer<ArrayBufferLike> | undefined
) {
	await prisma.pantheon.create({
		data: {
			playerId: dinoz.playerId,
			motif: type,
			dinozId: dinoz.id,
			indicator: dinoz.level,
			playerName: dinoz.player.name,
			image: display
		}
	});
}

export async function addPlayerToPantheon(type: PantheonMotif, player: Pick<Player, 'id' | 'name'>, rewardId: number) {
	await prisma.pantheon.create({
		data: {
			playerId: player.id,
			motif: type,
			indicator: rewardId,
			playerName: player.name
		}
	});
}

export async function getPantheons(
	type: PantheonMotif,
	level: number | null,
	raceId: number | null,
	rewardId: number | null
) {
	const where: Prisma.PantheonWhereInput = {};

	where.motif = type;

	if (level) {
		where.indicator = level;
		where.dinoz = { isNot: null };
	}

	if (raceId) {
		where.dinoz = { isNot: null };
		where.dinoz = { raceId: raceId };
	}

	if (rewardId) {
		where.indicator = rewardId;
		where.dinoz = { is: null };
	}

	const pantheon = await prisma.pantheon.findMany({
		where,
		take: 5,
		include: {
			dinoz: {
				select: {
					id: true,
					display: true,
					name: true,
					raceId: true
				}
			},
			player: {
				select: {
					name: true,
					id: true
				}
			}
		}
	});

	return pantheon;
}
