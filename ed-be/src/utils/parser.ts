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
			result = dinoz.status.some(dinozStatus => dinozStatus.statusId === condition.value);
			break;
		case ConditionEnum.FINISHED_MISSION:
			result = dinoz.missions.find(missions => missions.missionId === condition.value)?.isFinished;
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
			result = (dinoz.player.items.find(item => item.itemId === condition.value)?.quantity ?? 0) > 0;
			break;
		case ConditionEnum.RANDOM:
			const score: number = Math.floor(Math.random() * condition.value);
			const target: number = 0;
			result = score == target;
			break;
		default:
			break;
	}

	if (condition.conditionType !== ConditionEnum.RANDOM && condition.reverse) {
		result = !result;
	}
	return result!;
}
