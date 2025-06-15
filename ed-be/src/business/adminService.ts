import { Request } from 'express';
import { getAllDinozFromAccount, getDinozForDojoFight, getDinozForSkillEffect, updateDinoz } from '../dao/dinozDao.js';
import { addMultipleSkillToDinoz, removeSkillFromDinoz } from '../dao/dinozSkillDao.js';
import { addMultipleStatusToDinoz, removeStatusFromDinoz } from '../dao/dinozStatusDao.js';
import {
	addMoney,
	auth,
	getAllInformationFromPlayer,
	getEternalTwinId,
	getPlayerDinozInformationForTeam,
	getPlayerUSkills,
	removeMoney,
	setPlayer
} from '../dao/playerDao.js';
import { addMultipleRewardToPlayer, addRewardToPlayer, removeRewardFromPlayer } from '../dao/playerRewardsDao.js';
import { addNewSecret, getAllSecretsRequest } from '../dao/secretDao.js';
import { decreaseItemQuantity, increaseItemQuantity, setMultipleItem } from '../dao/playerItemDao.js';
import { decreaseIngredientQuantity, increaseIngredientQuantity } from '../dao/playerIngredientDao.js';
import { decreaseQuestProgression, increaseQuestProgression } from '../dao/questsDao.js';
import { createLog } from '../dao/logDao.js';
import { AdminRole, LogType, OfferStatus } from '@drpg/prisma';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { ModerationAdminType } from '@drpg/core/models/admin/ModerationType';
import { GLOBAL, LOGGER } from '../context.js';
import { prisma } from '../prisma.js';
import { Reward } from '@drpg/core/models/reward/RewardList';
import { calculateFightBetweenPlayers } from './fightService.js';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { Skill } from '@drpg/core/models/dinoz/SkillList';
import { DinozToGetFighter } from '@drpg/core/models/fight/FightConfiguration';
import { Item } from '@drpg/core/models/item/ItemList';
import { addMultipleUnlockableSkills, removeUnlockableSkillsFromDinoz } from '../dao/dinozSkillUnlockableDao.js';
import { skillList } from '@drpg/core/models/dinoz/SkillList';
import { applySkillToDinoz, deApplySkillFromDinoz } from '../utils/skillParser.js';
import { Job, scheduledJobs } from 'node-schedule';

/**
 * @summary Check if user can access the admin dashboard
 * @param req
 * @return boolean
 */
export async function getAdminDashBoard(req: Request): Promise<boolean> {
	await auth(req);
	return true;
}

/**
 * @summary Edit most of the element from a dinoz
 * @param req
 * @param req.params.id {string} DinozId
 * @param req.body.name {string} New Dinoz name
 * @param req.body.unavailableReason {string} Dinoz is unavailable or not
 * @param req.body.unavailableReasonOperation {string} Operation done to unavailableReason (add or remove)
 * @param req.body.level {number} New Dinoz level
 * @param req.body.placeId {number} New Dinoz placeId
 * @param req.body.canChangeName {boolean} Can change its name or not
 * @param req.body.life {number} New Dinoz life
 * @param req.body.maxLife {number} New Dinoz maximum life
 * @param req.body.experience {number} New Dinoz experience
 * @param req.body.nbrUpFire {number} New fire up for dinoz
 * @param req.body.nbrUpWood {number} New wood up for dinoz
 * @param req.body.nbrUpWater {number} New new water up for dinoz
 * @param req.body.nbrUpLightning {number} New lightning up for dinoz
 * @param req.body.nbrUpAir {number} New air up for dinoz
 * @param req.body.addStatus {number} Status to add to the dinoz
 * @param req.body.removeStatus {number} Status to remove to the dinoz
 * @param req.body.addSkill {number} Skill to add to the dinoz
 * @param req.body.removeSkill {number} Skill to remove to the dinoz
 * @param req.body.addUnlockableSkill {number} Unlockable skill to add to the dinoz
 * @param req.body.removeUnlockableSkill {number} Unlockable skill to remove to the dinoz
 */
