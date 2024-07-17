import { PlayerForConditionCheck } from '@drpg/core/constants';
import { DinozStatusId } from '@drpg/core/models/dinoz/StatusList';
import { ConditionEnum } from '@drpg/core/models/enums/Parser';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { actualPlace, possessStatus } from '@drpg/core/utils/DinozUtils';
import { DinozToGetActualStep, getActualStep } from '@drpg/core/utils/MissionUtils';
import { checkCondition } from '@drpg/core/utils/checkCondition';
import { Dinoz, Player } from '@drpg/prisma';
import { Request } from 'express';
import { specialActions } from '../constants/specialActions.js';
import {
	ConcentrationFromGetConcentration,
	createConcentration,
	getConcentration,
	removeConcentration,
	updateConcentration
} from '../dao/concentrationDao.js';
import { getDinozConcentrationRequest, updateMultipleDinoz, updateMultipleDinozPlaceId } from '../dao/dinozDao.js';
import { updateMissionStep } from '../dao/dinozMissionDao.js';
import { prepareConcentration } from '../dao/playerDao.js';
import { ErrorFormator } from '../utils/errorFormator.js';
import { rewarder } from '../utils/rewarder.js';
import { DinozToRewardFight, calculateFight, rewardFight } from './fightService.js';
import { DinozToGetFighter } from '@drpg/core/models/fight/FightConfiguration';
import { FightResult } from '@drpg/core/models/fight/FightResult';

export async function concentrate(req: Request) {
	if (!req.auth || !req.auth.playerId) {
		throw new ErrorFormator(500, 'Unauthorized');
	}
	const player = await prepareConcentration(req.auth.playerId);
	if (!player) {
		throw new ErrorFormator(500, `Player ${req.auth.playerId} doesn't exist.`);
	}
	const dinozList = player.dinoz;
	const dinoz = player.dinoz.find(d => d.id === parseInt(req.params.id));

	if (!dinoz) {
		throw new ErrorFormator(500, `Dinoz ${req.params.id} doesn't belong to player ${req.auth?.playerId}`);
	}

	//Check if dinoz is at Bao Bob's location
	if (actualPlace(dinoz).placeId !== PlaceEnum.BAO_BOB) {
		throw new ErrorFormator(500, `Dinoz ${dinoz.id} is not at the right place`);
	}

	//Check if dinoz doesn't already possess the key
	if (possessStatus(dinoz, DinozStatusId.SYLVENOIRE_KEY)) {
		throw new ErrorFormator(500, `${dinoz.name} cannot concentrate`);
	}

	//check if this dinoz is not already doing this and throw an error
	if (dinoz.concentration) {
		throw new ErrorFormator(500, `${dinoz.name} is already doing this`);
	}

	const concentratingDinoz = dinozList.find(d => d.concentration);
	let concentration: ConcentrationFromGetConcentration;

	//If there is no concentration row, create a new one
	if (!concentratingDinoz || !concentratingDinoz.concentration) {
		concentration = await createConcentration([{ id: dinoz.id }]);
		return;
	} else {
		concentration = await getConcentration(concentratingDinoz.concentration.id);

		if (!concentration) {
			throw new ErrorFormator(500, `Concentration ${concentratingDinoz.concentration.id} doesn't exist.`);
		}
		concentration.dinoz.push(dinoz);
		updateConcentration(concentration.id, concentration.dinoz);
	}

	//If 7 dinoz concentrate process the next events
	if (concentration.dinoz.length === 7) {
		await goDarkWorld(player.id, concentration.dinoz);
		await removeConcentration(concentration.id);
	}
}

export async function cancelConcentrate(req: Request) {
	const dinoz = await getDinozConcentrationRequest(+req.params.id);
	if (!dinoz) {
		throw new ErrorFormator(500, `Dinoz ${req.params.id} doesn't exist.`);
	}

	if (!dinoz.player || !req.auth || dinoz.player.id !== req.auth.playerId) {
		throw new ErrorFormator(500, `Dinoz ${dinoz.id} doesn't belong to player ${req.auth?.playerId}`);
	}

	if (!dinoz.concentration) {
		throw new ErrorFormator(500, `Dinoz ${dinoz.id} cannot do this.`);
	}

	const dinozToUpdate = dinoz.concentration.dinoz.findIndex(dino => dino.id === dinoz.id);
	dinoz.concentration.dinoz.splice(dinozToUpdate, 1);
	await updateConcentration(dinoz.concentration.id, dinoz.concentration.dinoz);
}

async function goDarkWorld(playerId: number, dinozList: Pick<Dinoz, 'id'>[]) {
	await updateMultipleDinozPlaceId(playerId, dinozList, PlaceEnum.PORTAIL);
}

export async function mouvementListener(
	player: Pick<Player, 'id' | 'teacher'> & PlayerForConditionCheck,
	team: (DinozToGetFighter & DinozToRewardFight & DinozToGetActualStep)[],
	finalPlace: PlaceEnum,
	activeDinoz: number
) {
	//Specials actions
	const potentialSpecialActions = Object.values(specialActions).find(special => special.place === finalPlace);

	if (potentialSpecialActions && checkCondition(potentialSpecialActions.condition, player, player.dinoz[0].id)) {
		if (potentialSpecialActions.opponents) {
			const fightResult = calculateFight(team, finalPlace, potentialSpecialActions.opponents);

			const partyLeader = team.find(d => d.id === activeDinoz);
			if (!partyLeader) {
				throw new ErrorFormator(500, `Cannot find dinoz ${activeDinoz} in the team`);
			}
			const result: FightResult = await rewardFight(
				team,
				potentialSpecialActions.opponents,
				fightResult,
				finalPlace,
				player
			);
			if (fightResult.winner) {
				await rewarder(potentialSpecialActions.reward, [partyLeader], player.id);
				//TODO: add a pending popup for the next dinozFiche call to prompt the text of the special event
			}
			if (potentialSpecialActions.startText) {
				result.startText = potentialSpecialActions.startText;
			}
			if (potentialSpecialActions.endText) {
				result.endText = potentialSpecialActions.endText;
			}
			return result;
		} else {
			await rewarder(potentialSpecialActions.reward, team, player.id);
			//TODO: add a pending popup for the next dinozFiche call to prompt the text of the special event
		}
	}

	// Check if all dinoz have the same unfinished mission
	const dinozMission = team[0].missions.find(m => !m.isFinished);

	if (
		dinozMission &&
		team.every(dinoz => dinoz.missions.find(m => !m.isFinished)?.missionId === dinozMission?.missionId)
	) {
		// Check if all dinoz are at the same step
		const actualStep = getActualStep(team[0]);

		if (actualStep && team.every(dinoz => getActualStep(dinoz)?.stepId === actualStep.stepId)) {
			if (actualStep.place === finalPlace && actualStep.requirement.actionType === ConditionEnum.KILL_BOSS) {
				const fightResult = calculateFight(team, finalPlace, actualStep.requirement.target);
				const result = await rewardFight(team, actualStep.requirement.target, fightResult, finalPlace, player);
				if (fightResult.winner) {
					const teamIds = team.map(dinoz => dinoz.id);

					await updateMissionStep(player.id, teamIds, dinozMission.missionId, actualStep.stepId + 1);
					await updateMultipleDinoz(teamIds, { placeId: finalPlace });
				}
				return result;
			}
		}
	}
	return false;
}
