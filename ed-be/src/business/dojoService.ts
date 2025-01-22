import { Request } from 'express';
import {
	auth,
	getDojoChallengePreparationRequest,
	getDojoDataForRanking,
	getDojoFightPreparationRequest,
	getPlayerDinozInformationForTeam,
	removeMoney
} from '../dao/playerDao.js';
import {
	addOpponent,
	cleanCurrentOpponentTeam,
	createChallengeRequest,
	createMyDojo,
	createMyTeamDao,
	getChallengeRequest,
	getMyDojoDao,
	getMyTeamDao,
	giveReputation,
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
	getArchivedFightRequest
} from '../dao/archiveDao.js';
import { FighterRecap, FullFightStats } from '@drpg/core/models/fight/FightResult';
import { FightStep } from '@drpg/core/models/fight/FightStep';
import { calculateFightBetweenPlayers } from './fightService.js';
import { Challenge, challengeRanges, ChallengeType } from '@drpg/core/models/dojo/challenge';
import { myTeam } from '@drpg/core/models/dojo/dojoBasic';
import { Dojo } from '@drpg/prisma';
import { getPlayerPositionDojoDAO, updateDojoPoints } from '../dao/rankingDao.js';
import { Skill } from '@drpg/core/models/dinoz/SkillList';

export async function getDojo(req: Request) {
	const authed = await auth(req);

	let myDojo = await getMyDojoDao(authed.id);

	if (!myDojo) {
		myDojo = await createMyDojo(authed.id);
	}

	const rank = await getPlayerPositionDojoDAO(authed.id);

	return { dojo: myDojo, rank: rank };
}

export async function createMyTeam(req: Request) {
	const authed = await auth(req);
	const teamIds = req.body.team as number[];

	let myDojo = await getMyDojoDao(authed.id);

	if (!myDojo) {
		myDojo = await createMyDojo(authed.id);
	}

	if (teamIds.length < 5 || teamIds.length > 10) {
		throw new ExpectedError(translate('dojo.wrongDinozInTeam', authed));
	}

	const playerDinoz = await getPlayerDinozInformationForTeam(authed.id);

	if (!teamIds.every(id => playerDinoz.dinoz.map(d => d.id).includes(id))) {
		throw new ExpectedError(translate('dojo.dinozNotPlayer', authed));
	}

	// Create challenge
	const newChallenge = generateRandomChallenge();
	await createChallengeRequest(authed.id, JSON.stringify(newChallenge));

	// Fill 5 opponents
	const team = playerDinoz.dinoz.filter(d => teamIds.includes(d.id));

	await createOpponentTeam(team, myDojo);

	const dojo: myTeam = await createMyTeamDao(teamIds, myDojo.id);

	return dojo;
}

