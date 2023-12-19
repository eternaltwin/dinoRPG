import { statusList } from '@drpg/core/models/dinoz/StatusList';
import { MapZone } from '@drpg/core/models/enums/MapZone';
import { FightConfiguration } from '@drpg/core/models/fight/FightConfiguration';
import { FightProcessResult } from '@drpg/core/models/fight/FightResult';
import { FighterFiche } from '@drpg/core/models/fight/FighterFiche';
import { MonsterFiche } from '@drpg/core/models/fight/MonsterFiche';
import { monsterList } from '@drpg/core/models/fight/MonsterList';
import { actualPlace, calculateXPBonus, canWinXP, getMaxXp, isAlive } from '@drpg/core/utils/DinozUtils';
import { Dinoz, DinozItem, DinozSkill, DinozStatus, LogType, Player } from '@drpg/prisma';
import { Request } from 'express';
import pkg from 'native-dinorpg';
import { getDinozFightDataRequest, updateDinoz, updateMultipleDinoz } from '../dao/dinozDao.js';
import { addMoney } from '../dao/playerDao.js';
import { ErrorFormator } from '../utils/errorFormator.js';
import { getRandomNumber } from '../utils/index.js';
import { DinozToCheckMissionFight, checkMissionFight } from './missionsService.js';
import { createLog } from '../dao/logDao.js';
import { sendDiscord } from '../utils/discord.js';
import gameConfig from '../config/game.config.js';

const { fight_rust } = pkg;

/**
 * @summary Process a fight
 * @param req
 * @return FightResult
 */
export async function processFight(req: Request) {
	const dinozId: number = +req.body.dinozId;
	// Get Dinoz info
	const dinozData = await getDinozFightDataRequest(dinozId);

	if (!dinozData) {
		throw new ErrorFormator(500, `Player ${dinozId} doesn't exist.`);
	}

	if (!dinozData.player || !req.auth || dinozData.player.id !== req.auth.playerId) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} doesn't belong to player ${req.auth?.playerId}`);
	}

	if (dinozData.canChangeName) {
		throw new ErrorFormator(500, `Dinoz has to be named.`);
	}

	const followers = dinozData.followers.map(follower => ({
		...follower,
		player: dinozData.player
	}));
	const team = [dinozData, ...followers];

	if (dinozData.concentration) {
		throw new ErrorFormator(400, 'concentration');
	}

	if (!isAlive(dinozData)) {
		throw new ErrorFormator(400, 'dead');
	}

	const monster = generateMonster(team); //prepareFight(dinozData.level, localisation.map, localisation.placeId);

	const fightResult = calculateFight(team, monster);

	const result = await rewardFight(team, monster, fightResult);

	// const result = getFightResult(dinozData, monster[0], fightResult);

	//If any dinoz is on a mission, check if the fight result progress the mission
	for (const dinoz of team) {
		if (dinoz.missions.some(mission => !mission.isFinished)) {
			await checkMissionFight(dinoz, result);
		}
	}

	// if (getEnvironnement() === 'development') console.log(`Result sent to front: ${JSON.stringify(result)}`);

	return result;
}

export async function moveFight(
	team: (DinozToCalculateFight & DinozToRewardFight & DinozToCheckMissionFight)[],
	placeId: number
) {
	const monsters = generateMonster(team); //prepareFight(dinoz.level, localisation.map, localisation.placeId);
	const fightResult = calculateFight(team, monsters);
	const result = await rewardFight(team, monsters, fightResult);

	// const result = getFightResult(dinoz, monsters[0], fightResult);
	//If any dinoz is on a mission, check if the fight result progress the mission
	for (const dinoz of team) {
		if (dinoz.missions.some(mission => !mission.isFinished)) {
			const dinozAtFuturePlace = structuredClone(dinoz);
			dinozAtFuturePlace.placeId = placeId;
			await checkMissionFight(dinozAtFuturePlace, result);
		}
	}
	return result;
}

export type DinozToCalculateFight = Parameters<typeof calculateFight>[0][number];
export function calculateFight(
	team: (Pick<
		Dinoz,
		'id' | 'level' | 'name' | 'life' | 'nbrUpFire' | 'nbrUpWood' | 'nbrUpWater' | 'nbrUpLightning' | 'nbrUpAir'
	> & {
		items: Pick<DinozItem, 'itemId'>[];
		skills: Pick<DinozSkill, 'skillId'>[];
		status: Pick<DinozStatus, 'statusId'>[];
	})[],
	monsters: MonsterFiche[]
): FightProcessResult {
	const attackers = team.map(dinoz => {
		const listDinozItems = dinoz.items.map(item => item.itemId);
		const listDinozSkills = dinoz.skills.map(skill => skill.skillId);
		const listDinozStatus = dinoz.status.map(status => status.statusId);

		const attacker = new FighterFiche(
			dinoz.id,
			dinoz.level,
			false,
			dinoz.name,
			dinoz.life,
			[dinoz.nbrUpFire, dinoz.nbrUpWood, dinoz.nbrUpWater, dinoz.nbrUpLightning, dinoz.nbrUpAir],
			0,
			0,
			listDinozItems,
			listDinozSkills,
			listDinozStatus
		);

		return attacker;
	});

	const defender = monsters.map(monster => {
		return new FighterFiche(
			0, // TODO have to find a way to define monster's id without conflicting with a dinoz id
			0,
			true,
			monster.name,
			monster.hp,
			[
				monster.elements.fire,
				monster.elements.wood,
				monster.elements.water,
				monster.elements.lightning,
				monster.elements.air
			],
			1,
			monster.bonus_defense,
			[],
			[],
			[]
		);
	});

	const fightConfiguration: FightConfiguration = {
		// Flags
		is_energy_enabled: true,
		can_use_equipment: true,
		can_use_permanent_equipment_only: false,
		can_use_capture: true,
		can_delete_objects: true,
		is_balance_enabled: true,

		// Fighters
		attackers,
		defenders: defender
	};

	// console.log(`Configuration: ${JSON.stringify(fightConfiguration)}`);

	return JSON.parse(fight_rust(JSON.stringify(fightConfiguration)));
}

