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
import translate from '../utils/server/translate.js';
import { calculateFightVsMonsters, rewardFightVsMonsters } from './fightService.js';
import { Npc } from '@drpg/core/models/npc/npc';
import { NpcData } from '@drpg/core/models/npc/NpcData';
import { Item } from '@drpg/core/models/item/ItemList';

// TODO explain core logic
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
		throw new ExpectedError(`Dinoz not found.`);
	}
	if (dinozBase.canChangeName) {
		throw new ExpectedError(`Dinoz has to be named.`);
	}
	if (!isAlive(dinozBase)) {
		throw new ExpectedError(`Dinoz is dead.`);
	}

	const dinozCurrentPlace = Object.values(placeList).find(place => place.placeId === dinozBase.placeId);
	if (!dinozCurrentPlace) {
		throw new ExpectedError(`Place ${dinozBase.placeId} doesn't exist.`);
	}
	const npc = Object.values(npcList).find(npc => npc.name === npcName);
	if (!npc) {
		throw new ExpectedError(`NPC ${npcName} doesn't exists`);
	}
	if (dinozCurrentPlace.placeId !== npc.placeId) {
		throw new ExpectedError(`Dinoz ${dinozId} not in same location as NPC`);
	}

	let dinozCurrentNpcStep = dinozBase.npcs.find(n => n.npcId === npc.id);

	// Find step data based on name or alias
	let nextStepWantedData = Object.values(npc.data).find(
		data => data.stepName === nextStepWanted || data.alias === nextStepWanted
	);

	if (!nextStepWantedData) {
		throw new ExpectedError(`The step ${nextStepWanted} doesn't exist for the NPC ${npcName}`);
	}

	// If the wanted step came from an alias, use the real step name.
	if (nextStepWantedData.alias && nextStepWanted === nextStepWantedData.alias) {
		console.log(`Used alias ${nextStepWanted}`);
		nextStepWanted = nextStepWantedData.stepName;
	}

	let debugCurrentStep = dinozCurrentNpcStep === undefined ? 'undefined' : dinozCurrentNpcStep.step;

	console.log(`Current step: ${debugCurrentStep}, next step chosen is: ${nextStepWanted} (${nextStepWantedData.stepName})`);

	// The wanted step conditions must be met at all times.
	if (!checkCondition(nextStepWantedData.condition, player, dinozId)) {
		throw new ExpectedError(`Dinoz doesn't fulfill the conditions.`);
	}

	// If there is a redirection, replace data with it.
	if (nextStepWantedData.redirect !== undefined) {
		const nonNullNextStepWantedData = nextStepWantedData;
		nextStepWantedData = Object.values(npc.data).find(npc => npc.stepName === nonNullNextStepWantedData.redirect);
		if (!nextStepWantedData) {
			throw new ExpectedError(`Invalid redirect.`);
		}
		// if there is an error relating to redirect, it's here.
		nextStepWanted = nextStepWantedData.stepName;
	}

	if (nextStepWantedData.initialStep === true) {
		// NPC conditions must be met for the initial step.
		if (npc.condition && !checkCondition(npc.condition, player, dinozId)) {
			throw new ExpectedError(`Dinoz ${dinozId} doesn't meet requirement to talk to ${npc.name}.`);
		}

		// At this point the Dinoz is at an initial step of the NPC and both the NPC and wanted step conditions are met.
		if (dinozCurrentNpcStep === undefined) {
			// Create NPC's entry at first step for this dinoz
			await createDinozStep(dinozId, {
				npcId: npc.id,
				step: nextStepWantedData.stepName
			});
		} else {
			// Update NPC entry.
			await updateDinozStep(dinozId, npc.id, nextStepWantedData.stepName);
		}
		
		// Note: initial steps cannot trigger fights, redirect or have rewards.

		console.log(`Initial step processed`);

		return {
			name: npcName,
			speech: nextStepWantedData.stepName,
			// Return only the next steps that the player can do.
			playerChoice: nextStepWantedData.nextStep.filter(
				step => player && checkCondition(npc.data[step].condition, player, dinozId)
			)
		};
	} else if (dinozCurrentNpcStep === undefined) {
		// At this point the Dinoz has no history with that NPC and wants a non-initial step.
		// This is an error case.

		console.log(`Dinoz current step does not exist.`);

		// Make sure it meets the NPC conditions and at least one initial step is found to redirect the Dinoz to it.
		if (npc.condition && !checkCondition(npc.condition, player, dinozId)) {
			throw new ExpectedError(`Dinoz ${dinozId} doesn't meet requirement to talk to ${npc.name}.`);
		}

		const initialStepData = Object.values(npc.data).find(
			step => step.initialStep && player && checkCondition(step.condition, player, dinozId)
		);
		if (!initialStepData) {
			throw new ExpectedError(`No valid initial step found for NPC ${npcName}.`);
		}

		// // Override with initial step data
		// nextStepWantedData = initialStepData;
		// nextStepWanted = initialStepData.stepName;

		console.log(`Redirecting ${dinozId} to initial ${npc.id}'s step: ${initialStepData.stepName}`);

		// Create NPC history
		await createDinozStep(dinozId, {
			npcId: npc.id,
			step: initialStepData.stepName
		});

		console.log(`createDinozStep ran`);
		
		return {
			name: npcName,
			speech: initialStepData.stepName,
			// Return only the next steps that the Dinoz has access to.
			playerChoice: initialStepData.nextStep.filter(
				step => player && checkCondition(npc.data[step].condition, player, dinozId)
			)
		};
	}

	console.log(`Processing chosen step.`);

	// At this point the wanted step is not an initial step, its conditions are met and the Dinoz has history with that NPC.
	// The NPC conditions and initial step conditions are assumed to be met by continuity and are not checked again here.

	let dinozCurrentStepData = Object.values(npc.data).find(npc => npc.stepName === dinozCurrentNpcStep.step);
	if (!dinozCurrentStepData) {
		throw new ExpectedError(`Dialog ${dinozCurrentNpcStep.step} does not exist for NPC ${npcName}.`);
	}
	
	// The Dinoz need to still meet the condition of its current step.
	if (!checkCondition(dinozCurrentStepData.condition, player, dinozId)) {
		throw new ExpectedError(`Player no longer meets condition for this dialog.`);
	}

	// Verify the wanted step is included in the possible next steps of the Dinoz current step.
	console.log(`Step included: ${dinozCurrentStepData.nextStep.includes(nextStepWantedData.stepName)}`);
	console.log(`Alias included: ${nextStepWantedData.alias !== undefined && dinozCurrentStepData.nextStep.includes(nextStepWantedData.alias)}`);
	if (!dinozCurrentStepData.nextStep.includes(nextStepWantedData.stepName) && !(nextStepWantedData.alias !== undefined && dinozCurrentStepData.nextStep.includes(nextStepWantedData.alias) )) {
		throw new ExpectedError(`NPC ${npcName} dialog ${nextStepWanted} is not available for your Dinoz.`);
	}

	// Note: stop step not needed
	// Handle stop step
	// if (req.body.stop) return await handleStopStep(dinozId, npc, npcName);

	let speechRewards: [Item, number][] = [];

	// Next step is a fight! Play out the fight.
	if (nextStepWantedData.fight) {
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

		const result = await rewardFightVsMonsters(
			team,
			nextStepWantedData.fight,
			fightResult,
			dinozData.placeId,
			playerData
		);

		// Update next step only upon victory
		if (result.result) {
			await updateDinozStep(dinozId, npc.id, nextStepWanted);
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
	
	if (nextStepWantedData.reward !== undefined) {
		checkRedirect(nextStepWantedData.reward, npcName, nextStepWantedData.stepName);
		speechRewards = await rewarder(nextStepWantedData.reward, player.dinoz, authed.id, false);
		// Refresh dinoz data to unlock next speech if it is conditioned by reward of the actual step
		player = await getDinozNPCRequest(dinozId, authed.id);
	}

	// Finally save step
	console.log(`Updating Dinoz step.`);
	await updateDinozStep(dinozId, npc.id, nextStepWanted);

	const playerChoices = nextStepWantedData.nextStep.filter(possibility => {
		const condition = Object.values(npc.data).find(data => data.stepName === possibility)?.condition;
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
		flashvars: npc.flashvars,
		service: nextStepServices(nextStepWantedData),
		rewards: speechRewards.reduce(
			(acc, [item, quantity]) => {
				acc[item] = quantity;
				return acc;
			},
			{} as Partial<Record<Item, number>>
		)
	};

}

/**
 * Get services to call after the NPC talk
 */
const nextStepServices = (data: NpcData) => {
	return data.reward
		?.filter(r => 'service' in r)
		.map(r => ('service' in r ? r.service : []))
		.reduce((acc, curr) => (curr ? acc?.concat(curr) : acc), []);
};

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
