import pkg from 'native-dinorpg';
import { Request } from 'express';
import { levelList, monsterList, placeList, statusList } from '../constants/index.js';
import { Dinoz } from '../entity/index.js';
import { getRandomNumber } from '../utils/index.js';
import { addExperience, addLife, getDinozFightDataRequest } from '../dao/dinozDao.js';
import { addPlayerMoney } from '../dao/playerDao.js';
import { ErrorFormator } from '../utils/errorFormator.js';
import { checkMissionFight } from './missionsService.js';
import { FightProcessResult, FightResult } from '@drpg/core/models/fight/FightResult';
import { Place } from '@drpg/core/models/place/Place';
import { MonsterFiche } from '@drpg/core/models/fight/MonsterFiche';
import { FighterFiche } from '@drpg/core/models/fight/FighterFiche';
import { FightConfiguration } from '@drpg/core/models/fight/FightConfiguration';
import { MapZone } from '@drpg/core/models/enums/MapZone';

const { fight_rust } = pkg;

/**
 * @summary Process a fight
 * @param req
 * @return FightResult
 */
export async function processFight(req: Request): Promise<FightResult> {
	const dinozId: number = parseInt(req.body.dinozId);
	// Get Dinoz info
	const dinozData: Dinoz | null = await getDinozFightDataRequest(dinozId);

	if (!dinozData) {
		throw new ErrorFormator(500, `Player ${dinozId} doesn't exist.`);
	}

	if (dinozData.player.id !== req.auth!.playerId) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} doesn't belong to player ${req.auth!.playerId}`);
	}

	if (dinozData.concentration) {
		throw new ErrorFormator(400, 'concentration');
	}

	if (!dinozData.isAlive) {
		throw new ErrorFormator(400, 'dead');
	}

	const monster: Array<MonsterFiche> = generateMonster([dinozData]); //prepareFight(dinozData.level, localisation.map, localisation.placeId);

	const fightResult: FightProcessResult = calculateFight(dinozData, monster);

	const result: FightResult = await rewardFight(dinozData, monster, fightResult);

	// const result: FightResult = getFightResult(dinozData, monster[0], fightResult);

	//If the dinoz is on a mission, check if the fight result progress the mission
	if (dinozData.missions.some(mission => !mission.isFinished)) {
		await checkMissionFight(dinozData, result);
	}

	// if (getEnvironnement() === 'development') console.log(`Result sent to front: ${JSON.stringify(result)}`);

	return result;
}

export async function moveFight(dinoz: Dinoz, placeId: number): Promise<FightResult> {
	const monsters: Array<MonsterFiche> = generateMonster([dinoz]); //prepareFight(dinoz.level, localisation.map, localisation.placeId);
	const fightResult: FightProcessResult = calculateFight(dinoz, monsters);
	const result = await rewardFight(dinoz, monsters, fightResult);

	// const result = getFightResult(dinoz, monsters[0], fightResult);
	//If the dinoz is on a mission, check if the fight result progress the mission
	if (dinoz.missions.some(mission => !mission.isFinished)) {
		const dinozAtFuturePlace = structuredClone(dinoz);
		dinozAtFuturePlace.placeId = placeId;
		await checkMissionFight(dinozAtFuturePlace, result);
	}
	return result;
}

