import { Request } from 'express';
import { getAllInformationFromPlayer, getPlayerMoney, setPlayer, setPlayerMoneyRequest } from '../dao/playerDao.js';
import { Dinoz } from '../entity/dinoz.js';
import { Player } from '../entity/player.js';
import { getAllDinozFromAccount, setDinoz } from '../dao/dinozDao.js';
import { addMultipleStatusToDinoz, removeStatusToDinoz } from '../dao/dinozStatusDao.js';
import { addMultipleSkillToDinoz, removeSkillToDinoz } from '../dao/dinozSkillDao.js';
import { DinozStatus, PlayerReward, DinozSkill } from '../entity/index.js';
import { addMultipleRewardToPlayer, removeRewardToPlayer } from '../dao/playerRewardsDao.js';
import { DinozFiche, PlayerTypeToSend } from '../models/index.js';
import { ErrorFormator } from '../utils/errorFormator.js';

/**
 * @summary Check if user can access the admin dashboard
 * @param req
 * @return boolean
 */
const getAdminDashBoard = async (req: Request): Promise<boolean> => {
	return true;
};

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
const editDinoz = async (req: Request): Promise<void> => {
	const dinoz: Partial<Dinoz> = {
		id: parseInt(req.params.id),
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

	await setDinoz(dinoz);

	const statusList: Array<number> = req.body.status;
	if (statusList.length > 0 && req.body.statusOperation) {
		switch (req.body.statusOperation) {
			case 'add':
				const statusToAdd: Array<DinozStatus> = statusList.map(
					status => new DinozStatus(new Dinoz(parseInt(req.params.id)), status)
				);
				await addMultipleStatusToDinoz(statusToAdd);
				break;
			case 'remove':
				for (const status of statusList) {
					await removeStatusToDinoz(parseInt(req.params.id), status);
				}
				break;
			default:
				throw new ErrorFormator(500, `You need to select an operation.`);
		}
	}

	const skillList: Array<number> = req.body.skill;
	if (skillList.length > 0 && req.body.skillOperation) {
		switch (req.body.skillOperation) {
			case 'add':
				const skillsToAdd: Array<DinozSkill> = skillList.map(
					skill => new DinozSkill(new Dinoz(parseInt(req.params.id)), skill)
				);
				await addMultipleSkillToDinoz(skillsToAdd);
				break;
			case 'remove':
				for (const skill of skillList) {
					await removeSkillToDinoz(parseInt(req.params.id), skill);
				}
				break;
			default:
				throw new ErrorFormator(500, `You need to select an operation.`);
		}
	}
};

/**
 * @summary Add or remove gold to a player
 * @param req
 * @param req.params.id {number} PlayerId
 * @param req.body.operation {string} Operation to be realised (add or remove)
 * @param req.body.epic {number} Quantity of gold
 * @return string
 */
const setPlayerMoney = async (req: Request): Promise<string> => {
	const playerGold: Player = await getPlayerMoney(parseInt(req.params.id));

	switch (req.body.operation) {
		case 'add':
			await setPlayerMoneyRequest(parseInt(req.params.id), playerGold.money! + req.body.gold);
			break;
		case 'remove':
			await setPlayerMoneyRequest(parseInt(req.params.id), playerGold.money! - req.body.gold);
			break;
		default:
			throw new ErrorFormator(500, `You need to select an operation.`);
	}

	const updatedPlayerGold: Player = await getPlayerMoney(parseInt(req.params.id));
	return updatedPlayerGold.money.toString();
};

/**
 * @summary Add or remove epic reward to a player
 * @param req
 * @param req.params.id {number} PlayerId
 * @param req.body.operation {string} Operation to be realised (add or remove)
 * @param req.body.epic {number} Id of the Epic reward
 * @return void
 */
const givePlayerEpicReward = async (req: Request): Promise<void> => {
	const rewardList: Array<number> = req.body.epicRewardId;
	switch (req.body.operation) {
		case 'add':
			const rewardsToAdd: Array<PlayerReward> = rewardList.map(
				rewards => new PlayerReward(new Player(parseInt(req.params.id)), rewards)
			);
			await addMultipleRewardToPlayer(rewardsToAdd);
			break;
		case 'remove':
			for (const reward of rewardList) {
				await removeRewardToPlayer(parseInt(req.params.id), reward);
			}
			break;
		default:
			throw new ErrorFormator(500, `You need to select an operation.`);
	}
};

/**
 * @summary List all dinoz from a player
 * @param req
 * @param req.params.id {string} PlayerId
 * @return Array<DinozFiche>
 */
const listAllDinozFromPlayer = async (req: Request): Promise<Array<DinozFiche>> => {
	const dinozList: Array<Dinoz> = await getAllDinozFromAccount(parseInt(req.params.id));
	const dinozListToSend: Array<DinozFiche> = dinozList.map(dinoz => {
		return {
			id: dinoz.id,
			name: dinoz.name,
			isFrozen: dinoz.isFrozen,
			isSacrificed: dinoz.isSacrificed,
			level: dinoz.level,
			canChangeName: dinoz.canChangeName,
			following: dinoz.following,
			missionId: dinoz.missionId,
			life: dinoz.life,
			maxLife: dinoz.maxLife,
			experience: dinoz.experience,
			placeId: dinoz.placeId,
			status: dinoz.status.map(status => status.statusId),
			skills: dinoz.skills.map(skill => skill.skillId)
		};
	});
	return dinozListToSend;
};

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
const editPlayer = async (req: Request): Promise<void> => {
	const player = {
		id: parseInt(req.params.id),
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
	} as Player;

	await setPlayer(player);
};

/**
 * @summary List all information from a player
 * @param req
 * @param req.params.id {number} PlayerId
 * @return Partial<PlayerTypeToSend>
 */
const listAllPlayerInformationForAdminDashboard = async (req: Request): Promise<Partial<PlayerTypeToSend>> => {
	const player: Player = await getAllInformationFromPlayer(parseInt(req.params.id));

	const playerToSend: Partial<PlayerTypeToSend> = {
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
};

export {
	getAdminDashBoard,
	editDinoz,
	setPlayerMoney,
	givePlayerEpicReward,
	listAllDinozFromPlayer,
	editPlayer,
	listAllPlayerInformationForAdminDashboard
};
