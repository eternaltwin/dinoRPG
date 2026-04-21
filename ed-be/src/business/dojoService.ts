import { Skill } from '@drpg/core/models/dinoz/SkillList';
import { Challenge, challengeRanges, ChallengeType, parseChallenge } from '@drpg/core/models/dojo/challenge';
import { TournamentPhase } from '@drpg/core/models/dojo/tournament';
import { ItemType } from '@drpg/core/models/enums/ItemType';
import { RewardEnum } from '@drpg/core/models/enums/Parser';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { DOJO_CHALLENGE_RULES } from '@drpg/core/models/fight/FightConfiguration';
import { FighterRecap, FightOutcome } from '@drpg/core/models/fight/FightResult';
import { FightStep } from '@drpg/core/models/fight/FightStep';
import { Item, itemList } from '@drpg/core/models/item/ItemList';
import {
	DOJO_FIGHT_COST,
	DOJO_FIGHT_FRIENDS_DINOZ_COST,
	DOJO_MAX_DAILY_CHALLENGE,
	DOJO_MAX_SERIES,
	DOJO_OPPONENT_IN_SERIE,
	DOJO_REPUTATION_CHALLENGE,
	DOJO_REPUTATION_WIN
} from '@drpg/core/utils/dojoConstants';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { Dojo, NotificationSeverity } from '@drpg/prisma';
import { Request } from 'express';
import {
	archiveChallenge,
	archiveFight,
	getAllArchivedFightRequest,
	getArchivedFightRequest,
	viewFight
} from '../dao/archiveDao.js';
import { getDinozForDojoFight, getRandomDinozFromLevel } from '../dao/dinozDao.js';
import {
	addOpponent,
	cleanCurrentOpponentTeam,
	createMyDojo,
	createMyTeamDao,
	getMyDojoDao,
	getMyTeamDao,
	incrementDailyReset,
	setFightedOpponent
} from '../dao/dojoDao.js';
import { createNotification } from '../dao/notificationDao.js';
import {
	auth,
	getDojoChallengePreparationRequest,
	getDojoDataForRanking,
	getDojoFightPreparationRequest,
	getPlayerDinozInformationForTeam,
	increaseCashPrice,
	removeMoney
} from '../dao/playerDao.js';
import { increaseItemQuantity } from '../dao/playerItemDao.js';
import { getPlayerPositionDojoDAO, updateDojoPoints } from '../dao/rankingDao.js';
import { prisma } from '../prisma.js';
import TournamentManager from '../utils/tournamentManager.js';
import translate from '../utils/translate.js';
import { calculateFightBetweenPlayers } from './fightService.js';
import { DojoFightResume } from '@drpg/core/models/dojo/dojoFightResume';
import { FullFightStats } from '@drpg/core/models/fight/FightResult';
import { getLatestTournament, incrementCashPrice } from '../dao/tournamentDao.js';

export async function getDojo(req: Request) {
	const authed = await auth(req);

	let myDojo = await getMyDojoDao(authed.id);

	if (!myDojo) {
		myDojo = await createMyDojo(authed.id, generateRandomChallenge());
	}

	const rank = await getPlayerPositionDojoDAO(authed.id);

	const tournament = await TournamentManager.getCurrentTournamentState(prisma);
	return { dojo: myDojo, rank: rank, tournament };
}

export async function createMyTeam(req: Request) {
	const authed = await auth(req);
	const teamIds = req.body.team as number[];

	const tournament = await TournamentManager.getCurrentTournamentState(prisma);

	if (!tournament || tournament.phase !== TournamentPhase.QUALIFICATION) {
		throw new ExpectedError(translate('dojo.qualificationOver', authed));
	}

	let myDojo = await getMyDojoDao(authed.id);

	if (!myDojo) {
		myDojo = await createMyDojo(authed.id, generateRandomChallenge());
	}

	if (teamIds.length < 5 || teamIds.length > 10) {
		throw new ExpectedError(translate('dojo.wrongDinozInTeam', authed));
	}

	const playerDinoz = await getPlayerDinozInformationForTeam(authed.id);

	if (!teamIds.every(id => playerDinoz.dinoz.map(d => d.id).includes(id))) {
		throw new ExpectedError(translate('dojo.dinozNotPlayer', authed));
	}

	// Fill DOJO_OPPONENT_IN_SERIE (5) opponents
	const team = playerDinoz.dinoz.filter(d => teamIds.includes(d.id));

	if (team.some(d => d.level < 10)) {
		throw new ExpectedError(translate('dojo.dinozTooLowLevel', authed));
	}
	await createOpponentTeam(team, myDojo);

	return await createMyTeamDao(teamIds, myDojo.id);
}

