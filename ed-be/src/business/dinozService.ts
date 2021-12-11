import { Request, Response } from 'express';
import {
	getDinozDetailsRequest,
	deleteDinozInShopRequest
} from '../dao/shopDao.js';
import { setPlayerMoneyRequest } from '../dao/playerDao.js';
import {
	createDinozRequest,
	getDinozFicheRequest,
	getCanDinozChangeName,
	setDinozNameRequest,
	getDinozSkillRequest,
	getDinozSkillAndStatusRequest,
	setSkillSetRequest,
	getDinozPlaceRequest,
	setDinozPlaceRequest
} from '../dao/dinozDao.js';
import {
	Dinoz,
	DinozShop,
	BasicDinoz,
	DinozFiche,
	Action,
	DinozSkill,
	DinozRace
} from '../models/index.js';
import {
	actions,
	levelList,
	itemList,
	raceList,
	skillList,
	statusList
} from '../constants/index.js';
import { addSkillToDinoz } from '../dao/assDinozSkillDao.js';
import { validationResult } from 'express-validator';

const getDinozFiche = async (
	req: Request,
	res: Response
): Promise<Response> => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	const dinozId: number = parseInt(req.params.id);

	// Retrieve player from dinozId
	const dinozDetails = (await getDinozFicheRequest(
		dinozId
	)) as DinozFiche | null;

	if (dinozDetails === null) {
		return res.status(500).send(`Dinoz ${dinozId} doesn't exists`);
	}

	// If player found is different from player who do the request, throw exception
	if (dinozDetails!.playerId !== req.user!.playerId) {
		return res
			.status(500)
			.send(
				`Cannot get dinoz details, dinozId : ${dinozId} for player ${
					req.user!.playerId
				}`
			);
	}

	// Set item list, we just put object name in the list, we don't need other data about items
	let items: Array<number> = [];
	dinozDetails.item.forEach(item =>
		items.push(
			Object.values(itemList).find(itemList => itemList.itemId === item.itemId)!
				.itemId
		)
	);

	dinozDetails.setDataValue('item', undefined);
	dinozDetails.setDataValue('items', items);

	// Set status
	let statusList: Array<number> = [];
	dinozDetails.status.forEach(status => statusList.push(status.statusId));

	dinozDetails.setDataValue('status', undefined);
	dinozDetails.setDataValue('statusList', statusList);

	// Set max experience
	dinozDetails.setDataValue(
		'maxExperience',
		levelList.find(level => level.id === dinozDetails.level)!.experience
	);

	// Set availables actions for this dinoz
	dinozDetails.setDataValue('actions', getActionList());

	return res.status(200).send(dinozDetails);
};

function getActionList(): Array<Action> {
	const actionsList: Array<Action> = [];
	const actionAvailable: Array<string> = getAvailableActions();

	actions.forEach(action => {
		if (actionAvailable.includes(action.name)) {
			actionsList.push(action);
		}
	});

	return actionsList;
}

function getAvailableActions(): Array<string> {
	const actionList: Array<string> = [];
	actionList.push('fight');
	actionList.push('follow');
	return actionList;
}

const getDinozSkill = async (
	req: Request,
	res: Response
): Promise<Response> => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	const dinozId: number = parseInt(req.params.id);
	const dinozSkill: Dinoz | null = await getDinozSkillRequest(dinozId);

	if (dinozSkill === null) {
		return res.status(500).send(`Dinoz ${dinozId} doesn't exist`);
	}

	if (dinozSkill.playerId !== req.user!.playerId) {
		return res
			.status(500)
			.send(`Dinoz ${dinozId} doesn't belong to player ${dinozSkill.playerId}`);
	}

	const response: Array<DinozSkill> = [];
	dinozSkill.skill.forEach(skill => {
		let skillFound: DinozSkill = skillList.find(
			skillDinoz => skillDinoz.skillId === skill.skillId
		)!;
		skillFound.state = skill.state;
		response.push(skillFound);
	});

	return res.status(200).send(response);
};

