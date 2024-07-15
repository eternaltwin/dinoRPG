import { MissionsStatus } from '@drpg/core/models/enums/MissionsStatus';
import { ConditionEnum } from '@drpg/core/models/enums/Parser';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { FightResult } from '@drpg/core/models/fight/FightResult';
import { monsterList } from '@drpg/core/models/fight/MonsterList';
import { Mission } from '@drpg/core/models/missions/mission';
import { MissionID } from '@drpg/core/models/missions/missionList';
import { MissionStep } from '@drpg/core/models/missions/missionSteps';
import { npcList } from '@drpg/core/models/npc/NpcList';
import { placeList } from '@drpg/core/models/place/PlaceList';
import { Reward } from '@drpg/core/models/reward/RewardList';
import { DinozToGetActualStep, getActualStep } from '@drpg/core/utils/MissionUtils';
import { checkCondition } from '@drpg/core/utils/checkCondition';
import { Dinoz, DinozMission } from '@drpg/prisma';
import { Request } from 'express';
import { PlayerWithMissionData, getDinozMissionsInfo, getGlobalMissionsData } from '../dao/dinozDao.js';
import {
	addMissionToDinoz,
	finishMission,
	removeMissionFromDinoz,
	updateMissionProgression,
	updateMissionStep
} from '../dao/dinozMissionDao.js';
import { getPlayerRewards } from '../dao/playerRewardsDao.js';
import { ErrorFormator } from '../utils/errorFormator.js';
import { rewarder } from '../utils/rewarder.js';

export async function getMissionsList(req: Request) {
	const dinozId = +req.params.id;
	const npcName = req.params.npc;
	if (!req.auth || !req.auth.playerId) {
		throw new ErrorFormator(500, `Player is not authenticated`);
	}
	const playerId = +req.auth.playerId;
	const player = await getDinozMissionsInfo(dinozId, playerId);
	if (!player) {
		throw new ErrorFormator(500, `Player ${playerId} doesn't exist.`);
	}
	const dinoz = player.dinoz.find(d => d.id === dinozId);
	if (!dinoz) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} doesn't exist.`);
	}
	const currentPlace = Object.values(placeList).find(place => place.placeId === dinoz.placeId);
	const npc = Object.values(npcList).find(npc => npc.name === npcName);

	if (dinoz.canChangeName) {
		throw new ErrorFormator(500, `Dinoz has to be named.`);
	}

	if (!currentPlace) {
		throw new ErrorFormator(500, `Place ${dinoz.placeId} doesn't exist.`);
	}

	if (!npc) {
		throw new ErrorFormator(500, `NPC ${npcName} doesn't exists`);
	}

	if (!npc.missions) {
		throw new ErrorFormator(500, `NPC ${npcName} doesn't have any missions`);
	}

	if (currentPlace.placeId !== npc.placeId) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} cannot talk to this NPC`);
	}

	return missionSort(npc.missions, player, dinozId);
}

export async function updateMission(req: Request) {
	const dinozId = +req.params.dinozId;
	const missionId = +req.params.missionId;
	const status = req.body.status;
	const playerId = req.auth?.playerId;

	if (!playerId) {
		throw new ErrorFormator(500, 'No player found');
	}

	const player = await getDinozMissionsInfo(dinozId, playerId);
	if (!player) {
		throw new ErrorFormator(500, `No player found.`);
	}
	const dinoz = player.dinoz.find(d => d.id === dinozId);
	if (!dinoz) {
		throw new ErrorFormator(500, `Player ${dinozId} doesn't exist.`);
	}
	const npc = Object.values(npcList).find(npc => npc.missions?.find(mission => mission.missionId === missionId));
	const actualPlace = Object.values(placeList).find(place => place.placeId === dinoz.placeId);

	if (!actualPlace) {
		throw new ErrorFormator(500, `Place ${dinoz.placeId} doesn't exist.`);
	}

	if (!npc) {
		throw new ErrorFormator(500, `This mission doesn't exist`);
	}
	const npcMissions = missionSort(npc.missions || [], player, dinozId);

	switch (status) {
		case 'start':
			if (actualPlace.placeId !== npc.placeId) {
				throw new ErrorFormator(500, `Dinoz ${dinozId} cannot talk to this NPC`);
			} else if (npcMissions.find(mission => mission.missionId === missionId)?.status === MissionsStatus.FINISHED) {
				throw new ErrorFormator(500, `This mission is already done`);
			} else if (npcMissions.some(mission => mission.status === MissionsStatus.ONGOING)) {
				throw new ErrorFormator(500, `A mission is already in progress`);
			} else if (npcMissions.find(mission => mission.missionId === missionId)?.status === MissionsStatus.UNAVAILABLE) {
				throw new ErrorFormator(500, `This mission is unavailable`);
			} else {
				await addMissionToDinoz(playerId, {
					dinoz: { connect: { id: dinozId } },
					missionId: missionId,
					step: 0,
					isFinished: false,
					progress: 0
				});
				return true;
			}
		case 'stop':
			if (npcMissions.find(mission => mission.missionId === missionId)?.status === MissionsStatus.FINISHED) {
				throw new ErrorFormator(500, `This mission is already done`);
			} else if (!npcMissions.some(mission => mission.status === MissionsStatus.ONGOING)) {
				throw new ErrorFormator(500, `There is no mission in progress`);
			} else if (npcMissions.find(mission => mission.missionId === missionId)?.status === MissionsStatus.UNAVAILABLE) {
				throw new ErrorFormator(500, `This mission is unavailable`);
			} else {
				await removeMissionFromDinoz(playerId, dinoz.id, missionId);
				return true;
			}
		default:
			throw new ErrorFormator(500, "This status don't exist");
	}
}