export async function getMyTeam(req: Request) {
	const authed = await auth(req);

	const myDojo = await getMyTeamDao(authed.id);

	if (!myDojo) {
		throw new ExpectedError(translate('dojo.inexistantDojo', authed));
	}

	if (myDojo.team.length == 0) {
		return myDojo;
	}

	if (
		(myDojo.DojoOpponents.length == 0 || myDojo.DojoOpponents.every(d => d.achieved)) &&
		myDojo.dailyReset < DOJO_MAX_SERIES
	) {
		myDojo.team = await cleanCurrentOpponentTeam(myDojo.id);
		myDojo.DojoOpponents = await createOpponentTeam(
			myDojo.team.map(d => {
				return {
					id: d.dinoz.id,
					level: d.dinoz.level
				};
			}),
			myDojo
		);
	}

	return myDojo;
}

export async function fightFriend(req: Request): Promise<{ fight: DojoFightResume; stats: FullFightStats }> {
	const left = req.body.left as number[];
	const right = req.body.right as number[];
	const rightId = req.body.rightId as string;
	const fightCost = (left.length + right.length) * DOJO_FIGHT_FRIENDS_DINOZ_COST;

	const authed = await auth(req);
	const leftPlayer = await getDojoFightPreparationRequest(authed.id);
	if (!left.every(id => leftPlayer.dinoz.map(d => d.id).includes(id))) {
		throw new ExpectedError(translate('dojo.dinozNotPlayer', authed));
	}
	const rightPlayer = await getDojoFightPreparationRequest(rightId);
	if (!right.every(id => rightPlayer.dinoz.map(d => d.id).includes(id))) {
		throw new ExpectedError(translate('dojo.dinozNotPlayer', authed));
	}

	if (leftPlayer.money < fightCost) {
		throw new ExpectedError(translate('dojo.notEnoughGold', authed));
	}

	// Pay the fees
	await removeMoney(authed.id, fightCost);
	// Add the fees to the tournament cash price if one is ongoing
	const tournament = await getLatestTournament();
	if (tournament) {
		await incrementCashPrice(tournament.id, fightCost);
	}

	const rightTeam = await getDinozForDojoFight(right);
	const leftTeam = await getDinozForDojoFight(left);

	// Keep only magic items from dinoz for the fight and set life to maxLife
	rightTeam.map(d => {
		d.items = d.items.filter(i =>
			Object.values(itemList).find(item => item.itemId === i.itemId && item.itemType === ItemType.MAGICAL)
		);
		d.life = d.maxLife;
	});
	leftTeam.map(d => {
		d.items = d.items.filter(i =>
			Object.values(itemList).find(item => item.itemId === i.itemId && item.itemType === ItemType.MAGICAL)
		);
		d.life = d.maxLife;
	});

	const fightResult = calculateFightBetweenPlayers(
		DOJO_CHALLENGE_RULES,
		leftTeam,
		leftPlayer.cooker,
		rightTeam,
		rightPlayer.cooker,
		PlaceEnum.DOJO
	);

	const fightArchive = await archiveFight(
		fightResult,
		fightResult.outcome === FightOutcome.AttackerWin, // Save if one or the other win, the detail is not important
		authed.id,
		rightId
	);
	return { fight: fightArchive, stats: fightResult.stats };
}

