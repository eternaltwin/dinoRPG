import { levelList } from '@drpg/core/models/dinoz/DinozLevel';
import { DinozRace } from '@drpg/core/models/dinoz/DinozRace';
import { SkillDetails } from '@drpg/core/models/dinoz/SkillDetails';
import { raceList } from '@drpg/core/models/dinoz/RaceList';
import { Skill, skillList } from '@drpg/core/models/dinoz/SkillList';
import { DinozStatusId } from '@drpg/core/models/dinoz/StatusList';
import { ElementType } from '@drpg/core/models/enums/ElementType';
import { SkillTree } from '@drpg/core/models/enums/SkillTree';
import { Item, itemList } from '@drpg/core/models/item/ItemList';
import { Dinoz, DinozItem, DinozSkill, DinozSkillUnlockable, DinozStatus, LogType, Player } from '@drpg/prisma';
import { Request } from 'express';
import gameConfig from '../config/game.config.js';
import {
	getDinozForLevelUp,
	getDinozSkillsLearnableAndUnlockable,
	getDinozToReincarnate,
	updateDinoz
} from '../dao/dinozDao.js';
import { addSkillToDinoz, removeAllSkillFromDinoz } from '../dao/dinozSkillDao.js';
import {
	addMultipleUnlockableSkills,
	removeAllUnlockableSkillsFromDinoz,
	removeUnlockableSkillsFromDinoz
} from '../dao/dinozSkillUnlockableDao.js';
import { effectParser, fromBase62 } from '../utils/index.js';
import { getMaxXp, getRace, getRandomUpElement, reincarnateDinoz } from '@drpg/core/utils/DinozUtils';
import { createLog } from '../dao/logDao.js';
import { updatePoints } from '../dao/rankingDao.js';
import { SkillType } from '@drpg/core/models/enums/SkillType';
import { auth, getPlayerUSkills, setPlayer } from '../dao/playerDao.js';
import { setSpecificStat } from '../dao/trackingDao.js';
import { StatTracking } from '@drpg/core/models/enums/statTracking';
import { GLOBAL } from '../context.js';
import { addStatusToDinoz, removeAllStatusFromDinoz } from '../dao/dinozStatusDao.js';
import { removeAllMissionsFromDinoz } from '../dao/dinozMissionDao.js';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { checkAnnounce } from '../utils/announcer.js';
import { PantheonMotif } from '@drpg/prisma';

/**
 * @summary Get all learnables and unlockables skills
 *
 * @param req
 * @param req.params.id {string} Dinoz id
 * @param req.params.tryNumber {number} Number of level up try (From 1 to 2)
 *
 * @returns Partial<DinozSkillOwnAndUnlockable> | undefined>
 */