export async function interactMission(req: Request) {
	const playerId = req.auth?.playerId;

	if (!playerId) {
		throw new ErrorFormator(500, 'No player found');
	}

	const mission = await checkMission(req);

	const task = mission.actualStep.requirement.actionType;

	switch (task) {
		case ConditionEnum.TALKTO:
			await updateMissionStep(
				playerId,
				[mission.dinoz.id],
				mission.dinozMission.missionId,
				mission.actualStep.stepId + 1
			);
			return `${mission.missionReference.missionName}.${mission.actualStep.displayedText}`;
		case ConditionEnum.DO:
			await updateMissionStep(
				playerId,
				[mission.dinoz.id],
				mission.dinozMission.missionId,
				mission.actualStep.stepId + 1
			);
			return `${mission.missionReference.missionName}.${mission.actualStep.displayedText}`;
		default:
			return 'error';
	}
}

export async function endMission(req: Request) {
	const mission = await checkMission(req);

	const playerId = req.auth?.playerId;

	if (!playerId) {
		throw new ErrorFormator(500, 'No player found');
	}

	await rewarder(mission.missionReference.rewards, [mission.dinoz], playerId);
	await finishMission(playerId, mission.dinoz.id, mission.dinozMission.missionId);
	return mission.missionReference.rewards;
}

async function checkMission(req: Request) {
	const dinozId = +req.params.dinozId;
	const missionId = +req.body.missionId;
	const playerId = req.auth?.playerId;

	if (!playerId) {
		throw new ErrorFormator(500, 'No player found');
	}

	const player = await getDinozMissionsInfo(dinozId, playerId);
	if (!player) {
		throw new ErrorFormator(500, `No player found.`);
	}
	const dinoz = player.dinoz.find(d => d.id === dinozId);
	if (!dinoz) {
		throw new ErrorFormator(500, `Player ${dinozId} doesn't exist.`);
	}
	if (!dinoz) {
		throw new ErrorFormator(500, `Player ${dinozId} doesn't exist.`);
	}
	const dinozMission = dinoz.missions.find(mission => mission.missionId === missionId);

	if (!dinozMission) {
		throw new ErrorFormator(500, 'This mission is not started yet');
	}
	if (dinozMission.isFinished) {
		throw new ErrorFormator(500, 'This mission is already over');
	}

	const npc = Object.values(npcList).find(
		npc => npc.missions?.find(mission => mission.missionId === dinozMission.missionId)
	);
	const missionReference = Object.values(npc?.missions || {}).find(
		missions => missions.missionId === dinozMission.missionId
	);
	if (!missionReference) {
		throw new ErrorFormator(500, 'No mission found');
	}

	const actualStep = missionReference.steps.find(step => step.stepId === dinozMission.step);
	if (!actualStep) {
		throw new ErrorFormator(500, 'No step found');
	}
	if (dinoz.placeId !== actualStep.place && actualStep.place !== PlaceEnum.ANYWHERE) {
		throw new ErrorFormator(500, 'The dinoz is not at the expected place.');
	}
	return {
		dinoz: dinoz,
		dinozMission: dinozMission,
		missionReference: missionReference,
		actualStep: actualStep
	};
}

export function getMissionAction(
	dinoz: Pick<Dinoz, 'placeId'> & {
		missions: Pick<DinozMission, 'missionId' | 'step' | 'progress' | 'isFinished'>[];
	}
) {
	const actualStep = getActualStep(dinoz);

	if (!actualStep) {
		return;
	}

	if (
		(dinoz.placeId === actualStep.place || actualStep.place === PlaceEnum.ANYWHERE) &&
		!actualStep.displayedAction.includes('kill')
	) {
		return actualStep.displayedAction;
	} else return;
}