export type DinozToRewardFight = Parameters<typeof rewardFight>[0][number];
export async function rewardFight(
	team: (Pick<Dinoz, 'id' | 'level' | 'experience' | 'life'> & {
		player: Pick<Player, 'id' | 'teacher'> | null;
		status: Pick<DinozStatus, 'statusId'>[];
		skills: Pick<DinozSkill, 'skillId'>[];
	})[],
	monsters: MonsterFiche[],
	fightResult: FightProcessResult
) {
	if (!team.length || !team[0].player) {
		throw new ErrorFormator(500, 'No player found');
	}

	const playerId = team[0].player.id;

	const XP_NEWB_BONUS = [15, 10, 6.6, 4.3, 2.5];

	// let teamLevel = 0;
	// teamLevel += dinozData.level;

	const goldFactor = 1.0;
	const xpFactor = 1.0;
	let totalWinXP = 0;

	//TODO use Array<MonsterFiche> input rather than MonsterFiche

	const teamLevel = team.reduce((acc, dinoz) => acc + dinoz.level, 0);

	let fgold = 0;

	for (const d of team) {
		//TODO escape
		/*//if escaped, no XP !
		if( Lambda.has( escaped, r.f) )
			continue;*/

		let xp = 0;
		const cur = d.level / teamLevel;

		/** HACK to restrict the use of low level dinoz in order to make easy money **/
		let gfact = 1.0;
		if (d.experience >= getMaxXp(d) && d.level <= 5) gfact = 0.1;
		/** HACK to make dinoz with malediction not generating gold **/
		if (d.status.some(status => status.statusId === statusList.CURSED)) {
			gfact = 0.0;
		}

		for (const f of monsters) {
			const factor = f.level >= d.level ? 1 : 4 / (4 + (d.level - f.level));
			fgold += (f.gold ?? 1.0) * factor * cur * gfact;
			xp += Math.round(f.xp ?? 10 * factor * cur);
			// newbie bonus
			if (d.level <= 5) xp += XP_NEWB_BONUS[d.level - 1] * cur;
			// bonus for fighters of same level of the monster
			if (Math.abs(f.level - d.level) <= 5 && f.xpBonus) xp += f.xpBonus;
		}
		//TODO ??
		/*if( !disableTrophies && d.life <= 0 ) {
			if( d.owner != null )
				d.owner.incrVar(Data.USERVARS.list.deaths, 1);
			continue;
		}*/

		//previous xp coef computation
		const lvlDiff = gameConfig.dinoz.maxLevel - d.level;
		let xpf = 1.2 + 0.8 * (lvlDiff / gameConfig.dinoz.maxLevel);
		if (xpf < 1.0) xpf = 1.0;

		//new one, applied if better
		if (gameConfig.dinoz.maxLevel / gameConfig.dinoz.initialMaxLevel > xpf)
			xpf = gameConfig.dinoz.maxLevel / gameConfig.dinoz.initialMaxLevel;

		xp = calculateXPBonus(d, Math.round(xp * xpFactor * xpf));
		const max = getMaxXp(d);
		if (d.experience + xp > max) {
			xp = max - d.experience;
			if (xp < 0) xp = 0;
		}
		totalWinXP += xp;

		const attacker = fightResult.attackers.find(a => a.dinoz_id === d.id);
		if (!attacker) {
			throw new ErrorFormator(500, `Attacker ${d.id} doesn't exist.`);
		}

		await updateDinoz(d.id, {
			life: {
				decrement: attacker.hp_lost
			},
			experience: {
				increment: fightResult.winner ? xp : 0
			}
		});

		// Log death if dinoz is dead
		if (attacker.hp_lost >= d.life) {
			await createLog(LogType.Death, playerId, d.id);
		}
	}

	const fprob = getRandomNumber(0, 100);
	let goldMultiplier = 1;
	if (fprob < 1) goldMultiplier = 10;
	else if (fprob < 11) goldMultiplier = 3;

	let gold = (getRandomNumber(0, 10) + 20) * 10;

	gold += Math.round(gold * goldMultiplier * fgold * goldFactor);
	// If attackers won
	if (fightResult.winner) {
		if (gold > 10000) {
			const monsterlist = monsters.map(m => m.name).toString();
			sendDiscord(`Player ${playerId} has been rewarded ${gold} gold when fighting ${monsterlist}.`);
		}
		await addMoney(playerId, gold);
	}

	await createLog(
		LogType.Fight,
		playerId,
		undefined,
		fightResult.winner ? gold : 0,
		fightResult.winner ? totalWinXP : 0,
		fightResult.attackers.reduce((partialSum, a) => partialSum + a.hp_lost, 0)
	);

	return {
		opponent: monsters.map(m => {
			return m.name;
		}),
		goldEarned: fightResult.winner ? gold : 0,
		xpEarned: fightResult.winner ? totalWinXP : 0,
		totalHpLost: fightResult.attackers.reduce((partialSum, a) => partialSum + a.hp_lost, 0),
		result: fightResult.winner,
		history: fightResult.history,
		hpLost: fightResult.attackers.map(a => ({
			id: a.dinoz_id,
			hpLost: a.hp_lost
		})),
		itemsUsed: fightResult.attackers.map(a => ({
			id: a.dinoz_id,
			itemsUsed: a.items_used
		}))
	};
}

