import { prisma } from '../prisma.js';
import { FighterRecap, FightOutcome, FightProcessResult } from '@drpg/core/models/fight/FightResult';
import { FightStep } from '@drpg/core/models/fight/FightStep';
import { withSpan } from '../utils/tracing.js';

export async function archiveFight(
	fight: FightProcessResult,
	winner: boolean,
	leftPlayerId: string,
	rightPlayerId: string | null
) {
	return withSpan(archiveFight.name, async () => {
		const playerSelect = { select: { id: true, name: true } };
		const archive = await prisma.fightArchive.create({
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
				rightPlayer: rightPlayerId ? { connect: { id: rightPlayerId } } : undefined
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
				rightPlayer: playerSelect
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
				fighters: true
			},
			orderBy: {
				createdDate: 'desc'
			}
		});

		return { archive, totalArchive };
	});
}
