import { Request } from 'express';
import _ from 'lodash';
import { itemList, levelList, raceList, skillList, statusList } from '../constants/index.js';
import { getRandomUpElement } from '../utils/helpers/DinozHelper.js';
import { Dinoz, DinozSkill, DinozSkillUnlockable, DinozStatus, Ranking } from '../entity/index.js';
import {
	DinozRace,
	DinozSkillFiche,
	DinozSkillOwnAndUnlockable,
	ElementType,
	SkillTree,
	UpChance
} from '../models/index.js';
import { getDinozForLevelUp, getDinozSkillsLearnableAndUnlockable, setDinoz } from '../dao/dinozDao.js';
import { addMultipleUnlockableSkills, removeUnlockableSkillsToDinoz } from '../dao/dinozSkillUnlockableDao.js';
import { addSkillToDinoz } from '../dao/dinozSkillDao.js';
import { updatePoints } from '../dao/rankingDao.js';
import gameConfig from '../config/game.config.js';
import { effectParser } from '../utils/index.js';
import { ErrorFormator } from '../utils/errorFormator.js';

/**
 * @summary Get all learnables and unlockables skills
 *
 * @param req
 * @param req.params.id {string} Dinoz id
 * @param req.params.tryNumber {number} Number of level up try (From 1 to 2)
 *
 * @returns Partial<DinozSkillOwnAndUnlockable> | undefined>
 */
const getLearnableAndUnlockableSkills = async (
	req: Request
): Promise<Partial<DinozSkillOwnAndUnlockable> | undefined> => {
	const dinozId: number = parseInt(req.params.id);

	const dinozSkills: Dinoz = await getDinozForLevelUp(dinozId);

	const dinozRace: DinozRace = Object.values(raceList).find(race => race.raceId === dinozSkills.raceId)!;

	return getDinozLearnableSkills(req, dinozSkills, dinozRace, dinozId, parseInt(req.params.tryNumber));
};

/**
 * @summary Learn one not spherical skill
 *
 * @param req
 * @param req.params.id Dinoz id
 * @body req.body.skillIdList {Array<number>} -> Id of skills that dinoz wants to learn
 * @body req.body.tryNumber {number} -> Number of level up try (From 1 to 2)
 *
 * @returns New max experience value
 */
const learnSkill = async (req: Request): Promise<string> => {
	const dinozId: number = parseInt(req.params.id);
	const skillIdList: Array<number> = req.body.skillIdList;

	const dinozSkills: Dinoz = await getDinozForLevelUp(dinozId);

	const ranking: Ranking | undefined = dinozSkills.player.rank;

	const dinozRace: DinozRace = Object.values(raceList).find(race => race.raceId === dinozSkills.raceId)!;

	const skills: Partial<DinozSkillOwnAndUnlockable> = getDinozLearnableSkills(
		req,
		dinozSkills,
		dinozRace,
		dinozId,
		parseInt(req.body.tryNumber)
	);

	const isLearnableSkills: boolean =
		skillIdList.every(skillId => skills.learnableSkills!.some(skill => skill.skillId === skillId)) &&
		skillIdList.length === 1;
	const isUnlockableSkills: boolean =
		skillIdList.every(skillId => skills.unlockableSkills!.some(skill => skill.skillId === skillId)) &&
		skillIdList.length === skills.unlockableSkills!.length;

	if (!isLearnableSkills && !isUnlockableSkills) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} can't learn this`);
	}

	if (isUnlockableSkills) {
		await removeUnlockableSkillsToDinoz(dinozId, skillIdList);
	} else {
		await applySkillEffect(dinozSkills, Object.values(skillList).find(skill => skill.skillId === skillIdList[0])!);
		await addSkillToDinoz(new DinozSkill(new Dinoz(dinozId), skillIdList[0]));

		// Get all new unlockables skills
		// First filter : get skills that required skill send in body to be learn
		// Second filter : Keep only skills that dinoz can learn (dinoz have every unlock condition)
		// Third filter : Remove race skills (ex : fly from Pteroz)
		const newUnlockableSkills: Array<DinozSkillUnlockable> = Object.values(skillList)
			.filter(skill => skill.unlockedFrom?.some(skillId => skillIdList.includes(skillId)))
			.filter(skill =>
				skill.unlockedFrom?.every(
					skillId =>
						skillIdList.includes(skillId) || dinozSkills.skills.some(dinozSkill => dinozSkill.skillId === skillId)
				)
			)
			.filter(skill => !skill.raceId || skill.raceId.includes(dinozSkills.raceId))
			.map(skill => new DinozSkillUnlockable(new Dinoz(dinozId), skill.skillId));

		// Add skill to dinoz in order to have same data than database.
		dinozSkills.skills.push(new DinozSkill(dinozSkills, skillIdList[0]));

		await addMultipleUnlockableSkills(newUnlockableSkills);
	}

	const newDinozData: Partial<Dinoz> = getNewDinozDataFromLevelUp(
		dinozId,
		parseInt(req.body.tryNumber),
		dinozSkills,
		dinozRace
	);

	await setDinoz(newDinozData);

	const newMaxExperience: string | undefined = levelList
		.find(level => level.id === dinozSkills.level + 1)
		?.experience?.toString()!;

	const dinozCount = ranking!.dinozCount;
	const sumPoints = ranking!.sumPoints + 1;
	const averagePoints = Math.round(sumPoints / dinozCount);
	await updatePoints(req.user!.playerId!, sumPoints, averagePoints, dinozCount);

	return newMaxExperience;
};

