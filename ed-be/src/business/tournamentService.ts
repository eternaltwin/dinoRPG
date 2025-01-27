import { prisma } from '../prisma.js';
import { DinozRace } from '@drpg/core/models/dinoz/DinozRace';
import { raceList } from '@drpg/core/models/dinoz/RaceList';
import { getRandomNumber, shuffle } from '../utils/index.js';
import { Request } from 'express';
import { auth, getPlayerDinozInformationForTeam } from '../dao/playerDao.js';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import translate from '../utils/translate.js';

export async function handleTournament() {
	const latestTournament = await prisma.tournament.findFirst({
		orderBy: {
			date: 'desc'
		}
	});
	if (!latestTournament) {
		throw new Error('No tournament found');
	}
	// Get selected Dojo and their teams
	const selectedDojo = await getSelectedDojo(latestTournament.teamSize);
	const shuffledDojos = shuffle(selectedDojo);
}

async function getSelectedDojo(teamLimit: number) {
	const topDojos = await prisma.dojo.findMany({
		take: 64,
		where: {
			TournamentTeam: {
				teamCount: {
					equals: teamLimit
				}
			}
		},
		include: {
			player: {
				include: {
					ranking: true
				}
			},
			TournamentTeam: true
		},
		orderBy: {
			player: {
				ranking: {
					dojo: 'desc'
				}
			}
		}
	});

	return topDojos;
}

export async function createTournament() {
	const teamSize = getRandomNumber(1, 6);
	const teamRace = [] as number[];

	const availableRaces: DinozRace[] = [
		raceList.WINKS,
		raceList.SIRAIN,
		raceList.CASTIVORE,
		raceList.NUAGOZ,
		raceList.GORILLOZ,
		raceList.WANWAN,
		raceList.PLANAILLE,
		raceList.MOUEFFE,
		raceList.PIGMOU
	];

	while (teamRace.length < 4) {
		const randomRace = availableRaces[getRandomNumber(0, availableRaces.length)];
		if (!teamRace.includes(randomRace.raceId)) {
			teamRace.push(randomRace.raceId);
		}
	}

	const levelLimit = getRandomNumber(20, 50);

	return prisma.tournament.create({
		data: {
			teamSize: teamSize,
			teamRace: teamRace.toString(),
			levelLimit: levelLimit
		},
		select: {
			id: true
		}
	});
}

export async function createTournamentTeam(req: Request) {
	const authed = await auth(req);
	const teamIds = req.body.team as number[];

	const latestTournament = await prisma.tournament.findFirst({
		orderBy: {
			date: 'desc'
		}
	});

	if (!latestTournament) {
		throw new Error('No tournament found.');
	}

	if (teamIds.length !== latestTournament.teamSize) {
		throw new ExpectedError(translate('dojo.wrongDinozInTeam', authed));
	}

	const playerDinoz = await getPlayerDinozInformationForTeam(authed.id);

	if (!teamIds.every(id => playerDinoz.dinoz.map(d => d.id).includes(id))) {
		throw new ExpectedError(translate('dojo.dinozNotPlayer', authed));
	}

	const playerFilteredDinoz = playerDinoz.dinoz.filter(d => teamIds.includes(d.id));

	const authorizedRaces = latestTournament.teamRace.split(',').map(r => parseInt(r)) as number[];

	if (!playerFilteredDinoz.every(d => authorizedRaces.includes(d.raceId))) {
		throw new ExpectedError(translate('dojo.dinozNotPlayer', authed));
	}

	await prisma.tournamentTeam.create({
		data: {
			dinoz: {
				connect: teamIds.map(id => ({ id: id }))
			},
			Tournament: {
				connect: { id: latestTournament.id }
			},
			dojo: {
				connect: { id: playerDinoz.Dojo?.id }
			},
			dojoId: playerDinoz.Dojo?.id,
			teamCount: teamIds.length
		},
		include: {
			dinoz: true
		}
	});

	return;
}

export async function tournamentInfo(req: Request) {
	await auth(req);
	const latestTournament = await prisma.tournament.findFirst({
		orderBy: {
			date: 'desc'
		},
		select: {
			teamRace: true,
			teamSize: true,
			id: true,
			levelLimit: true
		}
	});
	return latestTournament;
}