export async function editDinoz(req: Request) {
	const authed = await auth(req);

	let unavailableReason;

	switch (req.body.unavailableReasonOperation) {
		case 'add':
			unavailableReason = req.body.unavailableReason;
			break;
		case 'remove':
			unavailableReason = null;
			break;
		case '':
		// Do nothing
	}

	const dinoz = {
		name: req.body.name,
		canChangeName: req.body.canChangeName,
		unavailableReason: unavailableReason,
		level: req.body.level,
		placeId: req.body.placeId,
		life: req.body.life,
		maxLife: req.body.maxLife,
		experience: req.body.experience,
		nbrUpFire: req.body.nbrUpFire,
		nbrUpWood: req.body.nbrUpWood,
		nbrUpWater: req.body.nbrUpWater,
		nbrUpLightning: req.body.nbrUpLightning,
		nbrUpAir: req.body.nbrUpAir
	};

	await updateDinoz(+req.params.id, dinoz);

	if (typeof dinoz.name !== 'undefined') {
		await createLog(LogType.AdminUpdateDinoz, authed.id, +req.params.id, 'name', dinoz.name);
	}
	if (typeof dinoz.canChangeName !== 'undefined') {
		await createLog(LogType.AdminUpdateDinoz, authed.id, +req.params.id, 'canChangeName', dinoz.canChangeName);
	}
	if (typeof dinoz.unavailableReason !== 'undefined' && dinoz.unavailableReason !== null) {
		await createLog(LogType.AdminUpdateDinoz, authed.id, +req.params.id, 'unavailableReason', dinoz.unavailableReason);
	}
	if (typeof dinoz.level !== 'undefined') {
		await createLog(LogType.AdminUpdateDinoz, authed.id, +req.params.id, 'level', dinoz.level);
	}
	if (typeof dinoz.placeId !== 'undefined') {
		await createLog(LogType.AdminUpdateDinoz, authed.id, +req.params.id, 'placeId', dinoz.placeId);
	}
	if (typeof dinoz.life !== 'undefined') {
		await createLog(LogType.AdminUpdateDinoz, authed.id, +req.params.id, 'life', dinoz.life);
	}
	if (typeof dinoz.maxLife !== 'undefined') {
		await createLog(LogType.AdminUpdateDinoz, authed.id, +req.params.id, 'maxLife', dinoz.maxLife);
	}
	if (typeof dinoz.experience !== 'undefined') {
		await createLog(LogType.AdminUpdateDinoz, authed.id, +req.params.id, 'experience', dinoz.experience);
	}
	if (typeof dinoz.nbrUpFire !== 'undefined') {
		await createLog(LogType.AdminUpdateDinoz, authed.id, +req.params.id, 'nbrUpFire', dinoz.nbrUpFire);
	}
	if (typeof dinoz.nbrUpWood !== 'undefined') {
		await createLog(LogType.AdminUpdateDinoz, authed.id, +req.params.id, 'nbrUpWood', dinoz.nbrUpWood);
	}
	if (typeof dinoz.nbrUpWater !== 'undefined') {
		await createLog(LogType.AdminUpdateDinoz, authed.id, +req.params.id, 'nbrUpWater', dinoz.nbrUpWater);
	}
	if (typeof dinoz.nbrUpLightning !== 'undefined') {
		await createLog(LogType.AdminUpdateDinoz, authed.id, +req.params.id, 'nbrUpLightning', dinoz.nbrUpLightning);
	}
	if (typeof dinoz.nbrUpAir !== 'undefined') {
		await createLog(LogType.AdminUpdateDinoz, authed.id, +req.params.id, 'nbrUpAir', dinoz.nbrUpAir);
	}

	const statusListAsString: string[] = req.body.status;
	const statusList = statusListAsString.map(status => +status);
	if (statusList.length > 0 && req.body.statusOperation) {
		switch (req.body.statusOperation) {
			case 'add':
				await addMultipleStatusToDinoz(+req.params.id, statusList);

				for (const status of statusList) {
					await createLog(LogType.AdminAddStatus, authed.id, +req.params.id, status);
				}
				break;
			case 'remove':
				for (const status of statusList) {
					await removeStatusFromDinoz(parseInt(req.params.id), status);

					await createLog(LogType.AdminRemoveStatus, authed.id, +req.params.id, status);
				}
				break;
			default:
				throw new ExpectedError(`You need to select an operation.`);
		}
	}

	const skillsToHandle: number[] = req.body.skills;
	if (skillsToHandle.length > 0 && req.body.skillOperation) {
		const dinozId = +req.params.id;
		const dinoz = await getDinozForSkillEffect(dinozId);

		if (!dinoz) {
			throw new ExpectedError(`Dinoz ${dinozId} does not exist`);
		}

		switch (req.body.skillOperation) {
			case 'add':
				await addMultipleSkillToDinoz(dinozId, skillsToHandle);

				for (const skill of skillsToHandle) {
					const skillDetail = Object.values(skillList).find(s => s.id === skill);
					if (!skillDetail) {
						throw new ExpectedError(`Skill ${skill} doesn't exist.`);
					}
					if (skillDetail.effects) {
						const updates = applySkillToDinoz(skillDetail.effects, dinoz);
						await updateDinoz(dinozId, updates);
					}
					await createLog(LogType.AdminAddSkill, authed.id, dinozId, skill);
				}
				break;
			case 'remove':
				const promises = skillsToHandle.map(skill => removeSkillFromDinoz(dinozId, skill));
				await Promise.all(promises);

				for (const skill of skillsToHandle) {
					const skillDetail = Object.values(skillList).find(s => s.id === skill);
					if (!skillDetail) {
						throw new ExpectedError(`Skill ${skill} doesn't exist.`);
					}
					if (skillDetail.effects) {
						const updates = deApplySkillFromDinoz(skillDetail.effects, dinoz);
						await updateDinoz(dinozId, updates);
					}
					await createLog(LogType.AdminRemoveSkill, authed.id, dinozId, skill);
				}
				break;
			default:
				throw new ExpectedError(`You need to select an operation.`);
		}
	}

	const unlockableSkillList: number[] = req.body.unlockableSkills;
	if (unlockableSkillList.length > 0 && req.body.unlockableSkillOperation) {
		switch (req.body.unlockableSkillOperation) {
			case 'add':
				const unlockableSkillListData = unlockableSkillList.map(s => ({
					skillId: s,
					dinozId: +req.params.id
				}));
				await addMultipleUnlockableSkills(unlockableSkillListData);

				for (const skill of unlockableSkillList) {
					await createLog(LogType.AdminAddUnlockableSkill, authed.id, +req.params.id, skill);
				}
				break;
			case 'remove':
				await removeUnlockableSkillsFromDinoz(+req.params.id, unlockableSkillList);

				for (const skill of unlockableSkillList) {
					await createLog(LogType.AdminRemoveUnlockableSkill, authed.id, +req.params.id, skill);
				}
				break;
			default:
				throw new ExpectedError(`You need to select an operation.`);
		}
	}
}