export async function getLearnableAndUnlockableSkills(req: Request) {
	const dinozId = +req.params.id;

	const dinozSkills = await getDinozForLevelUp(dinozId);
	if (!dinozSkills) {
		throw new ExpectedError(`Dinoz ${dinozId} doesn't exist.`);
	}

	if (!dinozSkills.player || !req.auth || dinozSkills.player.id !== req.auth.playerId) {
		throw new ExpectedError(`Dinoz ${dinozId} doesn't belong to player ${req.auth?.playerId}`);
	}

	if (dinozSkills.canChangeName) {
		throw new ExpectedError(`Dinoz has to be named.`);
	}

	const dinozRace = Object.values(raceList).find(race => race.raceId === dinozSkills.raceId);

	if (!dinozRace) {
		throw new ExpectedError(`Dinoz race ${dinozSkills.raceId} doesn't exist.`);
	}

	return getDinozLearnableSkills(req, dinozSkills, dinozRace, dinozId, +req.params.tryNumber);
}

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
export async function learnSkill(req: Request) {
	const authed = await auth(req);
	const dinozId = +req.params.id;
	const skillIdList = req.body.skillIdList as number[];

	const dinozSkills = await getDinozForLevelUp(dinozId);
	if (!dinozSkills) {
		throw new ExpectedError(`Dinoz ${dinozId} doesn't exist.`);
	}
	if (!dinozSkills.player || !req.auth || dinozSkills.player.id !== req.auth.playerId) {
		throw new ExpectedError(`Dinoz ${dinozId} doesn't belong to player ${req.auth?.playerId}`);
	}

	if (dinozSkills.canChangeName) {
		throw new ExpectedError(`Dinoz has to be named.`);
	}

	const dinozRace = Object.values(raceList).find(race => race.raceId === dinozSkills.raceId);

	if (!dinozRace) {
		throw new ExpectedError(`Dinoz race ${dinozSkills.raceId} doesn't exist.`);
	}

	const skills = getDinozLearnableSkills(req, dinozSkills, dinozRace, dinozId, parseInt(req.body.tryNumber));

	const isLearnableSkills =
		skillIdList.every(skillId => skills.learnableSkills.some(skill => skill.skillId === skillId)) &&
		skillIdList.length === 1;
	const isUnlockableSkills =
		skillIdList.every(skillId => skills.unlockableSkills.some(skill => skill.skillId === skillId)) &&
		skillIdList.length === skills.unlockableSkills.length;

	if (!isLearnableSkills && !isUnlockableSkills) {
		throw new ExpectedError(`Dinoz ${dinozId} can't learn this`);
	}

	if (isUnlockableSkills) {
		await removeUnlockableSkillsFromDinoz(dinozId, skillIdList);
	} else {
		const skill = Object.values(skillList).find(skill => skill.id === skillIdList[0]);
		if (!skill) {
			throw new ExpectedError(`Skill ${skillIdList[0]} doesn't exist.`);
		}
		await applySkillEffect(dinozSkills, skill, authed.id);
		await addSkillToDinoz(dinozId, skillIdList[0]);
		if (skill.type === SkillType.U) {
			await applyUSkillEffect(dinozSkills.player.id, skill);
		}

		// Get all new unlockables skills
		// First filter : get skills that required skill send in body to be learn
		// Second filter : Keep only skills that dinoz can learn (dinoz have every unlock condition)
		// Third filter : Remove race skills (ex : fly from Pteroz)
		const newUnlockableSkills = Object.values(skillList)
			.filter(skill => skill.unlockedFrom?.some(skillId => skillIdList.includes(skillId)))
			.filter(
				skill =>
					skill.unlockedFrom?.every(
						skillId =>
							skillIdList.includes(skillId) || dinozSkills.skills.some(dinozSkill => dinozSkill.skillId === skillId)
					)
			)
			.filter(skill => !skill.raceId || skill.raceId.includes(dinozSkills.raceId))
			.map(skill => ({
				skillId: skill.id,
				dinozId
			}));

		// Add skill to dinoz in order to have same data than database.
		dinozSkills.skills.push({
			skillId: skillIdList[0]
		});

		await addMultipleUnlockableSkills(newUnlockableSkills);
	}

	const newDinozData = getNewDinozDataFromLevelUp(dinozId, parseInt(req.body.tryNumber), dinozSkills, dinozRace);

	await updateDinoz(newDinozData.id, newDinozData);

	if (newDinozData.level % 10 === 0) {
		checkAnnounce(PantheonMotif.race, newDinozData.id);
	}

	// Update player points
	await updatePoints(dinozSkills.player.id, 1);

	await createLog(LogType.LevelUp, dinozSkills.player.id, dinozSkills.id, newDinozData.level.toString());

	const newMaxExperience = levelList.find(level => level.id === dinozSkills.level + 1)?.experience;

	// Update stat
	await setSpecificStat(StatTracking.LVL_UP, dinozSkills.player.id, 1);
	switch (skills.element) {
		case ElementType.FIRE:
			await setSpecificStat(StatTracking.UP_FIRE, dinozSkills.player.id, 1);
			break;
		case ElementType.WATER:
			await setSpecificStat(StatTracking.UP_WATER, dinozSkills.player.id, 1);
			break;
		case ElementType.WOOD:
			await setSpecificStat(StatTracking.UP_WOOD, dinozSkills.player.id, 1);
			break;
		case ElementType.LIGHTNING:
			await setSpecificStat(StatTracking.UP_LIGHTNING, dinozSkills.player.id, 1);
			break;
		case ElementType.AIR:
			await setSpecificStat(StatTracking.UP_AIR, dinozSkills.player.id, 1);
			break;
		default:
			break;
	}

	return newMaxExperience ?? 0;
}