const buyDinoz = async (req: Request, res: Response): Promise<Response> => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	// Get dinoz details thanks to his ID
	const dinozData: DinozShop | null = await getDinozDetailsRequest(
		parseInt(req.params.id)
	);

	// Throw error if dinoz don't exist in database
	if (dinozData === null) {
		return res.status(500).send(`Dinoz ${req.params.id} doesn't exist`);
	}

	const race: DinozRace = Object.values(raceList).find(
		race => race.raceId === dinozData.raceId
	)!;

	// Throws an exception if player doesn't have enough money to buy the dinoz
	if (dinozData.player.money < race.price) {
		return res
			.status(500)
			.send(`You don't have enough money to buy dinoz ${req.params.id}`);
	}

	// Throw unauthorized error if dinoz doesn't belong to player shop
	if (dinozData.player.playerId !== req.user!.playerId!) {
		return res
			.status(500)
			.send(`Dinoz ${req.params.id} doesn't belong to your account`);
	}

	const newDinoz: Dinoz = Dinoz.build({
		name: '?',
		isFrozen: false,
		raceId: race.raceId,
		level: 1,
		playerId: req.user!.playerId,
		placeId: 1,
		display: dinozData.display,
		life: 100,
		maxLife: 100,
		experience: 0,
		canChangeName: true,
		canGather: false,
		nbrUpFire: race.nbrFireCase,
		nbrUpWood: race.nbrWoodCase,
		nbrUpWater: race.nbrWaterCase,
		nbrUpLight: race.nbrLightCase,
		nbrUpAir: race.nbrAirCase
	});

	// Set player money
	const newMoney: number = dinozData.player.money - race.price;
	await setPlayerMoneyRequest(req.user!.playerId!, newMoney);

	// Delete all dinoz from dinoz shop
	await deleteDinozInShopRequest(req.user!.playerId!);

	// Create a new dinoz that belongs to player
	const dinozCreated: Dinoz = await createDinozRequest(newDinoz.get());

	// Add skill to created dinoz
	if (race.skillId) {
		addSkillToDinoz(dinozCreated.dinozId, race.skillId);
	}

	const dinozToSend: BasicDinoz = {
		dinozId: dinozCreated.dinozId,
		display: dinozCreated.display,
		experience: dinozCreated.experience,
		following: dinozCreated.following,
		life: dinozCreated.life,
		maxLife: dinozCreated.maxLife,
		name: dinozCreated.name,
		placeId: dinozCreated.placeId
	};

	return res.status(200).send(dinozToSend);
};

const setDinozName = async (req: Request, res: Response): Promise<Response> => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	// Retrieve player from dinozId
	const dinoz: Dinoz | null = await getCanDinozChangeName(
		parseInt(req.params.id)
	);

	if (dinoz === null) {
		return res.status(500).send(`Dinoz ${req.params.id} doesn't exist`);
	}

	// If authenticated player is different from player found, throw exception
	if (dinoz!.player.playerId !== req.user!.playerId) {
		return res
			.status(500)
			.send(
				`Dinoz ${req.params.id} doesn't belong to player ${req.user!.playerId}`
			);
	}

	// If player can't change dinoz name, throw exception
	if (!dinoz!.canChangeName) {
		return res.status(500).send(`Can't update dinoz name`);
	}

	const dinozToUpdate = Dinoz.build({
		dinozId: req.params.id,
		name: req.body.newName
	});

	await setDinozNameRequest(dinozToUpdate);

	return res.status(200).send();
};

const setSkillState = async (
	req: Request,
	res: Response
): Promise<Response> => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}

	const dinozId: number = parseInt(req.params.id);
	const skillToUpdate: number = parseInt(req.body.skillId);
	const skillStateToUpdate: boolean = req.body.skillState;

	const dinoz: Dinoz | null = await getDinozSkillAndStatusRequest(dinozId);

	// Check if dinoz exists in database
	if (dinoz === null) {
		return res.status(500).send(`Dinoz ${dinozId} doesn't exists`);
	}

	// Check if dinoz belongs to player who do the request
	if (dinoz.playerId !== req.user!.playerId) {
		return res
			.status(500)
			.send(`Dinoz ${dinozId} doesn't belong to player ${dinoz.playerId}`);
	}

	// Check if dinoz can change his skills
	const amulst = dinoz.status.some(
		status => status.statusId === statusList.STRATEGY_IN_130_LESSONS
	);

	if (!amulst) {
		return res
			.status(500)
			.send(`Dinoz ${dinozId} doesn't have the good status`);
	}

	// Check if dinoz know the skill
	const dinozKnowThisSkill = dinoz.skill.some(
		skill => skill.skillId === skillToUpdate
	);

	if (!dinozKnowThisSkill) {
		return res
			.status(500)
			.send(`Dinoz ${dinozId} doesn't know skill : ${skillToUpdate}`);
	}

	// Check if skill can be activate / desactivate
	const skillIsActivable = skillList.find(
		skill => skill.skillId === skillToUpdate
	);

	if (!skillIsActivable!.activable) {
		return res.status(500).send(`Skill ${skillToUpdate} cannot be activated`);
	}

	await setSkillSetRequest(dinozId, skillToUpdate, skillStateToUpdate);

	return res.status(200).send(!skillStateToUpdate);
};

const alphaMove = async (req: Request, res: Response): Promise<Response> => {
	//FIXME: rework to protect movement to not available place and add payload
	//Retrieve dinozId
	const dinozId: number = parseInt(req.params.id);
	const dinoz: Dinoz | null = await getDinozPlaceRequest(dinozId); //No need to fix it

	// Check if dinoz exists in database
	if (dinoz === null) {
		return res.status(500).send(`Dinoz ${dinozId} doesn't exists`);
	}

	// // Check if dinoz belongs to player who do the request
	if (dinoz.playerId !== req.user!.playerId) {
		return res
			.status(500)
			.send(`Dinoz ${dinozId} doesn't belong to player ${dinoz.playerId}`);
	}

	const placeRand = Math.floor(Math.random() * 8 + 1);
	await setDinozPlaceRequest(dinozId, placeRand); //No need to fix it, just remove the placeRand
	const placeString: string = placeRand.toString();

	return res.status(200).send(placeString);
};

export {
	getDinozFiche,
	buyDinoz,
	setDinozName,
	getDinozSkill,
	setSkillState,
	alphaMove
};