/**
 * @summary Add or remove gold to a player
 * @param req
 * @param req.params.id {number} PlayerId
 * @param req.body.operation {string} Operation to be realised (add or remove)
 * @param req.body.epic {number} Quantity of gold
 * @return string
 */
export async function setPlayerMoney(req: Request) {
	const authed = await auth(req);

	const player = await getEternalTwinId(req.params.id);
	if (!player) {
		throw new ExpectedError(`Player ${req.params.id} doesn't exist.`);
	}
	let newMoney = 0;
	switch (req.body.operation) {
		case 'add':
			await createLog(LogType.AdminAddMoney, authed.id, undefined, req.params.id, req.body.gold);
			newMoney = (await addMoney(req.params.id, +req.body.gold)).money;
			break;
		case 'remove':
			await createLog(LogType.AdminRemoveMoney, authed.id, undefined, req.params.id, req.body.gold);
			newMoney = (await removeMoney(req.params.id, +req.body.gold)).money;
			break;
		default:
			throw new ExpectedError(`You need to select an operation.`);
	}

	return newMoney.toString();
}

/**
 * @summary Add or remove epic reward to a player
 * @param req
 * @param req.params.id {number} PlayerId
 * @param req.body.operation {string} Operation to be realised (add or remove)
 * @param req.body.epic {number} Id of the Epic reward
 * @return void
 */
export async function givePlayerEpicReward(req: Request): Promise<void> {
	const authed = await auth(req);

	const rewardList: number[] = req.body.epicRewardId;
	switch (req.body.operation) {
		case 'add':
			await addMultipleRewardToPlayer(
				rewardList.map(reward => ({
					playerId: req.params.id,
					rewardId: +reward
				}))
			);

			for (const reward of rewardList) {
				await createLog(LogType.AdminAddReward, authed.id, undefined, req.params.id, reward);
			}
			break;
		case 'remove':
			const promises = rewardList.map(reward => removeRewardFromPlayer(req.params.id, +reward));
			await Promise.all(promises);

			for (const reward of rewardList) {
				await createLog(LogType.AdminRemoveReward, authed.id, undefined, req.params.id, reward);
			}
			break;
		default:
			throw new ExpectedError(`You need to select an operation.`);
	}
}

/**
 * @summary Add, remove, or modify item quantities for a player
 * @param req
 * @param req.params.id {number} PlayerId
 * @param req.body.operation {string} Operation to be realized (increase, decrease)
 * @param req.body.items {Array<{id: number, quantity: number}>} List of items and their quantities
 * @return void
 */
