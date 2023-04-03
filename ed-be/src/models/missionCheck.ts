import { Dinoz, DinozMission } from '../entity/index.js';
import { Mission } from '@drpg/core/models/missions/mission';
import { MissionSteps } from '@drpg/core/models/missions/missionSteps';

export interface MissionCheck {
	dinoz: Dinoz;
	dinozMission: DinozMission;
	missionReference: Mission;
	actualStep: MissionSteps;
}
