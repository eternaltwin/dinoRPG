import { ClanChampionshipMatchStatus } from '@drpg/prisma';
import { prisma } from '../prisma.js';
import type { LocalTransactionClient } from './clansDao.js';
import { FighterRecap, FightOutcome, FightProcessResult } from '@drpg/core/models/fight/FightResult';
import { FightStep } from '@drpg/core/models/fight/FightStep';
import { withSpan } from '../utils/server/tracing.js';

export async function archiveFight(
	fight: FightProcessResult,
	winner: boolean,
	leftPlayerId: string,
	rightPlayerId: string | null,
	metaData?: string,
	tx: LocalTransactionClient = prisma
) {
	return withSpan(archiveFight.name, async () => {
		const playerSelect = { select: { id: true, name: true } };
		const archive = await tx.fightArchive.create({
			data: {
				fighters: JSON.stringify(
					fight.fighters.map(f => {
						return {
							id: f.id,
							type: f.type,
							name: f.name,
							display: f.display,
							attacker: f.attacker,
							maxHp: f.maxHp,
							startingHp: f.startingHp,
							energy: f.energy,
							maxEnergy: f.maxEnergy,
							energyRecovery: f.energyRecovery,
							dark: f.dark,
							size: f.size,
							entrance: f.entrance
						};
					})
				),
				steps: JSON.stringify(fight.steps),
				seed: fight.seed,
				result: winner,
				player: { connect: { id: leftPlayerId } },
				leftPlayer: { connect: { id: leftPlayerId } },
				rightPlayer: rightPlayerId ? { connect: { id: rightPlayerId } } : undefined,
				metadata: metaData
			},
			select: {
				id: true,
				fighters: true,
				steps: true,
				seed: true,
				result: true,
				leftPlayer: playerSelect,
				rightPlayer: playerSelect
			}
		});
		return {
			id: archive.id,
			fighters: JSON.parse(archive.fighters) as FighterRecap[],
			result: archive.result,
			history: JSON.parse(archive.steps) as FightStep[],
			seed: archive.seed,
			leftPlayer: archive.leftPlayer,
			rightPlayer: archive.rightPlayer
		};
	});
}

export async function archiveChallenge(
	myDinozId: number,
	opponentId: number,
	challenge: string,
	victory: boolean,
	achieved: boolean,
	dojoId: string
) {
	return withSpan(archiveChallenge.name, async () => {
		const archive = await prisma.dojoChallengeHistory.create({
			data: {
				myDinozId,
				opponentId,
				challenge,
				victory,
				achieved,
				dojo: { connect: { id: dojoId } }
			}
		});
		return archive;
	});
}

export async function viewFight(playerId: string, fightArchiveId: string) {
	return withSpan(viewFight.name, async () => {
		await prisma.fightWatched.upsert({
			where: {
				playerId_fightArchiveId: { playerId, fightArchiveId }
			},
			create: {
				playerId,
				fightArchiveId,
				favorite: false
			},
			update: {
				// Do nothing
			}
		});
	});
}

export async function getViewedTournamentFight(playerId: string, tournamentFights: string[]) {
	return withSpan(getViewedTournamentFight.name, async () => {
		return await prisma.fightWatched.findMany({
			where: {
				AND: [
					{
						fightArchiveId: {
							in: tournamentFights
						}
					},
					{ playerId: playerId }
				]
			}
		});
	});
}

export async function getArchivedFightRequest(archiveId: string) {
	return withSpan(getArchivedFightRequest.name, async () => {
		const playerSelect = { select: { id: true, name: true } };
		const archive = await prisma.fightArchive.findFirst({
			where: {
				id: archiveId
			},
			select: {
				fighters: true,
				steps: true,
				seed: true,
				result: true,
				leftPlayer: playerSelect,
				rightPlayer: playerSelect,
				metadata: true
			}
		});

		return archive;
	});
}

export async function getAllArchivedFightRequest(playerId: string, page: number) {
	return withSpan(getAllArchivedFightRequest.name, async () => {
		const totalArchive = await prisma.fightArchive.count({ where: { playerId } });
		const archive = await prisma.fightArchive.findMany({
			take: 10,
			skip: 10 * page - 10,
			where: {
				playerId
			},
			select: {
				id: true,
				fighters: true,
				metadata: true
			},
			orderBy: {
				createdDate: 'desc'
			}
		});

		return { archive, totalArchive };
	});
}

export async function getClanChampionshipFightParticipants(archiveId: string): Promise<string[] | null> {
	return withSpan(getClanChampionshipFightParticipants.name, async () => {
		const row = await prisma.clanChampionshipFight.findUnique({
			where: { archiveId },
			select: { participantPlayerIds: true }
		});
		return row ? row.participantPlayerIds : null;
	});
}

/**
 * True when the match replay shows this clan championship fight: to any player as soon as the match is played (live or
 * finished), never before.
 */
