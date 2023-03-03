import { Mission, MissionSteps } from './index.js';
import { Dinoz, DinozMission } from '../../entity/index.js';

export interface MissionCheck {
	dinoz: Dinoz;
	dinozMission: DinozMission;
	missionReference: Mission;
	actualStep: MissionSteps;
}
