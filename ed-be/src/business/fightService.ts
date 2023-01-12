import pkg from 'native-dinorpg';
import { Request } from 'express';
import { levelList, monsterList } from '../constants/index.js';
import { Dinoz } from '../entity/index.js';
import { FightConfiguration, FighterFiche, FightProcessResult, FightResult, MonsterFiche } from '../models/index.js';
import { getRandomNumber } from '../utils/tools.js';
import { addExperience, addLife, getDinozFightDataRequest } from '../dao/dinozDao.js';
import { addPlayerMoney } from '../dao/playerDao.js';
import { getEnvironnement } from '../utils/context.js';

const { fight_rust } = pkg;

/**
 * @summary Process a fight
 * @param req
 * @return FightResult
 */
const processFight = async (req: Request): Promise<FightResult> => {
	const dinozId: number = parseInt(req.body.dinozId);

	// Pick random monster
	// Get totalOdds, roll a random number between 0 and the totalOdds
	// Pick the monster based on the roll and a sliding window on the intermediate odds
	const totalOdds: number = Object.values(monsterList).reduce((previous, current) => previous + current.odds, 0);
	const roll: number = getRandomNumber(0, totalOdds);
	const sortedMonstersByOddsHighestFirst: Array<MonsterFiche> = Object.values(monsterList).sort(
		(monsterA, monsterB) => monsterB.odds - monsterA.odds
	);
	let previousOdds: number = 0;
	const monster: MonsterFiche =
		sortedMonstersByOddsHighestFirst.find(monster => {
			if (roll >= previousOdds && roll < previousOdds + monster.odds) {
				return monster;
			}
			previousOdds += monster.odds;
		}) ?? sortedMonstersByOddsHighestFirst[0];

	// Get Dinoz info
	const dinozData: Dinoz = await getDinozFightDataRequest(dinozId);
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

	if (getEnvironnement() === 'development') console.log(`Configuration: ${JSON.stringify(fightConfiguration)}`);

	const fightResult: FightProcessResult = JSON.parse(fight_rust(JSON.stringify(fightConfiguration)));

	// Cap experience gained to the max of what the dinoz needs
	const maxExp = levelList.find(level => level.id === dinozData.level)!.experience;
	const experienceGained = monster.xp + dinozData.experience > maxExp ? maxExp - dinozData.experience : monster.xp;
	// If attackers won
	if (fightResult.winner) {
		await addExperience(dinozId, experienceGained);
		await addPlayerMoney(dinozData.player.id, monster.gold);
	}
	// No need to modify the dinoz's life in db if none was lost
	if (fightResult.attackers[0].hp_lost != 0) {
		await addLife(dinozId, -fightResult.attackers[0].hp_lost);
	}

	const result: FightResult = {
		opponent: monster.name,
		goldEarned: fightResult.winner ? monster.gold : 0,
		xpEarned: fightResult.winner ? experienceGained : 0,
		hpLost: fightResult.attackers[0].hp_lost,
		result: fightResult.winner,
		dinozId: dinozId
	};

	if (getEnvironnement() === 'development') console.log(`Result sent to front: ${JSON.stringify(result)}`);

	return result;
};

export { processFight };