export async function getMyTeam(req: Request) {
	const authed = await auth(req);

	const myDojo = await getMyTeamDao(authed.id);

	if (!myDojo) {
		throw new ExpectedError(translate('dojo.inexistantDojo', authed));
	}

	if (myDojo.DojoOpponents.length > 0 && myDojo.DojoOpponents.every(d => d.achieved) && myDojo.dailyReset < 10) {
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
		d.items = [];
		d.life = d.maxLife;
	});
	leftTeam.map(d => {
		d.items = [];
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

export async function getChallenge(req: Request) {
	const authed = await auth(req);
	const dojo = await getChallengeRequest(authed.id);
	if (!dojo || !dojo.activeChallenge) {
		const newChallenge = generateRandomChallenge();
		await createChallengeRequest(authed.id, JSON.stringify(newChallenge));
		return newChallenge;
	}
	return JSON.parse(dojo.activeChallenge) as Challenge;
}

/**
 * Generate a random challenge
 * @returns {Challenge}
 */
function generateRandomChallenge(): Challenge {
	// Get all challenge types from the enum
	const challengeTypes = Object.values(ChallengeType); // .filter(value => typeof value === 'number'); // Filter out reverse mappings

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
	const player = await getDojoChallengePreparationRequest(authed.id);

	if (!player.Dojo) {
		throw new ExpectedError(translate('dojo.inexistantDojo', authed));
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
		// Remove Trou noir and Hypnose
		d.skills = d.skills.filter(
			s => s.skillId !== Skill.TROU_NOIR && s.skillId !== Skill.HYPNOSE && s.skillId !== Skill.SYLPHIDES
		);
	});
	leftTeam.map(d => {
		d.items = [];
		d.life = d.maxLife;
		// Remove Trou noir and Hypnose
		d.skills = d.skills.filter(
			s => s.skillId !== Skill.TROU_NOIR && s.skillId !== Skill.HYPNOSE && s.skillId !== Skill.SYLPHIDES
		);
	});

	const fightResult = calculateFightBetweenPlayers(leftTeam, false, rightTeam, false, PlaceEnum.DOJO, 100);

	const fightArchive = await archiveFight(fightResult, authed.id);

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const activeChallenge = JSON.parse(player.Dojo.activeChallenge!) as Challenge;
	const challengeWon = parseChallenge(activeChallenge, fightResult.stats) && fightResult.winner;

	const promises = [];
	promises.push(setFightedTeam(myDinozId, player.Dojo.id));
	promises.push(setFightedOpponent(opponentId, player.Dojo.id, fightArchive.result));

	const newChallenge = generateRandomChallenge();
	promises.push(createChallengeRequest(authed.id, JSON.stringify(newChallenge)));

	//Reputation
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

function parseChallenge(challenge: Challenge, stats: FullFightStats) {
	switch (challenge.type) {
		case ChallengeType.Kill:
			// Beat the opponent
			return stats.defense.endingHp <= 0;
		case ChallengeType.TakeAttackQuantity:
			// Receive less than N attacks
			return stats.defense.attacks <= challenge.goal;
		case ChallengeType.TakeRawDamage:
			// Lose les than N hp
			return stats.attack.hpLost <= challenge.goal;
		case ChallengeType.TakePercentDamage:
			// Lose less than X% of hp
			return ((stats.defense.startingHp - stats.defense.endingHp) / stats.attack.startingHp) * 100 <= challenge.goal;
		case ChallengeType.Assault:
			// Do at least N assaults
			return stats.attack.assaults >= challenge.goal;
		case ChallengeType.AssaultPercentage:
			// X% of attacks are assaults
			return (stats.attack.assaults / stats.attack.attacks) * 100 >= challenge.goal;
		case ChallengeType.DealDamage:
			// Deal up to N damage
			return stats.defense.hpLost <= challenge.goal;
		case ChallengeType.DealPercentDamage:
			// Deal at least X% of opponent hp
			return ((stats.defense.startingHp - stats.defense.endingHp) / stats.defense.startingHp) * 100 >= challenge.goal;
		case ChallengeType.CounterAttack:
			// Counter a minimum of N times
			return stats.attack.counters >= challenge.goal;
		case ChallengeType.Dodge:
			// Dodge a minimum of N times
			return stats.attack.evasions >= challenge.goal;
		case ChallengeType.DodgePoison:
			// Never get poisoned
			return stats.defense.poisoned === 0;
		case ChallengeType.PoisonOpponent:
			// Poison the opponent at least once
			return stats.attack.poisoned > 0;
		default:
			return false;
	}
}

export async function skipOpponent(req: Request) {
	const opponentId = +req.body.opponent;

	const authed = await auth(req);
	const player = await getDojoChallengePreparationRequest(authed.id);

	if (!player.Dojo) {
		throw new ExpectedError(translate('dojo.inexistantDojo', authed));
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
	const worth = isNaN(victory / ranking.DojoChallengeHistory.length)
		? 0
		: victory / ranking.DojoChallengeHistory.length;

	const promises = [];
	promises.push(setFightedOpponent(opponentId, player.Dojo.id, true));
	promises.push(
		archiveChallenge(1, opponentId, JSON.stringify(player.Dojo.activeChallenge), false, false, player.Dojo.id)
	);
	promises.push(updateDojoPoints(authed.id, Math.round(worth * ranking.reputation)));
	await Promise.all(promises);
}

async function createOpponentTeam(team: { id: number; level: number }[], myDojo: Pick<Dojo, 'id' | 'playerId'>) {
	const opponentLevels = team.sort((a, b) => b.level - a.level).slice(0, 5);
	const opponents = [];
	const parsedId = opponentLevels.map(o => o.id);
	for (const dinoz of opponentLevels) {
		const ennemi = await getRandomDinozFromLevel(dinoz.level, parsedId, myDojo.playerId);
		const newOpponent = await addOpponent(ennemi.id, myDojo.id);
		opponents.push(newOpponent);
		// Prevent a picked to opponent to be picked again
		parsedId.push(newOpponent.dinoz.id);
	}
	return opponents;
}
