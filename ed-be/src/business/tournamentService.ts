import { prisma } from '../prisma.js';
import { Request } from 'express';
import { auth, getPlayerDinozInformationForTeam } from '../dao/playerDao.js';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import translate from '../utils/translate.js';
import { PublicMetada, TournamentPhase } from '@drpg/core/models/dojo/tournament';

export type selectedDojoType = Awaited<ReturnType<typeof getSelectedDojo>>
export async function getSelectedDojo(teamLimit: number, qualified: number) {
	const topDojos = await prisma.dojo.findMany({
		take: qualified,
		where: {
			TournamentTeam: {
				teamCount: {
					equals: teamLimit
				}
			}
		},
		select: {
			tournamentTeamId: true,
			player: {
				include: {
					ranking: true
				}
			}
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

export async function createTournamentTeam(req: Request) {
	const authed = await auth(req);
	const teamIds = req.body.team as number[];

	const latestTournament = await prisma.tournament.findFirst({
		orderBy: {
			date: 'desc'
		}
	});

	// This shouldn't happen
	if (!latestTournament) {
		throw new Error('No tournament found.');
	}

	// Check if player select the right number of dinoz
	if (teamIds.length !== latestTournament.teamSize) {
		throw new ExpectedError(translate('dojo.wrongDinozInTeam', authed));
	}

	const playerDinoz = await getPlayerDinozInformationForTeam(authed.id);

	// Check if player possess all the selected dinoz
	if (!teamIds.every(id => playerDinoz.dinoz.map(d => d.id).includes(id))) {
		throw new ExpectedError(translate('dojo.dinozNotPlayer', authed));
	}

	const playerFilteredDinoz = playerDinoz.dinoz.filter(d => teamIds.includes(d.id));

	const authorizedRaces = latestTournament.teamRace.split(',').map(r => parseInt(r)) as number[];

	// Check if dinoz races are authorized for this tournament
	if (!playerFilteredDinoz.every(d => authorizedRaces.includes(d.raceId))) {
		throw new ExpectedError(translate('dojo.dinozNotPlayer', authed));
	}

	//Check if dinoz are under max level
	if (playerFilteredDinoz.some(d => d.level > latestTournament.levelLimit)) {
		throw new ExpectedError(translate('dojo.dinozTooHighLevel', authed));
	}

	// Check filtered dinoz is equal to asked dinoz
	if (playerFilteredDinoz.length !== teamIds.length) {
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

export async function tournamentTargetInfo(req: Request) {
	const tournamentId = req.params.id as string;
	const phase = req.params.phase as TournamentPhase;
	const fights = await prisma.fightArchive.findMany({
		where: {
			tournamentId
		},
		select: {
			id: true,
			tournamentTeamLeft: {
				select: {
					dinoz: {
						take: 1,
						select: {
							id: true,
							display: true,
							name: true
						}
					}
				}
			},
			tournamentTeamRight: {
				select: {
					dinoz: {
						take: 1,
						select: {
							id: true,
							display: true,
							name: true
						}
					}
				}
			},
			metadata: true,
			result: true
		}
	});

	return fights
		.map(f => {
			return {
				id: f.id,
				tournamentTeamLeft: f.tournamentTeamLeft?.dinoz[0],
				tournamentTeamRight: f.tournamentTeamRight?.dinoz[0],
				metadata: JSON.parse(<string>f.metadata) as PublicMetada,
				result: f.result
			};
		})
		.filter(t => t.metadata.phase === phase);
}
