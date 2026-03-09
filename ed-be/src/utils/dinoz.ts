import { Dinoz, DinozSkill, DinozSkillUnlockable, DinozStatus, Prisma } from '@drpg/prisma';
import { Skill, skillList } from '@drpg/core/models/dinoz/SkillList';
import { DinozRace, UpChance } from '@drpg/core/models/dinoz/DinozRace';
import { GatherData } from '@drpg/core/models/gather/gatherData';
import { GatherType } from '@drpg/core/models/enums/GatherType';
import { ElementType } from '@drpg/core/models/enums/ElementType';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import seedrandom from 'seedrandom';
import { randomUUID } from 'crypto';
import translate from './translate.js';
import { SkillDetails } from '@drpg/core/models/dinoz/SkillDetails';
import { DinozStatusId } from '@drpg/core/models/dinoz/StatusList';
import { SkillTreeType } from '@drpg/core/models/enums/SkillTreeType';
import { SkillType } from '@drpg/core/models/enums/SkillType';
import { raceList } from '@drpg/core/models/dinoz/RaceList';
import { GLOBAL } from '../context.js';
import { updateDinoz } from '../dao/dinozDao.js';

export const getTreeType = (status: Pick<DinozStatus, 'statusId'>[]) => {
	return status.some(status => status.statusId === DinozStatusId.ETHER_DROP)
		? SkillTreeType.ETHER
		: SkillTreeType.VANILLA;
};

/**
 * Return all skills that a dinoz can learn (every elements).
 * If the param "elementWanted" is present, return learnable skills from one specific element.
 */
export const getLearnableSkills = (
	dinoz: Pick<Dinoz, 'raceId'> & {
		status: Pick<DinozStatus, 'statusId'>[];
		skills: Pick<DinozSkill, 'skillId'>[];
		unlockableSkills: Pick<DinozSkillUnlockable, 'skillId'>[];
	},
	elementWanted?: ElementType
) => {
	const treeType = getTreeType(dinoz.status);
	let learnableSkills = structuredClone(Object.values(skillList));

	// Keep all skills which have same type (fire, wood...)
	if (elementWanted !== undefined) {
		learnableSkills = learnableSkills.filter(skill => skill.element.some(element => element === elementWanted));
	}

	// First filter : Keep all skills from same tree (Vanilla or Ether)
	// Second filter : Keep all skills that are learnable or already learned
	// Third filter : Remove all skills that dinoz already knows
	// Fourth filter : Remove all unlockables skills
	// Fifth filter : Remove all spherical skills (not learnable here)
	// Sixth filtre : Remove race skills (ex : fly from Pteroz)
	return learnableSkills
		.filter(skill => skill.tree === treeType)
		.filter(skill =>
			skill.unlockedFrom?.every(skillId => dinoz.skills.some(dinozSkill => dinozSkill.skillId === skillId))
		)
		.filter(skill => !dinoz.skills.some(dinozSkill => dinozSkill.skillId === skill.id))
		.filter(skill => !dinoz.unlockableSkills.some(dinozSkill => dinozSkill.skillId === skill.id))
		.filter(skill => !skill.isSphereSkill)
		.filter(skill => !skill.raceId || skill.raceId.includes(dinoz.raceId))
		.map(skill => {
			return {
				skillId: skill.id,
				type: skill.type,
				element: skill.element
			};
		});
};

/**
 * Return all skills that a dinoz can unlock (every elements).
 * If the param "elementWanted" is present, return unlockable skills from one specific element.
 */
export const getUnlockableSkills = (
	dinoz: {
		status: Pick<DinozStatus, 'statusId'>[];
		unlockableSkills: Pick<DinozSkillUnlockable, 'skillId'>[];
	},
	elementWanted?: ElementType
) => {
	const treeType = getTreeType(dinoz.status);
	let unlockableSkills = dinoz.unlockableSkills.map(skill => {
		const foundSkill = Object.values(skillList).find(skills => skills.id === skill.skillId);

		if (!foundSkill) {
			throw new ExpectedError(`Skill ${skill} doesn't exist.`);
		}
		return foundSkill;
	});

	if (elementWanted !== undefined) {
		unlockableSkills = unlockableSkills.filter(skill => skill.element.some(element => element === elementWanted));
	}

	return unlockableSkills
		.filter(skill => skill.tree === treeType)
		.map(skill => {
			return {
				skillId: skill.id,
				element: skill.element
			};
		});
};

/**
 * Get up chance for one element
 * If the dinoz can't learn more skill from that element, return 0 -> Element can't be selected at next level.
 */
export const getElementUpChance = (
	learnableSkillsAllElements: Partial<SkillDetails>[],
	unlockableSkillsAllElements: Partial<SkillDetails>[],
	element: ElementType,
	elementValue: number
) => {
	return learnableSkillsAllElements.some(skill => skill.element?.includes(element)) ||
		unlockableSkillsAllElements.some(skill => skill.element?.includes(element))
		? elementValue
		: 0;
};

