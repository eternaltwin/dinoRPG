import { Dinoz, DinozMission } from '@drpg/prisma';
import { ConditionEnum } from '../models/enums/Parser.mjs';
import { MissionHUD } from '../models/missions/missionHUD.mjs';
import { MissionStep } from '../models/missions/missionSteps.mjs';
import { npcList } from '../models/npc/NpcList.mjs';
import { placeList } from '../models/place/PlaceList.mjs';
import { PlaceEnum } from '../models/enums/PlaceEnum.mjs';

export function getHUDObjective(
	dinoz: Pick<Dinoz, 'placeId'> & {
		missions: Pick<DinozMission, 'missionId' | 'step' | 'progress' | 'isFinished' | 'checkTimeMission'>[];
	}
) {
	const actualStep = getActualStep(dinoz);

	if (!actualStep) {
		return null;
	}

	const dinozActualPlace = Object.values(placeList).find(place => place.placeId === dinoz.placeId);
	const HUD: MissionHUD = actualStep.requirement;

	if (HUD.actionType === ConditionEnum.KILL || HUD.actionType === ConditionEnum.HOUR) {
		HUD.progress = actualStep.progress;
	}

	if (actualStep.displayedHUD) {
		HUD.actionType = ConditionEnum.OVERWRITE;
		HUD.target = actualStep.displayedHUD;
		return HUD;
	}

	if (!dinozActualPlace) {
		return HUD;
	}

	if (dinozActualPlace.placeId === actualStep.place || actualStep.place === PlaceEnum.ANYWHERE) {
		return HUD;
	} else if (!actualStep.hidePlace && HUD.actionType === ConditionEnum.FINISH_MISSION) {
		return HUD;
	} else if (!actualStep.hidePlace) {
		HUD.actionType = ConditionEnum.GOTO;
		HUD.target = placeList[actualStep.place].name;
		return HUD;
	} else {
		HUD.actionType = ConditionEnum.HIDE_PLACE;
		return HUD;
	}
}

export type DinozToGetActualStep = Parameters<typeof getActualStep>[0];

/**
 * @summary Retrieve mission step of the dinoz on its way
 * @param dinoz Dinoz to get the actual step
 * @returns The mission step or undefined if the dinoz has no mission
 */
export function getActualStep(dinoz: {
	missions: Pick<DinozMission, 'missionId' | 'step' | 'progress' | 'isFinished' | 'checkTimeMission'>[];
}): MissionStep | undefined {
	const missionDinoz = dinoz.missions.find(mission => !mission.isFinished);
	if (!missionDinoz) {
		return;
	}

	const missionStartTime = missionDinoz.checkTimeMission;
	if (!missionStartTime) {
		return;
	}

	const npc = Object.values(npcList).find(
		npc => npc.missions?.find(mission => mission.missionId === missionDinoz.missionId)
	);

	if (!npc || !npc.missions) {
		return;
	}

	const missionReference = Object.values(npc.missions).find(missions => missions.missionId === missionDinoz.missionId);

	if (!missionReference) {
		return;
	}

	const missionReturn = structuredClone(missionReference.steps.find(step => step.stepId === missionDinoz.step));

	if (!missionReturn) {
		return;
	}
	missionReturn.progress = missionDinoz.progress ?? undefined;
	return missionReturn;
}
