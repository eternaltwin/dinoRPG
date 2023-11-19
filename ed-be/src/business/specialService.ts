import { Request } from 'express';
import { Concentration, Dinoz, Player } from '../entity/index.js';
import { prepareConcentration } from '../dao/playerDao.js';
import { ErrorFormator } from '../utils/errorFormator.js';
import { getConcentration, removeConcentration, setConcentration } from '../dao/concentrationDao.js';
import { getDinozConcentrationRequest, setDinoz, setMultipleDinoz } from '../dao/dinozDao.js';
import { specialActions } from '../constants/specialActions.js';
import { checkCondition } from '../utils/checkConditions.js';
import { FightProcessResult, FightResult } from '@drpg/core/models/fight/FightResult';
import { calculateFight, rewardFight } from './fightService.js';
import { rewarder } from '../utils/rewarder.js';
import { placeList } from '@drpg/core/models/place/PlaceList';
import { statusList } from '@drpg/core/models/dinoz/StatusList';
import { ConditionEnum } from '@drpg/core/models/enums/Parser';
import { getActualStep } from './missionsService.js';
import { updateMissionStep } from '../dao/dinozMissionDao.js';

export async function concentrate(req: Request) {
	const player: Player | null = await prepareConcentration(req.auth!.playerId!);
	if (!player) {
		throw new ErrorFormator(500, `Dinoz ${req.auth!.playerId!} doesn't exist.`);
	}
	const dinozList = player.dinoz;
	const dinoz: Dinoz | undefined = player.dinoz.find(d => d.id === parseInt(req.params.id));

	if (!dinoz) {
		throw new ErrorFormator(500, `Dinoz ${req.params.id} doesn't belong to player ${req.auth!.playerId}`);
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

	if (dinoz.player.id !== req.auth!.playerId) {
		throw new ErrorFormator(500, `Dinoz ${dinoz.id} doesn't belong to player ${req.auth!.playerId}`);
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
			const fightResult: FightProcessResult = calculateFight(dinoz, potentialSpecialActions.opponents);
			const result = await rewardFight(dinoz, potentialSpecialActions.opponents, fightResult);
			if (fightResult.winner) {
				await rewarder(potentialSpecialActions.reward, dinoz);
				//TODO: add a pending popup for the next dinozFiche call to prompt the text of the special event
			}
			return result;
		} else {
			await rewarder(potentialSpecialActions.reward, dinoz);
			//TODO: add a pending popup for the next dinozFiche call to prompt the text of the special event
		}
	}
	const dinozMission = dinoz.missions.find(m => !m.isFinished);
	// const isMissionSpecial = Object.values(missionsList).find(mission => mission)
	if (dinozMission) {
		const actualStep = getActualStep(dinoz);
		const placeName = Object.values(placeList).find(place => place.placeId === finalPlace)?.name;
		if (
			actualStep &&
			placeName &&
			actualStep.place === placeName &&
			actualStep.requirement.actionType === ConditionEnum.KILL_BOSS
		) {
			const fightResult: FightProcessResult = calculateFight(dinoz, actualStep.requirement.target);
			const result = await rewardFight(dinoz, actualStep.requirement.target, fightResult);
			if (fightResult.winner) {
				await updateMissionStep(dinoz.id, dinozMission.missionId, actualStep.stepId + 1);
				await setDinoz(dinoz.setPlace(finalPlace));
			}
			return result;
		}
	}
	return false;
}
