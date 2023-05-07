import { Request } from 'express';
import { Dinoz, DinozMission } from '../entity/index.js';
import { getDinozMissionsInfo } from '../dao/dinozDao.js';
import { placeList } from '../constants/index.js';
import { checkCondition, rewarder } from '../utils/parser.js';
import { npcList } from '../constants/npc.js';
import { ErrorFormator } from '../utils/errorFormator.js';
import {
	addMissionToDinoz,
	finishMission,
	removeMissionToDinoz,
	updateMissionProgression,
	updateMissionStep
} from '../dao/dinozMissionDao.js';
import _ from 'lodash';
import { MissionList } from '@drpg/core/models/missions/missionList';
import { PlaceDisplayed } from '@drpg/core/../../../core/src/models/place/PlaceDisplayed';
import { MissionsStatus } from '@drpg/core/models/enums/MissionsStatus';
import { Npc } from '@drpg/core/models/npc/npc';
import { ConditionEnum } from '@drpg/core/models/enums/Parser';
import { Rewarder } from '@drpg/core/models/reward/Rewarder';
import { Mission } from '@drpg/core/models/missions/mission';
import { MissionSteps } from '@drpg/core/models/missions/missionSteps';
import { MissionHUD } from '@drpg/core/models/missions/missionHUD';
import { FightResult } from '@drpg/core/models/fight/FightResult';
import { MissionCheck } from '../models/missionCheck.js';

export async function getMissionsList(req: Request): Promise<Array<MissionList>> {
	const dinozId: number = parseInt(req.params.id);
	const npcName: string = req.params.npc;
	const dinoz: Dinoz = await getDinozMissionsInfo(dinozId);
	const currentPlace: PlaceDisplayed | undefined = Object.values(placeList).find(place => place.placeId === dinoz.placeId);
	const npc = Object.values(npcList).find(npc => npc.name === npcName);

	if (dinoz.player.id !== req.user!.playerId) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} doesn't belong to player ${req.user!.playerId}`);
	}

	if (!npc) {
		throw new ErrorFormator(500, `NPC ${npcName} doesn't exists`);
	}

	if (!npc.missions) {
		throw new ErrorFormator(500, `NPC ${npcName} doesn't have any missions`);
	}

	if (currentPlace!.placeId !== npc!.placeId) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} cannot talk to this NPC`);
	}

	return missionSort(npc.missions, dinoz);
}

export async function updateMission(req: Request): Promise<boolean> {
	const dinozId: number = parseInt(req.params.dinozId);
	const missionId: number = parseInt(req.params.missionId);
	const status: string = req.body.status;

	const dinoz: Dinoz = await getDinozMissionsInfo(dinozId);
	const npc: Npc | undefined = Object.values(npcList).find(npc =>
		npc.missions?.find(mission => mission.missionId === missionId)
	);
	const actualPlace: PlaceDisplayed | undefined = Object.values(placeList).find(place => place.placeId === dinoz.placeId);

	if (dinoz.player.id !== req.user!.playerId) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} doesn't belong to player ${req.user!.playerId}`);
	}

	if (!npc) {
		throw new ErrorFormator(500, `This mission doesn't exist`);
	}
	const npcMissions = missionSort(npc.missions!, dinoz);

	switch (status) {
		case 'start':
			if (actualPlace!.placeId !== npc!.placeId) {
				throw new ErrorFormator(500, `Dinoz ${dinozId} cannot talk to this NPC`);
			} else if (npcMissions.find(mission => mission.missionId === missionId)!.status === MissionsStatus.FINISHED) {
				throw new ErrorFormator(500, `This mission is already done`);
			} else if (npcMissions.some(mission => mission.status === MissionsStatus.ONGOING)) {
				throw new ErrorFormator(500, `A mission is already in progress`);
			} else if (npcMissions.find(mission => mission.missionId === missionId)!.status === MissionsStatus.UNAVAILABLE) {
				throw new ErrorFormator(500, `This mission is unavailable`);
			} else {
				await addMissionToDinoz(new DinozMission(dinoz, missionId));
				return true;
			}
		case 'stop':
			if (npcMissions.find(mission => mission.missionId === missionId)!.status === MissionsStatus.FINISHED) {
				throw new ErrorFormator(500, `This mission is already done`);
			} else if (!npcMissions.some(mission => mission.status === MissionsStatus.ONGOING)) {
				throw new ErrorFormator(500, `There is no mission in progress`);
			} else if (npcMissions.find(mission => mission.missionId === missionId)!.status === MissionsStatus.UNAVAILABLE) {
				throw new ErrorFormator(500, `This mission is unavailable`);
			} else {
				await removeMissionToDinoz(dinoz.id, missionId);
				return true;
			}
		default:
			throw new ErrorFormator(500, "This status don't exist");
	}
}

export async function interactMission(req: Request): Promise<string> {
	const mission = await checkMission(req);

	const task = mission.actualStep.requirement.actionType;

	switch (task) {
		case ConditionEnum.TALKTO:
			await updateMissionStep(mission.dinoz.id, mission.dinozMission.missionId, mission.actualStep.stepId + 1);
			return `${mission.missionReference.missionName}.${mission.actualStep.displayedText!}`;
		case ConditionEnum.DO:
			await updateMissionStep(mission.dinoz.id, mission.dinozMission.missionId, mission.actualStep.stepId + 1);
			return `${mission.missionReference.missionName}.${mission.actualStep.displayedText!}`;
		default:
			return 'error';
	}
}

export async function endMission(req: Request): Promise<Array<Rewarder>> {
	const mission = await checkMission(req);

	await rewarder(mission.missionReference.rewards, mission.dinoz);
	await finishMission(mission.dinoz.id, mission.dinozMission.missionId);
	return mission.missionReference.rewards;
}

