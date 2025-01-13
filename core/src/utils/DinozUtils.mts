import {
	DinozItem,
	DinozMission,
	DinozSkill,
	DinozStatus,
	Player,
	PlayerItem,
	PlayerReward,
	PlayerQuest,
	type Dinoz,
	Prisma,
	Concentration
} from '@drpg/prisma';
import { DinozFiche, DinozPublicFiche } from '../models/dinoz/DinozFiche.mjs';
import { levelList } from '../models/dinoz/DinozLevel.mjs';
import { raceList } from '../models/dinoz/RaceList.mjs';
import { Skill, skillList } from '../models/dinoz/SkillList.mjs';
import { placeList } from '../models/place/PlaceList.mjs';
import { getHUDObjective } from './MissionUtils.mjs';
import { checkCondition } from './checkCondition.mjs';
import { PlayerForConditionCheck } from '../constants.mjs';
import { Condition } from '../models/npc/NpcConditions.mjs';
import { DinozRace, UpChance } from '../models/dinoz/DinozRace.mjs';
import { GatherData } from '../models/gather/gatherData.mjs';
import { GatherType } from '../models/enums/GatherType.mjs';
import { ElementType } from '../models/enums/ElementType.mjs';
import { DinozFicheLite } from '../models/dinoz/DinozFicheLite.mjs';
import { BaseStats, SpecialStat } from './getSpecialStat.mjs';
import { Stat } from '../models/enums/SkillStat.mjs';
import { SkillDetails } from '../models/dinoz/SkillDetails.mjs';
import { ExpectedError } from './ExpectedError.mjs';
import { PlaceEnum } from '../models/enums/PlaceEnum.mjs';
import { DinozStatusId } from '../models/dinoz/StatusList.mjs';
import { UnavailableReasonFront } from '../models/dinoz/UnavailableReasonFront.mjs';
import seedrandom from 'seedrandom';

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

export const getMaxXp = (
	dinoz: Pick<Dinoz, 'level'> & {
		status: Pick<DinozStatus, 'statusId'>[];
	}
) => {
	const level = levelList.find(level => level.id === dinoz.level);

	if (!level) {
		throw new Error(`Level ${dinoz.level} doesn't exist.`);
	}

	if (dinoz.status.some(s => s.statusId !== DinozStatusId.BROKEN_LIMIT_3) && dinoz.level === 70) return 0;
	if (dinoz.status.some(s => s.statusId !== DinozStatusId.BROKEN_LIMIT_2) && dinoz.level === 60) return 0;
	if (dinoz.status.some(s => s.statusId !== DinozStatusId.BROKEN_LIMIT_1) && dinoz.level === 50) return 0;

	return level.experience;
};

export const remainingXPToLevelUp = (
	dinoz: Pick<Dinoz, 'experience' | 'level'> & {
		status: Pick<DinozStatus, 'statusId'>[];
	}
) => {
	return getMaxXp(dinoz) - dinoz.experience;
};

export const isMaxLevel = (dinoz: Pick<Dinoz, 'level'>, config: Config) => dinoz.level >= config.dinoz.maxLevel;

export const canLevelUp = (
	dinoz: Pick<Dinoz, 'experience' | 'level'> & {
		status: Pick<DinozStatus, 'statusId'>[];
	},
	config: Config
) => {
	return remainingXPToLevelUp(dinoz) <= 0 && !isMaxLevel(dinoz, config);
};

export const getRace = (dinoz: Pick<Dinoz, 'raceId'>) => {
	const race = Object.values(raceList).find(race => race.raceId === dinoz.raceId);

	if (!race) {
		throw new Error(`Race ${dinoz.raceId} doesn't exist.`);
	}

	return race;
};

export const backpackSlot = (
	engineer: boolean,
	dinoz: Pick<Dinoz, 'id'> & {
		skills: Pick<DinozSkill, 'skillId'>[];
		status: Pick<DinozStatus, 'statusId'>[];
	}
) => {
	let total = 2;
	if (dinoz.skills.find(skill => skill.skillId === skillList[Skill.POCHE_VENTRALE].id)) total++;
	if (dinoz.skills.find(skill => skill.skillId === skillList[Skill.SURPLIS_DHADES].id)) total++;
	if (dinoz.status.find(status => status.statusId === DinozStatusId.BACKPACK)) total++;
	if (engineer) total++;

	// TODO: Check for other dinoz storekeeper here
	return total;
};

