import { Request } from 'express';
import {
	auth,
	getDojoChallengePreparationRequest,
	getDojoDataForRanking,
	getDojoFightPreparationRequest,
	getPlayerDinozInformationForTeam,
	increaseCashPrice,
	removeMoney
} from '../dao/playerDao.js';
import {
	addOpponent,
	cleanCurrentOpponentTeam,
	createChallengeRequest,
	createMyDojo,
	createMyTeamDao,
	getMyDojoDao,
	getMyTeamDao,
	giveReputation,
	incrementDailyReset,
	setFightedOpponent,
	setFightedTeam
} from '../dao/dojoDao.js';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import translate from '../utils/translate.js';
import { getDinozForDojoFight, getRandomDinozFromLevel } from '../dao/dinozDao.js';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import {
	archiveChallenge,
	archiveFight,
	getAllArchivedFightRequest,
	getArchivedFightRequest,
	viewFight
} from '../dao/archiveDao.js';
import { FighterRecap } from '@drpg/core/models/fight/FightResult';
import { FightStep } from '@drpg/core/models/fight/FightStep';
import { calculateFightBetweenPlayers } from './fightService.js';
import { Challenge, challengeRanges, ChallengeType, parseChallenge } from '@drpg/core/models/dojo/challenge';
import { Dojo, NotificationSeverity } from '@drpg/prisma';
import { getPlayerPositionDojoDAO, updateDojoPoints } from '../dao/rankingDao.js';
import { Skill } from '@drpg/core/models/dinoz/SkillList';
import TournamentManager from '../utils/tournamentManager.js';
import { prisma } from '../prisma.js';
import { TournamentPhase } from '@drpg/core/models/dojo/tournament';
import { increaseItemQuantity } from '../dao/playerItemDao.js';
import { Item, itemList } from '@drpg/core/models/item/ItemList';
import { createNotification } from '../dao/notificationDao.js';
import { RewardEnum } from '@drpg/core/models/enums/Parser';
import { ItemType } from '@drpg/core/models/enums/ItemType';

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

	// Fill 5 opponents
	const team = playerDinoz.dinoz.filter(d => teamIds.includes(d.id));

	if (team.some(d => d.level < 10)) {
		throw new ExpectedError(translate('dojo.dinozTooLowLevel', authed));
	}
	await createOpponentTeam(team, myDojo);
	await incrementDailyReset(myDojo.id);

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

	if ((myDojo.DojoOpponents.length == 0 || myDojo.DojoOpponents.every(d => d.achieved)) && myDojo.dailyReset < 10) {
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

export async function fightFriend(req: Request) {
	const left = req.body.left as number[];
	const right = req.body.right as number[];
	const rightId = req.body.rightId as string;
	const fightCost = (left.length + right.length) * 50;

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
	//Pay the fees
	await removeMoney(authed.id, fightCost);

	const rightTeam = await getDinozForDojoFight(right);
	const leftTeam = await getDinozForDojoFight(left);

	// Remove items from dinoz for the fight and set life to maxLife
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
		leftTeam,
		leftPlayer.cooker,
		rightTeam,
		rightPlayer.cooker,
		PlaceEnum.DOJO
	);

	const fightArchive = await archiveFight(fightResult, authed.id);
	return { fight: fightArchive, stats: fightResult.stats };
}

export async function getArchivedFight(req: Request) {
	const authed = await auth(req);
	const fight = await getArchivedFightRequest(req.params.id);

	if (!fight) {
		throw new ExpectedError(translate('dojo.archiveNotFound', authed));
	}

	await viewFight(authed.id, req.params.id);

	return {
		fighters: JSON.parse(fight.fighters) as FighterRecap[],
		result: fight.result,
		history: JSON.parse(fight.steps) as FightStep[],
		seed: fight.seed
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

export async function fightChallenge(req: Request) {
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
	if (player.money < 200) {
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

	const fightResult = calculateFightBetweenPlayers(leftTeam, false, rightTeam, false, PlaceEnum.DOJO, 100);

	const fightArchive = await archiveFight(fightResult, authed.id);

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const activeChallenge = player.Dojo.activeChallenge as Challenge;
	const challengeWon = parseChallenge(activeChallenge, fightResult.stats) <= 0 && fightResult.winner;

	const promises = [];

	if (fightArchive.result && player.Dojo.DojoOpponents.filter(o => o.achieved).length === 4) {
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
	promises.push(removeMoney(authed.id, 200));
	promises.push(increaseCashPrice(tournament.id, 200));
	promises.push(setFightedTeam(myDinozId, player.Dojo.id));
	promises.push(setFightedOpponent(opponentId, player.Dojo.id, fightArchive.result));

	const newChallenge = generateRandomChallenge();
	promises.push(createChallengeRequest(authed.id, newChallenge));

	// Reputation
	const reputation = fightResult.winner ? 2 + (challengeWon ? 2 : 0) : 0;
	promises.push(giveReputation(reputation, player.Dojo.id));
	// DOJO challenge history
	promises.push(
		archiveChallenge(
			myDinozId,
			opponentId,
			JSON.stringify(activeChallenge),
			fightArchive.result,
			challengeWon,
			player.Dojo.id
		)
	);
	const ranking = await getDojoDataForRanking(authed.id);
	const victory = ranking.DojoChallengeHistory.filter(h => h.victory).length + (fightResult.winner ? 1 : 0);
	const worth = victory / (ranking.DojoChallengeHistory.length + 1);
	promises.push(updateDojoPoints(authed.id, Math.round(worth * (ranking.reputation + reputation))));
	await Promise.all(promises);

	return { fight: fightArchive, stats: fightResult.stats, challengeWon: challengeWon, victory: fightResult.winner };
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
	if (player.money < 200) {
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
	promises.push(removeMoney(authed.id, 200));
	promises.push(increaseCashPrice(tournament.id, 200));
	promises.push(setFightedOpponent(opponentId, player.Dojo.id, true));
	promises.push(
		archiveChallenge(1, opponentId, JSON.stringify(player.Dojo.activeChallenge), false, false, player.Dojo.id)
	);
	promises.push(updateDojoPoints(authed.id, Math.round(worth * ranking.reputation)));
	await Promise.all(promises);
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
