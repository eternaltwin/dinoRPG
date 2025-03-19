import { PismaClientLocal, prisma } from '../prisma.js';
import { Request } from 'express';
import { auth, getPlayerDinozInformationForTeam } from '../dao/playerDao.js';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import translate from '../utils/translate.js';
import { PublicMetada, PublicTournament, TournamentPhase } from '@drpg/core/models/dojo/tournament';
import { getViewedTournamentFight, viewFight } from '../dao/archiveDao.js';
import TournamentManager from '../utils/tournamentManager.js';
import { GameDinozUsage, Prisma, UnavailableReason } from '@drpg/prisma';
import { getRandomNumber } from '../utils/index.js';
import { formatTID } from '@drpg/core/models/dojo/teamFormat';
import { RaceList } from '@drpg/core/models/dinoz/RaceList';
import dayjs from 'dayjs';
import gameConfig from '../config/game.config.js';
import { LOGGER } from '../context.js';
import { scheduleJob } from 'node-schedule';

export type selectedDojoType = Awaited<ReturnType<typeof getSelectedDojo>>;
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

	const tournament = await TournamentManager.getCurrentTournamentState(prisma);
	if (!tournament || tournament.phase !== TournamentPhase.QUALIFICATION) {
		throw new ExpectedError(translate('dojo.qualificationOver', authed));
	}

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
		throw new ExpectedError(translate('dojo.wrongDinozQuantity', authed, { qty: latestTournament.teamSize }));
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

	// Check if number of race is at least equal to the limit
	const playerRaces = new Set<number>();
	playerFilteredDinoz.forEach(d => playerRaces.add(d.raceId));
	if (playerRaces.size < latestTournament.raceMinimum) {
		throw new ExpectedError(translate('dojo.notEnoughDiversity', authed));
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

export async function deleteTournamentTeam(req: Request) {
	const authed = await auth(req);

	const tournament = await TournamentManager.getCurrentTournamentState(prisma);
	if (!tournament || tournament.phase !== TournamentPhase.QUALIFICATION) {
		throw new ExpectedError(translate('dojo.qualificationOver', authed));
	}

	const myTeam = await prisma.dojo.findUnique({
		where: {
			playerId: authed.id
		},
		select: {
			tournamentTeamId: true
		}
	});

	if (!myTeam || !myTeam.tournamentTeamId) {
		throw new ExpectedError('Team inexistant');
	}

	await prisma.tournamentTeam.delete({
		where: {
			id: myTeam.tournamentTeamId
		}
	});
}

export async function getTournamentTeam(req: Request) {
	const authed = await auth(req);

	const myTeam = await prisma.dojo.findUnique({
		where: {
			playerId: authed.id
		},
		select: {
			TournamentTeam: {
				select: {
					dinoz: {
						select: {
							id: true,
							name: true,
							display: true,
							level: true
						}
					}
				}
			}
		}
	});

	if (!myTeam || !myTeam.TournamentTeam) {
		throw new ExpectedError('No team found');
	}

	return myTeam.TournamentTeam.dinoz;
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
	const authed = await auth(req);
	const tournamentId = req.params.id as string;
	let pool = +req.params.pool;
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
							name: true,
							player: {
								select: {
									id: true,
									name: true
								}
							}
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
							name: true,
							player: {
								select: {
									id: true,
									name: true
								}
							}
						}
					}
				}
			},
			metadata: true,
			result: true
		}
	});
	if (phase === TournamentPhase.FINALS) {
		pool = 5;
	}
	const returnData = fights
		.map(f => {
			return {
				id: f.id,
				tournamentTeamLeft: f.tournamentTeamLeft?.dinoz[0],
				tournamentTeamRight: f.tournamentTeamRight?.dinoz[0],
				metadata: JSON.parse(<string>f.metadata) as PublicMetada,
				result: f.result
			};
		})
		.filter(t => t.metadata.phase === phase)
		.filter(t => t.metadata.poolNumber === pool) as PublicTournament[];

	const watchedFight = await getViewedTournamentFight(
		authed.id,
		returnData.map(f => f.id)
	);

	let mostAdvancedStep = 0;
	if (watchedFight.length === 0 && phase === TournamentPhase.POOLS) {
		return returnData.filter(t => t.metadata.round === 0);
	} else if (watchedFight.length === 0 && phase === TournamentPhase.FINALS) {
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
			.filter(t => t.metadata.phase === phase)
			.filter(t => t.metadata.round === 4);
	}

	const poolMatchViewed = watchedFight
		.map(f => {
			const a = returnData.find(t => t.id === f.fightArchiveId);
			if (a) return a;
		})
		.filter(f => f !== undefined);
	mostAdvancedStep = Math.max(...poolMatchViewed.map(f => f.metadata.round));

	// Reach next round if all match from this round for this pool ahve been view
	const poolMatchStep = returnData.filter(f => f.metadata.round === mostAdvancedStep).length;
	if (
		(phase === TournamentPhase.POOLS &&
			poolMatchStep === poolMatchViewed.filter(f => f.metadata.round === mostAdvancedStep).length) ||
		(phase === TournamentPhase.FINALS && poolMatchViewed.length >= 2)
	) {
		mostAdvancedStep++;
	}

	return returnData
		.filter(t => {
			if (t.metadata.round <= mostAdvancedStep || watchedFight.map(f => f.fightArchiveId).includes(t.id)) return true;
		})
		.map(fight => {
			return {
				...fight,
				watched: watchedFight.map(f => f.fightArchiveId).includes(fight.id)
			};
		});
}