export type PlayerForDinozFiche = Parameters<typeof toDinozFiche>[0];
export const toDinozFiche = (
	player: Pick<Player, 'id' | 'engineer'> & {
		items: Pick<PlayerItem, 'itemId' | 'quantity'>[];
		rewards: Pick<PlayerReward, 'rewardId'>[];
		quests: Pick<PlayerQuest, 'questId' | 'progression'>[];
		dinoz: (Pick<
			Dinoz,
			| 'id'
			| 'name'
			| 'display'
			| 'unavailableReason'
			| 'level'
			| 'leaderId'
			| 'life'
			| 'maxLife'
			| 'experience'
			| 'raceId'
			| 'placeId'
			| 'nbrUpFire'
			| 'nbrUpWood'
			| 'nbrUpWater'
			| 'nbrUpLightning'
			| 'nbrUpAir'
			| 'order'
			| 'remaining'
			| 'fight'
			| 'gather'
		> & {
			missions: DinozMission[];
			items: Pick<DinozItem, 'itemId'>[];
			status: Pick<DinozStatus, 'statusId'>[];
			skills: Pick<DinozSkill, 'skillId'>[];
			followers: Pick<Dinoz, 'id' | 'fight'>[];
			concentration: Concentration | null;
		})[];
	},
	activeDinoz: number
): DinozFiche => {
	const playerForCondition = structuredClone(player);
	const dinoz = player.dinoz.find(d => d.id === activeDinoz);
	if (!dinoz) {
		throw new ExpectedError('Inexistant dinoz');
	}
	playerForCondition.dinoz = [dinoz];
	return {
		id: dinoz.id,
		name: dinoz.name,
		display: dinoz.display,
		unavailableReason: dinoz.unavailableReason,
		level: dinoz.level,
		missionId: dinoz.missions?.find(mission => !mission.isFinished)?.missionId ?? null,
		leaderId: dinoz.leaderId,
		followers: dinoz.followers,
		life: dinoz.life,
		maxLife: dinoz.maxLife,
		experience: dinoz.experience,
		maxExperience: getMaxXp(dinoz),
		race: getRace(dinoz),
		placeId: dinoz.placeId,
		items: dinoz.items?.map(item => item.itemId),
		maxItems: backpackSlot(player.engineer, dinoz),
		status: dinoz.status?.sort((a, b) => a.statusId - b.statusId),
		borderPlace:
			dinoz.unavailableReason !== null || !dinoz.fight || dinoz.leaderId
				? []
				: actualPlace(dinoz)
						.borderPlace.map(placeId => {
							const place = Object.values(placeList).find(place => place.placeId === placeId);
							if (!place) {
								throw new Error(`Place ${placeId} doesn't exist.`);
							}
							return place;
						})
						.filter(place => !place.conditions || checkCondition(place.conditions, playerForCondition, dinoz.id))
						.map(place => place.placeId),
		nbrUpFire: dinoz.nbrUpFire,
		nbrUpWood: dinoz.nbrUpWood,
		nbrUpWater: dinoz.nbrUpWater,
		nbrUpLightning: dinoz.nbrUpLightning,
		nbrUpAir: dinoz.nbrUpAir,
		missionHUD: getHUDObjective(dinoz),
		actions: [],
		skills: dinoz.skills,
		order: dinoz.order,
		remaining: dinoz.remaining,
		fight: dinoz.fight,
		gather: dinoz.gather,
		missions: dinoz.missions,
		concentration: dinoz.concentration
	};
};

export const toDinozFicheLite = (
	dinoz: Pick<
		Dinoz,
		| 'id'
		| 'name'
		| 'display'
		| 'leaderId'
		| 'life'
		| 'maxLife'
		| 'experience'
		| 'placeId'
		| 'order'
		| 'unavailableReason'
		| 'level'
	> & {
		status: Pick<DinozStatus, 'statusId'>[];
	}
): DinozFicheLite => {
	return {
		id: dinoz.id,
		name: dinoz.name,
		display: dinoz.display,
		leaderId: dinoz.leaderId,
		life: dinoz.life,
		maxLife: dinoz.maxLife,
		experience: dinoz.experience,
		maxExperience: getMaxXp(dinoz),
		placeId: dinoz.placeId,
		order: dinoz.order,
		unavailableReason: dinoz.unavailableReason
	};
};

