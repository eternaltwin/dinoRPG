import { RewardEnum } from '@drpg/core/models/enums/Parser';
import { npcList } from '@drpg/core/models/npc/NpcList';
import { NpcTalk } from '@drpg/core/models/npc/NpcTalk';
import { placeList } from '@drpg/core/models/place/PlaceList';
import { checkCondition } from '@drpg/core/utils/checkCondition';
import { Request } from 'express';
import { getDinozFightDataRequest, getDinozNPCRequest } from '../dao/dinozDao.js';
import { createDinozStep, updateDinozStep } from '../dao/npcDao.js';
import { ErrorFormator } from '../utils/errorFormator.js';
import { rewarder } from '../utils/rewarder.js';
import { calculateFight, rewardFight } from './fightService.js';
import { isAlive } from '@drpg/core/utils/DinozUtils';
import { ServiceEnum } from '@drpg/core/models/enums/ServiceEnum';
import { Rewarder } from '@drpg/core/models/reward/Rewarder';

export async function getNpcSpeech(req: Request): Promise<NpcTalk> {
	const dinozId = +req.params.dinozId;
	const npcName: string = req.params.npc;
	let nextStepWanted: string = req.body.step;

	if (!req.auth?.playerId) {
		throw new ErrorFormator(500, `Unauthorized.`);
	}
	const playerId = req.auth.playerId;

	const player = await getDinozNPCRequest(dinozId, playerId);

	if (!player) {
		throw new ErrorFormator(500, `Player ${playerId} doesn't exist.`);
	}
	const dinozBase = player.dinoz.find(d => d.id === dinozId);

	if (!dinozBase) {
		throw new ErrorFormator(500, `Dinoz is not here.`);
	}

	if (dinozBase.canChangeName) {
		throw new ErrorFormator(500, `Dinoz has to be named.`);
	}

	let dinoz = player.dinoz;

	const actualPlace = Object.values(placeList).find(place => place.placeId === dinozBase.placeId);
	const pnj = Object.values(npcList).find(pnj => pnj.name === npcName);

	if (!actualPlace) {
		throw new ErrorFormator(500, `Place ${dinozBase.placeId} doesn't exist.`);
	}

	if (!pnj) {
		throw new ErrorFormator(500, `NPC ${npcName} doesn't exists`);
	}

	if (req.body.stop !== true && pnj.condition && !checkCondition(pnj.condition, player, dinozId)) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} don't meet requirement to talk to ${pnj.name}.`);
	}
	if (actualPlace.placeId !== pnj.placeId && !req.body.stop) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} cannot talk to this NPC`);
	}

	let nextStepWantedData = Object.values(pnj.data).find(
		pnj => pnj.stepName === nextStepWanted || pnj.alias === nextStepWanted
	);

	if (!nextStepWantedData) {
		throw new ErrorFormator(500, `The step ${nextStepWanted} doesn't exist for the NPC ${npcName}`);
	}

	if (nextStepWanted === nextStepWantedData.alias) {
		nextStepWanted = nextStepWantedData.stepName;
	}

	let dinozTalk = dinozBase.npcs.find(npc => npc.npcId === pnj.id);
	// Create NPC's entry at first step for this dinoz
	if (dinozTalk === undefined) {
		dinozTalk = await createDinozStep(dinozId, {
			npcId: pnj.id,
			step: 'begin'
		});
	} else {
		if (req.body.stop) {
			const stopStep = Object.values(pnj.data).find(pnj => pnj.stepName === 'stop');

			if (!stopStep) {
				throw new ErrorFormator(500, `The step stop doesn't exist for the NPC ${npcName}`);
			}

			await updateDinozStep(dinozId, pnj.id, 'begin');
			return {
				name: npcName,
				speech: stopStep.stepName,
				playerChoice: stopStep.nextStep
			};
		}

		const actualStep = Object.values(pnj.data).find(pnj => pnj.stepName === dinozTalk?.step);

		if (!actualStep) {
			throw new ErrorFormator(500, `The step ${dinozTalk?.step} doesn't exist for the NPC ${npcName}`);
		}

		// Check if dinoz can go to this step
		if (
			nextStepWanted !== 'begin' &&
			!actualStep.nextStep.includes(nextStepWantedData.stepName) &&
			!actualStep.nextStep.includes(nextStepWantedData.alias || '')
		) {
			throw new ErrorFormator(500, `This step is not reachable.`);
		}
		if (nextStepWantedData.condition !== undefined && !checkCondition(nextStepWantedData.condition, player, dinozId)) {
			throw new ErrorFormator(500, `The dinoz doesn't fullfill the conditions.`);
		}

		if (nextStepWantedData.target !== undefined) {
			const nonNullNextStepWantedData = nextStepWantedData;
			nextStepWantedData = Object.values(pnj.data).find(pnj => pnj.stepName === nonNullNextStepWantedData.target);
			if (!nextStepWantedData) {
				throw new ErrorFormator(500, `Invalid target.`);
			}
			// if there is an error relating to target, it's here
			nextStepWanted = nextStepWantedData.stepName;
		}

		// Action
		if (nextStepWantedData && nextStepWantedData.fight) {
			const playerData = await getDinozFightDataRequest(dinozId, playerId);
			if (!playerData) {
				throw new ErrorFormator(500, `No player ${playerId} found`);
			}
			const dinozData = player.dinoz.find(d => d.id === dinozId);
			if (!dinozData) {
				throw new ErrorFormator(500, `Player ${dinozId} doesn't exist.`);
			}

			const team = playerData.dinoz;
			if (!isAlive(dinozData)) {
				throw new ErrorFormator(400, 'dead');
			}
			const fightResult = calculateFight(team, dinozData.placeId, nextStepWantedData.fight);

			const result = await rewardFight(team, nextStepWantedData.fight, fightResult, dinozData.placeId, playerData);
			// Reward statement
			if (result.result) {
				await updateDinozStep(dinozId, pnj.id, nextStepWanted);
				if (nextStepWantedData.reward !== undefined) {
					await rewarder(nextStepWantedData.reward, team, playerId);
				}
			}
			return {
				name: npcName,
				speech: nextStepWantedData.nextStep[0],
				playerChoice: [],
				service: [ServiceEnum.FIGHT],
				fight: result
			};
		}

		if (!nextStepWantedData) {
			throw new ErrorFormator(500, `The step ${nextStepWanted} doesn't exist for the NPC ${npcName}`);
		}

		// Reward statement
		if (nextStepWantedData.reward !== undefined) {
			checkRedirect(nextStepWantedData.reward, npcName, nextStepWantedData.stepName);
			await rewarder(nextStepWantedData.reward, dinoz, playerId);

			//Refresh dinoz data to unlock next speech if it is conditioned by reward of the actual step
			const refreshedPlayer = await getDinozNPCRequest(dinozId, playerId);
			if (!refreshedPlayer) {
				throw new ErrorFormator(500, `Player ${playerId} doesn't exist.`);
			}
			const refreshedDinoz = player.dinoz.find(d => d.id === dinozId);
			if (!refreshedDinoz) {
				throw new ErrorFormator(500, `Dinoz ${dinozId} doesn't exist.`);
			}
			dinoz = player.dinoz;
		}

		await updateDinozStep(dinozId, pnj.id, nextStepWanted);
	}

	// Select nextStep to send to the player
	const playerChoices = nextStepWantedData.nextStep.filter(possibility => {
		const condition = Object.values(pnj.data).find(data => data.stepName === possibility)?.condition;
		// If there is a condition non-met, replace it with enmpty string
		if (!dinoz) {
			throw new ErrorFormator(500, `Dinoz ${dinozId} doesn't exist.`);
		}
		return condition === undefined || checkCondition(condition, player, dinozId);
	});

	return {
		name: npcName,
		speech: nextStepWantedData.stepName,
		playerChoice: playerChoices,
		flashvars: pnj.flashvars
	};
}

function checkRedirect(reward: Rewarder[], npcName: string, stepName: string) {
	// Send redirection request if there is one as a rewards
	if (reward.find(r => r.rewardType === RewardEnum.REDIRECT)) {
		const dataReturn = reward.find(r => r.rewardType === RewardEnum.REDIRECT);
		if (dataReturn?.rewardType === RewardEnum.REDIRECT) {
			return {
				name: npcName,
				speech: stepName,
				playerChoice: [],
				service: dataReturn.service
			};
		}
	}
}