export async function readAllFightFromPool(req: Request) {
	const authed = await auth(req);
	const tournamentId = req.params.id as string;
	const pool = +req.params.pool;
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
							name: true,
							player: {
								select: {
									id: true,
									name: true
								}
							}
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
							name: true,
							player: {
								select: {
									id: true,
									name: true
								}
							}
						}
					}
				}
			},
			metadata: true,
			result: true
		}
	});

	const poolFights = fights
		.map(f => {
			return {
				id: f.id,
				tournamentTeamLeft: f.tournamentTeamLeft?.dinoz[0],
				tournamentTeamRight: f.tournamentTeamRight?.dinoz[0],
				metadata: JSON.parse(<string>f.metadata) as PublicMetada,
				result: f.result
			};
		})
		.filter(t => t.metadata.phase === phase)
		.filter(t => t.metadata.poolNumber === pool)
		.map(f => f.id);

	for (const poolFight of poolFights) {
		await viewFight(authed.id, poolFight);
	}
}

export async function tournamentsHistory(req: Request) {
	const page = +req.params.page;
	const [count, history] = await prisma.$transaction([
		prisma.tournament.count(),
		prisma.tournament.findMany({
			take: 10,
			skip: 10 * (page - 1),
			orderBy: {
				date: 'desc'
			},
			select: {
				id: true,
				date: true,
				formatName: true
			}
		})
	]);
	return { count, history };
}

export async function createFirstTournament(prisma: PismaClientLocal) {
	// Check if there is at least:
	// - 5000 dinoz active
	//
	const dinozCount = await prisma.dinoz.count({
		where: {
			OR: [
				{ unavailableReason: null },
				{ unavailableReason: { not: { in: [UnavailableReason.frozen, UnavailableReason.sacrificed] } } }
			]
		}
	});

	if (dinozCount > 5000) {
		const tournamentFormat = formatTID[1];
		const teamSize = 4;
		const teamRace = tournamentFormat.teamRace;
		const raceMinimum = 4;
		const levelLimit = await getLevelLimits(tournamentFormat.teamRace);

		const endQualif = dayjs().add(6, 'days').set('hour', 23).set('minute', 59).set('second', 59).toDate();
		await prisma.tournament.create({
			data: {
				formatName: tournamentFormat.name,
				teamSize: teamSize,
				raceMinimum: raceMinimum,
				poison: tournamentFormat.poison,
				teamRace: teamRace.toString(),
				levelLimit: levelLimit,
				nextRound: endQualif
			},
			select: {
				id: true
			}
		});
	} else {
		const nextMonday = dayjs()
			.day(1)
			.add(dayjs().day() === 1 ? 1 : 0, 'week')
			.startOf('day')
			.add(1, 'second');
		LOGGER.error(`Not enough dinoz (currently ${dinozCount}), next check ${nextMonday}.`);
		scheduleJob('createFirstTournament', nextMonday.toDate(), () => createFirstTournament(prisma));
	}
}

export async function getLevelLimits(races: RaceList[]) {
	let maxLevel = 0;
	for (const race of races) {
		let currentLevel = 20;
		while (currentLevel <= gameConfig.dinoz.maxLevel) {
			const current = await prisma.dinoz.count({
				where: {
					AND: [{ raceId: race }, { level: { gte: currentLevel } }]
				}
			});
			if (current >= 100 && maxLevel <= currentLevel) {
				maxLevel = currentLevel;
			}
			currentLevel += 5;
		}
	}
	return maxLevel;
}
