import { DinozItem, DinozMission, DinozSkill, DinozStatus, Player, PlayerItem, PlayerReward, type Dinoz, Prisma } from '@drpg/prisma';
import { DinozFiche } from '../models/dinoz/DinozFiche.mjs';
import { levelList } from '../models/dinoz/DinozLevel.mjs';
import { raceList } from '../models/dinoz/RaceList.mjs';
import { Skill, skillList } from '../models/dinoz/SkillList.mjs';
import { statusList } from '../models/dinoz/StatusList.mjs';
import { placeList } from '../models/place/PlaceList.mjs';
import { getHUDObjective } from './MissionUtils.mjs';
import { checkCondition } from './checkCondition.mjs';
import { DinozForConditionCheck } from '../constants.mjs';
import { Condition } from '../models/npc/NpcConditions.mjs';
import { DinozRace, UpChance } from '../models/dinoz/DinozRace.mjs';
import { GatherData } from '../models/gather/gatherData.mjs';
import { GatherType } from '../models/enums/GatherType.mjs';
import { ElementType } from '../models/enums/ElementType.mjs';
import { DinozFicheLite } from '../models/dinoz/DinozFicheLite.mjs';

type Config = {
	dinoz: {
		maxLevel: number;
	};
};

export const isAlive = (dinoz: Pick<Dinoz, 'life'>) => dinoz.life > 0;

export const actualPlace = (dinoz: Pick<Dinoz, 'placeId'>) => {
	const place = Object.values(placeList).find(place => place.placeId === dinoz.placeId);

	if (!place) {
		throw new Error(`Place ${dinoz.placeId} doesn't exist.`);
	}

	return place;
};

export const getMaxXp = (dinoz: Pick<Dinoz, 'level'>) => {
	const level = levelList.find(level => level.id === dinoz.level);

	if (!level) {
		throw new Error(`Level ${dinoz.level} doesn't exist.`);
	}

	return level.experience;
};

export const remainingXPToLevelUp = (dinoz: Pick<Dinoz, 'experience' | 'level'>) => {
	return getMaxXp(dinoz) - dinoz.experience;
};

export const isMaxLevel = (
	dinoz: Pick<Dinoz, 'level'>,
	config: Config
) => dinoz.level === config.dinoz.maxLevel;

export const canLevelUp = (dinoz: Pick<Dinoz, 'experience' | 'level'>, config: Config) => {
	return remainingXPToLevelUp(dinoz) <= 0 && !isMaxLevel(dinoz, config);
};

export const getRace = (dinoz: Pick<Dinoz, 'raceId'>) => {
	const race = Object.values(raceList).find(race => race.raceId === dinoz.raceId);

	if (!race) {
		throw new Error(`Race ${dinoz.raceId} doesn't exist.`);
	}

	return race;
};

export const backpackSlot = (dinoz: Pick<Dinoz, 'id'> & {
	skills: Pick<DinozSkill, 'skillId'>[];
	status: Pick<DinozStatus, 'statusId'>[];
	player: Pick<Player, 'engineer'> | null;
}) => {
	if (!dinoz.player) {
		throw new Error(`Dinoz ${dinoz.id} doesn't belong to a player.`);
	}

	let total = 2;
	if (dinoz.skills.find(skill => skill.skillId === skillList[Skill.POCHE_VENTRALE].id)) total++;
	if (dinoz.skills.find(skill => skill.skillId === skillList[Skill.SURPLIS_DHADES].id)) total++;
	if (dinoz.status.find(status => status.statusId === statusList.BACKPACK)) total++;
	if (dinoz.player.engineer) total++;

	// TODO: Check for other dinoz storekeeper here
	return total;
};