export async function isClanChampionshipFightReplayable(archiveId: string): Promise<boolean> {
	return withSpan(isClanChampionshipFightReplayable.name, async () => {
		const row = await prisma.clanChampionshipFight.findUnique({
			where: { archiveId },
			select: { match: { select: { status: true } } }
		});
		return !!row && row.match.status !== ClanChampionshipMatchStatus.scheduled;
	});
}

const archiveSummarySelect = {
	id: true,
	createdDate: true,
	result: true,
	fighters: true,
	metadata: true,
	tournamentId: true,
	FBTournamentId: true,
	leftPlayer: { select: { id: true, name: true } },
	rightPlayer: { select: { id: true, name: true } },
	FightWatched: { where: { favorite: true }, select: { playerId: true } }
} as const;

/** The archived fights a player took part in, newest first. */
export async function getPlayerFightArchives(playerId: string, page: number, pageSize: number) {
	return withSpan(getPlayerFightArchives.name, async () => {
		const where = { OR: [{ leftPlayerId: playerId }, { rightPlayerId: playerId }] };
		const [total, archives] = await prisma.$transaction([
			prisma.fightArchive.count({ where }),
			prisma.fightArchive.findMany({
				where,
				select: archiveSummarySelect,
				orderBy: { createdDate: 'desc' },
				skip: pageSize * (page - 1),
				take: pageSize
			})
		]);
		return { total, archives };
	});
}

/** The fights a player keeps as favorites, last added first. */
export async function getFavoriteFightArchives(playerId: string) {
	return withSpan(getFavoriteFightArchives.name, async () => {
		const rows = await prisma.fightWatched.findMany({
			where: { playerId, favorite: true },
			select: { fight: { select: archiveSummarySelect } },
			orderBy: [{ favoriteDate: 'desc' }, { id: 'asc' }]
		});
		return rows.map(r => r.fight);
	});
}

export async function isFavoriteFight(playerId: string, fightArchiveId: string) {
	return withSpan(isFavoriteFight.name, async () => {
		const row = await prisma.fightWatched.findUnique({
			where: { playerId_fightArchiveId: { playerId, fightArchiveId } },
			select: { favorite: true }
		});
		return !!row?.favorite;
	});
}

/**
 * Adds or removes a favorite. The player row is locked so two concurrent additions cannot go over `max`.
 * Returns null when adding would go over `max`, else the player's favorite count afterwards.
 */
export async function setFavoriteFight(playerId: string, fightArchiveId: string, favorite: boolean, max: number) {
	return withSpan(setFavoriteFight.name, async () => {
		return prisma.$transaction(async tx => {
			await tx.$executeRaw`SELECT 1 FROM player WHERE id = ${playerId}::uuid FOR UPDATE`;
			if (!favorite) {
				await tx.fightWatched.updateMany({
					where: { playerId, fightArchiveId },
					data: { favorite: false, favoriteDate: null }
				});
				return tx.fightWatched.count({ where: { playerId, favorite: true } });
			}
			const others = await tx.fightWatched.count({
				where: { playerId, favorite: true, NOT: { fightArchiveId } }
			});
			if (others >= max) return null;
			const existing = await tx.fightWatched.findUnique({
				where: { playerId_fightArchiveId: { playerId, fightArchiveId } },
				select: { favorite: true }
			});
			if (!existing?.favorite) {
				await tx.fightWatched.upsert({
					where: { playerId_fightArchiveId: { playerId, fightArchiveId } },
					create: { playerId, fightArchiveId, favorite: true, favoriteDate: new Date() },
					update: { favorite: true, favoriteDate: new Date() }
				});
			}
			return others + 1;
		});
	});
}

/**
 * Deletes the archives created before `before` that no player keeps as a favorite and that are not clan championship
 * fights (their match replays need them), `batchSize` rows per statement so
 * no single statement locks a large part of the table. Their FightWatched rows go with them (cascade).
 * Returns how many archives were deleted.
 */
export async function purgeFightArchivesBefore(before: Date, batchSize: number) {
	return withSpan(purgeFightArchivesBefore.name, async () => {
		let total = 0;
		for (;;) {
			const deleted = await prisma.$executeRaw`
				DELETE FROM "FightArchive"
				WHERE id IN (
					SELECT fa.id
					FROM "FightArchive" fa
					WHERE fa."createdDate" < ${before}
						AND NOT EXISTS (
							SELECT 1 FROM "FightWatched" fw WHERE fw."fightArchiveId" = fa.id AND fw.favorite
						)
						AND NOT EXISTS (
							SELECT 1 FROM clan_championship_fight ccf WHERE ccf."archiveId" = fa.id
						)
					LIMIT ${batchSize}
				)`;
			total += deleted;
			if (deleted < batchSize) return total;
		}
	});
}
