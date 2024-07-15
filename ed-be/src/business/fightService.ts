import { DinozStatusId } from '@drpg/core/models/dinoz/StatusList';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { DinozToGetFighter, FightConfiguration } from '@drpg/core/models/fight/FightConfiguration';
import { FightProcessResult } from '@drpg/core/models/fight/FightResult';
import { MonsterFiche } from '@drpg/core/models/fight/MonsterFiche';
import { monsterList } from '@drpg/core/models/fight/MonsterList';
import { calculateXPBonus, getMaxXp, isAlive } from '@drpg/core/utils/DinozUtils';
import { Dinoz, DinozSkill, DinozStatus, LogType, Player } from '@drpg/prisma';
import { Request } from 'express';
import gameConfig from '../config/game.config.js';
import { getDinozFightDataRequest, updateDinoz } from '../dao/dinozDao.js';
import { addStatusToDinoz, removeStatusFromDinoz } from '../dao/dinozStatusDao.js';
import { createLog } from '../dao/logDao.js';
import { addMoney, removeMoney } from '../dao/playerDao.js';
import { sendDiscord } from '../utils/discord.js';
import { ErrorFormator } from '../utils/errorFormator.js';
import generateFight from '../utils/fight/generateFight.js';
import getFighters from '../utils/fight/getFighters.js';
import { getRandomNumber } from '../utils/index.js';
import { DinozToCheckMissionFight, checkMissionFight } from './missionsService.js';
import { currentEvents } from '@drpg/core/models/event/Events';
import { removeItemFromDinoz } from '../dao/dinozItemDao.js';
import randomBetween from '../utils/fight/randomBetween.js';
import { createCatch, removeCatch, updateCatch } from '../dao/dinozCatchDao.js';
import { placeList } from '@drpg/core/models/place/PlaceList';
import dayjs from 'dayjs';
import weightedRandom from '../utils/fight/weightedRandom.js';
import { getActualStep } from '@drpg/core/utils/MissionUtils';
import { ConditionEnum } from '@drpg/core/models/enums/Parser';
import { setSpecificStat } from '../dao/trackingDao.js';
import { StatTracking } from '@drpg/core/models/enums/statTracking';
import { mouvementListener } from './specialService.js';
import { bossList } from '@drpg/core/models/fight/BossList';

/**
 * @summary Process a fight
 * @param req
 * @return FightResult
 */
export async function processFight(req: Request) {
	// Date
	const currentDate = dayjs();
	const dayOfWeek = currentDate.day();

	const dinozId: number = +req.body.dinozId;
	if (!req.auth?.playerId) {
		throw new ErrorFormator(500, `Unauthorized`);
	}
	const playerId = +req.auth.playerId;
	// Get Dinoz info
	const player = await getDinozFightDataRequest(dinozId, playerId);
	if (!player) {
		throw new ErrorFormator(500, `Player ${playerId} doesn't exist.`);
	}
	const dinozData = player.dinoz.find(d => d.id === dinozId);
	if (!dinozData) {
		throw new ErrorFormator(500, `Player ${dinozId} doesn't exist.`);
	}

	// Marais Collant - No fights on Sunday and Wednesday
	if ((dayOfWeek === 0 || dayOfWeek === 3) && dinozData.placeId === PlaceEnum.MARAIS_COLLANT) {
		throw new ErrorFormator(400, `noFight`);
	}

	if (dinozData.canChangeName) {
		throw new ErrorFormator(500, `Dinoz has to be named.`);
	}

	if (dinozData.unavailableReason !== null) {
		throw new ErrorFormator(500, `Dinoz is not able to fight.`);
	}

	let team = player.dinoz;

	const unavailableFollowers = team.filter(d => d.life <= 0 || d.unavailableReason !== null);

	if (unavailableFollowers.length > 0) {
		for (const d of unavailableFollowers) {
			await updateDinoz(d.id, { leader: { disconnect: true } });
		}
		team = team.filter(d => d.life > 0 && d.unavailableReason === null);
	}

	if (dinozData.concentration) {
		throw new ErrorFormator(400, 'concentration');
	}

	if (team.some(d => !d.fight)) {
		throw new ErrorFormator(400, 'missingIrma');
	}

	if (!isAlive(dinozData)) {
		throw new ErrorFormator(400, 'dead');
	}

	let fight = await mouvementListener(player, team, dinozData.placeId, dinozId);
	if (!fight) {
		fight = await moveFight(team, dinozData.placeId, player);
	}

	//Consume fight action
	for (const dino of team) {
		await updateDinoz(dino.id, {
			fight: false
		});
	}

	// Update stats
	await setSpecificStat(StatTracking.KILL_M, player.id, fight.fighters.filter(f => f.type === 'monster').length);

	return fight;
}