/*export function getFightResult(dinozData: Dinoz, monster: MonsterFiche, fightResult: FightProcessResult): FightResult {
  //TODO use Array<MonsterFiche> input rather than MonsterFiche
	const maxExp = levelList.find(level => level.id === dinozData.level)!.experience;
	const experienceGained = monster.xp + dinozData.experience > maxExp ? maxExp - dinozData.experience : monster.xp;
	return {
		opponent: monster.name,
		goldEarned: fightResult.winner ? monster.gold : 0,
		xpEarned: fightResult.winner ? experienceGained : 0,
		hpLost: fightResult.attackers[0].hp_lost,
		result: fightResult.winner,
		dinozId: dinozData.id,
		history: fightResult.history
	};
}*/

function monsterLevelProba(level: number, p: number, monsterLvl: number) {
	let delta = level - monsterLvl;
	if (delta < 0) {
		if (delta < -3) return 0;
		delta = -delta * 3;
	}
	delta = Math.pow(delta, 1.5);
	return Math.round((p * 1000) / (3 + delta));
}

function generateMonster(fighters: Pick<Dinoz, 'level' | 'placeId'>[]) {
	const pow = 1;
	let teamLevel = 0;
	let maxLevel = 0;
	for (const fighter of fighters) {
		teamLevel += fighter.level;
		if (fighter.level > maxLevel) maxLevel = fighter.level;
	}

	const count = fighters.length;
	const dif = (count + 2) / (count * 2 + 1);
	teamLevel = Math.round(teamLevel * dif);
	teamLevel += (pow - 1) * 3;
	teamLevel += (pow - 1) * 0.3 * teamLevel;
	let mdelta = teamLevel / 4;
	if (mdelta < 2) mdelta = 2;

	const specialProb = getRandomNumber(0, 100);
	const place = actualPlace(fighters[0]);
	const monsters = Object.values(monsterList)
		.filter(m => m.zone === place.map || m.zone === MapZone.ALL)
		.map(m => {
			if (m.special) {
				const display = m.odds >= specialProb;
				return {
					monster: m,
					p: monsterLevelProba(maxLevel, display ? 100 : 0, m.level)
				};
			} else {
				return {
					monster: m,
					p: monsterLevelProba(maxLevel, m.odds, m.level)
				};
			}
		})
		.filter(m => m.p > 0);

	let monsterLevel = 0;
	const monsterArray: MonsterFiche[] = [];
	let total = 0;
	for (const monsterArrayElement of monsters) {
		if (monsterArrayElement.p === null) {
			monsterLevel += monsterArrayElement.monster.level;
			monsterArray.push(monsterArrayElement.monster);
			monsters.shift();
		} else {
			total += monsterArrayElement.p;
		}
	}

	if (monsterArray.length === 0 && total === 0) {
		for (const monsterArrayElement of monsters) {
			monsterArrayElement.p = 100;
		}
	}

	while (monsterLevel < teamLevel) {
		const randomIndex = getRandomNumber(0, monsters.length);
		const m = monsters[randomIndex].monster;
		let count = 0;
		if (!m.groups) {
			count = 1;
		} else {
			const rndGroup = getRandomNumber(0, m.groups.length);
			count += 1 + m.groups[rndGroup];
		}
		for (let i = 0; i < count; i++) {
			monsterLevel += m.level;
			monsterArray.push(m);
			if (m.groups && count > 1 && monsterLevel >= teamLevel && m.groups[i] != 0) {
				break;
			}
		}
		if (m.special) {
			// TODO: Rework this part to avoid using delete
			// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
			delete monsters[randomIndex];
		}
		monsterLevel += mdelta;
	}

	return monsterArray;
}
