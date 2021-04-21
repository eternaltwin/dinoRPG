import { Request, Response } from 'express';
import {
	getDinozDetailsRequest,
	deleteDinozInShopRequest,
} from '../dao/shopDao';
import { setPlayerMoneyRequest } from '../dao/playerDao';
import {
	createDinozRequest,
	getDinozFicheRequest,
	getCanDinozChangeName,
	setDinozNameRequest,
} from '../dao/dinozDao';
import { Dinoz, DinozShop } from '../models';
import { isNull } from 'lodash';
import { BasicDinoz } from '../models/dinoz/BasicDinoz';

const getDinozFiche = async (
	req: Request,
	res: Response
): Promise<Response> => {
	const dinozId: number = parseInt(req.params.id);

	// Retrieve player from dinozId
	const dinozDetails: Dinoz | null = await getDinozFicheRequest(dinozId);

	// If player found is different from player who do the request, throw exception
	if (Number(dinozDetails!.player.playerId) !== Number(req.user!.playerId)) {
		return res.status(500).send({
			message:
				'Cannot get dinoz details, dinozId : ' +
				dinozId +
				', playerId : ' +
				req.user!.playerId,
		});
	}

	return res.status(200).send(dinozDetails);
};

const buyDinoz = async (req: Request, res: Response): Promise<Response> => {
	// Get dinoz details thanks to his ID
	const dinozData: DinozShop | null = await getDinozDetailsRequest(
		parseInt(req.params.id)
	);

	if (isNull(dinozData)) {
		return res.status(500).send('Error: dinoz data cannot be null');
	}

	// Throws an exception if player doesn't have enough money to buy the dinoz
	if (dinozData.player.money < dinozData.race.price) {
		return res
			.status(500)
			.send("You don't have enough money to buy this dinoz");
	}

	// Throw unauthorized error if dinoz doesn't belong to player shop
	if (Number(dinozData.player.playerId) !== Number(req.user!.playerId!)) {
		return res
			.status(500)
			.send("Unauthorized action, you can't buy this dinoz");
	}

	const newDinoz: Dinoz = Dinoz.build({
		name: '?',
		isFrozen: false,
		raceId: dinozData.race.raceId,
		levelId: 1,
		playerId: req.user!.playerId,
		placeId: 1,
		display: dinozData.display,
		life: 100,
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
		dinozId: Number(dinozCreated.dinozId),
		display: dinozCreated.display,
		experience: dinozCreated.experience,
		following: Number(dinozCreated.following),
		life: dinozCreated.life,
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
	if (Number(dinoz!.player.playerId) !== Number(req.user!.playerId)) {
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
