import { PismaClientLocal, prisma } from '../prisma.js';
import { Request } from 'express';
import { auth, getPlayerDinozInformationForTeam } from '../dao/playerDao.js';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import translate from '../utils/translate.js';
import { PublicMetada, PublicTournament, TournamentPhase } from '@drpg/core/models/dojo/tournament';
import { getViewedTournamentFight, viewFight } from '../dao/archiveDao.js';
import TournamentManager from '../utils/tournamentManager.js';
import { UnavailableReason } from '@drpg/prisma';
import { formatTID } from '@drpg/core/models/dojo/teamFormat';
import { RaceEnum } from '@drpg/core/models/enums/RaceEnum';
import dayjs from 'dayjs';
import gameConfig from '../config/game.config.js';
import { LOGGER } from '../context.js';
import { scheduleJob } from 'node-schedule';
import weightedRandom from '../utils/fight/weightedRandom.js';
import { getLatestTournament } from '../dao/tournamentDao.js';
import { FighterRecap } from '@drpg/core/models/fight/FightResult';

export async function createTournamentTeam(req: Request) {
	const authed = await auth(req);

	const tournament = await TournamentManager.getCurrentTournamentState(prisma);
	if (!tournament || tournament.phase !== TournamentPhase.QUALIFICATION) {
		throw new ExpectedError(translate('dojo.qualificationOver', authed));
	}

	const teamIds = req.body.team as number[];

	const latestTournament = await getLatestTournament();

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
		throw new ExpectedError(translate('dojo.wrongRace', authed));
	}

	//Check if dinoz are under max level
	if (playerFilteredDinoz.some(d => d.level > latestTournament.levelLimit)) {
		throw new ExpectedError(translate('dojo.dinozTooHighLevel', authed));
	}

	// Check filtered dinoz is equal to asked dinoz (shouldn't be possible)
	if (playerFilteredDinoz.length !== teamIds.length) {
		throw new ExpectedError('Filtered dinoz is not enought');
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
	const latestTournament = await getLatestTournament();
	return latestTournament;
}

export async function getTournamentFightsToShow(
	fights: Exclude<PublicTournament, 'watched'>[],
	playerId: string,
	phase: TournamentPhase,
	pool: number
): Promise<PublicTournament[]> {
	const targetFights = fights.filter(t => t.metadata.phase === phase).filter(t => t.metadata.poolNumber === pool);
	const watchedFightIds = (
		await getViewedTournamentFight(
			playerId,
			targetFights.map(f => f.id)
		)
	).map(f => f.fightArchiveId);

	// Fights against byes will be considered automatically watched
	const nonWatchedFights = targetFights.filter(
		f => f.tournamentTeamLeft && f.tournamentTeamRight && !watchedFightIds.includes(f.id)
	);

	const mostAdvancedStep =
		nonWatchedFights.length > 0 ? Math.min(...nonWatchedFights.map(f => f.metadata.round)) : null;

	return targetFights
		.filter(t => {
			return mostAdvancedStep === null || t.metadata.round <= mostAdvancedStep;
		})
		.map(fight => {
			return {
				...fight,
				watched: !nonWatchedFights.map(f => f.id).includes(fight.id)
			};
		});
}