async function checkMission(req: Request): Promise<MissionCheck> {
	const dinozId: number = parseInt(req.params.dinozId);
	const missionId: number = req.body.missionId;

	const dinoz: Dinoz = await getDinozMissionsInfo(dinozId);
	const dinozMission = dinoz.missions.find(mission => mission.missionId === missionId);
	if (dinoz.player.id !== req.user!.playerId) {
		throw new ErrorFormator(500, `Dinoz ${dinozId} doesn't belong to player ${req.user!.playerId}`);
	}

	if (!dinozMission) {
		throw new ErrorFormator(500, 'This mission is not started yet');
	}
	if (dinozMission.isFinished) {
		throw new ErrorFormator(500, 'This mission is already over');
	}

	const npc = Object.values(npcList).find(npc =>
		npc.missions?.find(mission => mission.missionId === dinozMission.missionId)
	) as Npc;
	const missionReference = Object.values(npc.missions!).find(
		missions => missions.missionId === dinozMission.missionId
	) as Mission;
	const actualStep = missionReference.steps.find(step => step.stepId === dinozMission.step) as MissionSteps;

	if (dinoz.placeId != Object.values(placeList).find(place => place.name === actualStep.place)!.placeId) {
		throw new ErrorFormator(500, 'The dinoz is not at the expected place.');
	}
	return { dinoz: dinoz, dinozMission: dinozMission, missionReference: missionReference, actualStep: actualStep };
}
export function getMissionAction(dinoz: Dinoz): string | undefined {
	const actualStep = getActualStep(dinoz);

	if (!actualStep) {
		return;
	}

	if (
		dinoz.placeId === Object.entries(placeList).find(place => place[1].name === actualStep.place)![1].placeId &&
		!actualStep.displayedAction!.includes('kill')
	) {
		return actualStep.displayedAction;
	} else return;
}

export function getHUDObjective(dinoz: Dinoz): MissionHUD | undefined {
	const actualStep = getActualStep(dinoz);

	if (!actualStep) {
		return;
	}

	const dinozActualPlace = Object.values(placeList).find(place => place.placeId === dinoz.placeId) as PlaceDisplayed;
	let HUD: MissionHUD = actualStep.requirement;

	if (HUD.actionType === ConditionEnum.KILL) {
		HUD.progress = actualStep.progress;
	}

	if (dinozActualPlace.name === actualStep.place || actualStep.place === placeList.ANYWHERE.name) {
		return HUD;
	} else if (!actualStep.hidePlace && HUD.actionType === ConditionEnum.FINISH_MISSION) {
		return HUD;
	} else if (!actualStep.hidePlace) {
		HUD.actionType = ConditionEnum.GOTO;
		HUD.target = actualStep.place;
		return HUD;
	} else {
		HUD.actionType = ConditionEnum.HIDE_PLACE;
		return HUD;
	}
}

function getActualStep(dinoz: Dinoz): MissionSteps | undefined {
	const missionDinoz: DinozMission | undefined = dinoz.missions.find(mission => !mission.isFinished);
	if (!missionDinoz) {
		return;
	}
	const npc = Object.values(npcList).find(npc =>
		npc.missions?.find(mission => mission.missionId === missionDinoz.missionId)
	) as Npc;
	const missionReference = Object.values(npc.missions!).find(
		missions => missions.missionId === missionDinoz.missionId
	) as Mission;
	const missionReturn = _.cloneDeep(
		missionReference.steps.find(step => step.stepId === missionDinoz.step) as MissionSteps
	);
	missionReturn.progress = missionDinoz.progress;
	return missionReturn;
}

function missionSort(missions: Array<Mission>, dinoz: Dinoz): Array<MissionList> {
	return missions.map(missions => {
		const missionKnown = dinoz.missions.find(element => element.missionId === missions.missionId);
		let status: MissionsStatus;
		/* Vérifie si les conditions sont remplies pour commencer la missions.
         Si oui => status = MissionsStatus.AVAILABLE
         Si non => status = MissionsStatus.UNAVAILABLE
         */
		if (!missionKnown) {
			if (missions.condition && !checkCondition(missions.condition, dinoz)) {
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

export async function checkMissionFight(dinoz: Dinoz, fight: FightResult): Promise<void> {
	//Retrieve mission on its way and the step
	const actualStep = getActualStep(dinoz) as MissionSteps;
	//Increment the progress of killing mobs
	if (
		(dinoz.placeId === Object.values(placeList).find(place => place.name === actualStep.place)?.placeId ||
			actualStep.place === placeList.ANYWHERE.name) &&
		fight.result &&
		actualStep.requirement.actionType === ConditionEnum.KILL &&
		(actualStep.requirement.target.split(':').some(mob => mob === fight.opponent) ||
			actualStep.requirement.target === 'any')
	) {
		await updateMissionProgression(dinoz.id, dinoz.missions.find(mission => !mission.isFinished)?.missionId!, 1);
		await checkProgressEnd(dinoz, fight, actualStep);
	}
}

async function checkProgressEnd(dinoz: Dinoz, fight: FightResult, actualStep: MissionSteps): Promise<void> {
	if (actualStep.requirement.actionType !== ConditionEnum.KILL) return;
	const progressTarget = actualStep.requirement.value;

	let progress = dinoz.missions.find(mission => !mission.isFinished)!.progress;
	const missionId = dinoz.missions.find(mission => !mission.isFinished)!.missionId;

	if (fight.result) {
		progress += 1; //replace by fight.opponent.length when we can fight multiple opponent
	}
	if (progress >= progressTarget) {
		await updateMissionStep(dinoz.id, missionId, actualStep.stepId + 1);
	}
}