export function calculateFight(dinozData: Dinoz, monsters: Array<MonsterFiche>): FightProcessResult {
	const listDinozItems: Array<number> = dinozData.items ? dinozData.items.map(item => item.itemId) : [];
	const listDinozSkills: Array<number> = dinozData.skills ? dinozData.skills.map(skill => skill.skillId) : [];
	const listDinozStatus: Array<number> = dinozData.status ? dinozData.status.map(status => status.statusId) : [];

	const attacker: FighterFiche = new FighterFiche(
		dinozData.id,
		dinozData.level,
		false,
		dinozData.name,
		dinozData.life,
		[dinozData.nbrUpFire, dinozData.nbrUpWood, dinozData.nbrUpWater, dinozData.nbrUpLightning, dinozData.nbrUpAir],
		0,
		0,
		listDinozItems,
		listDinozSkills,
		listDinozStatus
	);

	const defender: Array<FighterFiche> = monsters.map(monster => {
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
		attackers: [attacker],
		defenders: defender
	};

	console.log(`Configuration: ${JSON.stringify(fightConfiguration)}`);

	return JSON.parse(fight_rust(JSON.stringify(fightConfiguration)));
}

export async function rewardFight(
	dinozData: Dinoz,
	monsters: Array<MonsterFiche>,
	fightResult: FightProcessResult
): Promise<FightResult> {
	const XP_NEWB_BONUS = [15, 10, 6.6, 4.3, 2.5];

	let teamLevel = 0;
	teamLevel += dinozData.level;

	let goldFactor = 1.0;

	//TODO use Array<MonsterFiche> input rather than MonsterFiche
	// Cap experience gained to the max of what the dinoz needs
	const maxExp = levelList.find(level => level.id === dinozData.level)!.experience;

	if (dinozData.status.some(status => status.statusId === statusList.CURSED)) {
		goldFactor = 0;
	}

	let xp = 0;
	let fgold = 0;
	for (const monster of monsters) {
		let factor = monster.level >= dinozData.level ? 1 : 4 / (4 + (dinozData.level - monster.level));
		const monsterGold = monster.gold ?? 1;
		fgold = monsterGold * factor * goldFactor;
		xp += Math.round(monster.xp ?? 10 * factor);
		//Newbie bonus
		if (dinozData.level <= 5) xp += XP_NEWB_BONUS[dinozData.level - 1];
		// bonus for fighters of same level of the monster
		if (Math.abs(dinozData.level - monster.level) <= 5) xp += monster.xpBonus ?? 0;
	}

	const experienceGained = xp + dinozData.experience > maxExp ? maxExp - dinozData.experience : Math.round(xp);

	let fprob = getRandomNumber(0, 100);
	let goldMultiplier = 1;
	if (fprob < 1) goldMultiplier = 10;
	else if (fprob < 11) goldMultiplier = 3;

	let gold = (getRandomNumber(0, 10) + 20) * 10;

	gold += Math.round(gold * goldMultiplier * fgold * goldFactor);
	// If attackers won
	if (fightResult.winner) {
		await addExperience(dinozData.id, experienceGained);
		await addPlayerMoney(dinozData.player.id, gold);
	}
	// No need to modify the dinoz's life in db if none was lost
	if (fightResult.attackers[0].hp_lost != 0) {
		await addLife(dinozData.id, -fightResult.attackers[0].hp_lost);
	}

	return {
		opponent: monsters.map(m => {
			return m.name;
		}),
		goldEarned: fightResult.winner ? gold : 0,
		xpEarned: fightResult.winner ? experienceGained : 0,
		hpLost: fightResult.attackers.reduce((partialSum, a) => partialSum + a.hp_lost, 0),
		result: fightResult.winner,
		dinozId: dinozData.id,
		history: fightResult.history
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

function monsterLevelProba(level: number, p: number, monsterLvl: number): number {
	let delta = level - monsterLvl;
	if (delta < 0) {
		if (delta < -3) return 0;
		delta = -delta * 3;
	}
	delta = Math.pow(delta, 1.5);
	return Math.round((p * 1000) / (3 + delta));
}

function generateMonster(fighters: Array<Dinoz>): Array<MonsterFiche> {
	const pow = 1;
	let teamLevel = 0;
	let maxLevel = 0;
	for (const fighter of fighters) {
		teamLevel += fighter.level;
		if (fighter.level > maxLevel) maxLevel = fighter.level;
	}

	let dif = (fighters.length + 2) / (fighters.length * 2 + 1);
	teamLevel = Math.round(teamLevel * dif);
	teamLevel += (pow - 1) * 3;
	teamLevel += (pow - 1) * 0.3 * teamLevel;
	let mdelta = teamLevel / 4;
	if (mdelta < 2) mdelta = 2;

	let specialProb = getRandomNumber(0, 100);
	const place = fighters[0].actualPlace;
	let monsters = Object.values(monsterList)
		.filter(m => m.zone === place.map || m.zone === MapZone.ALL)
		.map(m => {
			if (m.special) {
				let display = m.odds >= specialProb;
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
	let monsterArray: Array<MonsterFiche> = [];
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
		let randomIndex = getRandomNumber(0, monsters.length);
		let m = monsters[randomIndex].monster;
		let count = 0;
		if (!m.groups) {
			count = 1;
		} else {
			let rndGroup = getRandomNumber(0, m.groups.length);
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
			delete monsters[randomIndex];
		}
		monsterLevel += mdelta;
	}

	return monsterArray;
}