export async function modifyPlayerItems(req: Request): Promise<void> {
	const authed = await auth(req);

	const items: { id: number; quantity: number }[] = req.body.items;
	switch (req.body.operation) {
		case 'increase':
			for (const item of items) {
				await increaseItemQuantity(req.params.id, item.id, item.quantity);
				await createLog(LogType.AdminAddItem, authed.id, undefined, req.params.id, item.id, item.quantity);
			}
			break;
		case 'decrease':
			for (const item of items) {
				await decreaseItemQuantity(req.params.id, item.id, item.quantity);
				await createLog(LogType.AdminRemoveItem, authed.id, undefined, req.params.id, item.id, item.quantity);
			}
			break;
		default:
			throw new ExpectedError(`You need to select a valid operation.`);
	}
}

/**
 * @summary Add, remove, or modify ingredients quantities for a player
 * @param req
 * @param req.params.id {number} PlayerId
 * @param req.body.operation {string} Operation to be realized (increase, decrease)
 * @param req.body.ingredients {Array<{id: number, quantity: number}>} List of ingredients and their quantities
 * @return void
 */
export async function modifyPlayerIngredients(req: Request): Promise<void> {
	const authed = await auth(req);

	const ingredients: { id: number; quantity: number }[] = req.body.ingredients;
	switch (req.body.operation) {
		case 'increase':
			for (const ing of ingredients) {
				await increaseIngredientQuantity(req.params.id, ing.id, ing.quantity);
				await createLog(LogType.AdminAddIngredient, authed.id, undefined, req.params.id, ing.id, ing.quantity);
			}
			break;
		case 'decrease':
			for (const ing of ingredients) {
				await decreaseIngredientQuantity(req.params.id, ing.id, ing.quantity);
				await createLog(LogType.AdminRemoveIngredient, authed.id, undefined, req.params.id, ing.id, ing.quantity);
			}
			break;
		default:
			throw new ExpectedError(`You need to select a valid operation.`);
	}
}

/**
 * @summary Update quest progression for a player
 * @param req
 * @param req.params.id {number} PlayerId
 * @param req.body.questId {number} Quest ID to be updated
 * @param req.body.progression {number} New progression value for the quest
 * @return void
 */
export async function updatePlayerQuestProgression(req: Request): Promise<void> {
	const authed = await auth(req);

	const quests: { questId: number; progression: number }[] = req.body.quests;
	// Validate questId and progression
	if (quests === undefined) {
		throw new ExpectedError(`Quest ID and progression are required.`);
	}
	switch (req.body.operation) {
		case 'increase':
			for (const q of quests) {
				await increaseQuestProgression(req.params.id, q.questId, q.progression);
				await createLog(LogType.AdminUpdateQuest, authed.id, undefined, req.params.id, q.questId, q.progression);
			}
			break;
		case 'decrease':
			for (const q of quests) {
				await decreaseQuestProgression(req.params.id, q.questId, q.progression);
				await createLog(LogType.AdminUpdateQuest, authed.id, undefined, req.params.id, q.questId, q.progression);
			}
			break;
		default:
			throw new ExpectedError(`You need to select a valid operation.`);
	}
}

/**
 * @summary List all dinoz from a player
 * @param req
 * @param req.params.id {string} PlayerId
 */
export async function listAllDinozFromPlayer(req: Request) {
	const dinozList = await getAllDinozFromAccount(req.params.id);
	const dinozListToSend = dinozList.map(dinoz => {
		return {
			id: dinoz.id,
			name: dinoz.name,
			unavailableReason: dinoz.unavailableReason,
			level: dinoz.level,
			canChangeName: dinoz.canChangeName,
			leaderId: dinoz.leaderId,
			life: dinoz.life,
			maxLife: dinoz.maxLife,
			experience: dinoz.experience,
			placeId: dinoz.placeId,
			nbrUpFire: dinoz.nbrUpFire,
			nbrUpWood: dinoz.nbrUpWood,
			nbrUpWater: dinoz.nbrUpWater,
			nbrUpLightning: dinoz.nbrUpLightning,
			nbrUpAir: dinoz.nbrUpAir,
			status: dinoz.status.map(status => status.statusId),
			skills: dinoz.skills.map(skill => skill.skillId),
			unlockableSkills: dinoz.unlockableSkills.map(skill => skill.skillId)
		};
	});
	return dinozListToSend;
}

/**
 * @summary Edit a selected player
 * @param req
 * @param req.params.id {number} PlayerId
 * @param req.body.customText {string}
 * @param req.body.quetzuBought {number}
 * @param req.body.warLord {boolean}
 * @param req.body.leader {boolean}
 * @param req.body.engineer {boolean}
 * @param req.body.cooker {boolean}
 * @param req.body.shopKeeper {boolean}
 * @param req.body.merchant {boolean}
 * @param req.body.priest {boolean}
 * @param req.body.teacher {boolean}
 * @param req.body.messie {boolean}
 * @param req.body.matelasseur {boolean}
 * @param req.body.role {"admin" | "beta" | "player"}
 */
