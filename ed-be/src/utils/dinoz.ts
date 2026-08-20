import { Dinoz, DinozSkill, DinozSkillUnlockable, DinozStatus, Player, Prisma, UnavailableReason } from '@drpg/prisma';
import { Skill, skillList } from '@drpg/core/models/dinoz/SkillList';
import { DinozRace, UpChance } from '@drpg/core/models/dinoz/DinozRace';
import { GatherData } from '@drpg/core/models/gather/gatherData';
import { GatherType } from '@drpg/core/models/enums/GatherType';
import { ElementType } from '@drpg/core/models/enums/ElementType';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { SkillDetails } from '@drpg/core/models/dinoz/SkillDetails';
import { DinozStatusId } from '@drpg/core/models/dinoz/StatusList';
import { SkillTreeType } from '@drpg/core/models/enums/SkillTreeType';
import { SkillType } from '@drpg/core/models/enums/SkillType';
import { GLOBAL } from '../context.js';
import { Auth } from '../dao/playerDao.js';
import translate from './server/translate.js';
import seedrandom from 'seedrandom';
import { randomUUID } from 'crypto';
import weightedRandom from './fight/weightedRandom.js';
import { fromBase62, getRandomLetter, shuffle } from './index.js';
import { raceList } from '@drpg/core/models/dinoz/RaceList';
import { RaceEnum } from '@drpg/core/models/enums/RaceEnum';
import { getActiveDinoz, getDinozPlaces } from '../dao/dinozDao.js';
import gameConfig from '../config/game.config.js';
import { applySkillToDinoz } from './skillParser.js';

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

	return (
		learnableSkills
			// First filter : Keep all skills from same tree (Vanilla or Ether)
			.filter(skill => skill.tree === treeType)
			// Second filter : Keep all skills that are learnable or already learned
			.filter(skill =>
				skill.unlockedFrom?.every(skillId => dinoz.skills.some(dinozSkill => dinozSkill.skillId === skillId))
			)
			// Third filter : Remove all skills that dinoz already knows
			.filter(skill => !dinoz.skills.some(dinozSkill => dinozSkill.skillId === skill.id))
			// Fourth filter : Remove all unlockables skills
			.filter(skill => !dinoz.unlockableSkills.some(dinozSkill => dinozSkill.skillId === skill.id))
			// Fifth filter : Remove all spherical skills (not learnable here)
			.filter(skill => !skill.isSphereSkill)
			// Sixth filtre : Remove race skills (ex : fly from Pteroz)
			.filter(skill => !skill.raceId || skill.raceId.includes(dinoz.raceId))
			.map(skill => {
				return {
					skillId: skill.id,
					type: skill.type,
					element: skill.element
				};
			})
	);
};

/**
 * @summary Return the unlockable skills for a given Dinoz if it were to learn a new skill.
 * @param dinoz Relevant data of the Dinoz to level up.
 * @param skillId Skill to look up.
 * @returns List of skills that can be unlocked.
 */
export const getNewUnlockableSkills = (
	dinoz: Pick<Dinoz, 'raceId'> & {
		skills: Pick<DinozSkill, 'skillId'>[];
		unlockableSkills: Pick<DinozSkill, 'skillId'>[];
	},
	newSkill: Skill
) => {
	return (
		Object.values(skillList)
			// First filter : get skills that require the new skill to be unlocked
			.filter(skill => skill.unlockedFrom?.some(s => s === newSkill))
			// Second filter : Keep only skills that dinoz can learn with that new skill or its already learned skills
			.filter(skill =>
				skill.unlockedFrom?.every(
					skillId => newSkill === skillId || dinoz.skills.some(dinozSkill => dinozSkill.skillId === skillId)
				)
			)
			// Third filter : Remove race skills (ex : shell from Winks)
			.filter(skill => !skill.raceId || skill.raceId.includes(dinoz.raceId))
			.map(skill => {
				return skill.id;
			})
	);
};

/**
 * Return all skills that a dinoz can unlock (all elements).
 * If the param "elementWanted" is present, return unlockable skills from that one specific element.
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

/**
 * Validate and deduplicate the gather grid coordinates sent by the client.
 * Each coordinate must be a numeric `[row, col]` pair within `0 .. gridSize - 1`.
 * Duplicates are dropped because the gather reward logic credits every coordinate it
 * receives, so the same cell submitted twice would otherwise be rewarded twice.
 */