export type DinozForDinozFiche = Parameters<typeof toDinozFiche>[0];
export const toDinozFiche = (dinoz: Pick<Dinoz,
	'id' |
	'name' |
	'display' |
	'isFrozen' |
	'isSelling' |
	'level' |
	'following' |
	'life' |
	'maxLife' |
	'experience' |
	'raceId' |
	'placeId' |
	'nbrUpFire' |
	'nbrUpWood' |
	'nbrUpWater' |
	'nbrUpLightning' |
	'nbrUpAir' |
	'order'
> & {
	missions: DinozMission[];
	items: Pick<DinozItem, 'itemId'>[];
	status: Pick<DinozStatus, 'statusId'>[];
	skills: Pick<DinozSkill, 'skillId'>[];
	player: Pick<Player, 'engineer'> & {
		items: Pick<PlayerItem, 'itemId' | 'quantity'>[];
		rewards: Pick<PlayerReward, 'rewardId'>[];
	} | null;
}): DinozFiche => {
	return {
		id: dinoz.id,
		name: dinoz.name,
		display: dinoz.display,
		isFrozen: dinoz.isFrozen,
		isSelling: dinoz.isSelling,
		level: dinoz.level,
		missionId: dinoz.missions?.find(mission => !mission.isFinished)?.missionId,
		following: dinoz.following,
		life: dinoz.life,
		maxLife: dinoz.maxLife,
		experience: dinoz.experience,
		maxExperience: getMaxXp(dinoz),
		race: getRace(dinoz),
		placeId: dinoz.placeId,
		items: dinoz.items?.map(item => item.itemId),
		maxItems: backpackSlot(dinoz),
		status: dinoz.status?.map(status => status.statusId).sort((a, b) => a - b),
		borderPlace: actualPlace(dinoz).borderPlace
			.map(placeId => {
				const place = Object.values(placeList).find(place => place.placeId === placeId);
				if (!place) {
					throw new Error(`Place ${placeId} doesn't exist.`);
				}
				return place;
			})
			.filter(place => !place.conditions || checkCondition(place.conditions, dinoz))
			.map(place => place.placeId),
		nbrUpFire: dinoz.nbrUpFire,
		nbrUpWood: dinoz.nbrUpWood,
		nbrUpWater: dinoz.nbrUpWater,
		nbrUpLightning: dinoz.nbrUpLightning,
		nbrUpAir: dinoz.nbrUpAir,
		missionHUD: getHUDObjective(dinoz),
		actions: [],
		skills: dinoz.skills.map(skill => skill.skillId),
		order: dinoz.order,
	};
};

export const toDinozFicheLite = (
	dinoz: Pick<Dinoz,
		'id' |
		'name' |
		'display' |
		'following' |
		'life' |
		'maxLife' |
		'experience' |
		'placeId' |
		'order' |
		'isFrozen' |
		'level'
	>
): DinozFicheLite => {
	return {
		id: dinoz.id,
		name: dinoz.name,
		display: dinoz.display,
		following: dinoz.following,
		life: dinoz.life,
		maxLife: dinoz.maxLife,
		experience: dinoz.experience,
		maxExperience: getMaxXp(dinoz),
		placeId: dinoz.placeId,
		order: dinoz.order,
		isFrozen: dinoz.isFrozen
	};
}

export const toDinozSkillFiche = (dinoz: {
	skills: Pick<DinozSkill, 'skillId'>[];
}) => dinoz.skills.map(skill => {
	const skillFound = Object.values(skillList).find(skillDinoz => skillDinoz.id === skill.skillId);
	if (!skillFound) {
		throw new Error(`Skill ${skill.skillId} doesn't exist.`);
	}

	return skillFound;
});

export const canChangeSkillState = (dinoz: {
	status: Pick<DinozStatus, 'statusId'>[];
}) => {
	return dinoz.status.some(status => status.statusId === statusList.STRATEGY_IN_130_LESSONS);
}

export const knowSkillId = (dinoz: {
	skills: Pick<DinozSkill, 'skillId'>[];
}, skillId: number) => {
	return dinoz.skills.some(skill => skill.skillId === skillId);
}

export const canGoToThisPlace = (dinoz: DinozForConditionCheck, condition: Condition) => {
	return checkCondition(condition, dinoz);
};

export const possessStatus = (dinoz: {
	status: Pick<DinozStatus, 'statusId'>[];
}, statusId: number) => {
	return dinoz.status.some(status => status.statusId === statusId);
}

export const getRandomUpElement = (raceUpChance: UpChance) => {
	const totalUpChance = Object.values(raceUpChance).reduce((total, currentValue) => total + currentValue, 0);
	const randomNumber = Math.ceil(Math.random() * totalUpChance);
	let total = 0;

	for (const [index, elementValue] of Object.values(raceUpChance).entries()) {
		total += elementValue;
		if (randomNumber <= total) {
			return index + 1;
		}
	}

	throw new Error(`Random number ${randomNumber} is not in the range of the total up chance ${totalUpChance}.`);
};

