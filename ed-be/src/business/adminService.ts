import { Request } from 'express';
import { getAllDinozFromAccount, updateDinoz } from '../dao/dinozDao.js';
import { addMultipleSkillToDinoz, removeSkillFromDinoz } from '../dao/dinozSkillDao.js';
import { addMultipleStatusToDinoz, removeStatusFromDinoz } from '../dao/dinozStatusDao.js';
import { addMoney, getAllInformationFromPlayer, getEternalTwinId, removeMoney, setPlayer } from '../dao/playerDao.js';
import { addMultipleRewardToPlayer, removeRewardFromPlayer } from '../dao/playerRewardsDao.js';
import { addNewSecret, getAllSecretsRequest } from '../dao/secretDao.js';
import { ErrorFormator } from '../utils/errorFormator.js';

/**
 * @summary Check if user can access the admin dashboard
 * @param req
 * @return boolean
 */
export async function getAdminDashBoard(): Promise<boolean> {
	return true;
}

/**
 * @summary Edit most of the element from a dinoz
 * @param req
 * @param req.params.id {string} DinozId
 * @param req.body.name {string} New Dinoz name
 * @param req.body.isFrozen {boolean} Frozen or not
 * @param req.body.isSacrificed {boolean} Sacrificied or not
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
	const dinoz = {
		name: req.body.name,
		canChangeName: req.body.canChangeName,
		isFrozen: req.body.isFrozen,
		isSacrificed: req.body.isSacrificed,
		level: req.body.level,
		placeId: req.body.placeId,
		life: req.body.life,
		maxLife: req.body.maxLife,
		experience: req.body.experience
	};

	await updateDinoz(+req.params.id, dinoz);

	const statusListAsString: string[] = req.body.status;
	const statusList = statusListAsString.map(status => +status);
	if (statusList.length > 0 && req.body.statusOperation) {
		switch (req.body.statusOperation) {
			case 'add':
				await addMultipleStatusToDinoz(+req.params.id, statusList);
				break;
			case 'remove':
				for (const status of statusList) {
					await removeStatusFromDinoz(parseInt(req.params.id), status);
				}
				break;
			default:
				throw new ErrorFormator(500, `You need to select an operation.`);
		}
	}

	const skillList: number[] = req.body.skill;
	if (skillList.length > 0 && req.body.skillOperation) {
		switch (req.body.skillOperation) {
			case 'add':
				await addMultipleSkillToDinoz(+req.params.id, skillList);
				break;
			case 'remove':
				const promises = skillList.map(skill => removeSkillFromDinoz(+req.params.id, skill));
				await Promise.all(promises);
				break;
			default:
				throw new ErrorFormator(500, `You need to select an operation.`);
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
	const player = await getEternalTwinId(+req.params.id);
	if (!player) {
		throw new ErrorFormator(500, `Player ${req.params.id} doesn't exist.`);
	}
	let newMoney = 0;
	switch (req.body.operation) {
		case 'add':
			newMoney = (await addMoney(+req.params.id, +req.body.gold)).money;
			break;
		case 'remove':
			newMoney = (await removeMoney(+req.params.id, +req.body.gold)).money;
			break;
		default:
			throw new ErrorFormator(500, `You need to select an operation.`);
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
	const rewardList: number[] = req.body.epicRewardId;
	switch (req.body.operation) {
		case 'add':
			await addMultipleRewardToPlayer(
				rewardList.map(reward => ({
					playerId: +req.params.id,
					rewardId: +reward
				}))
			);
			break;
		case 'remove':
			const promises = rewardList.map(reward => removeRewardFromPlayer(+req.params.id, reward));
			await Promise.all(promises);
			break;
		default:
			throw new ErrorFormator(500, `You need to select an operation.`);
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
			isFrozen: dinoz.isFrozen,
			isSacrificed: dinoz.isSacrificed,
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
 */
export async function editPlayer(req: Request) {
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
		teacher: req.body.teacher
	};

	await setPlayer(+req.params.id, player);
}

/**
 * @summary List all information from a player
 * @param req
 * @param req.params.id {number} PlayerId
 */
export async function listAllPlayerInformationForAdminDashboard(req: Request) {
	const player = await getAllInformationFromPlayer(+req.params.id);
	if (!player) {
		throw new ErrorFormator(500, `Player ${req.params.id} doesn't exist.`);
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
		createdDate: player.createdDate,
		rewards: player.rewards.map(reward => reward.rewardId)
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
	await addNewSecret({
		key: req.body.key,
		value: req.body.value
	});
	const secrets = await getAllSecretsRequest();

	return secrets;
}
