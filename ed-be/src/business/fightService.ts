import pkg from 'native-dinorpg';
import { Request } from 'express';
import { levelList, monsterList, placeList } from '../constants/index.js';
import { Dinoz } from '../entity/index.js';
import { getRandomNumber } from '../utils/index.js';
import { addExperience, addLife, getDinozFightDataRequest } from '../dao/dinozDao.js';
import { addPlayerMoney } from '../dao/playerDao.js';
import { ErrorFormator } from '../utils/errorFormator.js';
import { checkMissionFight } from './missionsService.js';
import _ from 'lodash';
import { FightProcessResult, FightResult } from '@drpg/core/models/fight/FightResult';
import { Place } from '@drpg/core/models/place/Place';
import { MonsterFiche } from '@drpg/core/models/fight/MonsterFiche';
import { MapZone } from '@drpg/core/models/enums/MapZone';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { FighterFiche } from '@drpg/core/models/fight/FighterFiche';
import { FightConfiguration } from '@drpg/core/models/fight/FightConfiguration';

const { fight_rust } = pkg;

/**
 * @summary Process a fight
 * @param req
 * @return FightResult
 */
export async function processFight(req: Request): Promise<FightResult> {
	const dinozId: number = parseInt(req.body.dinozId);
	// Get Dinoz info
	const dinozData: Dinoz = await getDinozFightDataRequest(dinozId);

	if (dinozData.player.id !== req.user!.playerId) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} doesn't belong to player ${req.user!.playerId}`);
	}

	const localisation: Place = Object.values(placeList).find(place => place.placeId === dinozData.placeId)!;
	const monster: MonsterFiche = prepareFight(dinozData.level, localisation.map, localisation.placeId);

	const fightResult: FightProcessResult = calculateFight(dinozData, monster);

	await rewardFight(dinozData, monster, fightResult);

	const result: FightResult = getFightResult(dinozData, monster, fightResult);

	//If the dinoz is on a mission, check if the fight result progress the mission
	if (dinozData.missions.some(mission => !mission.isFinished)) {
		await checkMissionFight(dinozData, result);
	}

	// if (getEnvironnement() === 'development') console.log(`Result sent to front: ${JSON.stringify(result)}`);

	return result;
}

export async function moveFight(dinoz: Dinoz, placeId: number): Promise<FightResult> {
	const localisation: Place = Object.values(placeList).find(place => place.placeId === dinoz.placeId)!;
	const monster: MonsterFiche = prepareFight(dinoz.level, localisation.map, localisation.placeId);
	const fightResult: FightProcessResult = calculateFight(dinoz, monster);
	await rewardFight(dinoz, monster, fightResult);

	const result = getFightResult(dinoz, monster, fightResult);
	//If the dinoz is on a mission, check if the fight result progress the mission
	if (dinoz.missions.some(mission => !mission.isFinished)) {
		const dinozAtFuturePlace = _.cloneDeep(dinoz);
		dinozAtFuturePlace.placeId = placeId;
		await checkMissionFight(dinozAtFuturePlace, result);
	}
	return result;
}

function prepareFight(dinozlevel: number, zone: MapZone, place: PlaceEnum): MonsterFiche {
	// Pick random monster
	// Get totalOdds, roll a random number between 0 and the totalOdds
	// Pick the monster based on the roll and a sliding window on the intermediate odds
	const monsterArray = Object.values(monsterList)
		.filter(monster => monster.level <= dinozlevel)
		.filter(monster => monster.zone === zone || monster.zone === MapZone.ALL)
		.filter(monster => monster.place === place || monster.place === undefined)
		.sort((monsterA, monsterB) => monsterB.odds - monsterA.odds);
	const totalOdds: number = monsterArray.reduce((previous, current) => previous + current.odds, 0);

	const roll: number = getRandomNumber(0, totalOdds);
	let previousOdds: number = 0;
	return (
		monsterArray.find(monster => {
			if (roll >= previousOdds && roll < previousOdds + monster.odds) {
				return monster;
			}
			previousOdds += monster.odds;
		}) ?? monsterArray[0]
	);
}

function calculateFight(dinozData: Dinoz, monster: MonsterFiche): FightProcessResult {
	const listDinozItems: Array<number> = dinozData.items ? dinozData.items.map(item => item.itemId) : [];
	const listDinozSkills: Array<number> = dinozData.skills ? dinozData.skills.map(skill => skill.skillId) : [];
	const listDinozStatus: Array<number> = dinozData.status ? dinozData.status.map(status => status.statusId) : [];

	const attacker: FighterFiche = {
		dinoz_id: dinozData.id,
		start_life: dinozData.life,
		base_elements: [
			dinozData.nbrUpFire,
			dinozData.nbrUpWood,
			dinozData.nbrUpWater,
			dinozData.nbrUpLightning,
			dinozData.nbrUpAir
		],
		items: listDinozItems,
		skills: listDinozSkills,
		status: listDinozStatus
	};

	const defender: FighterFiche = {
		dinoz_id: 0, // TODO have to find a way to define monster's id without conflicting with a dinoz id
		start_life: monster.hp,
		base_elements: [monster.attack, monster.attack, monster.attack, monster.attack, monster.attack],
		items: [],
		skills: [],
		status: []
	};

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
		defenders: [defender]
	};

	// if (getEnvironnement() === 'development') console.log(`Configuration: ${JSON.stringify(fightConfiguration)}`);

	return JSON.parse(fight_rust(JSON.stringify(fightConfiguration)));
}

async function rewardFight(dinozData: Dinoz, monster: MonsterFiche, fightResult: FightProcessResult): Promise<void> {
	// Cap experience gained to the max of what the dinoz needs
	const maxExp = levelList.find(level => level.id === dinozData.level)!.experience;
	const experienceGained = monster.xp + dinozData.experience > maxExp ? maxExp - dinozData.experience : monster.xp;
	// If attackers won
	if (fightResult.winner) {
		await addExperience(dinozData.id, experienceGained);
		await addPlayerMoney(dinozData.player.id, monster.gold);
	}
	// No need to modify the dinoz's life in db if none was lost
	if (fightResult.attackers[0].hp_lost != 0) {
		await addLife(dinozData.id, -fightResult.attackers[0].hp_lost);
	}
}

function getFightResult(dinozData: Dinoz, monster: MonsterFiche, fightResult: FightProcessResult): FightResult {
	const maxExp = levelList.find(level => level.id === dinozData.level)!.experience;
	const experienceGained = monster.xp + dinozData.experience > maxExp ? maxExp - dinozData.experience : monster.xp;
	return {
		opponent: monster.name,
		goldEarned: fightResult.winner ? monster.gold : 0,
		xpEarned: fightResult.winner ? experienceGained : 0,
		hpLost: fightResult.attackers[0].hp_lost,
		result: fightResult.winner,
		dinozId: dinozData.id
	};
}
