import { statusList } from '../constants/status.js';
import { Dinoz } from '../entity/dinoz.js';
import { missionsList } from '../constants/missions.js';
import { placeList } from '../constants/index.js';
import { Condition } from '@drpg/core/models/npc/NpcConditions';
import { ConditionEnum } from '@drpg/core/models/enums/Parser';
import { Place } from '@drpg/core/models/place/Place';

export function conditionParser(condition: Condition, dinoz: Dinoz): boolean {
	let result: boolean | undefined = undefined;
	switch (condition.conditionType) {
		case ConditionEnum.MINLEVEL:
			result = dinoz.level >= condition.value;
			break;
		case ConditionEnum.MAXLEVEL:
			result = dinoz.level < condition.value;
			break;
		case ConditionEnum.STATUS:
			let status = Object.entries(statusList).find(status => status[0] === condition.value.toUpperCase()) as [
				string,
				number
			];
			result = dinoz.status.some(dinozStatus => dinozStatus.statusId === status[1]);
			break;
		case ConditionEnum.FINISHED_MISSION:
			let mission = Object.entries(missionsList).find(mission => mission[0] === condition.value.toUpperCase()) as [
				string,
				number
			];
			result = dinoz.missions.find(missions => missions.missionId === mission[1])?.isFinished;
			break;
		case ConditionEnum.SKILL:
			result = dinoz.skills.some(DinozSkill => DinozSkill.skillId === condition.value);
			break;
		case ConditionEnum.GOTO:
			let place = Object.entries(placeList).find(place => place[0].toUpperCase() === condition.value.toUpperCase()) as [
				string,
				Place
			];
			result = place[1].placeId === dinoz.placeId;
			break;
		case ConditionEnum.PLACE_IS:
			let thisplace = Object.entries(placeList).find(
				place => place[1].name.toUpperCase() === condition.value.toUpperCase()
			) as [string, Place];
			result = thisplace[1].placeId === dinoz.placeId;
			break;
		case ConditionEnum.SCENARIO:
			//TODO: Implement scenario
			result = false;
			break;
		case ConditionEnum.POSSESS_OBJECT:
			result = dinoz.player.items.some(item => item.itemId === condition.value);
			break;
		case ConditionEnum.RANDOM:
			result = true;
			break;
		default:
			break;
	}

	if (condition.conditionType !== ConditionEnum.RANDOM && condition.reverse) {
		result = !result;
	}
	return result!;
}