function getDinozLearnableSkills(
	req: Request,
	dinoz: Dinoz,
	race: DinozRace,
	dinozId: number,
	tryNumber: number
): Partial<DinozSkillOwnAndUnlockable> {
	if (dinoz.level === gameConfig.dinoz.maxLevel) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} is already at max level.`);
	}

	if (dinoz.player.id !== req.user!.playerId) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} doesn't belong to player ${req.user!.playerId}`);
	}

	const maxExperience: number = levelList.find(level => level.id === dinoz.level)!.experience;

	if (dinoz.experience < maxExperience) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} doesn't have enough experience`);
	}

	// Check if dinoz has 'Plan de carrière' skill or cube object
	const hasCubeOrPdc: boolean =
		dinoz.skills.some(skill => skill.skillId === skillList.PLAN_DE_CARRIERE.skillId) ||
		(dinoz.items.some(item => item.itemId === itemList.DINOZ_CUBE.itemId) && dinoz.level <= 10);

	if (tryNumber < 1 || tryNumber > 2 || (tryNumber === 2 && !hasCubeOrPdc)) {
		throw new ErrorFormator(500, `tryNumber ${tryNumber} is invalid`);
	}

	const learnableElement: number = tryNumber === 1 ? dinoz.nextUpElementId : dinoz.nextUpAltElementId;

	return {
		learnableSkills: getLearnableSkills(dinoz, learnableElement),
		unlockableSkills: getUnlockableSkills(dinoz, learnableElement),
		canRelaunch: hasCubeOrPdc,
		element: learnableElement,
		nbrUpFire: dinoz.nbrUpFire,
		nbrUpWood: dinoz.nbrUpWood,
		nbrUpWater: dinoz.nbrUpWater,
		nbrUpLightning: dinoz.nbrUpLightning,
		nbrUpAir: dinoz.nbrUpAir,
		upChance: race.upChance
	};
}

// Get dinoz updated data when level up is over.
function getNewDinozDataFromLevelUp(
	dinozId: number,
	tryNumber: number,
	dinozSkills: Dinoz,
	dinozRace: DinozRace
): Partial<Dinoz> {
	const allLearnableSkills: Array<Partial<DinozSkillFiche>> = getLearnableSkills(dinozSkills);

	const allUnlockableSkills: Array<Partial<DinozSkillFiche>> = getUnlockableSkills(dinozSkills);

	const upChance: UpChance = {
		fire: getElementUpChance(allLearnableSkills, allUnlockableSkills, ElementType.FIRE, dinozRace.upChance.fire),
		wood: getElementUpChance(allLearnableSkills, allUnlockableSkills, ElementType.WOOD, dinozRace.upChance.wood),
		water: getElementUpChance(allLearnableSkills, allUnlockableSkills, ElementType.WATER, dinozRace.upChance.water),
		lightning: getElementUpChance(
			allLearnableSkills,
			allUnlockableSkills,
			ElementType.LIGHTNING,
			dinozRace.upChance.lightning
		),
		air: getElementUpChance(allLearnableSkills, allUnlockableSkills, ElementType.AIR, dinozRace.upChance.air)
	};

	const dinoz: Partial<Dinoz> = {
		id: dinozId,
		experience: 0,
		level: dinozSkills.level + 1,
		nextUpElementId: getRandomUpElement(upChance),
		nextUpAltElementId: getRandomUpElement(upChance)
	};

	// Elements
	const nextUpElementId: number = tryNumber === 1 ? dinozSkills.nextUpElementId : dinozSkills.nextUpAltElementId;

	switch (nextUpElementId) {
		case ElementType.FIRE:
			dinoz.nbrUpFire = dinozSkills.nbrUpFire + 1;
			break;
		case ElementType.WOOD:
			dinoz.nbrUpWood = dinozSkills.nbrUpWood + 1;
			break;
		case ElementType.WATER:
			dinoz.nbrUpWater = dinozSkills.nbrUpWater + 1;
			break;
		case ElementType.LIGHTNING:
			dinoz.nbrUpLightning = dinozSkills.nbrUpLightning + 1;
			break;
		case ElementType.AIR:
			dinoz.nbrUpAir = dinozSkills.nbrUpAir + 1;
			break;
		default:
			throw new ErrorFormator(500, `Up type is not valid !`);
	}

	// Display
	let growthLetter: number = parseInt(dinozSkills.display[1]);

	if (growthLetter < 9) {
		growthLetter++;
	}

	dinoz.display = dinozSkills.display[0] + growthLetter + dinozSkills.display.substring(2, dinozSkills.display.length);

	return dinoz;
}

