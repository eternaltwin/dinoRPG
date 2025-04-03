import { Request } from 'express';
import { RewardEnum } from '@drpg/core/models/enums/Parser';
import { npcList } from '@drpg/core/models/npc/NpcList';
import { NpcTalk } from '@drpg/core/models/npc/NpcTalk';
import { placeList } from '@drpg/core/models/place/PlaceList';
import { checkCondition } from '@drpg/core/utils/checkCondition';
import { ServiceEnum } from '@drpg/core/models/enums/ServiceEnum';
import { Rewarder } from '@drpg/core/models/reward/Rewarder';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { isAlive } from '@drpg/core/utils/DinozUtils';
import { getDinozFightDataRequest, getDinozNPCRequest } from '../dao/dinozDao.js';
import { createDinozStep, updateDinozStep } from '../dao/npcDao.js';
import { auth } from '../dao/playerDao.js';
import { rewarder } from '../utils/rewarder.js';
import translate from '../utils/translate.js';
import { calculateFightVsMonsters, rewardFight } from './fightService.js';
import { Npc } from '@drpg/core/models/npc/npc';

export async function getNpcSpeech(req: Request): Promise<NpcTalk> {
	const dinozId = +req.params.dinozId;
	const npcName: string = req.params.npc;
	let nextStepWanted: string = req.body.step;

	const authed = await auth(req);

	let player = await getDinozNPCRequest(dinozId, authed.id);
	if (!player) {
		throw new ExpectedError(`Player ${authed.id} doesn't exist.`);
	}

	const dinozBase = player.dinoz.find(d => d.id === dinozId);
	if (!dinozBase) {
		throw new ExpectedError(`Dinoz is not here.`);
	}
	if (dinozBase.canChangeName) {
		throw new ExpectedError(`Dinoz has to be named.`);
	}

	const actualPlace = Object.values(placeList).find(place => place.placeId === dinozBase.placeId);
	const pnj = Object.values(npcList).find(pnj => pnj.name === npcName);
	if (!actualPlace) {
		throw new ExpectedError(`Place ${dinozBase.placeId} doesn't exist.`);
	}
	if (!pnj) {
		throw new ExpectedError(`NPC ${npcName} doesn't exists`);
	}

	if (req.body.stop !== true && pnj.condition && !checkCondition(pnj.condition, player, dinozId)) {
		throw new ExpectedError(`Dinoz ${dinozId} don't meet requirement to talk to ${pnj.name}.`);
	}
	if (actualPlace.placeId !== pnj.placeId && !req.body.stop) {
		throw new ExpectedError(`Dinoz ${dinozId} cannot talk to this NPC`);
	}

	// Management of multiple initial steps
	const initialStepData = Object.values(pnj.data).find(
		step => step.initialStep && player && checkCondition(step.condition, player, dinozId)
	);

	if (!initialStepData) {
		throw new ExpectedError(`No valid initial step found for NPC ${npcName}.`);
	}

	let nextStepWantedData = Object.values(pnj.data).find(
		pnj => pnj.stepName === nextStepWanted || pnj.alias === nextStepWanted
	);

	if (!nextStepWantedData) {
		throw new ExpectedError(`The step ${nextStepWanted} doesn't exist for the NPC ${npcName}`);
	}

	if (nextStepWanted === nextStepWantedData.alias) {
		nextStepWanted = nextStepWantedData.stepName;
	}

	let dinozTalk = dinozBase.npcs.find(npc => npc.npcId === pnj.id);
	// Create NPC's entry at first step for this dinoz
	if (dinozTalk === undefined) {
		dinozTalk = await createDinozStep(dinozId, {
			npcId: pnj.id,
			step: initialStepData.stepName
		});
	} else {
		if (req.body.stop) return await handleStopStep(dinozId, pnj, npcName);

		const actualStep = Object.values(pnj.data).find(pnj => pnj.stepName === dinozTalk?.step);

		if (!actualStep) {
			throw new ExpectedError(`The step ${dinozTalk?.step} doesn't exist for the NPC ${npcName}`);
		}

		// Check if dinoz can go to this step
		/*if (
			nextStepWanted !== 'begin' &&
			!actualStep.nextStep.includes(nextStepWantedData.stepName) &&
			!actualStep.nextStep.includes(nextStepWantedData.alias || '')
		) {
			await updateDinozStep(dinozId, pnj.id, 'begin');
			const beginStep = Object.values(pnj.data).find(pnj => pnj.initialStep);
			if (!beginStep) throw new ExpectedError(`Begin step did not exist for NPC ${pnj.name}`);
			return {
				name: npcName,
				speech: beginStep.stepName,
				playerChoice: beginStep.nextStep
			};
		}*/
		if (
			!actualStep.nextStep.includes(nextStepWantedData.stepName) &&
			!actualStep.nextStep.includes(nextStepWantedData.alias || '')
		) {
			await updateDinozStep(dinozId, pnj.id, initialStepData.stepName);
			return {
				name: npcName,
				speech: initialStepData.stepName,
				playerChoice: initialStepData.nextStep.filter(
					step => player && checkCondition(pnj.data[step].condition, player, dinozId)
				)
			};
		}
		if (nextStepWantedData.condition !== undefined && !checkCondition(nextStepWantedData.condition, player, dinozId)) {
			throw new ExpectedError(`The dinoz doesn't fullfill the conditions.`);
		}

		if (nextStepWantedData.target !== undefined) {
			const nonNullNextStepWantedData = nextStepWantedData;
			nextStepWantedData = Object.values(pnj.data).find(pnj => pnj.stepName === nonNullNextStepWantedData.target);
			if (!nextStepWantedData) {
				throw new ExpectedError(`Invalid target.`);
			}
			// if there is an error relating to target, it's here
			nextStepWanted = nextStepWantedData.stepName;
		}

		// Action
		if (nextStepWantedData && nextStepWantedData.fight) {
			const playerData = await getDinozFightDataRequest(dinozId, authed.id);
			if (!playerData) {
				throw new ExpectedError(`No player ${authed.id} found`);
			}
			const dinozData = playerData.dinoz.find(d => d.id === dinozId);
			if (!dinozData) {
				throw new ExpectedError(`Player ${dinozId} doesn't exist.`);
			}

			const team = [dinozData];
			if (!isAlive(dinozData)) {
				throw new ExpectedError(translate('dead', authed));
			}
			const fightResult = calculateFightVsMonsters(team, playerData, dinozData.placeId, nextStepWantedData.fight);

			const result = await rewardFight(team, nextStepWantedData.fight, fightResult, dinozData.placeId, playerData);
			// Reward statement
			if (result.result) {
				await updateDinozStep(dinozId, pnj.id, nextStepWanted);
				if (nextStepWantedData.reward !== undefined) {
					await rewarder(nextStepWantedData.reward, team, authed.id, true);
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
			throw new ExpectedError(`The step ${nextStepWanted} doesn't exist for the NPC ${npcName}`);
		}

		// Reward statement
		if (nextStepWantedData.reward !== undefined) {
			checkRedirect(nextStepWantedData.reward, npcName, nextStepWantedData.stepName);
			await rewarder(nextStepWantedData.reward, player.dinoz, authed.id, true);

			//Refresh dinoz data to unlock next speech if it is conditioned by reward of the actual step
			player = await getDinozNPCRequest(dinozId, authed.id);
		}

		await updateDinozStep(dinozId, pnj.id, nextStepWanted);
	}

	// Select nextStep to send to the player
	const playerChoices = nextStepWantedData.nextStep.filter(possibility => {
		const condition = Object.values(pnj.data).find(data => data.stepName === possibility)?.condition;
		// If there is a condition non-met, replace it with enmpty string
		if (!player) {
			throw new ExpectedError(`Player ${authed.id} doesn't exist.`);
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

async function handleStopStep(dinozId: number, pnj: Npc, npcName: string) {
	// Management of ending the conversation with the NPC
	const stopStep = Object.values(pnj.data).find(pnj => pnj.stepName === 'stop');
	if (!stopStep) {
		throw new ExpectedError(`The step stop doesn't exist for the NPC ${npcName}`);
	}

	await updateDinozStep(dinozId, pnj.id, 'begin');
	return {
		name: npcName,
		speech: stopStep.stepName,
		playerChoice: stopStep.nextStep
	};
}
