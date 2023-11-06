import { Dinoz } from '../entity/dinoz.js';
import { placeList } from '../constants/index.js';
import { Condition } from '@drpg/core/models/npc/NpcConditions';
import { ConditionEnum } from '@drpg/core/models/enums/Parser';
import { Place } from '@drpg/core/models/place/Place';

export function conditionParser(condition: Condition, dinoz: Dinoz, futurPlace?: Place): boolean {
	let result: boolean | undefined;
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
			let thisplace = Object.values(placeList).find(
				place => place.name.toUpperCase() === condition.value.toUpperCase()
			) as Place;
			if (thisplace.placeId === 0) thisplace.placeId = dinoz.placeId;
			result = thisplace.placeId === dinoz.placeId;
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
			return score == target;
		case ConditionEnum.NEXT_PLACE:
			result = futurPlace === condition.value;
			break;
		case ConditionEnum.COLLEC:
			const playerRewards = dinoz.player.rewards;
			result = playerRewards.some(reward => reward.rewardId === condition.value);
			break;
		case ConditionEnum.DINOZ_LIFE:
			switch (condition.target) {
				case 'equal':
					return dinoz.life === condition.value;
				case 'greater':
					return dinoz.life > condition.value;
				case 'greaterEqual':
					return dinoz.life >= condition.value;
				case 'lesser':
					return dinoz.life < condition.value;
				case 'lesserEqual':
					return dinoz.life <= condition.value;
				default:
					return false;
			}
			break;
		default:
			result = false;
			break;
	}

	if (!result) result = false;

	if (condition.reverse) {
		result = !result;
	}
	return result;
}
