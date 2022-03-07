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
	setSkillStateRequest,
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
	DinozRace,
	FightResult,
	Place,
	Ranking
} from '../models/index.js';
import {
	actions,
	levelList,
	itemList,
	raceList,
	skillList,
	statusList,
	placeList
} from '../constants/index.js';
import { addSkillToDinoz } from '../dao/assDinozSkillDao.js';
import { validationResult } from 'express-validator';
import { updatePoints } from '../dao/rankingDao.js';

// TODO: refaire cette fonction proprement
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

	// Set accessible places
	const places: Array<number> = Object.values(placeList)
		.find(place => place.placeId === dinozDetails.placeId)!
		.borderPlace.map(placeId =>
			Object.values(placeList).find(place => place.placeId === placeId)
		)
		.filter(
			place =>
				!place!.conditions ||
				dinozDetails.status.some(
					status => status.statusId === place!.conditions
				)
		)
		.map(place => place!.placeId);
	dinozDetails.setDataValue('borderPlace', places);

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
		const skillFound: DinozSkill | undefined = Object.values(skillList).find(
			skillDinoz => skillDinoz.skillId === skill.skillId
		)!;
		response.push({
			skillId: skillFound.skillId,
			type: skillFound.type,
			energy: skillFound.energy,
			element: skillFound.element,
			state: skill.state,
			activatable: skillFound.activatable
		} as DinozSkill);
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

	// Throw error if dinoz doesn't belong to player shop
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
		placeId: placeList.DINOVILLE.placeId,
		display: dinozData.display,
		life: 100,
		maxLife: 100,
		experience: 0,
		canChangeName: true,
		canGather: false,
		nbrUpFire: race.nbrFire,
		nbrUpWood: race.nbrWood,
		nbrUpWater: race.nbrWater,
		nbrUpLight: race.nbrLight,
		nbrUpAir: race.nbrAir
	});

	// Set player money
	const newMoney: number = dinozData.player.money - race.price;
	await setPlayerMoneyRequest(req.user!.playerId!, newMoney);

	// Delete all dinoz from dinoz shop
	await deleteDinozInShopRequest(req.user!.playerId!);

	// Create a new dinoz that belongs to player
	const dinozCreated: Dinoz = await createDinozRequest(newDinoz.get());

	// Add skill to created dinoz
	if (race.skillId.length > 0) {
		race.skillId.forEach(skillId =>
			addSkillToDinoz(dinozCreated.dinozId, skillId)
		);
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

	// Add a point in the ranking to the player
	const playerRanking: Ranking = dinozData.player.rank;
	const dinozCount = playerRanking!.dinozCount + 1;
	const sumPoints = playerRanking!.sumPoints + 1;
	const averagePoints = Math.round(sumPoints / dinozCount);
	await updatePoints(req.user!.playerId, sumPoints, averagePoints, dinozCount);

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
			.send(`Dinoz ${dinozId} doesn't belong to player ${req.user!.playerId}`);
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
	const skillIsActivatable: DinozSkill | undefined = Object.values(
		skillList
	).find(skill => skill.skillId === skillToUpdate);

	if (!skillIsActivatable!.activatable) {
		return res.status(500).send(`Skill ${skillToUpdate} cannot be activated`);
	}

	await setSkillStateRequest(dinozId, skillToUpdate, skillStateToUpdate);

	return res.status(200).send(!skillStateToUpdate);
};

const betaMove = async (req: Request, res: Response): Promise<Response> => {
	if (!validationResult(req).isEmpty()) {
		return res.status(400).json({ errors: validationResult(req) });
	}
	//Retrieve dinozId
	const dinozId: number = parseInt(req.params.id);
	const dinoz: Dinoz | null = await getDinozPlaceRequest(dinozId);
	let finalPlace: number;

	// Check if dinoz exists in database
	if (dinoz === null) {
		return res.status(500).send(`Dinoz ${dinozId} doesn't exists`);
	}

	// Check if dinoz belongs to player who do the request
	if (dinoz.playerId !== req.user!.playerId) {
		return res
			.status(500)
			.send(`Dinoz ${dinozId} doesn't belong to player ${req.user!.playerId}`);
	}

	const actualPlace: Place | undefined = Object.values(placeList).find(
		place => place.placeId === dinoz.placeId
	);
	const desiredPlace: Place | undefined = Object.values(placeList).find(
		place => place.placeId === req.body.placeId
	);

	// Check if desired and actual place exist and is adjacent to actual place
	if (!desiredPlace) {
		return res.status(500).send(`Dinoz ${dinozId} want to go in the void`);
	}

	if (actualPlace!.placeId === desiredPlace.placeId) {
		return res
			.status(500)
			.send(`Dinoz ${dinozId} is already at ${actualPlace!.name}`);
	}

	if (!actualPlace!.borderPlace.includes(desiredPlace.placeId)) {
		return res
			.status(500)
			.send(`${actualPlace!.name} is not adjascent with ${desiredPlace.name}`);
	}

	// Check if condition to go to desired place are fullfill
	if (desiredPlace.conditions) {
		const dinozStatus: Dinoz | null = await getDinozSkillAndStatusRequest(
			dinozId
		);
		const canGoToWantedPlace = dinozStatus!.status.some(
			status => status.statusId === desiredPlace.conditions
		);
		if (!canGoToWantedPlace) {
			return res
				.status(500)
				.send(`Dinoz ${dinozId} doesn't fullfill requirement to go this place`);
		}
	}

	// If dinoz leave the map, replace by the good place
	finalPlace = desiredPlace.alias ?? desiredPlace.placeId;

	// Fight at the desired place
	const fight: FightResult = betaFight(dinoz);
	if (fight.result) {
		await setDinozPlaceRequest(dinozId, finalPlace);
	}

	return res.status(200).send(fight);
};

function betaFight(dinoz: Dinoz): FightResult {
	// NOTHING IS GOOD HERE. EVERYTHING IS TO DO

	let goldEarned = 0;
	let xpEarned = 0;
	let hpLost = 0;
	let result = true;

	const infoToSend: FightResult = {
		goldEarned: goldEarned,
		xpEarned: xpEarned,
		hpLost: hpLost,
		result: result
	};

	return infoToSend;
}

export {
	getDinozFiche,
	buyDinoz,
	setDinozName,
	getDinozSkill,
	setSkillState,
	betaMove,
	betaFight
};
