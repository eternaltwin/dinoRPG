import { PlayerForConditionCheck } from '@drpg/core/constants';
import { DinozStatusId } from '@drpg/core/models/dinoz/StatusList';
import { ConditionEnum } from '@drpg/core/models/enums/Parser';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { DinozToGetFighter } from '@drpg/core/models/fight/FightConfiguration';
import { FightOutcome, FightResult } from '@drpg/core/models/fight/FightResult';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { DinozToGetActualStep, getActualStep } from '@drpg/core/utils/MissionUtils';
import { checkCondition } from '@drpg/core/utils/checkCondition';
import { Dinoz, Player } from '@drpg/prisma';
import { actualPlace, possessStatus } from '@drpg/core/utils/DinozUtils';
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
import { auth, prepareConcentration } from '../dao/playerDao.js';
import { rewarder } from '../utils/rewarder.js';
import { DinozToRewardFight, calculateFightVsMonsters, rewardFightVsMonsters } from './fightService.js';

export async function concentrate(req: Request) {
	const authed = await auth(req);
	const player = await prepareConcentration(authed.id);
	if (!player) {
		throw new ExpectedError(`Player ${authed.id} doesn't exist.`);
	}
	const dinozList = player.dinoz;
	const dinoz = player.dinoz.find(d => d.id === parseInt(req.params.id));

	if (!dinoz) {
		throw new ExpectedError(`Dinoz ${req.params.id} doesn't belong to player ${authed.id}`);
	}

	//Check if dinoz is at Bao Bob's location
	if (actualPlace(dinoz).placeId !== PlaceEnum.BAO_BOB) {
		throw new ExpectedError(`Dinoz ${dinoz.id} is not at the right place`);
	}

	//Check if dinoz doesn't already possess the key
	if (possessStatus(dinoz, DinozStatusId.SYLVENOIRE_KEY)) {
		throw new ExpectedError(`${dinoz.name} cannot concentrate`);
	}

	//check if this dinoz is not already doing this and throw an error
	if (dinoz.concentration) {
		throw new ExpectedError(`${dinoz.name} is already doing this`);
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
			throw new ExpectedError(`Concentration ${concentratingDinoz.concentration.id} doesn't exist.`);
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
	const authed = await auth(req);
	const dinoz = await getDinozConcentrationRequest(+req.params.id);
	if (!dinoz) {
		throw new ExpectedError(`Dinoz ${req.params.id} doesn't exist.`);
	}

	if (!dinoz.player || dinoz.player.id !== authed.id) {
		throw new ExpectedError(`Dinoz ${dinoz.id} doesn't belong to player ${authed.id}`);
	}

	if (!dinoz.concentration) {
		throw new ExpectedError(`Dinoz ${dinoz.id} cannot do this.`);
	}

	const dinozToUpdate = dinoz.concentration.dinoz.findIndex(dino => dino.id === dinoz.id);
	dinoz.concentration.dinoz.splice(dinozToUpdate, 1);
	await updateConcentration(dinoz.concentration.id, dinoz.concentration.dinoz);
}

async function goDarkWorld(playerId: string, dinozList: Pick<Dinoz, 'id'>[]) {
	await updateMultipleDinozPlaceId(playerId, dinozList, PlaceEnum.PORTAIL);
}

export async function movementListener(
	player: Pick<Player, 'id' | 'teacher' | 'cooker' | 'autoReequipItems'> &
		PlayerForConditionCheck & { items: { itemId: number; quantity: number }[] },
	team: (DinozToGetFighter & DinozToRewardFight & DinozToGetActualStep)[],
	finalPlace: PlaceEnum,
	activeDinoz: number
) {
	// Special actions
	const potentialSpecialActions = Object.values(specialActions).find(special => special.place === finalPlace);

	if (potentialSpecialActions && checkCondition(potentialSpecialActions.condition, player, player.dinoz[0].id)) {
		if (potentialSpecialActions.opponents) {
			// Trigger a fight against the opponents of the special action
			const fightResult = calculateFightVsMonsters(team, player, finalPlace, potentialSpecialActions.opponents);

			const partyLeader = team.find(d => d.id === activeDinoz);
			if (!partyLeader) {
				throw new ExpectedError(`Cannot find dinoz ${activeDinoz} in the team`);
			}
			const result: FightResult = await rewardFightVsMonsters(
				team,
				potentialSpecialActions.opponents,
				fightResult,
				finalPlace,
				player
			);
			// Rewards against monsters are granted only by defeating them. Tie counts as defeat.
			if (fightResult.outcome === FightOutcome.AttackerWin) {
				await rewarder(potentialSpecialActions.reward, [partyLeader], player.id, true);
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
			await rewarder(potentialSpecialActions.reward, team, player.id, true);
			//TODO: add a pending popup for the next dinozFiche call to prompt the text of the special event
		}
	}

	// Check if any dinoz has an unfinished mission
	const dinozMission = team.flatMap(dinoz => dinoz.missions).find(m => !m.isFinished);

	if (dinozMission) {
		// Find the dinoz with the unfinished mission
		const dinozWithMission = team.find(dinoz => dinoz.missions.some(m => m.missionId === dinozMission.missionId));
		if (dinozWithMission) {
			// Check the actual step of the dinoz with the unfinished mission
			const actualStep = getActualStep(dinozWithMission);

			if (actualStep?.stepId !== undefined) {
				if (actualStep.place === finalPlace && actualStep.requirement.actionType === ConditionEnum.KILL_BOSS) {
					const fightResult = calculateFightVsMonsters(team, player, finalPlace, actualStep.requirement.target);
					const result = await rewardFightVsMonsters(
						team,
						actualStep.requirement.target,
						fightResult,
						finalPlace,
						player
					);
					// Rewards against monsters are granted only by defeating them. Tie counts as defeat.
					if (fightResult.outcome === FightOutcome.AttackerWin) {
						const teamIds = team.map(dinoz => dinoz.id);

						await updateMissionStep(player.id, teamIds, dinozMission.missionId, actualStep.stepId + 1);
						await updateMultipleDinoz(teamIds, { placeId: finalPlace });
					}
					return result;
				}
			}
		}
	}
	return false;
}