export async function editPlayer(req: Request) {
	const authed = await auth(req);

	let role;
	switch (req.body.role) {
		case 'admin':
			role = AdminRole.ADMIN;
			break;
		case 'beta':
			role = AdminRole.BETA;
			break;
		case 'player':
			role = AdminRole.PLAYER;
			break;
		default:
			role = undefined;
	}

	const player = {
		customText: req.body.customText,
		quetzuBought: req.body.quetzuBought,
		dailyGridRewards: req.body.dailyGridRewards,
		warLord: req.body.warLord,
		leader: req.body.leader,
		engineer: req.body.engineer,
		cooker: req.body.cooker,
		shopKeeper: req.body.shopKeeper,
		merchant: req.body.merchant,
		priest: req.body.priest,
		teacher: req.body.teacher,
		messie: req.body.messie,
		matelasseur: req.body.matelasseur,
		role: role
	};

	await setPlayer(req.params.id, player);

	if (typeof player.customText !== 'undefined') {
		await createLog(LogType.AdminUpdatePlayer, authed.id, undefined, req.params.id, 'customText', player.customText);
	}
	if (typeof player.quetzuBought !== 'undefined') {
		await createLog(
			LogType.AdminUpdatePlayer,
			authed.id,
			undefined,
			req.params.id,
			'quetzuBought',
			player.quetzuBought
		);
	}
	if (typeof player.dailyGridRewards !== 'undefined') {
		await createLog(
			LogType.AdminUpdatePlayer,
			authed.id,
			undefined,
			req.params.id,
			'dailyGridRewards',
			player.dailyGridRewards
		);
	}
	if (typeof player.warLord !== 'undefined') {
		await createLog(LogType.AdminUpdatePlayer, authed.id, undefined, req.params.id, 'warLord', player.warLord);
	}
	if (typeof player.leader !== 'undefined') {
		await createLog(LogType.AdminUpdatePlayer, authed.id, undefined, req.params.id, 'leader', player.leader);
	}
	if (typeof player.engineer !== 'undefined') {
		await createLog(LogType.AdminUpdatePlayer, authed.id, undefined, req.params.id, 'engineer', player.engineer);
	}
	if (typeof player.cooker !== 'undefined') {
		await createLog(LogType.AdminUpdatePlayer, authed.id, undefined, req.params.id, 'cooker', player.cooker);
	}
	if (typeof player.shopKeeper !== 'undefined') {
		await createLog(LogType.AdminUpdatePlayer, authed.id, undefined, req.params.id, 'shopKeeper', player.shopKeeper);
	}
	if (typeof player.merchant !== 'undefined') {
		await createLog(LogType.AdminUpdatePlayer, authed.id, undefined, req.params.id, 'merchant', player.merchant);
	}
	if (typeof player.priest !== 'undefined') {
		await createLog(LogType.AdminUpdatePlayer, authed.id, undefined, req.params.id, 'priest', player.priest);
	}
	if (typeof player.teacher !== 'undefined') {
		await createLog(LogType.AdminUpdatePlayer, authed.id, undefined, req.params.id, 'teacher', player.teacher);
	}
	if (typeof player.messie !== 'undefined') {
		await createLog(LogType.AdminUpdatePlayer, authed.id, undefined, req.params.id, 'messie', player.messie);
	}
	if (typeof player.matelasseur !== 'undefined') {
		await createLog(LogType.AdminUpdatePlayer, authed.id, undefined, req.params.id, 'matelasseur', player.matelasseur);
	}
}

/**
 * @summary List all information from a player
 * @param req
 * @param req.params.id {number} PlayerId
 */
export async function listAllPlayerInformationForAdminDashboard(req: Request) {
	const player = await getAllInformationFromPlayer(req.params.id);
	if (!player) {
		throw new ExpectedError(`Player ${req.params.id} doesn't exist.`);
	}

	return player;
}

/**
 * @summary Get all secrets stored
 */
export async function getAllSecrets() {
	const secrets = await getAllSecretsRequest();
	const response = secrets.map(secret => {
		return {
			key: secret.key,
			value: secret.value
		};
	});
	return response;
}

/**
 * @summary Add a secret to the store
 */
export async function addSecret(req: Request) {
	const authed = await auth(req);

	await addNewSecret({
		key: req.body.key,
		value: req.body.value
	});
	const secrets = await getAllSecretsRequest();

	await createLog(LogType.AdminUpdateSecret, authed.id, undefined, req.body.key, req.body.value);

	return secrets;
}