export async function getArchivedFight(req: Request): Promise<DojoFightResume> {
	const authed = await auth(req);
	const fightId = req.params.id;
	const fight = await getArchivedFightRequest(fightId);

	if (!fight) {
		throw new ExpectedError(translate('dojo.archiveNotFound', authed));
	}

	await viewFight(authed.id, fightId);

	return {
		id: fightId,
		fighters: JSON.parse(fight.fighters) as FighterRecap[],
		result: fight.result,
		history: JSON.parse(fight.steps) as FightStep[],
		seed: fight.seed,
		leftPlayer: fight.leftPlayer,
		rightPlayer: fight.rightPlayer
	};
}

export async function getAllArchivedFight(req: Request) {
	const page = +req.params.page;
	const authed = await auth(req);
	const { archive, totalArchive } = await getAllArchivedFightRequest(authed.id, page);

	if (!archive) {
		throw new ExpectedError(translate('dojo.archiveNotFound', authed));
	}
	const fights = archive.map(f => {
		return {
			fighters: JSON.parse(f.fighters) as FighterRecap[],
			id: f.id
		};
	});

	return { archive: fights, quantity: totalArchive };
}

/**
 * Generate a random challenge
 * @returns {Challenge}
 */
function generateRandomChallenge(): Challenge {
	// Get all challenge types from the enum
	const challengeTypes = Object.values(ChallengeType); // Filter out reverse mappings

	// Select a random challenge type
	const randomType = challengeTypes[Math.floor(Math.random() * challengeTypes.length)] as ChallengeType;

	// Get the range for this challenge type
	const [min, max] = challengeRanges[randomType];

	// Generate a random number within the range (inclusive)
	const randomGoal = Math.floor(Math.random() * (max - min + 1)) + min;

	return {
		type: randomType,
		goal: randomGoal
	};
}

