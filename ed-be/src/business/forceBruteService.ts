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
import { PublicMetada, PublicTournament, TournamentPhase } from '@drpg/core/models/dojo/tournament';
import { getViewedTournamentFight, viewFight } from '../dao/archiveDao.js';
import { FighterRecap } from '@drpg/core/models/fight/FightResult';
import { PublicFBTournamentFight } from '@drpg/core/models/dojo/ForceBrute';

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
			dinoz: activeTournament.participants.filter(d => d.level === activeTournament.levelLimit).length,
			state:
				activeTournament.participants.filter(d => d.level === activeTournament.levelLimit).length < 256
					? 'qualif'
					: 'fights'
		};
	} else {
		return;
	}
}

export async function getCurrentEvents(req: Request) {
	const activeEvents = await prisma.$queryRaw`
  SELECT 
    t.id,
    t."levelLimit",
    t."teamRace",
    t.date,
    (
        SELECT CAST(COUNT(*) AS INTEGER)
      FROM "gamedinoz" p
      WHERE p."FBTournamentId" = t.id AND p.level = t."levelLimit"
    ) AS "participantCount"
  FROM "FBTournament" t
  WHERE t."winnerId" IS NULL
`;
	return activeEvents;
}

export async function getPlayerParticipation(req: Request) {
	const authed = await auth(req);
	const activeTournament = await prisma.fBTournament.findFirstOrThrow({
		where: {
			id: req.params.tournamentId
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
			usage: GameDinozUsage.FBTournament,
			FBTournamentId: activeTournament.id
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
	const regexName = /^[a-zA-Z0-9éèêëÉÈÊËîïÎÏôÔûÛ\-']{3,16}$/;
	if (!regexName.test(req.body.name)) {
		throw new ExpectedError(translate('OnlyLettersAndNumbers', authed));
	}
	const player = await prisma.player.findUniqueOrThrow({
		where: {
			id: authed.id
		},
		select: {
			createdDate: true,
			ranking: {
				select: {
					points: true
				}
			}
		}
	});
	if (dayjs().diff(dayjs(player.createdDate), 'days') < 3) {
		throw new ExpectedError(translate('fb.tooYoungAccount', authed));
	}
	const activeTournament = await prisma.fBTournament.findFirstOrThrow({
		where: {
			id: req.body.tournamentId
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
	if (player.ranking && player.ranking.points < activeTournament.levelLimit) {
		throw new ExpectedError(translate('fb.notEnoughPoints', authed));
	}
	const lastDinoz = await prisma.gameDinoz.findFirst({
		where: {
			playerId: authed.id,
			FBTournamentId: activeTournament.id
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

export async function getTournamentFights(req: Request) {
	const authed = await auth(req);
	const tournamentId = req.params.id as string;
	let pool = +req.params.pool;
	const phase = req.params.phase as TournamentPhase;
	const fights = await prisma.fightArchive.findMany({
		where: {
			FBTournamentId: tournamentId
		},
		select: {
			id: true,
			fighters: true,
			metadata: true,
			result: true,
			FBTournamentLeft: {
				select: {
					id: true,
					name: true,
					display: true,
					player: {
						select: {
							id: true,
							name: true
						}
					}
				}
			},
			FBTournamentRight: {
				select: {
					id: true,
					name: true,
					display: true,
					player: {
						select: {
							id: true,
							name: true
						}
					}
				}
			}
		}
	});
	if (phase === TournamentPhase.FINALS) {
		pool = 17;
	}
	const returnData = fights
		.map(f => {
			return {
				id: f.id,
				tournamentTeamLeft: f.FBTournamentLeft,
				tournamentTeamRight: f.FBTournamentRight,
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
				const fighters = JSON.parse(f.fighters) as FighterRecap[];
				const left = fighters.find(f => f.type === 'dinoz');
				if (!left) {
					throw new Error('Left fighter not found');
				}
				const right = fighters.find(f => f.type === 'dinoz' && f.id !== left.id);
				if (!right) {
					throw new Error('Right fighter not found');
				}
				return {
					id: f.id,
					tournamentTeamLeft: f.FBTournamentLeft,
					tournamentTeamRight: f.FBTournamentRight,
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
	if (
		(phase === TournamentPhase.POOLS &&
			16 / Math.pow(2, mostAdvancedStep + 1) ===
				poolMatchViewed.filter(f => f.metadata.round === mostAdvancedStep).length) ||
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

export async function readAllFightFromEventPool(req: Request) {
	const authed = await auth(req);
	const tournamentId = req.params.id as string;
	const pool = +req.params.pool;
	const phase = req.params.phase as TournamentPhase;
	const fights = await prisma.fightArchive.findMany({
		where: {
			FBTournamentId: tournamentId
		},
		select: {
			id: true,
			metadata: true,
			result: true,
			FBTournamentLeft: {
				select: {
					id: true,
					name: true,
					display: true,
					player: {
						select: {
							id: true,
							name: true
						}
					}
				}
			},
			FBTournamentRight: {
				select: {
					id: true,
					name: true,
					display: true,
					player: {
						select: {
							id: true,
							name: true
						}
					}
				}
			}
		}
	});

	const poolFights = fights
		.map(f => {
			return {
				id: f.id,
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
