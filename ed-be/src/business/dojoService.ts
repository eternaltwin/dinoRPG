import { Request } from 'express';
import { auth, getDojoFightPreparationRequest, removeMoney } from '../dao/playerDao.js';
import { createMyDojo, createMyTeamDao, getMyDojoDao } from '../dao/dojoDao.js';
import dayjs from 'dayjs';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import translate from '../utils/translate.js';
import { getDinozForDojoFight } from '../dao/dinozDao.js';
import generateFight from '../utils/fight/generateFight.js';
import { FightConfiguration } from '@drpg/core/models/fight/FightConfiguration';
import { generateString } from '../utils/index.js';
import getFighters from '../utils/fight/getFighters.js';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import seedrandom from 'seedrandom';
import { archiveFight, getAllArchivedFightRequest, getArchivedFightRequest } from '../dao/archiveDao.js';
import { FighterRecap } from '@drpg/core/models/fight/FightResult';
import { FightStep } from '@drpg/core/models/fight/FightStep';

export async function getDojo(req: Request) {
	const authed = await auth(req);

	let myDojo = await getMyDojoDao(authed.id);

	if (!myDojo) {
		myDojo = await createMyDojo(authed.id);
	}

	return myDojo;
}

export async function createMyTeam(req: Request) {
	const authed = await auth(req);
	const teamIds = req.body.team as number[];

	let myDojo = await getMyDojoDao(authed.id);

	if (!myDojo) {
		myDojo = await createMyDojo(authed.id);
	}

	if (myDojo.teamUpdate && dayjs().isSame(myDojo.teamUpdate, 'day')) {
		throw new ExpectedError(translate('teamAlreadyUpdated', authed));
	}
	const dojo = await createMyTeamDao(teamIds, myDojo.id);

	return dojo;
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

	const rng_seed = generateString(20);
	const rng = seedrandom(rng_seed);

	const place = PlaceEnum.DOJO;
	const fighters = getFighters(
		{
			dinozList: leftTeam,
			monsterList: []
		},
		{
			dinozList: rightTeam,
			monsterList: []
		},
		place,
		rng
	);

	const fightConfiguration: FightConfiguration = {
		seed: rng_seed,

		// Flags
		castleFight: false,
		canUseCapture: true,
		enableStats: false,

		// Teams
		attackerHasCook: leftPlayer.cooker,
		defenderHasCook: rightPlayer.cooker,

		// Fighters
		initialDinozList: leftTeam,
		fighters,

		// Place
		place
	};

	const fightResult = generateFight(fightConfiguration, place, rng);

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
