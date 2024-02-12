import { RewardEnum } from '@drpg/core/models/enums/Parser';
import { npcList } from '@drpg/core/models/npc/NpcList';
import { NpcTalk } from '@drpg/core/models/npc/NpcTalk';
import { placeList } from '@drpg/core/models/place/PlaceList';
import { checkCondition } from '@drpg/core/utils/checkCondition';
import { Request } from 'express';
import { getDinozFightDataRequest, getDinozNPCRequest, updateDinoz } from '../dao/dinozDao.js';
import { createDinozStep, updateDinozStep } from '../dao/npcDao.js';
import { getAllInformationFromPlayer } from '../dao/playerDao.js';
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

	const dinozBase = await getDinozNPCRequest(dinozId);
	const player = await getAllInformationFromPlayer(req.auth.playerId);

	if (!dinozBase || !player) {
		throw new ErrorFormator(500, `Player ${req.auth.playerId} doesn't exist.`);
	}

	if (dinozBase.canChangeName) {
		throw new ErrorFormator(500, `Dinoz has to be named.`);
	}

	let dinoz = {
		...dinozBase,
		player
	};

	// Check if dinoz belongs to player who do the request
	if (dinoz.player.id !== req.auth.playerId) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} doesn't belong to player ${req.auth.playerId}`);
	}

	const actualPlace = Object.values(placeList).find(place => place.placeId === dinoz.placeId);
	const pnj = Object.values(npcList).find(pnj => pnj.name === npcName);

	if (!actualPlace) {
		throw new ErrorFormator(500, `Place ${dinoz.placeId} doesn't exist.`);
	}

	if (!pnj) {
		throw new ErrorFormator(500, `NPC ${npcName} doesn't exists`);
	}

	if (req.body.stop !== true && pnj.condition && !checkCondition(pnj.condition, [dinoz])) {
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

	let dinozTalk = dinoz.npcs.find(npc => npc.npcId === pnj.id);
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
		if (nextStepWantedData.condition !== undefined && !checkCondition(nextStepWantedData.condition, [dinoz])) {
			throw new ErrorFormator(500, `The dinoz doesn't fullfill the conditions.`);
		}

		if (nextStepWantedData.target !== undefined) {
			const nonNullNextStepWantedData = nextStepWantedData;
			nextStepWantedData = Object.values(pnj.data).find(pnj => pnj.stepName === nonNullNextStepWantedData.target);
			nextStepWanted = nonNullNextStepWantedData.stepName;
		}

		// Action
		if (nextStepWantedData && nextStepWantedData.fight) {
			const dinozData = await getDinozFightDataRequest(dinozId);
			if (!dinozData) {
				throw new ErrorFormator(500, `Player ${dinozId} doesn't exist.`);
			}
			let followers = dinozData.followers.map(follower => ({
				...follower,
				player: dinozData.player
			}));
			const deadFollowers = followers.filter(d => d.life <= 0);

			if (deadFollowers.length > 0) {
				for (const d of deadFollowers) {
					await updateDinoz(d.id, { leader: { disconnect: true } });
				}
				followers = followers.filter(d => d.life > 0);
			}

			const team = [dinozData, ...followers];
			if (!isAlive(dinozData)) {
				throw new ErrorFormator(400, 'dead');
			}
			const fightResult = calculateFight(team, nextStepWantedData.fight, dinoz.placeId);

			const result = await rewardFight(team, nextStepWantedData.fight, fightResult);
			// Reward statement
			if (result.result) {
				await updateDinozStep(dinozId, pnj.id, nextStepWanted);
				if (nextStepWantedData.reward !== undefined) {
					await rewarder(nextStepWantedData.reward, [dinoz]);
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
			await rewarder(nextStepWantedData.reward, [dinoz]);

			//Refresh dinoz data to unlock next speech if it is conditioned by reward of the actual step
			const refreshedDinoz = await getDinozNPCRequest(dinozId);

			if (!refreshedDinoz) {
				throw new ErrorFormator(500, `Dinoz ${dinozId} doesn't exist.`);
			}
			dinoz = {
				...refreshedDinoz,
				player
			};
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
		return condition === undefined || checkCondition(condition, [dinoz]);
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