export const getNumberOfGatheringTries = (
	dinoz: {
		skills: Pick<DinozSkill, 'skillId'>[];
	},
	gridData: GatherData
) => {
	let click = 0;
	switch (gridData.type) {
		case GatherType.FISH:
			dinoz.skills.some(s => s.skillId === skillList[Skill.NEMO].id) ? click++ : click;
			break;
		case GatherType.CUEILLE1:
		case GatherType.CUEILLE2:
		case GatherType.CUEILLE3:
		case GatherType.CUEILLE4:
			dinoz.skills.some(s => s.skillId === skillList[Skill.LONDUHAUT].id) ? click++ : click;
			break;
		case GatherType.ENERGY1:
		case GatherType.ENERGY2:
			dinoz.skills.some(s => s.skillId === skillList[Skill.EINSTEIN].id) ? click++ : click;
			break;
		case GatherType.HUNT:
			dinoz.skills.some(s => s.skillId === skillList[Skill.BENEDICTION_DARTEMIS].id) ? click++ : click;
			break;
		case GatherType.SEEK:
			dinoz.skills.some(s => s.skillId === skillList[Skill.EXPERT_EN_FOUILLE].id) ? click++ : click;
			dinoz.skills.some(s => s.skillId === skillList[Skill.PLANIFICATEUR].id) ? click++ : click;
			dinoz.skills.some(s => s.skillId === skillList[Skill.CHAMPOLLION].id) ? click++ : click;
			dinoz.skills.some(s => s.skillId === skillList[Skill.GRATTEUR].id) ? click++ : click;
			break;
		case GatherType.LABO:
		case GatherType.PARTY:
		case GatherType.XMAS:
		case GatherType.TICTAC:
		case GatherType.ANNIV:
			break;
	}
	return gridData.minimumClick + click;
};

export const resurrect = (dinoz: Pick<Dinoz, 'life' | 'id'>) => {
	if (dinoz.life > 0) {
		throw new Error('DinozNotDead');
	}
	dinoz.life = 1;
	return {
		id: dinoz.id,
		life: dinoz.life
	};
}

export const initializeDinoz = (race: DinozRace, playerId: number, display: string): Prisma.DinozCreateInput => {
	return {
		name: '?',
		isFrozen: false,
		isSacrificed: false,
		raceId: race.raceId,
		level: 1,
		placeId: placeList.DINOVILLE.placeId,
		display: display,
		life: 100,
		maxLife: 100,
		experience: 0,
		canChangeName: true,
		nbrUpFire: race.nbrFire,
		nbrUpWood: race.nbrWood,
		nbrUpWater: race.nbrWater,
		nbrUpLightning: race.nbrLightning,
		nbrUpAir: race.nbrAir,
		nextUpElementId: getRandomUpElement(race.upChance),
		nextUpAltElementId: getRandomUpElement(race.upChance),
		player: { connect: { id: playerId } },
	};
};

export const learnNextSphereSkill = (dinoz: {
	skills: Pick<DinozSkill, 'skillId'>[];
}, element: ElementType) => {
	const sphereSkills = Object.values(skillList)
		.filter(skill => skill.isSphereSkill)
		.filter(skill => skill.element.some(el => el === element))
		.sort((a, b) => a.id - b.id);
	//Search last sphere skills from this element learnt
	const lastKnownSphere = dinoz.skills
		.filter(skill => sphereSkills.some(s => skill.skillId === s.id))
		.map(skill => skill.skillId)
		.sort()
		.pop();

	if (!lastKnownSphere) {
		return sphereSkills[0].id;
	}

	const testSphereToLean = sphereSkills.find(skill => skill.unlockedFrom?.some(s => s === lastKnownSphere));
	if (!testSphereToLean) {
		throw new Error(`AlreadySphere`);
	}

	return testSphereToLean.id;
}

export const useRice = (dinoz: Pick<Dinoz, 'id'>) => {
	return {
		id: dinoz.id,
		name: '?',
		experience: 0,
		canChangeName: true
	};
}

export const heal = (dinoz: Pick<Dinoz, 'id' | 'life' | 'maxLife'>, lifeToAdd: number) => {
	const lifeHealed = dinoz.maxLife - dinoz.life > lifeToAdd ? lifeToAdd : dinoz.maxLife - dinoz.life;
	if (lifeHealed === 0) throw new Error('AlreadyAtMaxHealth');
	if (dinoz.life === 0) throw new Error('DinozIsDead');
	dinoz.life += lifeHealed;
	return {
		id: dinoz.id,
		life: dinoz.life
	};
}
