import { levelList } from '@drpg/core/models/dinoz/DinozLevel';
import { DinozRace } from '@drpg/core/models/dinoz/DinozRace';
import { raceList } from '@drpg/core/models/dinoz/RaceList';
import { SkillDetails } from '@drpg/core/models/dinoz/SkillDetails';
import { Skill, skillList } from '@drpg/core/models/dinoz/SkillList';
import { DinozStatusId } from '@drpg/core/models/dinoz/StatusList';
import { ElementType } from '@drpg/core/models/enums/ElementType';
import { SkillType } from '@drpg/core/models/enums/SkillType';
import { StatTracking } from '@drpg/core/models/enums/statTracking';
import { Item, itemList } from '@drpg/core/models/item/ItemList';
import { LearnSkillData } from '@drpg/core/returnTypes/Dinoz';
import { getMaxXp, getRace } from '@drpg/core/utils/DinozUtils';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import {
	$Enums,
	Dinoz,
	DinozItem,
	DinozSkill,
	DinozSkillUnlockable,
	DinozStatus,
	LogType,
	PantheonMotif,
	Player
} from '@drpg/prisma';
import { Request } from 'express';
import gameConfig from '../config/game.config.js';
import { GLOBAL } from '../context.js';
import {
	getAllDinozFromAccount,
	getDinozForLevelUp,
	getDinozSkillsLearnableAndUnlockable,
	getDinozToReincarnate,
	getEventDinozForLevelUp,
	getFollowingDinoz,
	isDinozInTournament,
	tournamentDinoz,
	updateDinoz,
	updateEventDinoz
} from '../dao/dinozDao.js';
import { removeAllMissionsFromDinoz } from '../dao/dinozMissionDao.js';
import { addSkillToDinoz, removeAllSkillFromDinoz } from '../dao/dinozSkillDao.js';
import {
	addMultipleUnlockableSkills,
	removeAllUnlockableSkillsFromDinoz,
	removeUnlockableSkillsFromDinoz
} from '../dao/dinozSkillUnlockableDao.js';
import { addStatusToDinoz, removeAllStatusFromDinoz } from '../dao/dinozStatusDao.js';
import { createLog } from '../dao/logDao.js';
import { auth, getPlayerUSkills, setPlayer } from '../dao/playerDao.js';
import { updatePoints } from '../dao/rankingDao.js';
import { setSpecificStat } from '../dao/trackingDao.js';
import { prisma } from '../prisma.js';
import { checkAnnounce } from '../utils/announcer.js';
import {
	getDinozUpChance,
	getLearnableSkills,
	getRandomUpElement,
	getUnlockableSkills,
	reincarnateDinoz
} from '../utils/dinoz.js';
import { applySkillToDinoz, applyUSkillEffect, computeUSkillEffects, fromBase62 } from '../utils/index.js';
import TournamentManager from '../utils/tournamentManager.js';
import translate from '../utils/translate.js';
import { checkFBCreation } from './forceBruteService.js';
import GameDinozUsage = $Enums.GameDinozUsage;

/**
 * @summary Get all learnables and unlockables skills
 *
 * @param req
 * @param event
 * @param req.params.id {string} Dinoz id
 * @param req.params.tryNumber {number} Number of level up try (From 1 to 2)
 *
 * @returns Partial<DinozSkillOwnAndUnlockable> | undefined>
 */