export async function truncateAll(req: Request) {
	const authed = await auth(req);
	const superAdmin = authed.id === GLOBAL.config.administrator;
	if (!superAdmin) {
		LOGGER.error(`${authed.id} attempted to truncate the game !`);
		throw new ExpectedError(`Forbiden for you`);
	}

	try {
		await prisma.$executeRaw`BEGIN;`;

		await prisma.$executeRaw`SET CONSTRAINTS ALL DEFERRED;`;

		await prisma.$executeRaw`TRUNCATE TABLE "Clan" CASCADE;`;
		await prisma.$executeRaw`TRUNCATE TABLE "Conversation" CASCADE;`;
		await prisma.$executeRaw`DELETE FROM dinoz;`;
		await prisma.$executeRaw`TRUNCATE TABLE dojo CASCADE;`;
		await prisma.$executeRaw`TRUNCATE TABLE "FBTournament" CASCADE;`;
		await prisma.$executeRaw`TRUNCATE TABLE "FightArchive" CASCADE;`;
		await prisma.$executeRaw`TRUNCATE TABLE gamedinoz CASCADE;`;
		await prisma.$executeRaw`TRUNCATE TABLE "Log" CASCADE;`;
		await prisma.$executeRaw`DELETE FROM "Moderation";`;
		await prisma.$executeRaw`TRUNCATE TABLE news;`;
		await prisma.$executeRaw`TRUNCATE TABLE "Notification" CASCADE;`;
		await prisma.$executeRaw`TRUNCATE TABLE "Offer" CASCADE;`;
		await prisma.$executeRaw`TRUNCATE TABLE "Pantheon" CASCADE;`;
		await prisma.$executeRaw`TRUNCATE TABLE player_dinoz_shop CASCADE;`;
		await prisma.$executeRaw`TRUNCATE TABLE player_gather CASCADE;`;
		await prisma.$executeRaw`TRUNCATE TABLE player_ingredient CASCADE;`;
		await prisma.$executeRaw`TRUNCATE TABLE player_item CASCADE;`;
		await prisma.$executeRaw`TRUNCATE TABLE player_quest CASCADE;`;
		await prisma.$executeRaw`TRUNCATE TABLE player_reward CASCADE;`;
		await prisma.$executeRaw`TRUNCATE TABLE "playerTracking" CASCADE;`;
		await prisma.$executeRaw`TRUNCATE TABLE "Tournament" CASCADE;`;
		await prisma.$executeRaw`TRUNCATE TABLE "UsernameHistory";`;

		await prisma.$executeRaw`SET CONSTRAINTS ALL IMMEDIATE;`;

		await prisma.$executeRaw`COMMIT;`;

		LOGGER.log('Remise à zéro du jeu effectuée');
	} catch (error) {
		console.error('Erreur lors de la suppression des données:', error);
		try {
			await prisma.$executeRaw`ROLLBACK;`;
		} catch (rollbackError) {
			console.error('Erreur lors du rollback:', rollbackError);
		}
	}

	const players = await prisma.player.updateManyAndReturn({
		data: {
			money: 50000,
			quetzuBought: 0,
			leader: false,
			engineer: false,
			cooker: false,
			shopKeeper: false,
			merchant: false,
			priest: false,
			teacher: false,
			matelasseur: false,
			messie: false,
			labruteDone: false,
			dailyGridRewards: 0,
			createdDate: new Date()
		}
	});
	await prisma.ranking.updateMany({
		data: {
			dinozCount: 0,
			points: 0,
			average: 0,
			completion: 0,
			dojo: 0
		}
	});
	for (const player of players) {
		await addRewardToPlayer({
			rewardId: Reward.BETA,
			player: { connect: { id: player.id } }
		});
		await setMultipleItem([
			{
				itemId: Item.POTION_IRMA,
				quantity: 30,
				playerId: player.id
			},
			{
				itemId: Item.CLOUD_BURGER,
				quantity: 5,
				playerId: player.id
			},
			{
				itemId: Item.MEAT_PIE,
				quantity: 2,
				playerId: player.id
			},
			{
				itemId: Item.FIGHT_RATION,
				quantity: 2,
				playerId: player.id
			},
			{
				itemId: Item.HOT_BREAD,
				quantity: 1,
				playerId: player.id
			},
			{
				itemId: Item.POTION_ANGEL,
				quantity: 5,
				playerId: player.id
			}
		]);
	}
}

