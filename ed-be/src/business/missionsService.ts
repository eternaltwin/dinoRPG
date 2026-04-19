import { MissionsStatus } from '@drpg/core/models/enums/MissionsStatus';
import { ConditionEnum } from '@drpg/core/models/enums/Parser';
import { PlaceEnum } from '@drpg/core/models/enums/PlaceEnum';
import { FightResult } from '@drpg/core/models/fight/FightResult';
import { monsterList } from '@drpg/core/models/fight/MonsterList';
import { Mission } from '@drpg/core/models/missions/mission';
import { MissionID } from '@drpg/core/models/missions/missionList';
import { MissionStep } from '@drpg/core/models/missions/missionSteps';
import { npcList } from '@drpg/core/models/npc/NpcList';
import { placeList, PlacesByMap } from '@drpg/core/models/place/PlaceList';
import { Reward } from '@drpg/core/models/reward/RewardList';
import { DinozToGetActualStep, getActualStep } from '@drpg/core/utils/MissionUtils';
import { checkCondition } from '@drpg/core/utils/checkCondition';
import { Dinoz, DinozMission } from '@drpg/prisma';
import { Request } from 'express';
import {
	PlayerWithMissionData,
	getDinozFicheRequest,
	getDinozFightDataRequest,
	getDinozMissionsInfo,
	getGlobalMissionsData
} from '../dao/dinozDao.js';
import {
	addMissionToDinoz,
	finishMission,
	removeMissionFromDinoz,
	updateMissionProgression,
	updateMissionStep
} from '../dao/dinozMissionDao.js';
import { getPlayerRewards } from '../dao/playerRewardsDao.js';
import { rewarder } from '../utils/rewarder.js';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { auth } from '../dao/playerDao.js';
import { calculateFightVsMonsters, rewardFightVsMonsters } from './fightService.js';
import { decreaseItemQuantity, getPlayerItems } from '../dao/playerItemDao.js';
import translate from '../utils/translate.js';
import { FighterType } from '@drpg/core/models/fight/DetailedFighter';

export async function getMissionsList(req: Request) {
	const dinozId = +req.params.id;
	const npcName = req.params.npc;
	const authed = await auth(req);
	const player = await getDinozMissionsInfo(dinozId, authed.id);
	if (!player) {
		throw new ExpectedError(`Player ${authed.id} doesn't exist.`);
	}
	const dinoz = player.dinoz.find(d => d.id === dinozId);
	if (!dinoz) {
		throw new ExpectedError(`Dinoz ${dinozId} doesn't exist.`);
	}
	const currentPlace = Object.values(placeList).find(place => place.placeId === dinoz.placeId);
	const npc = Object.values(npcList).find(npc => npc.name === npcName);

	if (dinoz.canChangeName) {
		throw new ExpectedError(`Dinoz has to be named.`);
	}

	if (!currentPlace) {
		throw new ExpectedError(`Place ${dinoz.placeId} doesn't exist.`);
	}

	if (!npc) {
		throw new ExpectedError(`NPC ${npcName} doesn't exists`);
	}

	if (!npc.missions) {
		throw new ExpectedError(`NPC ${npcName} doesn't have any missions`);
	}

	if (currentPlace.placeId !== npc.placeId) {
		throw new ExpectedError(`Dinoz ${dinozId} cannot talk to this NPC`);
	}

	return missionSort(npc.missions, player, dinozId);
}