export const getDinozUpChance = (
	learnableSkills: {
		skillId: Skill;
		type: SkillType;
		element: ElementType[];
	}[],
	unlockableSkills: {
		skillId: Skill;
		element: ElementType[];
	}[],
	dinozRace: DinozRace
) => {
	return {
		fire: getElementUpChance(learnableSkills, unlockableSkills, ElementType.FIRE, dinozRace.upChance.fire),
		wood: getElementUpChance(learnableSkills, unlockableSkills, ElementType.WOOD, dinozRace.upChance.wood),
		water: getElementUpChance(learnableSkills, unlockableSkills, ElementType.WATER, dinozRace.upChance.water),
		lightning: getElementUpChance(
			learnableSkills,
			unlockableSkills,
			ElementType.LIGHTNING,
			dinozRace.upChance.lightning
		),
		air: getElementUpChance(learnableSkills, unlockableSkills, ElementType.AIR, dinozRace.upChance.air)
	};
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
	seed = seed ?? randomUUID();
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
		nextUpElementId: getRandomUpElement(race.upChance, seed + GLOBAL.config.salt),
		nextUpAltElementId: getRandomUpElement(race.upChance, seed + GLOBAL.config.salt + 'pdc'),
		player: { connect: { id: playerId } },
		seed: seed
	};
};

export const reincarnateDinoz = (race: DinozRace, display: string, seed: string): Prisma.DinozUpdateInput => {
	const fullDisplay = [...display];
	fullDisplay[1] = '0';

	let fire = 0;
	let water = 0;
	let wood = 0;
	let lightning = 0;
	let air = 0;
	for (let i = 0; i < 5; i++) {
		const element = getRandomUpElement(race.upChance); // Seed is purposefully different so gained elements cannot be predicted
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
		nextUpElementId: getRandomUpElement(race.upChance, seed + GLOBAL.config.salt),
		nextUpAltElementId: getRandomUpElement(race.upChance, seed + GLOBAL.config.salt + 'pdc'),
		nbrUpFire: race.nbrFire + fire,
		nbrUpWood: race.nbrWood + wood,
		nbrUpWater: race.nbrWater + water,
		nbrUpLightning: race.nbrLightning + lightning,
		nbrUpAir: race.nbrAir + air,
		display: fullDisplay.toString().replaceAll(',', ''),
		maxLife: 100,
		placeId: PlaceEnum.DINOVILLE,
		life: 1,
		FBTournamentStep: 0
	};
};

export const useRice = async (
	dinoz: Pick<Dinoz, 'id' | 'level' | 'raceId'> & {
		status: Pick<DinozStatus, 'statusId'>[];
		skills: Pick<DinozSkill, 'skillId'>[];
		unlockableSkills: Pick<DinozSkillUnlockable, 'skillId'>[];
	}
) => {
	const newDinozData: Prisma.DinozUpdateInput = {
		name: '?',
		experience: 0,
		canChangeName: true
	};

	if (dinoz.level === 1) {
		const dinozRace = Object.values(raceList).find(race => race.raceId === dinoz.raceId);

		if (!dinozRace) {
			throw new ExpectedError(`Dinoz race ${dinoz.raceId} doesn't exist.`);
		}

		const learnableSkills = getLearnableSkills(dinoz);
		const unlockableSkills = getUnlockableSkills(dinoz);
		const upChance = getDinozUpChance(learnableSkills, unlockableSkills, dinozRace);

		newDinozData.seed = randomUUID();
		newDinozData.nextUpElementId = getRandomUpElement(upChance, newDinozData.seed + GLOBAL.config.salt + dinoz.level);
		newDinozData.nextUpAltElementId = getRandomUpElement(
			upChance,
			newDinozData.seed + GLOBAL.config.salt + dinoz.level + 'pdc'
		);
	}
	await updateDinoz(dinoz.id, newDinozData);
};

export const learnNextSphereSkill = (
	dinoz: {
		skills: Pick<DinozSkill, 'skillId'>[];
	},
	element: ElementType
) => {
	const sphereSkills = Object.values(skillList)
		.filter(skill => skill.isSphereSkill)
		.filter(skill => skill.element.some(el => el === element));

	// Start with the first sphere skill, i.e the one that is unlocked from nothing
	let sphereSkillToLearn = sphereSkills.find(skill => skill.unlockedFrom && skill.unlockedFrom.length === 0);

	while (sphereSkillToLearn !== undefined) {
		if (!dinoz.skills.some(skill => skill.skillId === sphereSkillToLearn?.id)) {
			// SAFETY: sphereSkillToLearn is not undefined
			// If dinoz does not have the skill, then it is the next skill to learn
			break;
		} else {
			// Else the dinoz knows the skill already, so check the next skill that is unlocked from the current one
			sphereSkillToLearn = sphereSkills.find(
				skill => skill.unlockedFrom && skill.unlockedFrom.some(s => s === sphereSkillToLearn?.id)
			); // SAFETY: sphereSkillToLearn is not undefined
		}
	}

	if (!sphereSkillToLearn) {
		throw new ExpectedError(translate('knownSphereSkill'));
	}

	return sphereSkillToLearn?.id; // SAFETY: sphereSkillToLearn is not undefined
};
