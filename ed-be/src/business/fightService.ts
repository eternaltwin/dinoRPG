import pkg from 'native-dinorpg';
import { Request } from 'express';
import { levelList, monsterList } from '../constants/index.js';
import { Dinoz } from '../entity/index.js';
import { FightConfiguration, FighterFiche, FightProcessResult, FightResult, MonsterFiche } from '../models/index.js';
import { getRandomNumber } from '../utils/tools.js';
import { addExperience, addLife, getDinozFightDataRequest } from '../dao/dinozDao.js';
import { addPlayerMoney } from '../dao/playerDao.js';
import { ErrorFormator } from '../utils/errorFormator.js';
import { checkMissionFight } from './missionsService.js';
import _ from 'lodash';

const { fight_rust } = pkg;

/**
 * @summary Process a fight
 * @param req
 * @return FightResult
 */
const processFight = async (req: Request): Promise<FightResult> => {
	const dinozId: number = parseInt(req.body.dinozId);
	// Get Dinoz info
	const dinozData: Dinoz = await getDinozFightDataRequest(dinozId);

	if (dinozData.player.id !== req.user!.playerId) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} doesn't belong to player ${req.user!.playerId}`);
	}

	const monster: MonsterFiche = prepareFight(dinozData.level);

	const fightResult: FightProcessResult = calculateFight(dinozData, monster);

	await rewardFight(dinozData, monster, fightResult);

	const result: FightResult = getFightResult(dinozData, monster, fightResult);

	//If the dinoz is on a mission, check if the fight result progress the mission
	if (dinozData.missions.some(mission => !mission.isFinished)) {
		await checkMissionFight(dinozData, result);
	}

	// if (getEnvironnement() === 'development') console.log(`Result sent to front: ${JSON.stringify(result)}`);

	return result;
};

const moveFight = async (dinoz: Dinoz, placeId: number): Promise<FightResult> => {
	const monster: MonsterFiche = prepareFight(dinoz.level);
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
};

function prepareFight(dinozlevel: number): MonsterFiche {
	// Pick random monster
	// Get totalOdds, roll a random number between 0 and the totalOdds
	// Pick the monster based on the roll and a sliding window on the intermediate odds
	const totalOdds: number = Object.values(monsterList)
		.filter(monster => monster.level <= dinozlevel)
		.reduce((previous, current) => previous + current.odds, 0);
	const roll: number = getRandomNumber(0, totalOdds);
	const sortedMonstersByOddsHighestFirst: Array<MonsterFiche> = Object.values(monsterList)
		.filter(monster => monster.level <= dinozlevel)
		.sort((monsterA, monsterB) => monsterB.odds - monsterA.odds);
	let previousOdds: number = 0;
	return (
		sortedMonstersByOddsHighestFirst.find(monster => {
			if (roll >= previousOdds && roll < previousOdds + monster.odds) {
				return monster;
			}
			previousOdds += monster.odds;
		}) ?? sortedMonstersByOddsHighestFirst[0]
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
			dinozData.nbrUpAir,
			dinozData.nbrUpFire,
			dinozData.nbrUpLightning,
			dinozData.nbrUpWater,
			dinozData.nbrUpWood
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

export { processFight, moveFight };