export async function debugFight(req: Request) {
	const seed = req.params.seed;
	let dinoz1: DinozToGetFighter[];
	let dinoz2: DinozToGetFighter[];
	let timeout = 1000;
	if (req.params.type === 'gameDinoz') {
		const d1 = await getDinozToFight(+req.params.dinoz1);
		const d2 = await getDinozToFight(+req.params.dinoz2);
		// Remove items from dinoz for the fight and set life to maxLife
		d1.skills = d1.skills.filter(
			s => s.skillId !== Skill.TROU_NOIR && s.skillId !== Skill.HYPNOSE && s.skillId !== Skill.SYLPHIDES
		);
		d1.life = d1.maxLife;
		d2.skills = d2.skills.filter(
			s => s.skillId !== Skill.TROU_NOIR && s.skillId !== Skill.HYPNOSE && s.skillId !== Skill.SYLPHIDES
		);
		d2.life = d2.maxLife;
		dinoz1 = [d1];
		dinoz2 = [d2];
	} else if (req.params.type === 'classic') {
		dinoz1 = await getDinozForDojoFight([+req.params.dinoz1]);
		dinoz2 = await getDinozForDojoFight([+req.params.dinoz2]);
	} else {
		// if (req.params.type === 'dojo')
		dinoz1 = await getDinozForDojoFight([+req.params.dinoz1]);
		dinoz2 = await getDinozForDojoFight([+req.params.dinoz2]);
		dinoz1.map(d => {
			d.items = [];
			d.life = d.maxLife;
		});
		dinoz2.map(d => {
			d.items = [];
			d.life = d.maxLife;
		});
	}

	if (req.params.type === 'dojo') {
		timeout = 100;
	}

	/*	console.log('start')
	for (let i = 0; i < 10000; i++) {
		calculateFightBetweenPlayers([dinoz1], false, [dinoz2], false, PlaceEnum.DOJO);
	}
	console.log('stop')*/

	const fakePlayer = {
		cooker: false,
		warLord: false
	};

	const fight = calculateFightBetweenPlayers(dinoz1, fakePlayer, dinoz2, fakePlayer, PlaceEnum.DOJO, timeout, seed);
	return fight;
}

async function getDinozToFight(dinozId: number) {
	const dinoz = await prisma.gameDinoz.findUnique({
		where: { id: dinozId },
		select: {
			id: true,
			display: true,
			name: true,
			level: true,
			life: true,
			maxLife: true,
			nbrUpFire: true,
			nbrUpWood: true,
			nbrUpWater: true,
			nbrUpLightning: true,
			nbrUpAir: true,
			playerId: true,
			skills: {
				select: { skillId: true }
			}
		}
	});
	if (!dinoz) {
		throw new Error("Dinoz doesn't exist");
	}
	return { ...dinoz, status: [], items: [], catches: [] };
}

export async function getJobs(req: Request) {
	const rawJobs = Object.values(scheduledJobs).map(job => {
		return {
			name: job.name,
			nextRun: job.nextInvocation()
		};
	});

	/*const activeOffer = await prisma.offer.findMany({
		where: {
			status: OfferStatus.ONGOING
		},
		select: {
			id: true,
			seller: { select: { id: true, name: true } }
		}
	})


	console.log(rawJobs)*/
	return rawJobs;
}

