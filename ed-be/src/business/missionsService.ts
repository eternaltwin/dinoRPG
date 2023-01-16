import { Request } from 'express';
import { Mission, MissionSteps, MissionList, MissionsStatus, Npc, Place } from '../models/index.js';
import { Dinoz, DinozMission } from '../entity/index.js';
import { getDinozMissionsInfo } from '../dao/dinozDao.js';
import { placeList } from '../constants/index.js';
import { checkCondition, rewarder } from '../utils/parser.js';
import { npcList } from '../constants/npc.js';
import { ErrorFormator } from '../utils/errorFormator.js';
import { addMissionToDinoz, finishMission, removeMissionToDinoz, updateMissionStep } from '../dao/dinozMissionDao.js';
import { ConditionEnum } from '../models/enums/Parser.js';

const getMissionsList = async (req: Request): Promise<Array<MissionList>> => {
	const dinozId: number = parseInt(req.params.id);
	const npcName: string = req.params.npc;
	const dinoz: Dinoz = await getDinozMissionsInfo(dinozId);
	const currentPlace: Place | undefined = Object.values(placeList).find(place => place.placeId === dinoz.placeId);
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
};

const updateMission = async (req: Request): Promise<boolean> => {
	const dinozId: number = parseInt(req.params.dinozId);
	const missionId: number = parseInt(req.params.missionId);
	const status: string = req.body.status;

	const dinoz: Dinoz = await getDinozMissionsInfo(dinozId);
	const npc: Npc | undefined = Object.values(npcList).find(npc =>
		npc.missions?.find(mission => mission.missionId === missionId)
	);
	const actualPlace: Place | undefined = Object.values(placeList).find(place => place.placeId === dinoz.placeId);

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
};

const interactMission = async (req: Request): Promise<string> => {
	const dinozId: number = parseInt(req.params.dinozId);
	const missionId: number = req.body.missionId;
	// const target: string = req.body.task;

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

	const task = actualStep.requirement?.split('(')[0];

	switch (task) {
		case ConditionEnum.TALKTO:
			await updateMissionStep(dinoz.id, dinozMission.missionId, actualStep.stepId + 1);
			return `${missionReference.missionName}.${actualStep.displayedText!}`;
		case ConditionEnum.FINISH_MISSION:
			await rewarder(missionReference.rewards, dinoz);
			await finishMission(dinoz.id, dinozMission.missionId);
			return missionReference.rewards.join('-');
		default:
			return 'error';
	}
};

function getMissionAction(dinoz: Dinoz): string | undefined {
	const actualStep = getActualStep(dinoz);

	if (!actualStep) {
		return;
	}

	if (
		actualStep.requirement &&
		dinoz.placeId === Object.entries(placeList).find(place => place[1].name === actualStep.place)![1].placeId
	) {
		return actualStep.displayedAction;
	} else return;
}

function getHUDObjective(dinoz: Dinoz): string | undefined {
	const actualStep = getActualStep(dinoz);

	if (!actualStep) {
		return;
	}

	const dinozActualPlace = Object.values(placeList).find(place => place.placeId === dinoz.placeId) as Place;

	if (dinozActualPlace.name === actualStep.place) {
		return actualStep.requirement;
	} else if (!actualStep.hidePlace && actualStep.requirement!.includes('validate')) {
		return actualStep.requirement;
	} else if (!actualStep.hidePlace) {
		return `goto(${actualStep.place})`;
	} else {
		return `hidePlace`;
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
	return missionReference.steps.find(step => step.stepId === missionDinoz.step) as MissionSteps;
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

export { getMissionsList, updateMission, interactMission, getHUDObjective, getMissionAction };