function getDinozLearnableSkills(
	req: Request,
	dinoz: Pick<
		Dinoz,
		| 'level'
		| 'experience'
		| 'nextUpElementId'
		| 'nextUpAltElementId'
		| 'nbrUpFire'
		| 'nbrUpWood'
		| 'nbrUpWater'
		| 'nbrUpLightning'
		| 'nbrUpAir'
		| 'raceId'
		| 'seed'
	> & {
		player: Pick<Player, 'id'> | null;
		skills: Pick<DinozSkill, 'skillId'>[];
		items: Pick<DinozItem, 'itemId'>[];
		status: Pick<DinozStatus, 'statusId'>[];
		unlockableSkills: Pick<DinozSkillUnlockable, 'skillId'>[];
	},
	race: DinozRace,
	dinozId: number,
	tryNumber: number
) {
	if (dinoz.level === gameConfig.dinoz.maxLevel) {
		throw new ExpectedError(`Dinoz ${dinozId} is already at max level.`);
	}

	if (!dinoz.player || !req.auth || dinoz.player.id !== req.auth.playerId) {
		throw new ExpectedError(`Dinoz ${dinozId} doesn't belong to player ${req.auth?.playerId}`);
	}

	const level = levelList.find(level => level.id === dinoz.level);
	if (!level) {
		throw new ExpectedError(`Level ${dinoz.level} doesn't exist.`);
	}
	const maxExperience = level.experience;

	if (dinoz.experience < maxExperience) {
		throw new ExpectedError(`Dinoz ${dinozId} doesn't have enough experience`);
	}

	// Check if dinoz has 'Plan de carrière' skill or cube object
	const hasCubeOrPdc =
		dinoz.skills.some(skill => skill.skillId === skillList[Skill.PLAN_DE_CARRIERE].id) ||
		(dinoz.items.some(item => item.itemId === itemList[Item.DINOZ_CUBE].itemId) && dinoz.level <= 10);

	if (tryNumber < 1 || tryNumber > 2 || (tryNumber === 2 && !hasCubeOrPdc)) {
		throw new ExpectedError(`tryNumber ${tryNumber} is invalid`);
	}

	const learnableElement = tryNumber === 1 ? dinoz.nextUpElementId : dinoz.nextUpAltElementId;

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
	dinozSkills: Pick<
		Dinoz,
		| 'raceId'
		| 'level'
		| 'nextUpElementId'
		| 'nextUpAltElementId'
		| 'nbrUpFire'
		| 'nbrUpWood'
		| 'nbrUpWater'
		| 'nbrUpLightning'
		| 'nbrUpAir'
		| 'display'
		| 'experience'
		| 'seed'
	> & {
		status: Pick<DinozStatus, 'statusId'>[];
		skills: Pick<DinozSkill, 'skillId'>[];
		unlockableSkills: Pick<DinozSkillUnlockable, 'skillId'>[];
	},
	dinozRace: DinozRace
) {
	const maxXp = getMaxXp(dinozSkills);
	const allLearnableSkills = getLearnableSkills(dinozSkills);

	const allUnlockableSkills = getUnlockableSkills(dinozSkills);

	const upChance = {
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

	const dinoz = {
		id: dinozId,
		experience: dinozSkills.experience - maxXp,
		level: dinozSkills.level + 1,
		nextUpElementId: getRandomUpElement(upChance, dinozSkills.seed + GLOBAL.config.salt + dinozSkills.level),
		nextUpAltElementId: getRandomUpElement(upChance, dinozSkills.seed + GLOBAL.config.salt + dinozSkills.level + 'pdc'),
		nbrUpFire: dinozSkills.nbrUpFire,
		nbrUpWood: dinozSkills.nbrUpWood,
		nbrUpWater: dinozSkills.nbrUpWater,
		nbrUpLightning: dinozSkills.nbrUpLightning,
		nbrUpAir: dinozSkills.nbrUpAir,
		display: dinozSkills.display
	};

	// Elements
	const nextUpElementId = tryNumber === 1 ? dinozSkills.nextUpElementId : dinozSkills.nextUpAltElementId;

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
			throw new ExpectedError(`Up type is not valid !`);
	}

	// Display
	let growthLetter = fromBase62(dinozSkills.display[1]) % 10;

	if (dinozSkills.level < 10 && dinozSkills.display[1] !== 'A') {
		growthLetter++;
		dinoz.display =
			dinozSkills.display[0] + growthLetter + dinozSkills.display.substring(2, dinozSkills.display.length);
	}

	return dinoz;
}

/**
 * Return all skills that a dinoz can learn (every elements).
 * If the param "elementWanted" is present, return learnable skills from one specific element.
 */
