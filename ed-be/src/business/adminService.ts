import { Request } from 'express';
import { getAllDinozFromAccount, updateDinoz } from '../dao/dinozDao.js';
import { addMultipleSkillToDinoz, removeSkillFromDinoz } from '../dao/dinozSkillDao.js';
import { addMultipleStatusToDinoz, removeStatusFromDinoz } from '../dao/dinozStatusDao.js';
import {
	addMoney,
	auth,
	getAllInformationFromPlayer,
	getEternalTwinId,
	removeMoney,
	setPlayer
} from '../dao/playerDao.js';
import { addMultipleRewardToPlayer, removeRewardFromPlayer } from '../dao/playerRewardsDao.js';
import { addNewSecret, getAllSecretsRequest } from '../dao/secretDao.js';
import { createLog } from '../dao/logDao.js';
import { LogType } from '@drpg/prisma';
import { AdminRole } from '@drpg/prisma';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';

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
 * @param req.body.addStatus {number} Status to add to the dinoz
 * @param req.body.removeStatus {number} Status to remove to the dinoz
 * @param req.body.addSkill {number} Skill to add to the dinoz
 * @param req.body.removeSkill {number} Skill to remove to the dinoz
 */
export async function editDinoz(req: Request) {
	if (!req.auth?.playerId) {
		throw new ExpectedError(`You need to be logged in.`);
	}

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
		experience: req.body.experience
	};

	await updateDinoz(+req.params.id, dinoz);

	if (typeof dinoz.name !== 'undefined') {
		await createLog(LogType.AdminUpdateDinoz, req.auth.playerId, +req.params.id, 'name', dinoz.name);
	}
	if (typeof dinoz.canChangeName !== 'undefined') {
		await createLog(LogType.AdminUpdateDinoz, req.auth.playerId, +req.params.id, 'canChangeName', dinoz.canChangeName);
	}
	if (typeof dinoz.unavailableReason !== 'undefined' && dinoz.unavailableReason !== null) {
		await createLog(
			LogType.AdminUpdateDinoz,
			req.auth.playerId,
			+req.params.id,
			'unavailableReason',
			dinoz.unavailableReason
		);
	}
	if (typeof dinoz.level !== 'undefined') {
		await createLog(LogType.AdminUpdateDinoz, req.auth.playerId, +req.params.id, 'level', dinoz.level);
	}
	if (typeof dinoz.placeId !== 'undefined') {
		await createLog(LogType.AdminUpdateDinoz, req.auth.playerId, +req.params.id, 'placeId', dinoz.placeId);
	}
	if (typeof dinoz.life !== 'undefined') {
		await createLog(LogType.AdminUpdateDinoz, req.auth.playerId, +req.params.id, 'life', dinoz.life);
	}
	if (typeof dinoz.maxLife !== 'undefined') {
		await createLog(LogType.AdminUpdateDinoz, req.auth.playerId, +req.params.id, 'maxLife', dinoz.maxLife);
	}
	if (typeof dinoz.experience !== 'undefined') {
		await createLog(LogType.AdminUpdateDinoz, req.auth.playerId, +req.params.id, 'experience', dinoz.experience);
	}

	const statusListAsString: string[] = req.body.status;
	const statusList = statusListAsString.map(status => +status);
	if (statusList.length > 0 && req.body.statusOperation) {
		switch (req.body.statusOperation) {
			case 'add':
				await addMultipleStatusToDinoz(+req.params.id, statusList);

				for (const status of statusList) {
					await createLog(LogType.AdminAddStatus, req.auth.playerId, +req.params.id, status);
				}
				break;
			case 'remove':
				for (const status of statusList) {
					await removeStatusFromDinoz(parseInt(req.params.id), status);

					await createLog(LogType.AdminRemoveStatus, req.auth.playerId, +req.params.id, status);
				}
				break;
			default:
				throw new ExpectedError(`You need to select an operation.`);
		}
	}

	const skillList: number[] = req.body.skill;
	if (skillList.length > 0 && req.body.skillOperation) {
		switch (req.body.skillOperation) {
			case 'add':
				await addMultipleSkillToDinoz(+req.params.id, skillList);

				for (const skill of skillList) {
					await createLog(LogType.AdminAddSkill, req.auth.playerId, +req.params.id, skill);
				}
				break;
			case 'remove':
				const promises = skillList.map(skill => removeSkillFromDinoz(+req.params.id, skill));
				await Promise.all(promises);

				for (const skill of skillList) {
					await createLog(LogType.AdminRemoveSkill, req.auth.playerId, +req.params.id, skill);
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
	if (!req.auth?.playerId) {
		throw new ExpectedError(`You need to be logged in.`);
	}

	const player = await getEternalTwinId(+req.params.id);
	if (!player) {
		throw new ExpectedError(`Player ${req.params.id} doesn't exist.`);
	}
	let newMoney = 0;
	switch (req.body.operation) {
		case 'add':
			await createLog(LogType.AdminAddMoney, req.auth.playerId, undefined, +req.params.id, req.body.gold);
			newMoney = (await addMoney(+req.params.id, +req.body.gold)).money;
			break;
		case 'remove':
			await createLog(LogType.AdminRemoveMoney, req.auth.playerId, undefined, +req.params.id, req.body.gold);
			newMoney = (await removeMoney(+req.params.id, +req.body.gold)).money;
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
	if (!req.auth?.playerId) {
		throw new ExpectedError(`You need to be logged in.`);
	}

	const rewardList: number[] = req.body.epicRewardId;
	switch (req.body.operation) {
		case 'add':
			await addMultipleRewardToPlayer(
				rewardList.map(reward => ({
					playerId: +req.params.id,
					rewardId: +reward
				}))
			);

			for (const reward of rewardList) {
				await createLog(LogType.AdminAddReward, req.auth.playerId, undefined, +req.params.id, reward);
			}
			break;
		case 'remove':
			const promises = rewardList.map(reward => removeRewardFromPlayer(+req.params.id, +reward));
			await Promise.all(promises);

			for (const reward of rewardList) {
				await createLog(LogType.AdminRemoveReward, req.auth.playerId, undefined, +req.params.id, reward);
			}
			break;
		default:
			throw new ExpectedError(`You need to select an operation.`);
	}
}

/**
 * @summary List all dinoz from a player
 * @param req
 * @param req.params.id {string} PlayerId
 */
export async function listAllDinozFromPlayer(req: Request) {
	const dinozList = await getAllDinozFromAccount(parseInt(req.params.id));
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
			status: dinoz.status.map(status => status.statusId),
			skills: dinoz.skills.map(skill => skill.skillId)
		};
	});
	return dinozListToSend;
}