export async function moveFight(
	team: (DinozToGetFighter & DinozToRewardFight & DinozToCheckMissionFight)[],
	placeId: PlaceEnum,
	player: Pick<Player, 'teacher' | 'id'>
) {
	const dayOfWeek = dayjs().day();
	let monsters = generateMonsterList(team, placeId); //prepareFight(dinoz.level, localisation.map, localisation.placeId);

	if ((dayOfWeek === 0 || dayOfWeek === 3) && placeId === PlaceEnum.MARAIS_COLLANT) {
		monsters = [];
	}
	const fightResult = calculateFight(team, placeId, monsters);
	// console.log(fightResult.steps[0])
	const result = await rewardFight(team, monsters, fightResult, placeId, player);

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

export function calculateFight(
	team: DinozToGetFighter[],
	place: PlaceEnum,
	monsters?: MonsterFiche[]
): FightProcessResult {
	const fighters = getFighters(
		{
			dinozList: team,
			monsterList: []
		},
		{
			dinozList: [],
			monsterList: monsters ?? []
		},
		place
	);

	const fightConfiguration: FightConfiguration = {
		// Flags
		is_energy_enabled: true,
		can_use_equipment: true,
		can_use_permanent_equipment_only: false,
		can_use_capture: true,
		can_delete_objects: true,
		is_balance_enabled: true,

		// Fighters
		initialDinozList: team,
		fighters,

		// Place
		place
	};

	return generateFight(fightConfiguration, place);
}

export type DinozToRewardFight = Parameters<typeof rewardFight>[0][number];
export async function rewardFight(
	team: (Pick<Dinoz, 'id' | 'level' | 'experience' | 'life' | 'placeId'> & {
		status: Pick<DinozStatus, 'statusId'>[];
		skills: Pick<DinozSkill, 'skillId'>[];
	})[],
	monsters: MonsterFiche[],
	fightResult: FightProcessResult,
	place: PlaceEnum,
	player: Pick<Player, 'id' | 'teacher'>
) {
	if (!team.length) {
		throw new ErrorFormator(500, 'No player found');
	}

	const playerId = player.id;

	const XP_NEWB_BONUS = [15, 10, 6.6, 4.3, 2.5];

	// let teamLevel = 0;
	// teamLevel += dinozData.level;

	const goldFactor = 1.0;
	const xpFactor = 1.0;
	let totalWinXP = 0;

	const teamLevel = team.reduce((acc, dinoz) => acc + dinoz.level, 0);

	let fgold = 0;
	let levelup = false;

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
		if (d.status.some(status => status.statusId === DinozStatusId.CURSED)) {
			gfact = 0.0;
		}

		for (const f of monsters) {
			const factor = f.level >= d.level ? 1 : 4 / (4 + (d.level - f.level));
			let monsterXp = Math.round((f.xp ?? 10) * factor * cur);
			fgold += (f.gold ?? 1.0) * factor * cur * gfact;
			// newbie bonus
			if (d.level <= 5) monsterXp += XP_NEWB_BONUS[d.level - 1] * cur;
			// bonus for fighters of same level of the monster
			if (Math.abs(f.level - d.level) <= 5 && f.xpBonus) monsterXp += f.xpBonus;
			xp += monsterXp;
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

		xp = calculateXPBonus(d, Math.round(xp * xpFactor * xpf), player);
		const max = getMaxXp(d);
		if (d.experience + xp > max) {
			levelup = true;
			xp = max - d.experience;
			if (xp < 0) xp = 0;
		}
		totalWinXP += xp;

		const attacker = fightResult.attackers.find(a => a.dinozId === d.id);
		if (!attacker) {
			throw new ErrorFormator(500, `Attacker ${d.id} doesn't exist.`);
		}

		await updateDinoz(d.id, {
			life: {
				decrement: attacker.hpLost
			},
			experience: {
				increment: fightResult.winner ? xp : 0
			}
		});

		// Log death if dinoz is dead
		if (attacker.hpLost >= d.life) {
			await createLog(LogType.Death, playerId, d.id);
		}

		// Add statuses
		for (const status of attacker.statusGained) {
			if (d.status.some(s => s.statusId === status)) continue;

			await addStatusToDinoz(d.id, status);
		}

		// Handle dinoz statuses
		for (const dinozStatus of d.status) {
			if (dinozStatus.statusId === DinozStatusId.FIRE_CHARM || dinozStatus.statusId === DinozStatusId.WATER_CHARM) {
				// 1/11 chance to remove charm
				if (randomBetween(0, 10) === 0) {
					await removeStatusFromDinoz(d.id, dinozStatus.statusId);
				}
			}
		}
	}

	const fprob = getRandomNumber(0, 100);
	let goldMultiplier = 1;
	if (fprob < 1) goldMultiplier = 10;
	else if (fprob < 11) goldMultiplier = 3;

	let gold = (getRandomNumber(0, 10) + 35) * 10;

	gold += Math.round(gold * goldMultiplier * fgold * goldFactor);

	const goldLost = fightResult.attackers.reduce((partialSum, a) => partialSum + a.goldLost, 0);
	gold -= goldLost;
	if (monsters.length === 0) {
		gold = 0;
	}

	// If attackers won
	if (fightResult.winner) {
		if (gold > 10000) {
			const monsterlist = monsters.map(m => m.name).toString();
			sendDiscord(`Player ${playerId} has been rewarded ${gold} gold when fighting ${monsterlist}.`);
		}
		await addMoney(playerId, gold);
	} else if (goldLost) {
		await removeMoney(playerId, goldLost);
	}

	// Items used
	for (const fighter of [...fightResult.attackers, ...fightResult.defenders]) {
		for (const itemUsed of fighter.itemsUsed) {
			await removeItemFromDinoz(fighter.dinozId, itemUsed);
		}
	}

	// Catches
	for (const dinozCatch of fightResult.catches) {
		if (!dinozCatch.id) {
			// New catch

			// Ignore dead catch
			if (dinozCatch.hp <= 0) continue;

			// Create catch
			await createCatch(dinozCatch.dinozId, dinozCatch.monsterId, dinozCatch.hp);
		} else {
			// Existing catch

			// Delete catch if dead
			if (dinozCatch.hp <= 0) {
				await removeCatch(dinozCatch.id);
				continue;
			}

			// Update catch
			await updateCatch(dinozCatch.id, dinozCatch.hp);
		}
	}

	await createLog(
		LogType.Fight,
		playerId,
		undefined,
		fightResult.winner ? gold : -goldLost,
		fightResult.winner ? totalWinXP : 0,
		fightResult.attackers.reduce((partialSum, a) => partialSum + a.hpLost, 0)
	);

	await createLog(LogType.XPEarned, playerId, undefined, fightResult.winner ? totalWinXP : 0);
	await createLog(
		LogType.HPLost,
		playerId,
		undefined,
		fightResult.attackers.reduce((partialSum, a) => partialSum + a.hpLost, 0)
	);

	const fighters = fightResult.fighters.map(f => {
		return {
			id: f.id,
			type: f.type,
			name: f.name,
			display: f.display,
			attacker: f.attacker,
			maxHp: f.maxHp,
			startingHp: f.startingHp,
			energy: f.energy,
			maxEnergy: f.maxEnergy,
			dark: f.type === 'boss' ? Object.values(bossList).find(b => b.name === f.name)?.dark ?? undefined : undefined,
			size: f.type === 'boss' ? Object.values(bossList).find(b => b.name === f.name)?.size ?? undefined : undefined
		};
	});
	return {
		fighters: fighters,
		goldEarned: fightResult.winner ? gold : -goldLost,
		xpEarned: fightResult.winner ? totalWinXP : 0,
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
		place: place
	};
}

export async function rewardFightCalculate(
	team: (Pick<Dinoz, 'id' | 'level' | 'experience' | 'life' | 'placeId'> & {
		status: Pick<DinozStatus, 'statusId'>[];
		skills: Pick<DinozSkill, 'skillId'>[];
	})[],
	monsters: MonsterFiche[],
	fightResult: FightProcessResult,
	player: Pick<Player, 'id' | 'teacher'>
) {
	if (!team.length) {
		throw new ErrorFormator(500, 'No player found');
	}

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
		if (d.status.some(status => status.statusId === DinozStatusId.CURSED)) {
			gfact = 0.0;
		}

		for (const f of monsters) {
			const factor = f.level >= d.level ? 1 : 4 / (4 + (d.level - f.level));
			let monsterXp = Math.round(f.xp ?? 10 * factor * cur);
			fgold += (f.gold ?? 1.0) * factor * cur * gfact;
			// newbie bonus
			if (d.level <= 5) monsterXp += XP_NEWB_BONUS[d.level - 1] * cur;
			// bonus for fighters of same level of the monster
			if (Math.abs(f.level - d.level) <= 5 && f.xpBonus) monsterXp += f.xpBonus;
			console.log(`Monster ${f.name} gave ${monsterXp}`);
			xp += monsterXp;
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

		xp = calculateXPBonus(d, Math.round(xp * xpFactor * xpf), player);
		const max = getMaxXp(d);
		if (d.experience + xp > max) {
			xp = max - d.experience;
			if (xp < 0) xp = 0;
		}
		totalWinXP += xp;
	}

	const fprob = getRandomNumber(0, 100);
	let goldMultiplier = 1;
	if (fprob < 1) goldMultiplier = 10;
	else if (fprob < 11) goldMultiplier = 3;

	let gold = (getRandomNumber(0, 10) + 20) * 10;

	gold += Math.round(gold * goldMultiplier * fgold * goldFactor);

	const goldLost = fightResult.attackers.reduce((partialSum, a) => partialSum + a.goldLost, 0);
	gold -= goldLost;

	return {
		opponent: monsters.map(m => {
			return m.name;
		}),
		goldEarned: fightResult.winner ? gold : -goldLost,
		xpEarned: fightResult.winner ? totalWinXP : 0,
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

/**
 * Calculate the probability of a monster to appear
 * @param dinozLevel Level of the dinoz
 * @param p Probability of the monster to appear
 * @param monsterLvl Level of the monster
 * @returns The probability of the monster to appear
 */
function monsterLevelProba(dinozLevel: number, p: number, monsterLvl: number): number {
	let delta = dinozLevel - monsterLvl;
	// If monster level is higher than dinoz level
	if (delta < 0) {
		// If monster is too high level p = 0
		if (delta < -3) return 0;
		delta = -delta * 3;
	}
	delta = Math.pow(delta, 1.5);
	return Math.round((p * 1000) / (3 + delta));
}

/**
 * @summary Return a list of monsters to fight
 * @param team List of dinoz
 * @param placeOfFight Place of the fight
 * @returns List of monsters to fight
 */
export function generateMonsterList(
	team: (Pick<Dinoz, 'level' | 'placeId'> & DinozToCheckMissionFight)[],
	placeOfFight: PlaceEnum
): MonsterFiche[] {
	let teamPowerLevel = 0;
	let greatestFighterLevel = 0;
	for (const dinoz of team) {
		teamPowerLevel += dinoz.level;
		if (dinoz.level > greatestFighterLevel) greatestFighterLevel = dinoz.level;
	}
	const diff = (team.length + 2) / (team.length * 2 + 1);
	teamPowerLevel = Math.round(teamPowerLevel * diff);

	const specialProb = getRandomNumber(0, 100);
	const place = Object.values(placeList).find(place => place.placeId === placeOfFight);
	if (!place) {
		throw new ErrorFormator(500, `This place doesn't exist.`);
	}
	const events = currentEvents();
	const monsters = Object.values(monsterList)
		// Filter the possible monsters to fight
		.filter(m => {
			// Filter monsters by place if defined
			if (m.places && !m.places.includes(place.placeId)) return false;
			// Filter event monsters
			if (m.events && m.events.length > 0) {
				if (events.length === 0) return false;
				if (!m.events.some(event => events.includes(event))) return false;
			}
			// Filter monsters by zones
			return m.zones.includes(place.map);
		})
		// Calculate the probability of each monster to appear
		.map(m => {
			// 1 - If monster is a mission target, boost its probability
			for (const dinoz of team) {
				const actualStep = getActualStep(dinoz);
				if (
					actualStep &&
					actualStep.requirement.actionType === ConditionEnum.KILL &&
					actualStep.requirement.target.includes(m.name)
				) {
					return {
						monster: m,
						p: monsterLevelProba(greatestFighterLevel, m.odds * 10, m.level)
					};
				}
			}
			// 2 - If monster is special, check if it appears
			if (m.special) {
				const display = m.odds >= specialProb;
				return {
					monster: m,
					p: monsterLevelProba(greatestFighterLevel, display ? 100 : 0, m.level)
				};
				// 3 - Default case
			} else {
				return {
					monster: m,
					p: monsterLevelProba(greatestFighterLevel, m.odds, m.level)
				};
			}
		})
		// Keep only monsters with a probability greater than 0
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

	const mdelta = Math.max(Math.round(teamPowerLevel / 4), 2);
	while (monsterLevel < teamPowerLevel) {
		const ml = monsters.map(a => {
			return { monster: a.monster, odds: a.p };
		});
		const total = ml.reduce((acc, item) => acc + item.odds, 0);
		const m = weightedRandom(ml, total).monster;
		let count = 1;
		if (m.groups) {
			const totalGroup = m.groups.reduce((acc, item) => acc + item.odds, 0);
			const weightedGroup = weightedRandom(m.groups, totalGroup).quantity;
			count += weightedGroup;
		}
		for (let i = 0; i < count; i++) {
			monsterLevel += m.level;
			monsterArray.push(m);
			if (m.groups && count > 1 && monsterLevel >= teamPowerLevel) {
				break;
			}
		}
		if (m.special) {
			// TODO: Rework this part to avoid using delete
			// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
			// delete monsters[randomIndex];
			break;
		}
		monsterLevel += mdelta;
	}


	return monsterArray;
}