export async function softReset(req: Request) {
	const authed = await auth(req);
	const superAdmin = authed.id === GLOBAL.config.administrator;
	if (!superAdmin) {
		LOGGER.error(`${authed.id} attempted to truncate the game !`);
		throw new ExpectedError(`Forbiden for you`);
	}

	try {
		await prisma.$transaction([
			prisma.$executeRawUnsafe(`SET CONSTRAINTS ALL DEFERRED;`),

			// TRUNCATE multiple tables in one statement
			prisma.$executeRawUnsafe(`TRUNCATE TABLE dojo CASCADE;`),

			prisma.$executeRawUnsafe(`DELETE FROM "FBTournament";`),
			prisma.$executeRawUnsafe(`TRUNCATE TABLE "FightArchive", "FightWatched", dinoz_skill_unlockable;`),
			prisma.$executeRawUnsafe(`DELETE FROM dinoz_skill WHERE "gameDinozId" is not null ;`),
			prisma.$executeRawUnsafe(`DELETE FROM dinoz_item WHERE "gameDinozId" is not null ;`),
			prisma.$executeRawUnsafe(`DELETE FROM gamedinoz;`),
			prisma.$executeRawUnsafe(`UPDATE dinoz SET display = SUBSTRING(display FROM 1 for 1) || '0' || SUBSTRING(display FROM 3 FOR 14);`),

			// DELETE with condition
			prisma.$executeRawUnsafe(`
				DELETE FROM dinoz_skill
				WHERE "skillId" NOT IN (
				61102, 61103, 61104, 61105, 61106, 61107, 61108, 61109, 61113, 61117, 61122, 61201, 61301
				);
			`),

				// Single UPDATE using CASE for each level
				prisma.$executeRawUnsafe(`
				UPDATE dinoz
				SET experience = experience + CASE level
				WHEN 2 THEN 100
				WHEN 3 THEN 207
				WHEN 4 THEN 322
				WHEN 5 THEN 446
				WHEN 6 THEN 579
				WHEN 7 THEN 722
				WHEN 8 THEN 876
				WHEN 9 THEN 1041
				WHEN 10 THEN 1219
				WHEN 11 THEN 1410
				WHEN 12 THEN 1616
				WHEN 13 THEN 1837
				WHEN 14 THEN 2075
				WHEN 15 THEN 2331
				WHEN 16 THEN 2606
				WHEN 17 THEN 2901
				WHEN 18 THEN 3219
				WHEN 19 THEN 3560
				WHEN 20 THEN 3927
				WHEN 21 THEN 4322
				WHEN 22 THEN 4746
				WHEN 23 THEN 5202
				WHEN 24 THEN 5692
				WHEN 25 THEN 6219
				WHEN 26 THEN 6786
				WHEN 27 THEN 7382
				WHEN 28 THEN 8037
				WHEN 29 THEN 8741
				WHEN 30 THEN 9498
				WHEN 31 THEN 10312
				WHEN 32 THEN 11187
				WHEN 33 THEN 12128
				WHEN 34 THEN 13139
				WHEN 35 THEN 14226
				WHEN 36 THEN 15395
				WHEN 37 THEN 16651
				WHEN 38 THEN 18002
				WHEN 39 THEN 19454
				WHEN 40 THEN 21015
				WHEN 41 THEN 22693
				WHEN 42 THEN 24497
				WHEN 43 THEN 26433
				WHEN 44 THEN 28518
				WHEN 45 THEN 30760
				WHEN 46 THEN 33169
				WHEN 47 THEN 35760
				WHEN 48 THEN 38545
				WHEN 49 THEN 41538
				WHEN 50 THEN 44756
				ELSE 0
				END;
			`),

			prisma.$executeRawUnsafe(`
				UPDATE dinoz
				SET 
					"nbrUpFire" = CASE
						WHEN "raceId" IN (1, 2, 3, 4, 26, 28) THEN 2
						WHEN "raceId" IN (14, 19, 20, 27) THEN 1
						ELSE 0
					END,
					"nbrUpWood" = CASE
						WHEN "raceId" IN (15, 16, 23, 25, 28) THEN 2
						WHEN "raceId" IN (9, 14, 17, 18, 20, 24) THEN 1
						ELSE 0
					END,
					"nbrUpWater" = CASE
						WHEN "raceId" IN (13, 23, 26) THEN 2
						WHEN "raceId" IN (5, 6, 14, 19, 20, 21, 22, 24 ) THEN 1
						ELSE 0
						END,
					"nbrUpAir" = CASE
						WHEN "raceId" IN (11) THEN 3
						WHEN "raceId" IN (19, 24, 27) THEN 2
						WHEN "raceId" IN (9, 12, 14, 28) THEN 1
						ELSE 0
					END,
					"nbrUpLightning" = CASE
						WHEN "raceId" IN (7, 25, 27) THEN 2
						WHEN "raceId" IN (5, 6, 10, 12, 14, 17, 18, 24, 28) THEN 1
						ELSE 0
					END	;
			`),

			// Other updates
			prisma.$executeRawUnsafe(
				`UPDATE dinoz SET level = 1, "placeId" = 5, life = 100, "maxLife" = 100, fight = true, gather = true, remaining = 2, "FBTournamentStep" = 0, following = null;`
			),

			prisma.$executeRawUnsafe(`UPDATE ranking SET points = "dinozCount", average = 1, dojo = 0;`),

			prisma.$executeRawUnsafe(`SET CONSTRAINTS ALL IMMEDIATE;`)
		]);

		LOGGER.log('Remise à zéro du jeu effectuée');
	} catch (error) {
		console.error('Erreur lors de la suppression des données:', error);
		try {
			await prisma.$executeRaw`ROLLBACK;`;
		} catch (rollbackError) {
			console.error('Erreur lors du rollback:', rollbackError);
		}
	}

	await prisma.ranking.updateMany({
		data: {
			points: 0,
			average: 0
		}
	});
}