export async function fightChallenge(
	req: Request
): Promise<{ fight: DojoFightResume; stats: FullFightStats; challengeWon: boolean; victory: boolean }> {
	const myDinozId = +req.body.myDinoz;
	const opponentId = +req.body.opponent;

	const authed = await auth(req);

	const tournament = await TournamentManager.getCurrentTournamentState(prisma);

	if (!tournament || tournament.phase !== TournamentPhase.QUALIFICATION) {
		throw new ExpectedError(translate('dojo.qualificationOver', authed));
	}

	const player = await getDojoChallengePreparationRequest(authed.id);

	if (!player.Dojo) {
		throw new ExpectedError(translate('dojo.inexistantDojo', authed));
	}
	if (player.money < DOJO_FIGHT_COST) {
		throw new ExpectedError(translate('dojo.notEnoughMoney', authed));
	}
	const myDinoz = player.Dojo.team.find(d => d.dinozId === myDinozId);
	const opponent = player.Dojo.DojoOpponents.find(d => d.dinozId === opponentId);
	if (!myDinoz || !opponent) {
		throw new ExpectedError(translate('dojo.dinozNotPlayer', authed));
	}

	if (myDinoz.fighted || opponent.achieved) {
		throw new ExpectedError(translate('dojo.alreadyFighted', authed));
	}

	const leftTeam = await getDinozForDojoFight([myDinozId]);
	const rightTeam = await getDinozForDojoFight([opponentId]);

	// Remove items from dinoz for the fight and set life to maxLife
	rightTeam.map(d => {
		d.items = [];
		d.life = d.maxLife;
		// Remove Trou noir, Sylphides and Hypnose
		d.skills = d.skills.filter(
			s => s.skillId !== Skill.TROU_NOIR && s.skillId !== Skill.HYPNOSE && s.skillId !== Skill.SYLPHIDES
		);
	});
	leftTeam.map(d => {
		d.items = [];
		d.life = d.maxLife;
		// Remove Trou noir, Sylphides and Hypnose
		d.skills = d.skills.filter(
			s => s.skillId !== Skill.TROU_NOIR && s.skillId !== Skill.HYPNOSE && s.skillId !== Skill.SYLPHIDES
		);
	});

	const fightResult = calculateFightBetweenPlayers(
		DOJO_CHALLENGE_RULES,
		leftTeam,
		false,
		rightTeam,
		false,
		PlaceEnum.DOJO,
		100
	);

	let victory = false;

	// Only defeating the opponent or having more % hp left on timeout give a victory. Defeat, having less % hp on timeout and tie give a defeat.

	// The winner and loser will be calculated based on the remaining hp (%) in case of timeout
	// That is, the loser will be the one with lowest endingHp / startingHp
	// To avoid comparing non-integer numbers, instead of comparing
	// "attack.endingHp / attack.startingHp" with "defense.endingHp / defense.startingHp"
	// Compare: "attack.endingHp * defense.startingHp' with "defense.endingHp * attack.startingHp"
	const left = fightResult.stats.attack.endingHp * fightResult.stats.defense.startingHp;
	const right = fightResult.stats.defense.endingHp * fightResult.stats.attack.startingHp;
	if (
		fightResult.outcome === FightOutcome.AttackerWin ||
		(fightResult.outcome === FightOutcome.Timeout && left > right)
	) {
		victory = true;
	}

	const fightArchive = await archiveFight(
		fightResult,
		victory,
		authed.id,
		rightTeam.length > 0 ? rightTeam[0].playerId : null
	);

	const activeChallenge = player.Dojo.activeChallenge as Challenge;
	const challengeWon = parseChallenge(activeChallenge, fightResult.stats) <= 0 && victory;

	const promises = [];

	if (fightArchive.result && player.Dojo.DojoOpponents.filter(o => o.achieved).length + 1 === DOJO_OPPONENT_IN_SERIE) {
		promises.push(increaseItemQuantity(authed.id, Item.TREASURE_COUPON, 1));
		promises.push(
			createNotification(
				authed.id,
				JSON.stringify([
					{
						rewardType: RewardEnum.ITEM,
						value: Item.TREASURE_COUPON,
						quantity: 1
					}
				]),
				NotificationSeverity.reward
			)
		);
		promises.push(incrementDailyReset(player.Dojo.id));
	}

	if (challengeWon && player.Dojo.DojoChallengeHistory.filter(c => c.achieved).length < DOJO_MAX_DAILY_CHALLENGE) {
		promises.push(increaseItemQuantity(authed.id, Item.TREASURE_COUPON, 1));
		promises.push(
			createNotification(
				authed.id,
				JSON.stringify([
					{
						rewardType: RewardEnum.ITEM,
						value: Item.TREASURE_COUPON,
						quantity: 1
					}
				]),
				NotificationSeverity.reward
			)
		);
	}

	await Promise.all(promises);

	const newChallenge = generateRandomChallenge();
	await prisma.$transaction(async tx => {
		const dojo = await tx.dojo.findUniqueOrThrow({
			where: { playerId: authed.id },
			include: { DojoChallengeHistory: true }
		});

		await tx.player.update({
			where: {
				id: authed.id
			},
			data: {
				money: {
					decrement: DOJO_FIGHT_COST
				}
			}
		});
		await tx.tournament.update({
			where: {
				id: tournament.id
			},
			data: {
				cashPrice: {
					increment: DOJO_FIGHT_COST
				}
			}
		});
		await tx.dojoTeam.update({
			where: {
				dojoId_dinozId: {
					dojoId: dojo.id,
					dinozId: myDinozId
				}
			},
			data: {
				fighted: true
			}
		});
		await tx.dojoOpponents.update({
			where: {
				dojoId_dinozId: {
					dinozId: opponentId,
					dojoId: dojo.id
				}
			},
			data: {
				fighted: true,
				achieved: fightArchive.result
			}
		});

		const addedReputation = victory ? DOJO_REPUTATION_WIN + (challengeWon ? DOJO_REPUTATION_CHALLENGE : 0) : 0;
		const newReputation = dojo.reputation + addedReputation;
		const totalCombats = dojo.DojoChallengeHistory.length + 1;
		const totalVictoires = dojo.DojoChallengeHistory.filter(h => h.victory).length + (victory ? 1 : 0);
		const worth = totalVictoires / totalCombats;
		const newDojoPoints = Math.round(worth * newReputation);

		await tx.dojo.update({
			where: { id: dojo.id },
			data: {
				reputation: { increment: addedReputation },
				activeChallenge: newChallenge,
				DojoChallengeHistory: {
					create: {
						myDinozId,
						opponentId,
						challenge: JSON.stringify(activeChallenge),
						victory: fightArchive.result,
						achieved: challengeWon
					}
				}
			}
		});
		await tx.ranking.update({
			where: { playerId: authed.id },
			data: { dojo: newDojoPoints }
		});
	});

	return { fight: fightArchive, stats: fightResult.stats, challengeWon: challengeWon, victory };
}