/**
 * @summary Edit a selected player
 * @param req
 * @param req.params.id {number} PlayerId
 * @param req.body.hasImported {boolean}
 * @param req.body.customText {string}
 * @param req.body.quetzuBought {number}
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
	if (!req.auth?.playerId) {
		throw new ExpectedError(`You need to be logged in.`);
	}

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
		hasImported: req.body.hasImported,
		customText: req.body.customText,
		quetzuBought: req.body.quetzuBought,
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

	await setPlayer(+req.params.id, player);

	if (typeof player.hasImported !== 'undefined') {
		await createLog(
			LogType.AdminUpdatePlayer,
			req.auth.playerId,
			undefined,
			+req.params.id,
			'hasImported',
			player.hasImported
		);
	}
	if (typeof player.customText !== 'undefined') {
		await createLog(
			LogType.AdminUpdatePlayer,
			req.auth.playerId,
			undefined,
			+req.params.id,
			'customText',
			player.customText
		);
	}
	if (typeof player.quetzuBought !== 'undefined') {
		await createLog(
			LogType.AdminUpdatePlayer,
			req.auth.playerId,
			undefined,
			+req.params.id,
			'quetzuBought',
			player.quetzuBought
		);
	}
	if (typeof player.leader !== 'undefined') {
		await createLog(LogType.AdminUpdatePlayer, req.auth.playerId, undefined, +req.params.id, 'leader', player.leader);
	}
	if (typeof player.engineer !== 'undefined') {
		await createLog(
			LogType.AdminUpdatePlayer,
			req.auth.playerId,
			undefined,
			+req.params.id,
			'engineer',
			player.engineer
		);
	}
	if (typeof player.cooker !== 'undefined') {
		await createLog(LogType.AdminUpdatePlayer, req.auth.playerId, undefined, +req.params.id, 'cooker', player.cooker);
	}
	if (typeof player.shopKeeper !== 'undefined') {
		await createLog(
			LogType.AdminUpdatePlayer,
			req.auth.playerId,
			undefined,
			+req.params.id,
			'shopKeeper',
			player.shopKeeper
		);
	}
	if (typeof player.merchant !== 'undefined') {
		await createLog(
			LogType.AdminUpdatePlayer,
			req.auth.playerId,
			undefined,
			+req.params.id,
			'merchant',
			player.merchant
		);
	}
	if (typeof player.priest !== 'undefined') {
		await createLog(LogType.AdminUpdatePlayer, req.auth.playerId, undefined, +req.params.id, 'priest', player.priest);
	}
	if (typeof player.teacher !== 'undefined') {
		await createLog(LogType.AdminUpdatePlayer, req.auth.playerId, undefined, +req.params.id, 'teacher', player.teacher);
	}
	if (typeof player.messie !== 'undefined') {
		await createLog(LogType.AdminUpdatePlayer, req.auth.playerId, undefined, +req.params.id, 'messie', player.messie);
	}
	if (typeof player.matelasseur !== 'undefined') {
		await createLog(
			LogType.AdminUpdatePlayer,
			req.auth.playerId,
			undefined,
			+req.params.id,
			'matelasseur',
			player.matelasseur
		);
	}
}

/**
 * @summary List all information from a player
 * @param req
 * @param req.params.id {number} PlayerId
 */
export async function listAllPlayerInformationForAdminDashboard(req: Request) {
	const player = await getAllInformationFromPlayer(+req.params.id);
	if (!player) {
		throw new ExpectedError(`Player ${req.params.id} doesn't exist.`);
	}

	const playerToSend = {
		id: player.id,
		hasImported: player.hasImported,
		customText: player.customText,
		name: player.name,
		eternalTwinId: player.eternalTwinId,
		money: player.money,
		quetzuBought: player.quetzuBought,
		leader: player.leader,
		engineer: player.engineer,
		cooker: player.cooker,
		shopKeeper: player.shopKeeper,
		merchant: player.merchant,
		priest: player.priest,
		teacher: player.teacher,
		messie: player.messie,
		matelasseur: player.matelasseur,
		createdDate: player.createdDate,
		rewards: player.rewards.map(reward => reward.rewardId),
		role: player.role
	};

	return playerToSend;
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
	if (!req.auth?.playerId) {
		throw new ExpectedError(`You need to be logged in.`);
	}

	await addNewSecret({
		key: req.body.key,
		value: req.body.value
	});
	const secrets = await getAllSecretsRequest();

	await createLog(LogType.AdminUpdateSecret, req.auth.playerId, undefined, req.body.key, req.body.value);

	return secrets;
}
