import { Request, Response } from 'express';
import {
	editCustomText,
	getCommonDataRequest,
	setCooker,
	setEngineer,
	setHasImported,
	setLeader,
	setMerchant,
	setPlayerMoneyRequest,
	setPriest,
	setQuetzuBought,
	setShopKeeper,
	setTeacher
} from '../dao/playerDao.js';
import { validationResult } from 'express-validator';
import {
	addStatusToDinoz,
	removeStatusToDinoz
} from '../dao/assDinozStatusDao.js';
import {
	addRewardToPlayer,
	removeRewardToPlayer
} from '../dao/assPlayerRewardsDao.js';
import {
	freezeDinoz,
	getAllDinozFromAccount,
	getCanDinozChangeName,
	getDinozFicheRequest,
	sacrificeDinoz,
	setDinozCanChangeName,
	setDinozExperience,
	setDinozLevel,
	setDinozLife,
	setDinozMaxLife,
	setDinozNameRequest,
	setDinozPlaceRequest
} from '../dao/dinozDao.js';
import { Dinoz, Player } from '../models/index.js';
import {
	addSkillToDinoz,
	removeSkillToDinoz
} from '../dao/assDinozSkillDao.js';

/**
 * @summary Check if user can access the admin dashboard
 * @param req
 * @param res
 * @return boolean
 */
const getAdminDashBoard = async (
	req: Request,
	res: Response
): Promise<Response> => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}
	return res.status(200).send(true);
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
 * @param res
 * @return Dinoz
 */
const editDinoz = async (req: Request, res: Response): Promise<Response> => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	if (req.body.name) {
		const canChangeName: Dinoz | null = await getCanDinozChangeName(
			parseInt(req.params.id)
		);
		await setDinozNameRequest(
			{
				dinozId: parseInt(req.params.id),
				name: req.body.name
			} as Dinoz,
			canChangeName!.canChangeName
		);
	}
	if (req.body.isFrozen !== null) {
		await freezeDinoz(parseInt(req.params.id), req.body.isFrozen);
	}
	if (req.body.isSacrificed !== null) {
		await sacrificeDinoz(parseInt(req.params.id), req.body.isSacrificed);
	}
	if (req.body.level) {
		await setDinozLevel(parseInt(req.params.id), req.body.level);
	}
	if (req.body.placeId) {
		await setDinozPlaceRequest(parseInt(req.params.id), req.body.placeId);
	}
	if (req.body.canChangeName !== null) {
		await setDinozCanChangeName(
			parseInt(req.params.id),
			req.body.canChangeName
		);
	}
	if (req.body.life) {
		await setDinozLife(parseInt(req.params.id), req.body.life);
	}
	if (req.body.maxLife) {
		await setDinozMaxLife(parseInt(req.params.id), req.body.maxLife);
	}
	if (req.body.experience) {
		await setDinozExperience(parseInt(req.params.id), req.body.experience);
	}
	if (req.body.addStatus) {
		await addStatusToDinoz(parseInt(req.params.id), req.body.addStatus);
	}
	if (req.body.removeStatus) {
		await removeStatusToDinoz(parseInt(req.params.id), req.body.removeStatus);
	}
	if (req.body.addSkill) {
		await addSkillToDinoz(parseInt(req.params.id), req.body.addSkill);
	}
	if (req.body.removeSkill) {
		await removeSkillToDinoz(parseInt(req.params.id), req.body.removeSkill);
	}

	const dinozUpdated: Dinoz | null = await getDinozFicheRequest(
		parseInt(req.params.id)
	);
	return res.status(200).send(dinozUpdated);
};

/**
 * @summary Add or remove gold to a player
 * @param req
 * @param req.params.id {number} PlayerId
 * @param req.body.operation {string} Operation to be realised (add or remove)
 * @param req.body.epic {number} Quantity of gold
 * @param res
 * @return void
 */
const setPlayerMoney = async (
	req: Request,
	res: Response
): Promise<Response> => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}
	const playerGold: Player | null = await getCommonDataRequest(
		parseInt(req.params.id)
	);

	if (!playerGold) {
		return res
			.status(500)
			.send(`Player ${parseInt(req.params.id)} doesn't exists`);
	}

	switch (req.body.operation) {
		case 'add':
			await setPlayerMoneyRequest(
				parseInt(req.params.id),
				playerGold.money! + req.body.gold
			);
			return res.status(200).send();
		case 'remove':
			await setPlayerMoneyRequest(
				parseInt(req.params.id),
				playerGold.money! - req.body.gold
			);
			return res.status(200).send();
		default:
			return res.status(400).send(`You need to select an operation.`);
	}
};

/**
 * @summary Add or remove epic reward to a player
 * @param req
 * @param req.params.id {number} PlayerId
 * @param req.body.operation {string} Operation to be realised (add or remove)
 * @param req.body.epic {number} Id of the Epic reward
 * @param res
 * @return void
 */
const givePlayerEpic = async (
	req: Request,
	res: Response
): Promise<Response> => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	switch (req.body.operation) {
		case 'add':
			await addRewardToPlayer(parseInt(req.params.id), req.body.epicRewardId);
			return res.status(200).send();
		case 'remove':
			await removeRewardToPlayer(
				parseInt(req.params.id),
				req.body.epicRewardId
			);
			return res.status(200).send();
		default:
			return res.status(400).send(`You need to select an operation.`);
	}
};

/**
 * @summary List all dinoz from a player
 * @param req
 * @param req.params.id {string} PlayerId
 * @param res
 * @return Array<Dinoz>
 */
const listAllDinozFromPlayer = async (
	req: Request,
	res: Response
): Promise<Response> => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	const dinozList: Array<Dinoz> = await getAllDinozFromAccount(
		parseInt(req.params.id)
	);
	return res.status(200).send(dinozList);
};

/**
 * @summary Edit a selected player
 * @param req
 * @param req.params.id {string} PlayerId
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
 * @param res
 * @return void
 */
const editPlayer = async (req: Request, res: Response): Promise<Response> => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	if (req.body.hasImported !== null) {
		await setHasImported(parseInt(req.params.id), req.body.hasImported);
	}
	if (req.body.customText) {
		await editCustomText(parseInt(req.params.id), req.body.customText);
	}
	if (req.body.quetzuBought) {
		await setQuetzuBought(parseInt(req.params.id), req.body.quetzuBought);
	}
	if (req.body.leader !== null) {
		await setLeader(parseInt(req.params.id), req.body.leader);
	}
	if (req.body.engineer !== null) {
		await setEngineer(parseInt(req.params.id), req.body.engineer);
	}
	if (req.body.cooker !== null) {
		await setCooker(parseInt(req.params.id), req.body.cooker);
	}
	if (req.body.shopKeeper !== null) {
		await setShopKeeper(parseInt(req.params.id), req.body.shopKeeper);
	}
	if (req.body.merchant !== null) {
		await setMerchant(parseInt(req.params.id), req.body.merchant);
	}
	if (req.body.priest !== null) {
		await setPriest(parseInt(req.params.id), req.body.priest);
	}
	if (req.body.teacher !== null) {
		await setTeacher(parseInt(req.params.id), req.body.teacher);
	}

	//TODO : send this const
	// const playerUpdated: Player | null = await getAllInformationFromPlayer(
	// 	parseInt(req.params.id)
	// );

	return res.status(200).send();
};

export {
	getAdminDashBoard,
	editDinoz,
	setPlayerMoney,
	givePlayerEpic,
	listAllDinozFromPlayer,
	editPlayer
};
