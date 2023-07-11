import { Request } from 'express';
import { Dinoz, NPC } from '../entity/index.js';
import { getDinozNPCRequest } from '../dao/dinozDao.js';
import { placeList } from '../constants/index.js';
import { npcList } from '../constants/npc.js';
import { createDinozStep, updateDinozStep } from '../dao/npcDao.js';
import { ErrorFormator } from '../utils/errorFormator.js';
import { NpcTalk } from '@drpg/core/models/npc/NpcTalk';
import { Place } from '@drpg/core/models/place/Place';
import { Npc } from '@drpg/core/models/npc/npc';
import { NpcData } from '@drpg/core/models/npc/NpcData';
import { Condition } from '@drpg/core/models/npc/NpcConditions';
import { rewarder } from '../utils/rewarder.js';
import { triggerAction } from '../utils/triggerAction.js';
import { checkCondition } from '../utils/checkConditions.js';

export async function getNpcSpeech(req: Request): Promise<NpcTalk> {
	const dinozId: number = parseInt(req.params.dinozId);
	const npcName: string = req.params.npc;
	let nextStepWanted: string = req.body.step;

	let dinoz: Dinoz = await getDinozNPCRequest(dinozId);

	// Check if dinoz belongs to player who do the request
	if (dinoz.player.id !== req.user!.playerId) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} doesn't belong to player ${req.user!.playerId}`);
	}

	const actualPlace: Place | undefined = Object.values(placeList).find(place => place.placeId === dinoz.placeId);
	const pnj: Npc | undefined = Object.values(npcList).find(pnj => pnj.name === npcName);

	if (!pnj) {
		throw new ErrorFormator(500, `NPC ${npcName} doesn't exists`);
	}
	if (actualPlace!.placeId !== pnj!.placeId) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} cannot talk to this NPC`);
	}

	let nextStepWantedData: NpcData | undefined = Object.values(pnj.data).find(
		pnj => pnj.stepName === nextStepWanted || pnj.alias === nextStepWanted
	);

	if (!nextStepWantedData) {
		throw new ErrorFormator(500, `The step ${nextStepWanted} doesn't exist for the NPC ${npcName}`);
	}

	if (nextStepWanted === nextStepWantedData.alias) {
		nextStepWanted = nextStepWantedData.stepName;
	}

	let dinozTalk: NPC | undefined = dinoz.NPC.find(npc => npc.npcId === pnj.id);
	// Create NPC's entry at first step for this dinoz
	if (dinozTalk === undefined) {
		dinozTalk = await createDinozStep(new NPC(new Dinoz(dinozId), pnj!.id, 'begin'));
	} else {
		if (req.body.stop) {
			const stopStep: NpcData = Object.values(pnj.data).find(pnj => pnj.stepName === 'stop')!;
			await updateDinozStep(dinozId, pnj.id, 'begin');
			return {
				name: npcName,
				speech: stopStep.stepName,
				playerChoice: stopStep.nextStep
			};
		}
		const actualStep: NpcData = Object.values(pnj.data).find(pnj => pnj.stepName === dinozTalk!.step)!;

		// Check if dinoz can go to this step
		if (
			nextStepWanted !== 'begin' &&
			!actualStep.nextStep.includes(nextStepWantedData!.stepName) &&
			!actualStep.nextStep.includes(nextStepWantedData!.alias!)
		) {
			throw new ErrorFormator(500, `This step is not reachable.`);
		}
		if (nextStepWantedData.condition !== undefined && !checkCondition(nextStepWantedData!.condition, dinoz)) {
			throw new ErrorFormator(500, `The dinoz doesn't fullfill the conditions.`);
		}

		if (nextStepWantedData.target !== undefined) {
			nextStepWantedData = Object.values(pnj.data).find(pnj => pnj.stepName === nextStepWantedData!.target);
		}

		let action: boolean | undefined;
		if (nextStepWantedData!.action !== undefined) {
			action = await triggerAction(nextStepWantedData!.action, dinoz);
		}

		if ((action && nextStepWantedData!.reward) || nextStepWantedData!.reward !== undefined) {
			await rewarder(nextStepWantedData!.reward, dinoz);
			//Refresh dinoz data to unlock next speech if it is conditioned by reward of the actual step
			dinoz = await getDinozNPCRequest(dinozId);
		}

		await updateDinozStep(dinozId, pnj.id, nextStepWanted);
	}

	// Select nextStep to send to the player
	const playerChoices: Array<string> = nextStepWantedData!.nextStep.filter(possibility => {
		const condition: Condition | undefined = Object.values(pnj!.data).find(data => data.stepName === possibility)
			?.condition;
		// If there is a condition non-met, replace it with enmpty string
		return condition === undefined || checkCondition(condition, dinoz);
	});

	return {
		name: npcName,
		speech: nextStepWantedData!.stepName,
		playerChoice: playerChoices,
		flashvars: pnj.flashvars
	};
}