export async function updateMission(req: Request) {
	const dinozId = +req.params.dinozId;
	const missionId = +req.params.missionId;
	const status = req.body.status;
	const authed = await auth(req);

	const player = await getDinozMissionsInfo(dinozId, authed.id);
	if (!player) {
		throw new ExpectedError(`No player found.`);
	}
	const dinoz = player.dinoz.find(d => d.id === dinozId);
	if (!dinoz) {
		throw new ExpectedError(`Player ${dinozId} doesn't exist.`);
	}
	const npc = Object.values(npcList).find(npc => npc.missions?.find(mission => mission.missionId === missionId));
	const actualPlace = Object.values(placeList).find(place => place.placeId === dinoz.placeId);

	if (!actualPlace) {
		throw new ExpectedError(`Place ${dinoz.placeId} doesn't exist.`);
	}

	if (!npc) {
		throw new ExpectedError(`This mission doesn't exist`);
	}
	const npcMissions = missionSort(npc.missions || [], player, dinozId);

	switch (status) {
		case 'start':
			if (actualPlace.placeId !== npc.placeId) {
				throw new ExpectedError(`Dinoz ${dinozId} cannot talk to this NPC`);
			} else if (npcMissions.find(mission => mission.missionId === missionId)?.status === MissionsStatus.FINISHED) {
				throw new ExpectedError(`This mission is already done`);
			} else if (npcMissions.some(mission => mission.status === MissionsStatus.ONGOING)) {
				throw new ExpectedError(`A mission is already in progress`);
			} else if (npcMissions.find(mission => mission.missionId === missionId)?.status === MissionsStatus.UNAVAILABLE) {
				throw new ExpectedError(`This mission is unavailable`);
			} else {
				await addMissionToDinoz(authed.id, {
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
				throw new ExpectedError(`This mission is already done`);
			} else if (!npcMissions.some(mission => mission.status === MissionsStatus.ONGOING)) {
				throw new ExpectedError(`There is no mission in progress`);
			} else if (npcMissions.find(mission => mission.missionId === missionId)?.status === MissionsStatus.UNAVAILABLE) {
				throw new ExpectedError(`This mission is unavailable`);
			} else {
				await removeMissionFromDinoz(authed.id, dinoz.id, missionId);
				return true;
			}
		default:
			throw new ExpectedError("This status don't exist");
	}
}

export async function startFightMission(req: Request) {
	const authed = await auth(req);
	const mission = await checkMission(req);
	const task = mission.actualStep.requirement.actionType;

	if (task !== ConditionEnum.LAUNCH_FIGHT) {
		return;
	}

	const dinoz_fiche = await getDinozFicheRequest(mission.dinoz.id, authed.id);
	const leadDinoz = dinoz_fiche?.dinoz.find(d => d.id === mission.dinoz.id);
	const lead = leadDinoz?.leaderId;

	let dinoz_fight;

	if (!lead) {
		dinoz_fight = mission.dinoz.id;
	} else {
		dinoz_fight = lead;
	}

	if (!dinoz_fight) {
		throw new ExpectedError('error dinoz_fight');
	}
	const player = await getDinozFightDataRequest(dinoz_fight, authed.id);
	if (!player) {
		throw new ExpectedError(`No player ${authed.id} found`);
	}
	const team = player.dinoz;
	const ennemi_team = mission.actualStep.requirement.mobList;

	const fightResult = calculateFightVsMonsters(team, player, mission.actualStep.place, ennemi_team);
	const fight: FightResult = await rewardFightVsMonsters(
		team,
		ennemi_team,
		fightResult,
		mission.actualStep.place,
		player
	);
	if (mission.actualStep.requirement.startText) {
		fight.startText = mission.actualStep.requirement.startText;
	}

	if (mission.actualStep.requirement.endText) {
		fight.endText = mission.actualStep.requirement.endText;
	}

	await updateMissionStep(authed.id, [mission.dinoz.id], mission.dinozMission.missionId, mission.actualStep.stepId + 1);
	return fight;
}

export async function interactMission(req: Request) {
	const authed = await auth(req);

	const mission = await checkMission(req);

	const task = mission.actualStep.requirement.actionType;

	switch (task) {
		case ConditionEnum.TALKTO:
		case ConditionEnum.DO:
			await updateMissionStep(
				authed.id,
				[mission.dinoz.id],
				mission.dinozMission.missionId,
				mission.actualStep.stepId + 1
			);
			return `${mission.missionReference.missionName}.${mission.actualStep.displayedText}`;
		case ConditionEnum.GIVE_ITEM:
			const { requirement } = mission.actualStep;
			const playerItems = await getPlayerItems(authed.id, { itemId: requirement.item.itemId });
			const playerNbItem = playerItems[0]?.quantity || 0;
			if (playerNbItem < requirement.itemQuantity) {
				throw new ExpectedError(translate('notEnoughItem', authed));
			}
			await decreaseItemQuantity(authed.id, requirement.item.itemId, requirement.itemQuantity);
			await updateMissionStep(
				authed.id,
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

	const authed = await auth(req);

	await rewarder(mission.missionReference.rewards, [mission.dinoz], authed.id, false);
	await finishMission(authed.id, mission.dinoz.id, mission.dinozMission.missionId);
	return mission.missionReference.rewards;
}

async function checkMission(req: Request) {
	const dinozId = +req.params.dinozId;
	const missionId = +req.body.missionId;
	const authed = await auth(req);

	const player = await getDinozMissionsInfo(dinozId, authed.id);
	if (!player) {
		throw new ExpectedError(`No player found.`);
	}
	const dinoz = player.dinoz.find(d => d.id === dinozId);
	if (!dinoz) {
		throw new ExpectedError(`Player ${dinozId} doesn't exist.`);
	}
	if (!dinoz) {
		throw new ExpectedError(`Player ${dinozId} doesn't exist.`);
	}
	const dinozMission = dinoz.missions.find(mission => mission.missionId === missionId);

	if (!dinozMission) {
		throw new ExpectedError('This mission is not started yet');
	}
	if (dinozMission.isFinished) {
		throw new ExpectedError('This mission is already over');
	}

	const npc = Object.values(npcList).find(npc =>
		npc.missions?.find(mission => mission.missionId === dinozMission.missionId)
	);
	const missionReference = Object.values(npc?.missions || {}).find(
		missions => missions.missionId === dinozMission.missionId
	);
	if (!missionReference) {
		throw new ExpectedError('No mission found');
	}

	const actualStep = missionReference.steps.find(step => step.stepId === dinozMission.step);
	if (!actualStep) {
		throw new ExpectedError('No step found');
	}
	if (dinoz.placeId !== actualStep.place && actualStep.place !== PlaceEnum.ANYWHERE) {
		throw new ExpectedError('The dinoz is not at the expected place.');
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
		throw new ExpectedError(`No active dinoz.`);
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
		throw new ExpectedError('No mission found');
	}

	//Increment the progress of killing mobs
	if (
		(dinoz.placeId === actualStep.place || actualStep.place === PlaceEnum.ANYWHERE) &&
		fight.result &&
		actualStep.requirement.actionType === ConditionEnum.KILL &&
		PlacesByMap[actualStep.requirement.zone]?.includes(dinoz.placeId) &&
		(actualStep.requirement.target.includes(monsterList.ANY.name) ||
			actualStep.requirement.target.filter(value => fight.fighters.map(a => a.name).includes(value)).length > 0)
	) {
		const dinozMission = dinoz.missions.find(mission => !mission.isFinished);
		// const presentOpponents = actualStep.requirement.target.filter(value => monsters.includes(value));
		let count = 0;
		for (const opponent of fight.fighters.filter(f => f.type === FighterType.MONSTER)) {
			if (actualStep.requirement.target.includes(monsterList.ANY.name)) count++;
			else if (actualStep.requirement.target.includes(opponent.name)) count++;
		}
		if (!dinozMission) {
			throw new ExpectedError('No mission found');
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
		throw new ExpectedError('No player found');
	}

	if (actualStep.requirement.actionType !== ConditionEnum.KILL) return;
	const progressTarget = actualStep.requirement.value;

	const dinozMission = dinoz.missions.find(mission => !mission.isFinished);

	if (!dinozMission) {
		throw new ExpectedError('No mission found');
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
	const authed = await auth(req);

	// Get player rewards
	const rewards = await getPlayerRewards(authed.id);

	// Check if player has PMI
	const hasPMI = rewards.some(reward => reward.rewardId === Reward.PMI);

	// Stop if player doesn't have PMI
	if (!hasPMI) {
		throw new ExpectedError('Player has no PMI');
	}

	// Get player Dinoz and their missions
	const dinozList = await getGlobalMissionsData(authed.id);

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