export function getLearnableSkills(
	dinoz: Pick<Dinoz, 'raceId'> & {
		status: Pick<DinozStatus, 'statusId'>[];
		skills: Pick<DinozSkill, 'skillId'>[];
		unlockableSkills: Pick<DinozSkillUnlockable, 'skillId'>[];
	},
	elementWanted?: ElementType
) {
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
		.filter(
			skill => skill.unlockedFrom?.every(skillId => dinoz.skills.some(dinozSkill => dinozSkill.skillId === skillId))
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
}

/**
 * Return all skills that a dinoz can unlock (every elements).
 * If the param "elementWanted" is present, return unlockable skills from one specific element.
 */
function getUnlockableSkills(
	dinoz: {
		status: Pick<DinozStatus, 'statusId'>[];
		unlockableSkills: Pick<DinozSkillUnlockable, 'skillId'>[];
	},
	elementWanted?: ElementType
) {
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
}

function getTreeType(status: Pick<DinozStatus, 'statusId'>[]) {
	return status.some(status => status.statusId === DinozStatusId.ETHER_DROP) ? SkillTree.ETHER : SkillTree.VANILLA;
}

// Get up chance for one element
// If the dinoz can't learn more skill from that element, return 0 -> Element can't be selected at next level.
function getElementUpChance(
	learnableSkillsAllElements: Partial<SkillDetails>[],
	unlockableSkillsAllElements: Partial<SkillDetails>[],
	element: ElementType,
	elementValue: number
) {
	return learnableSkillsAllElements.some(skill => skill.element?.includes(element)) ||
		unlockableSkillsAllElements.some(skill => skill.element?.includes(element))
		? elementValue
		: 0;
}

/**
 * Function used when the dinoz learn "Double skill".
 * Get all double skills that dinoz can learn et place it into unlockable_skills table.
 */
export async function unlockDoubleSkills(dinozId: number) {
	const dinoz = await getDinozSkillsLearnableAndUnlockable(dinozId);
	if (!dinoz) {
		throw new ExpectedError(`Dinoz ${dinozId} doesn't exist.`);
	}
	const allLearnableSkills = getLearnableSkills(dinoz);

	// First filter : Get all skills which have more that one element (ex : fire and water).
	// Second filter : Assert that the skill is a double skill, and not an invocation or something else.
	const doubleSkillsToUnlock = allLearnableSkills
		.filter(skill => (skill.element?.length || 0) > 1)
		.filter(skillToUnlock => {
			const skillDetail = Object.values(skillList).find(skill => skill.id === skillToUnlock.skillId);
			return skillDetail?.unlockedFrom?.includes(skillList[Skill.COMPETENCE_DOUBLE].id);
		})
		.map(skill => ({
			skillId: skill.skillId,
			dinozId
		}));

	await addMultipleUnlockableSkills(doubleSkillsToUnlock);
}

export async function applySkillEffect(
	dinoz: Pick<Dinoz, 'id' | 'maxLife' | 'nbrUpFire' | 'nbrUpAir' | 'nbrUpLightning' | 'nbrUpWater' | 'nbrUpWood'>,
	skill: SkillDetails,
	playerId: number
) {
	if (skill.effects) {
		await effectParser(skill.effects, dinoz);
	}
	if (playerId && skill.type === SkillType.U) {
		await applyUSkillEffect(playerId, skill);
	}
}

async function applyUSkillEffect(playerId: number, skill: SkillDetails) {
	const player = await getPlayerUSkills(playerId);
	if (!player) {
		throw new ExpectedError(`This player doesn't exist.`);
	}
	switch (skill.id) {
		case Skill.LEADER:
			if (!player.leader) player.leader = true;
			break;
		case Skill.INGENIEUR:
			if (!player.engineer) player.engineer = true;
			break;
		case Skill.MAGASINIER:
			if (!player.shopKeeper) player.shopKeeper = true;
			break;
		case Skill.CUISINIER:
			if (!player.cooker) player.cooker = true;
			break;
		case Skill.MARCHAND:
			if (!player.merchant) player.merchant = true;
			break;
		case Skill.PRETRE:
			if (!player.priest) player.priest = true;
			break;
		case Skill.PROFESSEUR:
			if (!player.teacher) player.teacher = true;
			break;
		case Skill.MESSIE:
			if (!player.messie) player.messie = true;
			break;
		case Skill.MATELASSEUR:
			if (!player.matelasseur) player.matelasseur = true;
			break;
		default:
			break;
	}
	await setPlayer(playerId, player);
}

export async function reincarnate(req: Request) {
	const dinozId: number = +req.params.id;
	const authed = await auth(req);

	const dinoz = await getDinozToReincarnate(dinozId);

	if (!dinoz) {
		throw new ExpectedError(`No dinoz found for reincarnation.`);
	}

	if (
		!dinoz.skills.some(s => s.skillId === Skill.REINCARNATION) ||
		dinoz.level < 40 ||
		dinoz.status.some(s => s.statusId === DinozStatusId.REINCARNATION)
	) {
		throw new ExpectedError(`Dinoz cannot reincarnate`);
	}

	const race = getRace(dinoz);

	const promises = [];

	await updateDinoz(dinoz.id, reincarnateDinoz(race, dinoz.display, dinoz.id));
	promises.push(removeAllSkillFromDinoz(dinoz.id));

	if (race.skillId && race.skillId.length > 0) {
		for (const skill of race.skillId) {
			promises.push(addSkillToDinoz(dinoz.id, skill));
		}
	}
	promises.push(removeAllStatusFromDinoz(dinoz.id));
	promises.push(removeAllMissionsFromDinoz(dinoz.id));
	promises.push(removeAllUnlockableSkillsFromDinoz(dinoz.id));
	promises.push(updatePoints(authed.id, -dinoz.level));
	promises.push(addStatusToDinoz(dinozId, DinozStatusId.REINCARNATION));

	await Promise.all(promises);
}