function missionSort(missions: Mission[], player: PlayerWithMissionData, activeDinoz: number) {
	const dinoz = player.dinoz.find(d => d.id === activeDinoz);
	if (!dinoz) {
		throw new ErrorFormator(500, `No active dinoz.`);
	}
	return missions.map(missions => {
		const missionKnown = dinoz.missions.find(element => element.missionId === missions.missionId);
		let status;
		/* Vérifie si les conditions sont remplies pour commencer la missions.
				Si oui => status = MissionsStatus.AVAILABLE
				Si non => status = MissionsStatus.UNAVAILABLE
				 */
		if (!missionKnown) {
			if (missions.condition && !checkCondition(missions.condition, player, dinoz.id)) {
				status = MissionsStatus.UNAVAILABLE;
			} else {
				status = MissionsStatus.AVAILABLE;
			}
		} else if (missionKnown.isFinished) {
			//Si la mission est terminée
			status = MissionsStatus.FINISHED;
		} else {
			//Si aucun des précédents, alors la mission est en cours
			status = MissionsStatus.ONGOING;
		}
		return {
			missionId: missions.missionId,
			status: status
		};
	});
}

export type DinozToCheckMissionFight = Parameters<typeof checkMissionFight>[0];
export async function checkMissionFight(
	dinoz: DinozToGetActualStep &
		Pick<Dinoz, 'placeId' | 'id' | 'playerId'> & {
			missions: DinozMission[];
		},
	fight: FightResult
) {
	//Retrieve mission on its way and the step
	const actualStep = getActualStep(dinoz);

	if (!actualStep) {
		throw new ErrorFormator(500, 'No mission found');
	}

	//Increment the progress of killing mobs
	if (
		(dinoz.placeId === actualStep.place || actualStep.place === PlaceEnum.ANYWHERE) &&
		fight.result &&
		actualStep.requirement.actionType === ConditionEnum.KILL &&
		(actualStep.requirement.target.includes(monsterList.ANY.name) ||
			actualStep.requirement.target.filter(value => fight.fighters.map(a => a.name).includes(value)).length > 0)
	) {
		const dinozMission = dinoz.missions.find(mission => !mission.isFinished);
		// const presentOpponents = actualStep.requirement.target.filter(value => monsters.includes(value));
		let count = 0;
		for (const opponent of fight.fighters.filter(f => f.type === 'monster')) {
			if (actualStep.requirement.target.includes(monsterList.ANY.name)) count++;
			else if (actualStep.requirement.target.includes(opponent.name)) count++;
		}
		if (!dinozMission) {
			throw new ErrorFormator(500, 'No mission found');
		}
		await updateMissionProgression(dinoz.id, dinozMission.missionId, { progress: { increment: count } });
		await checkProgressEnd(dinoz, fight, actualStep, count);
	}
}

export async function checkProgressEnd(
	dinoz: Pick<Dinoz, 'id' | 'playerId'> & { missions: DinozMission[] },
	fight: FightResult,
	actualStep: MissionStep,
	killedProgress: number
): Promise<void> {
	if (!dinoz.playerId) {
		throw new ErrorFormator(500, 'No player found');
	}

	if (actualStep.requirement.actionType !== ConditionEnum.KILL) return;
	const progressTarget = actualStep.requirement.value;

	const dinozMission = dinoz.missions.find(mission => !mission.isFinished);

	if (!dinozMission) {
		throw new ErrorFormator(500, 'No mission found');
	}
	let progress = dinozMission.progress || 0;
	const missionId = dinozMission.missionId;

	if (fight.result) {
		progress += killedProgress; //replace by fight.opponent.length when we can fight multiple opponent
	}
	if (progress >= progressTarget) {
		await updateMissionStep(dinoz.playerId, [dinoz.id], missionId, actualStep.stepId + 1);
	}
}

/**
 * Get data needed for the /missions page
 */
export async function getGlobalMissions(req: Request) {
	// Check if player is logged in
	if (!req.auth || !req.auth.playerId) {
		throw new ErrorFormator(500, 'No player found');
	}

	const playerId = req.auth.playerId;

	// Get player rewards
	const rewards = await getPlayerRewards(playerId);

	// Check if player has PMI
	const hasPMI = rewards.some(reward => reward.rewardId === Reward.PMI);

	// Stop if player doesn't have PMI
	if (!hasPMI) {
		throw new ErrorFormator(500, 'Player has no PMI');
	}

	// Get player Dinoz and their missions
	const dinozList = await getGlobalMissionsData(playerId);

	// Get NPCs with missions
	const npcsWithMissions = Object.values(npcList).filter(npc => npc.missions?.length);

	return dinozList.map(dinoz => ({
		id: dinoz.id,
		name: dinoz.name,
		display: dinoz.display,
		missions: npcsWithMissions
			.map(npc => {
				const npcMissions = npc.missions || [];

				return {
					npc: npc.name,
					missions: dinoz.missions.reduce<{ id: MissionID; name: string }[]>((acc, mission) => {
						// Filter out missions that are not finished
						if (!mission.isFinished) {
							return acc;
						}

						const foundMission = npcMissions.find(npcMission => npcMission.missionId === mission.missionId);

						// Filter out missions that are not from the current NPC
						if (!foundMission) {
							return acc;
						}

						acc.push({
							id: mission.missionId,
							name: foundMission.missionName
						});

						return acc;
					}, [])
				};
			})
			.filter(npc => npc.missions.length)
	}));
}