export async function getDojoTournamentFights(req: Request) {
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
			tournamentTeamLeftId: true,
			tournamentTeamRightId: true,
			leftPlayer: {
				select: {
					id: true,
					name: true
				}
			},
			rightPlayer: {
				select: {
					id: true,
					name: true
				}
			},
			fighters: true,
			metadata: true,
			result: true
		}
	});
	if (phase === TournamentPhase.FINALS) {
		pool = 5;
	}

	const returnData = fights
		.map(f => {
			const fighters = JSON.parse(f.fighters) as FighterRecap[]; // fighters are preserved after player deletion
			fighters.sort((a, b) => a.id - b.id);
			return {
				id: f.id,
				tournamentTeamLeft: f.tournamentTeamLeftId
					? {
							dinoz: fighters.filter(fighter => fighter.attacker)[0],
							player: f.leftPlayer
						}
					: null,
				tournamentTeamRight: f.tournamentTeamRightId
					? {
							dinoz: fighters.filter(fighter => !fighter.attacker)[0],
							player: f.rightPlayer
						}
					: null,
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

	// Fights against byes will be considered automatically watched
	const poolMatchViewed = returnData.filter(
		f => !f.tournamentTeamLeft || !f.tournamentTeamRight || watchedFight.map(f => f.fightArchiveId).includes(f.id)
	);

	let mostAdvancedStep = 0;
	if (poolMatchViewed.length === 0) {
		if (phase === TournamentPhase.FINALS) mostAdvancedStep = 4;
	} else {
		mostAdvancedStep = Math.max(...poolMatchViewed.map(f => f.metadata.round));

		// Reach next round if all match from this round for this pool have been view
		const poolMatchStep = returnData.filter(f => f.metadata.round === mostAdvancedStep).length;
		if (
			(phase === TournamentPhase.POOLS &&
				poolMatchStep === poolMatchViewed.filter(f => f.metadata.round === mostAdvancedStep).length) ||
			(phase === TournamentPhase.FINALS && poolMatchViewed.length >= 2)
		) {
			mostAdvancedStep++;
		}
	}

	return returnData
		.filter(t => {
			return t.metadata.round <= mostAdvancedStep;
		})
		.map(fight => {
			return {
				...fight,
				watched: poolMatchViewed.map(f => f.id).includes(fight.id)
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

export async function getLevelLimits(races: RaceEnum[]) {
	let maxLevel = 0;
	let currentLevel = 20;
	while (currentLevel <= gameConfig.dinoz.maxLevel) {
		const current = await prisma.dinoz.count({
			where: {
				AND: [{ raceId: { in: races } }, { level: { gte: currentLevel } }]
			}
		});
		if (current >= 350 && maxLevel <= currentLevel) {
			maxLevel = currentLevel;
		}
		currentLevel += 5;
	}
	return maxLevel;
}

export async function getNewLevelLimits(races: RaceEnum[]) {
	const COEF_UNDER25 = 1;
	const COEF_UNDER30 = 2;
	const COEF_UNDER35 = 2.5;
	const COEF_UNDER40 = 3;
	const COEF_UNDER45 = 3.5;
	const COEF_UNDER50 = 4;
	const [under25, under30, under35, under40, under45, under50] = await prisma.$transaction([
		prisma.dinoz.count({
			where: {
				AND: [{ raceId: { in: races } }, { level: { gte: 20, lte: 25 } }]
			}
		}),
		prisma.dinoz.count({
			where: {
				AND: [{ raceId: { in: races } }, { level: { gte: 25, lte: 30 } }]
			}
		}),
		prisma.dinoz.count({
			where: {
				AND: [{ raceId: { in: races } }, { level: { gte: 30, lte: 35 } }]
			}
		}),
		prisma.dinoz.count({
			where: {
				AND: [{ raceId: { in: races } }, { level: { gte: 35, lte: 40 } }]
			}
		}),
		prisma.dinoz.count({
			where: {
				AND: [{ raceId: { in: races } }, { level: { gte: 40, lte: 45 } }]
			}
		}),
		prisma.dinoz.count({
			where: {
				AND: [{ raceId: { in: races } }, { level: { gte: 45, lte: 50 } }]
			}
		})
	]);
	const data = [
		{ levelMax: 25, odds: under25 * COEF_UNDER25 },
		{ levelMax: 30, odds: under30 * COEF_UNDER30 },
		{ levelMax: 35, odds: under35 * COEF_UNDER35 },
		{ levelMax: 40, odds: under40 * COEF_UNDER40 },
		{ levelMax: 45, odds: under45 * COEF_UNDER45 },
		{ levelMax: 50, odds: under50 * COEF_UNDER50 }
	];
	const m = weightedRandom(data);
	return m.levelMax;
}
