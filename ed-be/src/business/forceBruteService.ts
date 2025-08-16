import { Request } from 'express';
import { prisma } from '../prisma.js';
import ForceBruteManager from '../utils/forcebruteManager.js';
import { addMoney, auth, ownsDinoz } from '../dao/playerDao.js';
import { $Enums, Prisma } from '@drpg/prisma';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import translate from '../utils/translate.js';
import dayjs from 'dayjs';
import { getRandomUpElement } from '../utils/dinoz.js';
import { RaceList, raceList } from '@drpg/core/models/dinoz/RaceList';
import { randomUUID } from 'crypto';
import { getLetter, getRandomNumber } from '../utils/index.js';
import { SkillDetails } from '@drpg/core/models/dinoz/SkillDetails';
import { Skill, skillList } from '@drpg/core/models/dinoz/SkillList';
import { addMultipleSkillToDinoz } from '../dao/dinozSkillDao.js';
import { PublicMetada, PublicTournament, TournamentPhase } from '@drpg/core/models/dojo/tournament';
import { archiveFight, getViewedTournamentFight, viewFight } from '../dao/archiveDao.js';
import { FighterRecap, FightResult } from '@drpg/core/models/fight/FightResult';
import { generateDinozDisplay } from './inventoryService.js';
import seedrandom from 'seedrandom';
import {
	TournamentNameMiddle,
	TournamentNamePrefix,
	TournamentNameQuality,
	TournamentNameSuffix,
	TournamentNameTitle
} from '@drpg/core/models/enums/TournamentName';
import { getRandomEnumValue } from '../utils/randomEnum.js';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { calculateXPBonus, getMaxXp, isAlive } from '@drpg/core/utils/DinozUtils';
import { calculateFightBetweenPlayers } from './fightService.js';
import { updateDinoz } from '../dao/dinozDao.js';
import GameDinozUsage = $Enums.GameDinozUsage;
import { DinozStatusId } from '@drpg/core/models/dinoz/StatusList';
import { addStatusToDinoz } from '../dao/dinozStatusDao.js';
import { removeItemFromDinoz } from '../dao/dinozItemDao.js';

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
		throw new ExpectedError(translate('fb.error.noTournamentOngoing', authed));
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
		throw new ExpectedError(translate('fb.error.tooYoungAccount', authed));
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
		throw new ExpectedError(translate('fb.error.noTournamentOngoing', authed));
	}
	if (player.ranking && player.ranking.points < activeTournament.levelLimit) {
		throw new ExpectedError(translate('fb.error.notEnoughPoints', authed));
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
		throw new ExpectedError(translate('fb.error.alreadyCreatedDinoz', authed));
	}

	const dinozCount = await prisma.gameDinoz.count({
		where: {
			FBTournamentId: activeTournament.id,
			usage: GameDinozUsage.FBTournament,
			level: activeTournament.levelLimit
		}
	});

	if (dinozCount >= 256) {
		throw new ExpectedError(translate('fb.error.maxDinozReached', authed));
	}

	const seed = randomUUID();
	const currentRace = raceList[+activeTournament.teamRace as RaceList];

	let display = generateDinozDisplay(currentRace, '0', '0', '0');
	if (Math.random() * 100 <= 1) {
		switch (currentRace.raceId) {
			case RaceList.MOUEFFE:
			case RaceList.MOUEFFE_DEMON:
			case RaceList.WINKS:
			case RaceList.WINKS_DEMON:
			case RaceList.PLANAILLE:
			case RaceList.PLANAILLE_DEMON:
			case RaceList.GORILLOZ:
			case RaceList.GORILLOZ_DEMON:
			case RaceList.SANTAZ:
			case RaceList.MAHAMUTI:
			case RaceList.QUETZU:
			case RaceList.TRICERAGNON:
			case RaceList.PIGMOU:
			case RaceList.PIGMOU_DEMON:
			case RaceList.SIRAIN:
			case RaceList.KABUKI:
			case RaceList.KABUKI_DEMON:
				display = generateDinozDisplay(currentRace, '1', '1', '0');
				break;
			case RaceList.CASTIVORE:
				display = generateDinozDisplay(currentRace, '1', getLetter(1 + getRandomNumber(0, 2)), '0');
				break;
			case RaceList.ROCKY:
			case RaceList.NUAGOZ:
			case RaceList.SMOG:
				display = generateDinozDisplay(currentRace, '1', '0', '0');
				break;
			case RaceList.WANWAN:
			case RaceList.WANWAN_DEMON:
				display = generateDinozDisplay(currentRace, '2', '0', '0');
				break;
			case RaceList.FEROSS:
				display =
					getRandomNumber(0, 1) === 0
						? generateDinozDisplay(currentRace, '1', '1', '0')
						: generateDinozDisplay(currentRace, '2', '2', '0');
				break;
			case RaceList.TOUFUFU:
				display = generateDinozDisplay(currentRace, '0', '1', '0');
				break;
			case RaceList.PTEROZ:
			case RaceList.HIPPOCLAMP:
			case RaceList.SOUFFLET:
			default:
				break;
		}
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

export async function getFBTournamentOpponent(req: Request) {
	const authed = await auth(req);
	const dinozId = +req.params.dinozId;

	// Check if the player owns the dinoz
	if (!(await ownsDinoz(authed.id, dinozId))) {
		throw new ExpectedError('Player does not own this dinoz');
	}

	const dinoz = await prisma.dinoz.findFirst({
		where: {
			id: dinozId
		},
		select: {
			FBTournamentStep: true,
			placeId: true
		}
	});

	if (!dinoz) {
		throw new ExpectedError(`Dinoz ${dinozId} doesn't exist.`);
	}

	if (dinoz.placeId !== PlaceEnum.FORCEBRUT) {
		throw new ExpectedError(`Dinoz not at the right place.`);
	}

	const opponent = await prisma.fBTournament.findFirst({
		where: {
			levelLimit: dinoz.FBTournamentStep + 10
		},
		select: {
			winnerId: true
		}
	});

	if (!opponent || !opponent.winnerId) {
		throw new ExpectedError(translate(`fb_tournament.noOpponent`, authed));
	}

	const opponentGameDinoz = await prisma.gameDinoz.findFirstOrThrow({
		where: {
			id: opponent.winnerId
		},
		select: {
			display: true,
			level: true,
			seed: true
		}
	});

	const rng = seedrandom(opponentGameDinoz.seed);
	const name =
		translate(`fb.name.prefix.${getRandomEnumValue(TournamentNamePrefix, rng())}`, authed) +
		translate(`fb.name.middle.${getRandomEnumValue(TournamentNameMiddle, rng())}`, authed) +
		translate(`fb.name.suffix.${getRandomEnumValue(TournamentNameSuffix, rng())}`, authed) +
		' ' +
		translate(`fb.name.title.${getRandomEnumValue(TournamentNameTitle, rng())}`, authed) +
		' ' +
		translate(`fb.name.quality.${getRandomEnumValue(TournamentNameQuality, rng())}`, authed);

	return {
		name: name,
		display: opponentGameDinoz.display,
		level: opponentGameDinoz.level,
		stage: dinoz.FBTournamentStep + 1
	};
}

export async function fightFBTournamentOpponent(req: Request) {
	const authed = await auth(req);
	const dinozId = +req.params.dinozId;

	// Check if the player owns the dinoz
	if (!(await ownsDinoz(authed.id, dinozId))) {
		throw new ExpectedError('Player does not own this dinoz');
	}

	const dinoz = await prisma.dinoz.findFirst({
		where: {
			id: dinozId
		},
		select: {
			FBTournamentStep: true,
			placeId: true,
			id: true,
			display: true,
			name: true,
			level: true,
			experience: true,
			life: true,
			maxLife: true,
			nbrUpFire: true,
			nbrUpWood: true,
			nbrUpWater: true,
			nbrUpLightning: true,
			nbrUpAir: true,
			skills: {
				select: { skillId: true },
				where: { state: { equals: true } }
			},
			items: {
				select: {
					itemId: true
				}
			},
			status: {
				select: {
					statusId: true
				}
			},
			catches: { select: { id: true, hp: true, monsterId: true } },
			player: {
				select: {
					cooker: true,
					teacher: true
				}
			}
		}
	});

	if (!dinoz) {
		throw new ExpectedError(`Dinoz ${dinozId} doesn't exist.`);
	}

	if (dinoz.placeId !== PlaceEnum.FORCEBRUT) {
		throw new ExpectedError(`Dinoz not at the right place.`);
	}

	if (!isAlive(dinoz)) {
		throw new ExpectedError(translate('dead', authed));
	}

	// Forbid Black Hole, Hypnose and Sylphide skills
	dinoz.skills = dinoz.skills.filter(
		s => s.skillId !== Skill.TROU_NOIR && s.skillId !== Skill.HYPNOSE && s.skillId !== Skill.SYLPHIDES
	);

	const opponent = await prisma.fBTournament.findFirst({
		where: {
			levelLimit: dinoz.FBTournamentStep + 10
		},
		select: {
			winnerId: true
		}
	});

	if (!opponent || !opponent.winnerId) {
		throw new ExpectedError(translate(`fb_tournament.noOpponent`, authed));
	}

	const opponentGameDinoz = await prisma.gameDinoz.findFirstOrThrow({
		where: {
			id: opponent.winnerId
		},
		select: {
			display: true,
			level: true,
			id: true,
			name: true,
			life: true,
			maxLife: true,
			seed: true,
			nbrUpFire: true,
			nbrUpWood: true,
			nbrUpWater: true,
			nbrUpLightning: true,
			nbrUpAir: true,
			skills: {
				select: { skillId: true },
				where: { state: { equals: true } }
			},
			items: {
				select: {
					itemId: true
				}
			},
			status: {
				select: {
					statusId: true
				}
			}
		}
	});

	const rng = seedrandom(opponentGameDinoz.seed);
	opponentGameDinoz.name =
		translate(`fb.name.prefix.${getRandomEnumValue(TournamentNamePrefix, rng())}`, authed) +
		translate(`fb.name.middle.${getRandomEnumValue(TournamentNameMiddle, rng())}`, authed) +
		translate(`fb.name.suffix.${getRandomEnumValue(TournamentNameSuffix, rng())}`, authed) +
		' ' +
		translate(`fb.name.title.${getRandomEnumValue(TournamentNameTitle, rng())}`, authed) +
		' ' +
		translate(`fb.name.quality.${getRandomEnumValue(TournamentNameQuality, rng())}`, authed);
	opponentGameDinoz.life = opponentGameDinoz.maxLife;

	const fightResult = calculateFightBetweenPlayers(
		[dinoz],
		dinoz.player.cooker,
		[{ ...opponentGameDinoz, catches: [] }],
		false,
		PlaceEnum.FORCEBRUT
	);

	const attacker = fightResult.attackers.find(a => a.dinozId === dinoz.id);
	if (!attacker) {
		throw new ExpectedError(`Attacker ${dinoz.id} doesn't exist.`);
	}

	const fprob = getRandomNumber(0, 100);
	let goldMultiplier = 1;
	if (fprob < 1) goldMultiplier = 10;
	else if (fprob < 11) goldMultiplier = 3;

	let gold = (getRandomNumber(0, 10) + 28) * 10;

	gold += Math.round(gold * goldMultiplier);

	if (fightResult.winner) {
		await addMoney(authed.id, gold);
	}

	const lvlDiff = opponentGameDinoz.level - dinoz.level;
	let xpf = 1.2 + 0.8 * (lvlDiff / opponentGameDinoz.level) * 2.5;
	if (xpf < 1.0) xpf = 2.5;
	let xp = calculateXPBonus(dinoz, 50 * xpf, dinoz.player);
	const max = getMaxXp(dinoz);
	let levelup = false;
	if (dinoz.experience + xp >= max) {
		levelup = true;
		xp = max - dinoz.experience;
		if (xp < 0) xp = 0;
	}
	await updateDinoz(dinoz.id, {
		life: {
			decrement: attacker.hpLost
		},
		experience: {
			increment: fightResult.winner ? xp : 0
		},
		FBTournamentStep: {
			increment: fightResult.winner ? 1 : 0
		}
	});

	await archiveFight(fightResult, authed.id);

	// Consume item used
	for (const fighter of [...fightResult.attackers]) {
		for (const itemUsed of fighter.itemsUsed) {
			await removeItemFromDinoz(fighter.dinozId, itemUsed);
		}
	}

	if (fightResult.winner && dinoz.FBTournamentStep % 10 === 0) {
		switch (dinoz.FBTournamentStep / 10) {
			case 1:
				await addStatusToDinoz(dinoz.id, DinozStatusId.BRONZE_MEDAL_FORCEBRUT);
				break;
			case 2:
				await addStatusToDinoz(dinoz.id, DinozStatusId.SILVER_MEDAL_FORCEBRUT);
				break;
			case 3:
				await addStatusToDinoz(dinoz.id, DinozStatusId.GOLD_MEDAL_FORCEBRUT);
				break;
			case 4:
				await addStatusToDinoz(dinoz.id, DinozStatusId.DIAMOND_MEDAL_FORCEBRUT);
				break;
			default:
				break;
		}
	}

	return {
		fighters: fightResult.fighters,
		goldEarned: fightResult.winner ? gold : 0,
		xpEarned: fightResult.winner ? xp : 0,
		levelUp: levelup,
		totalHpLost: fightResult.attackers.reduce((partialSum, a) => partialSum + a.hpLost, 0),
		result: fightResult.winner,
		history: fightResult.steps,
		hpLost: fightResult.attackers.map(a => ({
			id: a.dinozId,
			hpLost: a.hpLost
		})),
		itemsUsed: fightResult.attackers.map(a => ({
			id: a.dinozId,
			itemsUsed: a.itemsUsed
		})),
		place: PlaceEnum.FORCEBRUT
	};
}
