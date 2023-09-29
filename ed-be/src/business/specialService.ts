import { Request } from 'express';
import { Concentration, Dinoz, Player } from '../entity/index.js';
import { prepareConcentration } from '../dao/playerDao.js';
import { ErrorFormator } from '../utils/errorFormator.js';
import { placeList, statusList } from '../constants/index.js';
import { getConcentration, removeConcentration, setConcentration } from '../dao/concentrationDao.js';
import { getDinozConcentrationRequest, setMultipleDinoz } from '../dao/dinozDao.js';
import { specialActions } from '../constants/specialActions.js';
import { checkCondition } from '../utils/checkConditions.js';
import { FightProcessResult, FightResult } from '@drpg/core/models/fight/FightResult';
import { calculateFight, getFightResult, rewardFight } from './fightService.js';
import { rewarder } from '../utils/rewarder.js';

export async function concentrate(req: Request) {
	const player: Player | null = await prepareConcentration(req.user!.playerId!);
	if (!player) {
		throw new ErrorFormator(500, `Dinoz ${req.user!.playerId!} doesn't exist.`);
	}
	const dinozList = player.dinoz;
	const dinoz: Dinoz | undefined = player.dinoz.find(d => d.id === parseInt(req.params.id));

	if (!dinoz) {
		throw new ErrorFormator(500, `Dinoz ${req.params.id} doesn't belong to player ${req.user!.playerId}`);
	}

	//Check if dinoz is at Bao Bob's location
	if (dinoz.actualPlace.placeId !== placeList.BAO_BOB.placeId) {
		throw new ErrorFormator(500, `Dinoz ${dinoz.id} is not at the right place`);
	}

	//Check if dinoz doesn't already possess the key
	if (dinoz.possessStatus(statusList.SYLVENOIRE_KEY)) {
		throw new ErrorFormator(500, `${dinoz.name} cannot concentrate`);
	}

	//check if this dinoz is not already doing this and throw an error
	if (dinoz.concentration) {
		throw new ErrorFormator(500, `${dinoz.name} is already doing this`);
	}

	let concentration = dinozList.find(d => d.concentration)?.concentration ?? undefined;

	//If there is no concentration row, create a new one
	if (!concentration) {
		dinoz.concentration = new Concentration();
		dinoz.concentration.dinoz = [dinoz];
		await setConcentration(dinoz.concentration);
		return;
	} else {
		concentration = (await getConcentration(concentration.id)) as Concentration;
	}

	concentration.dinoz.push(dinoz);
	//Save this pool
	concentration = await setConcentration(concentration);
	//If 7 dinoz concentrate process the next events
	if (concentration.dinoz.length === 2) {
		await goDarkWorld(concentration.dinoz);
		await removeConcentration(concentration.id);
	}
}

export async function cancelConcentrate(req: Request) {
	const dinoz: Dinoz | null = await getDinozConcentrationRequest(parseInt(req.params.id));
	if (!dinoz) {
		throw new ErrorFormator(500, `Dinoz ${req.params.id} doesn't exist.`);
	}

	if (dinoz.player.id !== req.user!.playerId) {
		throw new ErrorFormator(500, `Dinoz ${dinoz.id} doesn't belong to player ${req.user!.playerId}`);
	}

	if (!dinoz.concentration) {
		throw new ErrorFormator(500, `Dinoz ${dinoz.id} cannot do this.`);
	}

	const dinozToUpdate = dinoz.concentration.dinoz.findIndex(dino => dino.id === dinoz.id);
	dinoz.concentration.dinoz.splice(dinozToUpdate, 1);
	await setConcentration(dinoz.concentration);
}

async function goDarkWorld(dinozList: Array<Dinoz>): Promise<void> {
	dinozList.forEach(dinoz => {
		dinoz.placeId = placeList.PORTAIL.placeId;
	});
	await setMultipleDinoz(dinozList);
}

export async function mouvementListener(dinoz: Dinoz, finalPlace: number): Promise<false | FightResult> {
	//Specials actions
	let potentialSpecialActions = Object.values(specialActions).find(special => special.place === finalPlace);

	if (potentialSpecialActions && checkCondition(potentialSpecialActions.condition, dinoz)) {
		if (potentialSpecialActions.opponents) {
			//TODO: pass the array rather than just the first enemy
			const fightResult: FightProcessResult = calculateFight(dinoz, potentialSpecialActions.opponents[0]);
			await rewardFight(dinoz, potentialSpecialActions.opponents[0], fightResult);
			if (fightResult.winner) {
				await rewarder(potentialSpecialActions.reward, dinoz);
				//TODO: add a pending popup for the next dinozFiche call to prompt the text of the special event
			}
			return getFightResult(dinoz, potentialSpecialActions.opponents[0], fightResult);
		} else {
			await rewarder(potentialSpecialActions.reward, dinoz);
			//TODO: add a pending popup for the next dinozFiche call to prompt the text of the special event
		}
	}
	return false;
}