/**
 * Return all skills that a dinoz can learn (every elements).
 * If the param "elementWanted" is present, return learnable skills from one specific element.
 */
function getLearnableSkills(dinoz: Dinoz, elementWanted?: ElementType): Array<Partial<DinozSkillFiche>> {
	const treeType: SkillTree = getTreeType(dinoz.status);
	let learnableSkills: Array<Partial<DinozSkillFiche>> = _.cloneDeep(Object.values(skillList));

	// Keep all skills which have same type (fire, wood...)
	if (elementWanted !== undefined) {
		learnableSkills = learnableSkills.filter(skill => skill.element!.some(element => element === elementWanted));
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
		.filter(skill => !dinoz.skills.some(dinozSkill => dinozSkill.skillId === skill.skillId))
		.filter(skill => !dinoz.skillsUnlockable.some(dinozSkill => dinozSkill.skillId === skill.skillId))
		.filter(skill => !skill.isSphereSkill)
		.filter(skill => !skill.raceId || skill.raceId.includes(dinoz.raceId))
		.map(skill => {
			return {
				skillId: skill.skillId,
				type: skill.type,
				element: skill.element
			};
		});
}

/**
 * Return all skills that a dinoz can unlock (every elements).
 * If the param "elementWanted" is present, return unlockable skills from one specific element.
 */
function getUnlockableSkills(dinoz: Dinoz, elementWanted?: ElementType): Array<Partial<DinozSkillFiche>> {
	const treeType: SkillTree = getTreeType(dinoz.status);
	let unlockableSkills = dinoz.skillsUnlockable.map(
		skill => Object.values(skillList).find(skills => skills.skillId === skill.skillId)!
	);

	if (elementWanted !== undefined) {
		unlockableSkills = unlockableSkills.filter(skill => skill.element.some(element => element === elementWanted));
	}

	return unlockableSkills
		.filter(skill => skill.tree === treeType)
		.map(skill => {
			return {
				skillId: skill.skillId,
				element: skill.element
			};
		});
}

function getTreeType(status: Array<DinozStatus>): SkillTree {
	return status.some(status => status.statusId === statusList.ETHER_DROP) ? SkillTree.ETHER : SkillTree.VANILLA;
}

// Get up chance for one element
// If the dinoz can't learn more skill from that element, return 0 -> Element can't be selected at next level.
function getElementUpChance(
	learnableSkillsAllElements: Array<Partial<DinozSkillFiche>>,
	unlockableSkillsAllElements: Array<Partial<DinozSkillFiche>>,
	element: ElementType,
	elementValue: number
): number {
	return learnableSkillsAllElements.some(skill => skill.element!.includes(element)) ||
		unlockableSkillsAllElements.some(skill => skill.element!.includes(element))
		? elementValue
		: 0;
}

/**
 * Function used when the dinoz learn "Double skill".
 * Get all double skills that dinoz can learn et place it into unlockable_skills table.
 */
const unlockDoubleSkills = async (dinozId: number): Promise<void> => {
	const dinoz: Dinoz = await getDinozSkillsLearnableAndUnlockable(dinozId);
	const allLearnableSkills: Array<Partial<DinozSkillFiche>> = getLearnableSkills(dinoz);

	// First filter : Get all skills which have more that one element (ex : fire and water).
	// Second filter : Assert that the skill is a double skill, and not an invocation or something else.
	const doubleSkillsToUnlock: Array<DinozSkillUnlockable> = allLearnableSkills
		.filter(skill => skill.element!.length > 1)
		.filter(skillToUnlock => {
			const skillDetail: DinozSkillFiche = Object.values(skillList).find(
				skill => skill.skillId === skillToUnlock.skillId
			)!;
			return skillDetail.unlockedFrom!.includes(skillList.COMPETENCE_DOUBLE.skillId);
		})
		.map(skill => new DinozSkillUnlockable(new Dinoz(dinozId), skill.skillId!));

	await addMultipleUnlockableSkills(doubleSkillsToUnlock);
};

async function applySkillEffect(dinoz: Dinoz, skill: DinozSkillFiche): Promise<void> {
	if (skill.effects) {
		await effectParser(skill.effects, dinoz);
	}
}

export { getLearnableAndUnlockableSkills, getLearnableSkills, learnSkill, unlockDoubleSkills };
