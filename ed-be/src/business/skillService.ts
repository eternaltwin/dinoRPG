import { Request } from 'express';
import _ from 'lodash';
import { itemList, levelList, raceList, skillList, statusList } from '../constants/index.js';
import { addSkillToDinoz } from '../dao/assDinozSkillDao.js';
import { addMultipleUnlockableSkills, removeUnlockableSkillsToDinoz } from '../dao/assDinozSkillUnlockable.js';
import { getDinozSkillsOwnAndUnlockable, setLevelUpData } from '../dao/dinozDao.js';
import {
	AssDinozSkillUnlockable,
	Dinoz,
	DinozRace,
	DinozSkill,
	DinozSkillOwnAndUnlockable,
	ElementType,
	Ranking,
	SkillTree
} from '../models/index.js';
import { getRandomUpElement } from '../utils/helpers/DinozHelper.js';
import { updatePoints } from '../dao/rankingDao.js';

/**
 * @summary Get all learnables and unlockables skills
 *
 * @param req
 * @param req.params.id {string} Dinoz id
 * @param req.params.tryNumber {number} Number of level up try (From 1 to 2)
 *
 * @returns Partial<DinozSkillOwnAndUnlockable> | undefined>
 */
const getLearnableSkills = async (req: Request): Promise<Partial<DinozSkillOwnAndUnlockable> | undefined> => {
	const dinozId: number = parseInt(req.params.id);

	const dinozSkills: Dinoz | null = await getDinozSkillsOwnAndUnlockable(dinozId);

	if (dinozSkills === null) {
		throw new Error(`Dinoz ${dinozId} doesn't exist`);
	}

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

	const dinozSkills: Dinoz | null = await getDinozSkillsOwnAndUnlockable(dinozId);

	if (dinozSkills === null) {
		throw new Error(`Dinoz ${dinozId} doesn't exist`);
	}

	const ranking: Ranking | undefined = dinozSkills.player.rank;

	const dinozRace: DinozRace = Object.values(raceList).find(race => race.raceId === dinozSkills.raceId)!;

	const skills: Partial<DinozSkillOwnAndUnlockable> | undefined = getDinozLearnableSkills(
		req,
		dinozSkills,
		dinozRace,
		dinozId,
		parseInt(req.body.tryNumber)
	);

	const isLearnableSkills: boolean =
		skillIdList.every(skillId => skills!.learnableSkills!.some(skill => skill.skillId === skillId)) &&
		skillIdList.length === 1;
	const isUnlockableSkills: boolean =
		skillIdList.every(skillId => skills!.unlockableSkills!.some(skill => skill.skillId === skillId)) &&
		skillIdList.length === skills!.unlockableSkills!.length;

	if (!isLearnableSkills && !isUnlockableSkills) {
		throw new Error(`Dinoz ${dinozId} can't learn this`);
	}

	if (isUnlockableSkills) {
		await removeUnlockableSkillsToDinoz(dinozId, skillIdList);
	} else {
		await addSkillToDinoz(dinozId, skillIdList[0]);

		// Get all new unlockables skills
		// First filter : get skills that required skill send in body to be learn
		// Second filter : Keep only skills that dinoz can learn (dinoz have every unlock condition)
		// Third filter : Remove race skills (ex : fly from Pteroz)
		const newUnlockableSkills: Array<AssDinozSkillUnlockable> = Object.values(skillList)
			.filter(skill => skill.unlockedFrom?.some(skillId => skillIdList.includes(skillId)))
			.filter(skill =>
				skill.unlockedFrom?.every(
					skillId =>
						skillIdList.includes(skillId) || dinozSkills.skill.some(dinozSkill => dinozSkill.skillId === skillId)
				)
			)
			.filter(skill => !skill.raceId || skill.raceId.includes(dinozSkills.raceId))
			.map(skill =>
				AssDinozSkillUnlockable.build({
					dinozId: dinozId,
					skillId: skill.skillId
				}).get()
			);

		await addMultipleUnlockableSkills(newUnlockableSkills);
	}

	const newDinozData: Partial<Dinoz> = getNewDinozDataFromLevelUp(
		dinozId,
		parseInt(req.body.tryNumber),
		dinozSkills,
		dinozRace
	);

	await setLevelUpData(newDinozData);

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
): Partial<DinozSkillOwnAndUnlockable> | undefined {
	let skills: Partial<DinozSkillOwnAndUnlockable> = {};

	if (dinoz.player.playerId !== req.user!.playerId) {
		throw new Error(`Dinoz ${dinozId} doesn't belong to player ${req.user!.playerId}`);
	}

	const maxExperience: number = levelList.find(level => level.id === dinoz.level)!.experience;

	if (dinoz.experience < maxExperience) {
		throw new Error(`Dinoz ${dinozId} doesn't have enough experience`);
	}

	// Check if dinoz has 'Plan de carrière' skill or cube object
	const hasCubeOrPdc: boolean =
		dinoz.skill.some(skill => skill.skillId === skillList.PLAN_DE_CARRIERE.skillId) ||
		(dinoz.item.some(item => item.itemId === itemList.DINOZ_CUBE.itemId) && dinoz.level <= 10);

	if (tryNumber < 1 || tryNumber > 2 || (tryNumber === 2 && !hasCubeOrPdc)) {
		throw new Error(`tryNumber ${tryNumber} is invalid`);
	}

	const learnableSkills: Array<DinozSkill> = _.cloneDeep(Object.values(skillList));

	const treeType: SkillTree = dinoz.status.some(status => status.statusId === statusList.ETHER_DROP)
		? SkillTree.ETHER
		: SkillTree.VANILLA;

	const learnableElement: number = tryNumber === 1 ? dinoz.nextUpElementId : dinoz.nextUpAltElementId;

	// First filter : Keep all skills which have same type (fire, wood...)
	// Second filter : Keep all skills from same tree (Vanilla or Ether)
	// Third filter : Keep all skills that are learnable or already learned
	// Fourth filter : Remove all skills that dinoz already knows
	// Fifth filter : Remove all unlockables skills
	// Sixth filter : Remove all spherical skills (not learnable here)
	// Seventh filtre : Remove race skills (ex : fly from Pteroz)
	skills.learnableSkills = learnableSkills
		.filter(skill => skill.element.some(element => element === learnableElement))
		.filter(skill => skill.tree === treeType)
		.filter(skill =>
			skill.unlockedFrom?.every(skillId => dinoz.skill.some(dinozSkill => dinozSkill.skillId === skillId))
		)
		.filter(skill => !dinoz.skill.some(dinozSkill => dinozSkill.skillId === skill.skillId))
		.filter(skill => !dinoz.skillUnlockable.some(dinozSkill => dinozSkill.skillId === skill.skillId))
		.filter(skill => !skill.isSphereSkill)
		.filter(skill => !skill.raceId || skill.raceId.includes(dinoz.raceId))
		.map(skill => {
			return {
				skillId: skill.skillId,
				type: skill.type,
				element: skill.element
			};
		});

	// Get all unlockable skills
	skills.unlockableSkills = dinoz.skillUnlockable
		.map(skill => Object.values(skillList).find(skills => skills.skillId === skill.skillId)!)
		.filter(skill => skill.element.some(element => element === learnableElement))
		.filter(skill => skill.tree === treeType)
		.map(skill => {
			return {
				skillId: skill.skillId,
				element: skill.element
			};
		});

	skills.canRelaunch = hasCubeOrPdc;
	skills.element = learnableElement;
	skills.nbrUpFire = dinoz.nbrUpFire;
	skills.nbrUpWood = dinoz.nbrUpWood;
	skills.nbrUpWater = dinoz.nbrUpWater;
	skills.nbrUpLightning = dinoz.nbrUpLightning;
	skills.nbrUpAir = dinoz.nbrUpAir;
	skills.upChance = race.upChance;

	return skills;
}

// Get dinoz updated data when level up is over.
function getNewDinozDataFromLevelUp(
	dinozId: number,
	tryNumber: number,
	dinozSkills: Dinoz,
	dinozRace: DinozRace
): Partial<Dinoz> {
	const dinoz: Partial<Dinoz> = {
		dinozId: dinozId,
		experience: 0,
		level: dinozSkills.level + 1,
		nextUpElementId: getRandomUpElement(dinozRace)!,
		nextUpAltElementId: getRandomUpElement(dinozRace)!
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
			throw new Error(`Up type is not valid !`);
	}

	// Display
	let growthLetter: number = parseInt(dinozSkills.display[1]);

	if (growthLetter < 9) {
		growthLetter++;
	}

	dinoz.display = dinozSkills.display[0] + growthLetter + dinozSkills.display.substring(2, dinozSkills.display.length);

	// TODO: Do a function to save into database the effect of the skill learned (ex: Sumo -> +100 hp) - (EDRPG-112)

	return dinoz;
}

export { getLearnableSkills, learnSkill };