export async function skipOpponent(req: Request) {
	const opponentId = +req.body.opponent;

	const authed = await auth(req);
	const tournament = await TournamentManager.getCurrentTournamentState(prisma);

	if (!tournament || tournament.phase !== TournamentPhase.QUALIFICATION) {
		throw new ExpectedError(translate('dojo.qualificationOver', authed));
	}

	const player = await getDojoChallengePreparationRequest(authed.id);

	if (!player.Dojo) {
		throw new ExpectedError(translate('dojo.inexistantDojo', authed));
	}
	if (player.money < DOJO_FIGHT_COST) {
		throw new ExpectedError(translate('dojo.notEnoughMoney', authed));
	}

	const opponent = player.Dojo.DojoOpponents.find(d => d.dinozId === opponentId);
	if (!opponent) {
		throw new ExpectedError(translate('dojo.inexistantOpponent', authed));
	}

	if (!opponent.fighted) {
		throw new ExpectedError(translate('dojo.notFightedOpponent', authed));
	}

	const ranking = await getDojoDataForRanking(authed.id);
	const victory = ranking.DojoChallengeHistory.filter(h => h.victory).length;
	const worth = victory / (ranking.DojoChallengeHistory.length + 1);

	const promises = [];
	promises.push(removeMoney(authed.id, DOJO_FIGHT_COST));
	promises.push(increaseCashPrice(tournament.id, DOJO_FIGHT_COST));
	promises.push(setFightedOpponent(opponentId, player.Dojo.id, true));
	promises.push(
		archiveChallenge(1, opponentId, JSON.stringify(player.Dojo.activeChallenge), false, false, player.Dojo.id)
	);
	promises.push(updateDojoPoints(authed.id, Math.round(worth * ranking.reputation)));
	await Promise.all(promises);

	// If skip generate new batch of opponent
	if (player.Dojo.DojoOpponents.filter(d => d.achieved).length + 1 === DOJO_OPPONENT_IN_SERIE) {
		await increaseItemQuantity(authed.id, Item.TREASURE_COUPON, 1);

		await createNotification(
			authed.id,
			JSON.stringify([
				{
					rewardType: RewardEnum.ITEM,
					value: Item.TREASURE_COUPON,
					quantity: 1
				}
			]),
			NotificationSeverity.reward
		);
		await incrementDailyReset(player.Dojo.id);
	}
}

async function createOpponentTeam(team: { id: number; level: number }[], myDojo: Pick<Dojo, 'id' | 'playerId'>) {
	const opponentLevels = team.sort((a, b) => b.level - a.level).slice(0, 5);
	const opponentIds = [];
	const parsedId = opponentLevels.map(o => o.id);
	for (const dinoz of opponentLevels) {
		const ennemi = await getRandomDinozFromLevel(dinoz.level, parsedId, myDojo.playerId);
		if (ennemi === null) {
			// Incomplete opponent teams won't be created
			return [];
		}
		// Prevent a picked to opponent to be picked again
		parsedId.push(ennemi.id);
		opponentIds.push(ennemi.id);
	}

	const opponents = [];
	for (const opponentId of opponentIds) {
		opponents.push(await addOpponent(opponentId, myDojo.id));
	}

	return opponents;
}