export const toDinozPublicFiche = (
	dinoz: Pick<Dinoz, 'id' | 'name' | 'display' | 'unavailableReason' | 'level' | 'raceId' | 'life'> & {
		status: Pick<DinozStatus, 'statusId'>[];
	}
): DinozPublicFiche => {
	return {
		id: dinoz.id,
		name: dinoz.name,
		display: dinoz.display,
		isFrozen: dinoz.unavailableReason === UnavailableReasonFront.frozen,
		level: dinoz.level,
		life: dinoz.life,
		race: getRace(dinoz),
		status: dinoz.status?.map(status => status.statusId).sort((a, b) => a - b)
	};
};

export const toSkillDetails = (dinoz: { skills: Pick<DinozSkill, 'skillId' | 'state'>[] }): SkillDetails[] =>
	dinoz.skills.map(skill => {
		const skillFound = Object.values(skillList).find(skillDinoz => skillDinoz.id === skill.skillId);
		if (!skillFound) {
			throw new Error(`Skill ${skill.skillId} doesn't exist.`);
		}

		return {
			...skillFound,
			state: skill.state
		};
	});

export const canChangeSkillState = (dinoz: { status: Pick<DinozStatus, 'statusId'>[] }) => {
	return dinoz.status.some(status => status.statusId === DinozStatusId.STRATEGY_IN_130_LESSONS);
};

export const knowSkillId = (
	dinoz: {
		skills: Pick<DinozSkill, 'skillId'>[];
	},
	skillId: number
) => {
	return dinoz.skills.some(skill => skill.skillId === skillId);
};

export const canGoToThisPlace = (player: PlayerForConditionCheck, condition: Condition, activeDinoz: number) => {
	return checkCondition(condition, player, activeDinoz);
};

export const possessStatus = (
	dinoz: {
		status: Pick<DinozStatus, 'statusId'>[];
	},
	statusId: number
) => {
	return dinoz.status.some(status => status.statusId === statusId);
};

export const getRandomUpElement = (raceUpChance: UpChance, seed?: string) => {
	const totalUpChance = Object.values(raceUpChance).reduce((total, currentValue) => total + currentValue, 0);
	let randomNumber;
	if (seed) {
		const rng = seedrandom(seed);
		randomNumber = Math.ceil(rng() * totalUpChance);
	} else {
		randomNumber = Math.ceil(Math.random() * totalUpChance);
	}
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

export const initializeDinoz = (
	race: DinozRace,
	playerId: string,
	display: string,
	seed?: string
): Prisma.DinozCreateInput => {
	return {
		name: '?',
		unavailableReason: null,
		raceId: race.raceId,
		level: 1,
		placeId: PlaceEnum.DINOVILLE,
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
		nextUpElementId: getRandomUpElement(race.upChance, seed),
		nextUpAltElementId: getRandomUpElement(race.upChance, seed),
		player: { connect: { id: playerId } }
	};
};

export const reincarnateDinoz = (race: DinozRace, display: string, dinozId: number): Prisma.DinozUpdateInput => {
	const fullDisplay = [...display];
	fullDisplay[1] = '0';

	//TODO use upchance
	let fire = 0;
	let water = 0;
	let wood = 0;
	let lightning = 0;
	let air = 0;
	for (let i = 0; i < 5; i++) {
		const element = getRandomUpElement(race.upChance);
		switch (element) {
			case 1:
				fire++;
				break;
			case 2:
				wood++;
				break;
			case 3:
				water++;
				break;
			case 4:
				lightning++;
				break;
			case 5:
				air++;
				break;
			default:
				break;
		}
	}

	return {
		experience: 0,
		level: 1,
		nextUpElementId: getRandomUpElement(race.upChance),
		nextUpAltElementId: getRandomUpElement(race.upChance),
		nbrUpFire: race.nbrFire + fire,
		nbrUpWood: race.nbrWood + wood,
		nbrUpWater: race.nbrWater + water,
		nbrUpLightning: race.nbrLightning + lightning,
		nbrUpAir: race.nbrAir + air,
		display: fullDisplay.toString().replaceAll(',', ''),
		maxLife: 100,
		placeId: PlaceEnum.DINOVILLE,
		life: 1
	};
};

export const learnNextSphereSkill = (
	dinoz: {
		skills: Pick<DinozSkill, 'skillId'>[];
	},
	element: ElementType
) => {
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
		throw new ExpectedError('AlreadySphere');
	}

	return testSphereToLean.id;
};

export const useRice = (dinoz: Pick<Dinoz, 'id'>) => {
	return {
		id: dinoz.id,
		name: '?',
		experience: 0,
		canChangeName: true
	};
};