export async function getLearnableAndUnlockableSkills(req: Request, event?: GameDinozUsage) {
	const dinozId = +req.params.id;

	const authed = await auth(req);
	let dinozSkills;

	if (event) {
		dinozSkills = await getEventDinozForLevelUp(dinozId);
	} else {
		dinozSkills = await getDinozForLevelUp(dinozId);
	}

	if (!dinozSkills) {
		throw new ExpectedError(translate('dinozNotFound', authed, { id: dinozId }));
	}
	const tournament = await TournamentManager.getCurrentTournamentState(prisma);
	const dinozTournament = await isDinozInTournament(dinozId);

	const canLevelUp = !tournament || !dinozTournament || dinozSkills.level + 1 <= tournament.levelLimit;
	if (!canLevelUp) {
		throw new ExpectedError(translate('dinozCannotLvlUp', authed, { id: dinozId }));
	}

	if (!dinozSkills.player || dinozSkills.player.id !== authed.id) {
		throw new ExpectedError(`Dinoz ${dinozId} doesn't belong to player ${authed.id}`);
	}

	if (dinozSkills.canChangeName) {
		throw new ExpectedError(`Dinoz has to be named.`);
	}

	const dinozRace = Object.values(raceList).find(race => race.raceId === dinozSkills.raceId);

	if (!dinozRace) {
		throw new ExpectedError(`Dinoz race ${dinozSkills.raceId} doesn't exist.`);
	}

	return getDinozLearnableSkills(req, dinozSkills, dinozRace, dinozId, +req.params.tryNumber, event);
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
export async function learnSkill(req: Request, event?: GameDinozUsage): Promise<LearnSkillData> {
	const authed = await auth(req);
	const dinozId = +req.params.id;
	const skillIdList = req.body.skillIdList as number[];
	const result: LearnSkillData = {
		newMaxExperience: 0,
		discoveredSkill: 0
	};

	let dinozSkills;
	if (event) {
		dinozSkills = await getEventDinozForLevelUp(dinozId);
	} else {
		dinozSkills = await getDinozForLevelUp(dinozId);
	}

	if (!dinozSkills) {
		throw new ExpectedError(translate('dinozNotFound', authed, { id: dinozId }));
	}
	if (!dinozSkills.player || dinozSkills.player.id !== authed.id) {
		throw new ExpectedError(`Dinoz ${dinozId} doesn't belong to player ${authed.id}`);
	}

	let canLevelUp = false;
	if (event) {
		const dinoz = await tournamentDinoz(dinozId);
		if (!dinoz.FBTournament) {
			throw new Error(`No FBTournament found`);
		}
		canLevelUp = dinoz.level < dinoz.FBTournament.levelLimit;
	} else {
		const tournament = await TournamentManager.getCurrentTournamentState(prisma);
		const dinozTournament = await isDinozInTournament(dinozId);

		canLevelUp = !tournament || !dinozTournament || dinozSkills.level + 1 <= tournament.levelLimit;
	}
	if (!canLevelUp) {
		throw new ExpectedError(translate('dinozCannotLvlUp', authed, { id: dinozId }));
	}

	if (dinozSkills.canChangeName) {
		throw new ExpectedError(`Dinoz has to be named.`);
	}

	const dinozRace = Object.values(raceList).find(race => race.raceId === dinozSkills.raceId);

	if (!dinozRace) {
		throw new ExpectedError(`Dinoz race ${dinozSkills.raceId} doesn't exist.`);
	}

	const skills = getDinozLearnableSkills(req, dinozSkills, dinozRace, dinozId, parseInt(req.body.tryNumber), event);

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
		await removeUnlockableSkillsFromDinoz(dinozId, skillIdList, event);
	} else {
		const skill = Object.values(skillList).find(skill => skill.id === skillIdList[0]);
		if (!skill) {
			throw new ExpectedError(`Skill ${skillIdList[0]} doesn't exist.`);
		}
		await applySkillEffect(dinozSkills, skill, authed.id, event);
		await addSkillToDinoz(dinozId, skillIdList[0], event);

		// Leave party if the skill is Brave
		if (skill.id === Skill.BRAVE && !event) {
			const dinoz = await getFollowingDinoz(dinozId);
			if (dinoz && dinoz.followers.length > 0) {
				for (const d of dinoz.followers) {
					await updateDinoz(d.id, { leader: { disconnect: true } });
				}
			} else if (dinoz && dinoz.leaderId) {
				await updateDinoz(dinozId, { leader: { disconnect: true } });
			}
		}

		// Discover skill for player
		if (!dinozSkills.player.discoveredSkills.includes(skill.id)) {
			await setPlayer(dinozSkills.player.id, {
				discoveredSkills: [...dinozSkills.player.discoveredSkills, skill.id]
			});

			result.discoveredSkill = skill.id;
		}

		// Get all new unlockables skills
		// First filter : get skills that required skill send in body to be learn
		// Second filter : Keep only skills that dinoz can learn (dinoz have every unlock condition)
		// Third filter : Remove race skills (ex : fly from Pteroz)
		const newUnlockableSkills = Object.values(skillList)
			.filter(skill => skill.unlockedFrom?.some(skillId => skillIdList.includes(skillId)))
			.filter(skill =>
				skill.unlockedFrom?.every(
					skillId =>
						skillIdList.includes(skillId) || dinozSkills.skills.some(dinozSkill => dinozSkill.skillId === skillId)
				)
			)
			.filter(skill => !skill.raceId || skill.raceId.includes(dinozSkills.raceId))
			.map(skill => {
				if (event) {
					return {
						skillId: skill.id,
						gameDinozId: dinozId
					};
				} else {
					return { skillId: skill.id, dinozId };
				}
			});

		// Add skill to dinoz in order to have same data than database.
		dinozSkills.skills.push({
			skillId: skillIdList[0]
		});

		await addMultipleUnlockableSkills(newUnlockableSkills);
	}

	const newDinozData = getNewDinozDataFromLevelUp(dinozId, parseInt(req.body.tryNumber), dinozSkills, dinozRace);

	if (event) {
		await updateEventDinoz(newDinozData.id, newDinozData);
		result.newMaxExperience = 1;
		return result;
	}
	await updateDinoz(newDinozData.id, newDinozData);

	if (newDinozData.level % 10 === 0) {
		checkAnnounce(PantheonMotif.race, newDinozData.id.toString(), newDinozData.display);
	}

	// Update player points
	await updatePoints(dinozSkills.player.id, 1);

	await createLog(LogType.LevelUp, dinozSkills.player.id, dinozSkills.id, newDinozData.level.toString());

	result.newMaxExperience = levelList.find(level => level.id === dinozSkills.level + 1)?.experience ?? 0;

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

	await checkFBCreation(dinozSkills.level + 1);

	return result;
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
		| 'name'
		| 'display'
	> & {
		player: Pick<Player, 'id'> | null;
		skills: Pick<DinozSkill, 'skillId'>[];
		items: Pick<DinozItem, 'itemId'>[];
		status: Pick<DinozStatus, 'statusId'>[];
		unlockableSkills: Pick<DinozSkillUnlockable, 'skillId'>[];
	},
	race: DinozRace,
	dinozId: number,
	tryNumber: number,
	event?: GameDinozUsage
) {
	if (dinoz.level === gameConfig.dinoz.maxLevel) {
		throw new ExpectedError(`Dinoz ${dinozId} is already at max level.`);
	}

	const level = levelList.find(level => level.id === dinoz.level);
	if (!level) {
		throw new ExpectedError(`Level ${dinoz.level} doesn't exist.`);
	}
	const maxExperience = level.experience;

	if (dinoz.experience < maxExperience && !event) {
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
		upChance: race.upChance,
		name: dinoz.name,
		display: dinoz.display,
		level: dinoz.level
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

	const upChance = getDinozUpChance(allLearnableSkills, allUnlockableSkills, dinozRace);

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
	playerId: string,
	event?: GameDinozUsage
) {
	if (skill.effects) {
		const updates = applySkillToDinoz(skill.effects, dinoz);
		if (event) {
			await updateEventDinoz(dinoz.id, updates);
		} else {
			await updateDinoz(dinoz.id, updates);
		}
	}
	if (playerId && skill.type === SkillType.U && !event) {
		const player = await getPlayerUSkills(playerId);
		if (!player) {
			throw new ExpectedError(`This player doesn't exist.`);
		}
		applyUSkillEffect(player, skill);
		await setPlayer(playerId, player);
	}
}

/**
 * Update player U skills based on its dinoz skills
 *
 * @param playerId the playerId to update
 */
export async function computeUSkillsForPlayer(playerId: string) {
	// Get player with its U skills
	const player = await getPlayerUSkills(playerId);
	if (!player) {
		throw new ExpectedError(`This player doesn't exist.`);
	}
	// Get player dinoz list
	const dinozList = await getAllDinozFromAccount(playerId);
	const skills = dinozList.flatMap(dinoz => dinoz.skills).map(skill => skill.skillId);
	// Compute player U skills using dinoz skills
	computeUSkillEffects(player, skills);
	await setPlayer(playerId, player);
}

export async function reincarnate(req: Request) {
	const dinozId: number = +req.params.id;
	const authed = await auth(req);

	const dinoz = await getDinozToReincarnate(dinozId);

	if (!dinoz) {
		throw new ExpectedError(translate('dinozNotFound', authed, { id: dinozId }));
	}

	if (
		!dinoz.skills.some(s => s.skillId === Skill.REINCARNATION) ||
		dinoz.level < 40 ||
		dinoz.status.some(s => s.statusId === DinozStatusId.REINCARNATION)
	) {
		throw new ExpectedError(translate('reincarnationNotPossible', authed, { id: dinozId }));
	}

	// 🔎 Check if the dinoz has any equipped items before reincarnation and prevent reincarnation if it has any
	const equippedItems = dinoz.items.filter(i => i.itemId);
	if (equippedItems && equippedItems.length > 0) {
		throw new ExpectedError(translate('reincarnationWithEquippedItems', authed, { id: dinozId }));
	}

	const race = getRace(dinoz);

	await updateDinoz(dinoz.id, reincarnateDinoz(race, dinoz.display, dinoz.seed));

	// Note: remove all skills *before*  going through the promises because the removal may conflict with adding back the race native skills.
	await removeAllSkillFromDinoz(dinoz.id);

	const promises = [];
	if (race.skillId && race.skillId.length > 0) {
		for (const skill of race.skillId) {
			promises.push(addSkillToDinoz(dinoz.id, skill));
		}
	}
	promises.push(removeAllStatusFromDinoz(dinoz.id));
	promises.push(removeAllMissionsFromDinoz(dinoz.id));
	promises.push(removeAllUnlockableSkillsFromDinoz(dinoz.id));
	promises.push(updatePoints(authed.id, -dinoz.level));
	promises.push(computeUSkillsForPlayer(authed.id));
	await Promise.all(promises);

	await addStatusToDinoz(dinozId, DinozStatusId.REINCARNATION);
}