export const sanitizeGatherBoxes = (rawBoxes: number[][], gridSize: number): [number, number][] => {
	const boxes: [number, number][] = [];
	const seen = new Set<string>();
	for (const element of rawBoxes) {
		if (!element.every(coord => typeof coord === 'number')) {
			throw new ExpectedError(`This coordinate is not correct : ${element}`);
		}
		// Valid indices are 0 .. gridSize - 1, so anything >= gridSize is out of bounds.
		if (element.some(coord => coord >= gridSize || coord < 0)) {
			throw new ExpectedError(`This coordinate is out of the grid : ${element}`);
		}
		const [row, col] = element as [number, number];
		const key = `${row},${col}`;
		if (!seen.has(key)) {
			seen.add(key);
			boxes.push([row, col]);
		}
	}
	return boxes;
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

export const reincarnateDinoz = (
	race: DinozRace,
	display: string,
	seed: string,
	isDemon: boolean
): Prisma.DinozUpdateInput => {
	const fullDisplay = [...display];
	fullDisplay[1] = isDemon ? 'A' : '0';

	let fire = 0;
	let water = 0;
	let wood = 0;
	let lightning = 0;
	let air = 0;
	const reincarnation_salt = 'abcde';
	for (let i = 0; i < 5; i++) {
		const element = getRandomUpElement(race.upChance, seed + GLOBAL.config.salt + reincarnation_salt[i]); // Seed is purposefully different than for level ups so gained elements cannot be predicted
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

export const learnNextSphereSkill = (
	dinoz: {
		skills: Pick<DinozSkill, 'skillId'>[];
	},
	element: ElementType,
	authed: Auth
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
		throw new ExpectedError(translate('knownSphereSkill', authed));
	}

	return sphereSkillToLearn?.id; // SAFETY: sphereSkillToLearn is not undefined
};

/**
 * @summary Randomly level a Dinoz N times. Levels are picked up based on element affinity of the Dinoz.
 * @param dinoz Data of the Dinoz to level up, this data is mutated directly.
 * @param targetLevel The expected level to bring the Dinoz to.
 * @returns None, it mutates the dinoz data directly.
 */
export const randomlyLevelUpDinoz = (
	dinoz: Pick<
		Dinoz,
		| 'id'
		| 'display'
		| 'level'
		| 'raceId'
		| 'maxLife'
		| 'nbrUpAir'
		| 'nbrUpFire'
		| 'nbrUpLightning'
		| 'nbrUpWater'
		| 'nbrUpWood'
		| 'nextUpElementId'
		| 'nextUpAltElementId'
		| 'seed'
	> & {
		status: Pick<DinozStatus, 'statusId'>[];
		skills: Pick<DinozSkill, 'skillId'>[];
		unlockableSkills: Pick<DinozSkillUnlockable, 'skillId'>[];
	},
	// One entry per elemental point the Dinoz must gain, e.g. a Demon race declaring nbrFire: 6 means
	// 6 FIRE entries. Order is shuffled below, values themselves are not randomly drawn.
	targetElements: ElementType[]
) => {
	if (targetElements.length === 0) return;

	const dinozRace = raceList[dinoz.raceId as RaceEnum];
	const elementQueue = shuffle(targetElements);

	elementQueue.forEach((element, index) => {
		// For each iteration, select either a skill to learn or to unlock skills randomly.
		// Each learnable skill's weight is 1. Unlocking skills weight is based on its length divided by 2.
		// Note: algorithm to select a Demon Dinoz skills has not been found in MT's source code. This is an attempt to recreate it. Completely made up.

		const currentLearnableSkills = getLearnableSkills(dinoz, element).map(s => s.skillId);
		const currentUnlockableSkills = getUnlockableSkills(dinoz, element).map(s => s.skillId);

		switch (element) {
			case ElementType.FIRE:
				dinoz.nbrUpFire++;
				break;
			case ElementType.WOOD:
				dinoz.nbrUpWood++;
				break;
			case ElementType.WATER:
				dinoz.nbrUpWater++;
				break;
			case ElementType.LIGHTNING:
				dinoz.nbrUpLightning++;
				break;
			case ElementType.AIR:
				dinoz.nbrUpAir++;
				break;
			default:
				break;
		}

		if (currentLearnableSkills.length === 0 && currentUnlockableSkills.length === 0) {
			// If nothing to unlock, throw.
			throw new ExpectedError(
				`Dinoz is level ${dinoz.level} and out of skills to learn, ${elementQueue.length - index} iterations left`
			);
		}

		let odds = currentLearnableSkills.map(s => {
			return { skillId: s as number, odds: 1 };
		});

		// Add odds of unlocking skills except for last iteration (unless there is no skill to learn)
		if (index < elementQueue.length - 1 || currentLearnableSkills.length === 0) {
			// Key is '-1' for unlocking given all skill IDs are > 0
			odds.push({ skillId: -1, odds: currentUnlockableSkills.length / 2 });
		}

		let result = weightedRandom(odds);

		if (result.skillId === -1) {
			// Unlock only skills from the chosen element
			dinoz.unlockableSkills = dinoz.unlockableSkills.filter(s => !currentUnlockableSkills.includes(s.skillId));
		} else {
			// Learn new skill
			dinoz.unlockableSkills.push(
				...getNewUnlockableSkills(dinoz, result.skillId).map(skillId => {
					return { skillId, dinozId: dinoz.id };
				})
			);
			dinoz.skills.push({
				skillId: result.skillId
			});

			// Apply the skill's passive effects (elements, max life...) right away so the Dinoz ends up
			// with its final stats without a separate re-application pass.
			const skillData = skillList[result.skillId as Skill];
			if (skillData.effects) {
				applySkillToDinoz(skillData.effects, dinoz);
			}
		}

		let growthLetter = fromBase62(dinoz.display[1]) % 10;
		if (dinoz.level < 10 && dinoz.display[1] !== 'A') {
			growthLetter++;
			dinoz.display = dinoz.display[0] + growthLetter + dinoz.display.substring(2, dinoz.display.length);
		}

		dinoz.level++;
	});

	// Roll the element(s) the Dinoz will gain on its next (real, in-game) level up, based on its final skill set.
	const newLearnableSkills = getLearnableSkills(dinoz);
	const newUnlockableSkills = getUnlockableSkills(dinoz);
	const upChance = getDinozUpChance(newLearnableSkills, newUnlockableSkills, dinozRace);
	dinoz.nextUpElementId = getRandomUpElement(upChance, dinoz.seed + GLOBAL.config.salt + dinoz.level);
	dinoz.nextUpAltElementId = getRandomUpElement(upChance, dinoz.seed + GLOBAL.config.salt + dinoz.level + 'pdc');
};

export const generateDinozDisplay = (race: DinozRace, palette: string, rare_1: string, rare_2: string) => {
	// Generate display:
	// - the first 2 chars come from the race swf letters
	// - the second char is '0' for non-demon and 'A' for demon
	// - the next 11 chars are random between '0' and 'z'
	// - the next (14th) is the provided color palette
	// - the next (15th) is the provided 1st rare visual attribute
	// - the last one (16h) is the provided 2nd rare visual attribute
	let randomDisplay = race.swfLetter;

	for (let i = 0; i < 11; i++) {
		randomDisplay += getRandomLetter('z');
	}

	randomDisplay += palette + rare_1 + rare_2;
	return randomDisplay;
};

/**
 * @summary Checks if a player has reached the maximum number of active Dinoz it can have. Throws if it did.
 * @param playerId ID of the player.
 * @param targetLevel The expected level to bring the Dinoz to.
 * @returns boolean: true if at max, false if not.
 */
export async function isAtMaxActiveDinoz(authed: Pick<Player, 'id' | 'lang'>) {
	const dinozActive = await getActiveDinoz(authed.id);

	if (dinozActive.length > 0) {
		const player = dinozActive[0].player;

		if (!player) {
			throw new ExpectedError(translate('playerNotFound', authed, { id: authed.id }));
		}

		const maxDinoz =
			gameConfig.dinoz.maxQuantity +
			(player.leader ? gameConfig.dinoz.leaderMessieBonus : 0) +
			(player.messie ? gameConfig.dinoz.leaderMessieBonus : 0);
		if (dinozActive.length >= maxDinoz) {
			return true;
		} else {
			return false;
		}
	} else {
		return false;
	}
}

/**
 * @summary Checks if a player has any *active* Dinoz at the given location.
 * @param playerId ID of the player.
 * @param locationId The location ID to check for.
 * @returns boolean: true if at least one, false if none.
 */
export async function hasAnyActiveDinozAt(authed: Pick<Player, 'id' | 'lang'>, placeId: PlaceEnum) {
	const player = await getDinozPlaces(authed.id);

	if (!player) {
		throw new ExpectedError(translate('playerNotFound', authed, { id: authed.id }));
	}

	const dinozAtLocation = player.dinoz.filter(
		d => d.placeId === placeId && (d.unavailableReason === null || d.unavailableReason === UnavailableReason.resting)
	);

	if (dinozAtLocation.length > 0) {
		return true;
	} else {
		return false;
	}
}

export const getDemonShopPrice = (level: number) => {
	// The formula is not in MT's code. It was determined through manual regression, trial and error.
	// It is `1.10625 * (1 - 1.079^N) / (1 - 1.079)`
	// It comes from the sum of N number for a geometric serie: Sn = a * (1 - r^n) / (1 - r)
	const a = 1.10625;
	const r = 1.079;

	return Math.floor((a * (1 - Math.pow(r, level))) / (1 - r));
};