export const getMaxFollowers = (dinoz: Pick<DinozFiche, 'skills'>) => {
	let max = BaseStats[SpecialStat.MAX_FOLLOWERS];

	const skillsAffectingMaxFollowers = Object.values(skillList).filter(skill => skill.effects?.[Stat.MAX_FOLLOWERS]);

	for (const skill of skillsAffectingMaxFollowers) {
		if (dinoz.skills.some(s => s.skillId === skill.id)) {
			max += skill.effects?.[Stat.MAX_FOLLOWERS] || 0;
		}
	}

	return max;
};

export const getFollowableDinoz = <
	T extends Pick<DinozFiche, 'id' | 'placeId' | 'leaderId' | 'unavailableReason' | 'followers' | 'skills' | 'life'>
>(
	dinozList: T[],
	potentialFollower: Pick<DinozFiche, 'id' | 'placeId' | 'fight'>
) => {
	return dinozList.filter(dinoz => {
		// Filter out current dinoz
		if (dinoz.id === potentialFollower.id) {
			return false;
		}
		// Filter out unavaible Dinoz (selling, resting...)
		if (dinoz.unavailableReason !== null) {
			return false;
		}
		// Filter out Dinoz that already have a leader
		if (dinoz.leaderId) {
			return false;
		}
		// Filter out Dinoz that are not in the same place
		if (dinoz.placeId !== potentialFollower.placeId) {
			return false;
		}

		if (dinoz.life <= 0) {
			return false;
		}

		const maxFollowers = getMaxFollowers(dinoz);

		// Filter out Dinoz that have too many followers
		if (dinoz.followers.length >= maxFollowers) {
			return false;
		}

		return true;
	});
};

export const orderDinozList = <T extends Pick<DinozFiche, 'id' | 'order' | 'name' | 'leaderId' | 'followers'>[]>(
	dinozList: T
) => {
	const sortedByOrderAndName = [...dinozList].sort((a, b) => {
		if (a.order === null) {
			a.order = a.id;
		}
		if (b.order === null) {
			b.order = b.id;
		}
		if (a.order === b.order) {
			return a.name.localeCompare(b.name);
		}
		return a.order - b.order;
	});

	// Group by leader
	for (const leader of sortedByOrderAndName.filter(dinoz => dinoz.followers.length)) {
		// Find all dinoz that follow this leader
		const followers = sortedByOrderAndName.filter(dinoz => dinoz.leaderId === leader.id);

		// Remove them from the list
		for (const follower of followers) {
			sortedByOrderAndName.splice(
				sortedByOrderAndName.findIndex(dinoz => dinoz.id === follower.id),
				1
			);
		}

		// Add them after the leader
		sortedByOrderAndName.splice(sortedByOrderAndName.findIndex(dinoz => dinoz.id === leader.id) + 1, 0, ...followers);
	}

	return sortedByOrderAndName;
};

export const canWinXP = (
	dinoz: Pick<Dinoz, 'id' | 'experience' | 'level'> & {
		status: Pick<DinozStatus, 'statusId'>[];
	}
) => {
	if (dinoz.status.some(s => s.statusId === DinozStatusId.CURSED)) return false;
	if (dinoz.status.some(s => s.statusId === DinozStatusId.BROKEN_LIMIT_3)) return true;
	if (dinoz.status.some(s => s.statusId === DinozStatusId.BROKEN_LIMIT_2) && dinoz.level < 70) return true;
	if (dinoz.status.some(s => s.statusId === DinozStatusId.BROKEN_LIMIT_1) && dinoz.level < 60) return true;
	if (dinoz.level < 50) return true;
	else return false;
};

export const calculateXPBonus = (
	dinoz: Pick<Dinoz, 'id'> & {
		skills: Pick<DinozSkill, 'skillId'>[];
		status: Pick<DinozStatus, 'statusId'>[];
	},
	xp: number,
	player: Pick<Player, 'teacher'>
) => {
	let f = 1.0;
	if (dinoz.skills.some(s => s.skillId === Skill.INTELLIGENCE)) f *= 1.05;
	if (player.teacher) f *= 1.05;
	//TODO encyclopedie et maudit
	/*if( d.hasEquip(Data.OBJECTS.list.mencly) )
		f *= 1.15;
	if( d.hasEffect(Data.EFFECTS.list.maudit) )
		f = 0;*/
	return Math.round(xp * f);
};
