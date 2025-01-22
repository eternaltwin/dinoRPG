import { prisma } from '../prisma.js';
import { FighterRecap, FightProcessResult } from '@drpg/core/models/fight/FightResult';
import { FightStep } from '@drpg/core/models/fight/FightStep';

export async function archiveFight(fight: FightProcessResult, playerId: string) {
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
						dark: undefined,
						size: undefined
					};
				})
			),
			steps: JSON.stringify(fight.steps),
			seed: fight.seed,
			result: fight.winner,
			player: { connect: { id: playerId } }
		},
		select: {
			id: true,
			fighters: true,
			steps: true,
			seed: true,
			result: true
		}
	});
	return {
		id: archive.id,
		fighters: JSON.parse(archive.fighters) as FighterRecap[],
		result: archive.result,
		history: JSON.parse(archive.steps) as FightStep[],
		seed: archive.seed
	};
}

export async function archiveChallenge(
	myDinozId: number,
	opponentId: number,
	challenge: string,
	victory: boolean,
	achieved: boolean,
	dojoId: string
) {
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
}

export async function getArchivedFightRequest(archiveId: string) {
	const archive = await prisma.fightArchive.findFirst({
		where: {
			id: archiveId
		},
		select: {
			fighters: true,
			steps: true,
			seed: true,
			result: true
		}
	});

	return archive;
}

export async function getAllArchivedFightRequest(playerId: string, page: number) {
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
}
