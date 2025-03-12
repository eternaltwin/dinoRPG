import { Request } from 'express';
import { prisma } from '../prisma.js';
import ForceBruteManager from '../utils/forcebruteManager.js';
import { auth } from '../dao/playerDao.js';
import { $Enums, Prisma } from '@drpg/prisma';
import GameDinozUsage = $Enums.GameDinozUsage;
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import translate from '../utils/translate.js';
import dayjs from 'dayjs';
import { getRandomUpElement } from '../utils/dinoz.js';
import { RaceList, raceList } from '@drpg/core/models/dinoz/RaceList';
import { randomUUID } from 'crypto';
import { getRandomLetter } from '../utils/index.js';
import { SkillDetails } from '@drpg/core/models/dinoz/SkillDetails';
import { skillList } from '@drpg/core/models/dinoz/SkillList';
import { addMultipleSkillToDinoz } from '../dao/dinozSkillDao.js';

export async function resumeTournaments() {
	const ongoingTournament = await prisma.fBTournament.findMany({
		where: {
			winnerId: null
		}
	});

	for (const tournament of ongoingTournament) {
		const startedTournament = new ForceBruteManager(tournament.levelLimit);
		startedTournament.resume(prisma);
	}
}

export async function checkFBCreation(level: number) {
	const dinozLevel = await prisma.fBTournament.findFirst({
		where: {
			levelLimit: level
		}
	});

	if (dinozLevel || level < 10) {
		return;
	} else {
		const tournament = new ForceBruteManager(level);
		tournament.initializeTournament(prisma);
	}
}

export async function getCurrentTournament(req: Request) {
	const activeTournament = await prisma.fBTournament.findFirst({
		where: {
			id: req.params.id
		},
		select: {
			id: true,
			date: true,
			levelLimit: true,
			participants: {
				select: {
					level: true
				}
			}
		}
	});

	if (activeTournament) {
		return {
			id: activeTournament.id,
			date: activeTournament.date.toString(),
			level: activeTournament.levelLimit,
			dinoz: activeTournament.participants.filter(d => d.level === activeTournament.levelLimit).length
		};
	} else {
		return;
	}
}

export async function getCurrentEvents(req: Request) {
	const activeEvents = await prisma.fBTournament.findMany({
		where: {
			winnerId: null
		},
		select: {
			levelLimit: true,
			id: true,
			teamRace: true,
			date: true
		}
	});
	return activeEvents;
}

export async function getPlayerParticipation(req: Request) {
	const authed = await auth(req);
	const activeTournament = await prisma.fBTournament.findFirstOrThrow({
		orderBy: {
			date: 'desc'
		},
		select: {
			id: true
		}
	});
	if (!activeTournament) {
		throw new ExpectedError(translate('fb.noTournamentOngoing', authed));
	}
	const dinozList = await prisma.gameDinoz.findMany({
		where: {
			playerId: authed.id,
			usage: GameDinozUsage.FBTournament
		},
		select: {
			id: true,
			name: true,
			level: true,
			display: true,
			FBTournamentId: true,
			skills: {
				select: {
					skillId: true
				}
			}
		}
	});
	return dinozList
		.filter(d => d.FBTournamentId === activeTournament.id)
		.map(d => {
			return {
				...d,
				skills: d.skills.map(s => s.skillId)
			};
		});
}

export async function createTournamentDinoz(req: Request) {
	const authed = await auth(req);
	const activeTournament = await prisma.fBTournament.findFirstOrThrow({
		orderBy: {
			date: 'desc'
		},
		select: {
			levelLimit: true,
			teamRace: true,
			id: true
		}
	});
	if (!activeTournament) {
		throw new ExpectedError(translate('fb.noTournamentOngoing', authed));
	}
	const lastDinoz = await prisma.gameDinoz.findFirst({
		where: {
			playerId: authed.id,
			usage: GameDinozUsage.FBTournament
		},
		select: {
			id: true,
			createdDate: true
		},
		orderBy: {
			createdDate: 'desc'
		}
	});

	if (lastDinoz && dayjs().isSame(lastDinoz.createdDate, 'day')) {
		throw new ExpectedError(translate('fb.alreadyCreatedDinoz', authed));
	}

	const dinozCount = await prisma.gameDinoz.count({
		where: {
			FBTournamentId: activeTournament.id,
			usage: GameDinozUsage.FBTournament,
			level: activeTournament.levelLimit
		}
	});

	if (dinozCount >= 256) {
		throw new ExpectedError(translate('fb.maxDinozReached', authed));
	}

	const seed = randomUUID();
	const currentRace = raceList[+activeTournament.teamRace as RaceList];

	let display = currentRace.swfLetter;
	for (let i = 0; i < 11; i++) {
		display += getRandomLetter('z');
	}
	//TODO add a chance to get rare display (1%)

	const newDinoz: Prisma.GameDinozCreateInput = {
		name: req.body.name,
		raceId: currentRace.raceId,
		level: 1,
		nextUpElementId: getRandomUpElement(currentRace.upChance, seed),
		nextUpAltElementId: getRandomUpElement(currentRace.upChance, seed),
		display: display,
		life: 100,
		maxLife: 100,
		experience: 0,
		nbrUpFire: currentRace.nbrFire,
		nbrUpWood: currentRace.nbrWood,
		nbrUpWater: currentRace.nbrWater,
		nbrUpLightning: currentRace.nbrLightning,
		nbrUpAir: currentRace.nbrAir,
		seed: seed,
		usage: 'FBTournament',
		player: { connect: { id: authed.id } },
		FBTournament: { connect: { id: activeTournament.id } }
	};

	const dinoz = await prisma.gameDinoz.create({
		data: newDinoz,
		select: {
			id: true
		}
	});

	const skillsToAdd: SkillDetails[] = Object.values(skillList).filter(
		skill => skill.raceId?.some(raceId => raceId === currentRace.raceId) && skill.isBaseSkill
	);
	await addMultipleSkillToDinoz(
		dinoz.id,
		skillsToAdd.map(skill => skill.id),
		'FBTournament'
	);
}
