import { Request, Response } from 'express';
import {
	getDinozDetailsRequest,
	deleteDinozInShopRequest,
} from '../dao/shopDao.js';
import { setPlayerMoneyRequest } from '../dao/playerDao.js';
import {
	createDinozRequest,
	getDinozFicheRequest,
	getCanDinozChangeName,
	setDinozNameRequest,
} from '../dao/dinozDao.js';
import {
	Dinoz,
	DinozShop,
	BasicDinoz,
	DinozFiche,
	Action,
	Item,
} from '../models/index.js';
import _ from 'lodash';
import { actions, level, race } from '../constants/index.js';

const getDinozFiche = async (
	req: Request,
	res: Response
): Promise<Response> => {
	const dinozId: number = parseInt(req.params.id);

	// Retrieve player from dinozId
	const dinozDetails = (await getDinozFicheRequest(dinozId)) as DinozFiche;

	// If player found is different from player who do the request, throw exception
	if (dinozDetails!.player.playerId !== req.user!.playerId) {
		return res.status(500).send({
			message:
				'Cannot get dinoz details, dinozId : ' +
				dinozId +
				', playerId : ' +
				req.user!.playerId,
		});
	}

	// Set item list
	let itemList: Array<Item> = [];
	dinozDetails.assDinozItem.forEach((item) => itemList.push(item.item));
	dinozDetails.setDataValue('item', itemList);
	dinozDetails.setDataValue('assDinozItem', undefined);

	// Set max experience
	dinozDetails.setDataValue(
		'maxExperience',
		level.find((level) => level.id === dinozDetails.level)!.experience
	);

	// Set availables actions for this dinoz
	dinozDetails.setDataValue('actions', getActionList());

	return res.status(200).send(dinozDetails);
};

function getActionList(): Array<Action> {
	const actionsList: Array<Action> = [];
	const actionAvailable: Array<string> = getAvailableActions();

	actions.forEach((action) => {
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

const buyDinoz = async (req: Request, res: Response): Promise<Response> => {
	// Get dinoz details thanks to his ID
	const dinozData: DinozShop | null = await getDinozDetailsRequest(
		parseInt(req.params.id)
	);

	if (_.isNull(dinozData)) {
		return res.status(500).send('Error: dinoz data cannot be null');
	}

	dinozData.race = Object.values(race).find(
		(race) => race.raceId === dinozData.raceId
	)!;

	// Throws an exception if player doesn't have enough money to buy the dinoz
	if (dinozData.player.money < dinozData.race.price) {
		return res
			.status(500)
			.send("You don't have enough money to buy this dinoz");
	}

	// Throw unauthorized error if dinoz doesn't belong to player shop
	if (dinozData.player.playerId !== req.user!.playerId!) {
		return res
			.status(500)
			.send("Unauthorized action, you can't buy this dinoz");
	}

	const newDinoz: Dinoz = Dinoz.build({
		name: '?',
		isFrozen: false,
		raceId: dinozData.race.raceId,
		level: 1,
		playerId: req.user!.playerId,
		placeId: 1,
		display: dinozData.display,
		life: 100,
		maxLife: 100,
		experience: 0,
		canChangeName: true,
		canGather: false,
		nbrUpFire: dinozData.race.nbrFireCase,
		nbrUpWood: dinozData.race.nbrWoodCase,
		nbrUpWater: dinozData.race.nbrWaterCase,
		nbrUpLight: dinozData.race.nbrLightCase,
		nbrUpAir: dinozData.race.nbrAirCase,
	});

	// Set player money
	const newMoney: number =
		Number(dinozData.player.money) - dinozData.race.price;
	await setPlayerMoneyRequest(req.user!.playerId!, newMoney);

	// Delete all dinoz from dinoz shop
	await deleteDinozInShopRequest(req.user!.playerId!);

	// Create a new dinoz that belongs to player
	const dinozCreated: Dinoz = await createDinozRequest(newDinoz.get());

	const dinozToSend: BasicDinoz = {
		dinozId: dinozCreated.dinozId,
		display: dinozCreated.display,
		experience: dinozCreated.experience,
		following: dinozCreated.following,
		life: dinozCreated.life,
		maxLife: dinozCreated.maxLife,
		name: dinozCreated.name,
		place: { name: 'dinoville' },
	};

	return res.status(200).send(dinozToSend);
};

const setDinozName = async (req: Request, res: Response): Promise<Response> => {
	// Retrieve player from dinozId
	const dinoz: Dinoz | null = await getCanDinozChangeName(
		parseInt(req.params.id)
	);

	// If authenticated player is different from player found, throw exception
	if (dinoz!.player.playerId !== req.user!.playerId) {
		return res.status(500).send({
			message: 'Unauthorized action from player : ' + req.user!.playerId,
		});
	} else if (!dinoz!.canChangeName) {
		return res.status(500).send({
			message: "Can't update dinoz name",
		});
	}

	const dinozToUpdate = Dinoz.build({
		dinozId: req.params.id,
		name: req.body.newName,
	});

	await setDinozNameRequest(dinozToUpdate);

	return res.status(200).send();
};

export { getDinozFiche, buyDinoz, setDinozName };
