import { DinozSkill, Prisma } from '@drpg/prisma';
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
			dinoz.skills.some(s => s.skillId === skillList[Skill.GRIFFES_METALLIQUES].id) ? click++ : click;
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
		nextUpElementId: getRandomUpElement(race.upChance, seed),
		nextUpAltElementId: getRandomUpElement(race.upChance, seed),
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
		nextUpElementId: getRandomUpElement(race.upChance, seed),
		nextUpAltElementId: getRandomUpElement(race.upChance, seed),
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
		throw new ExpectedError(translate('AlreadySphere'));
	}

	return sphereSkillToLearn?.id; // SAFETY: sphereSkillToLearn is not undefined
};
