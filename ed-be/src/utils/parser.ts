import { Dinoz } from '../entity/dinoz.js';
import { Condition } from '@drpg/core/models/npc/NpcConditions';
import { ConditionEnum } from '@drpg/core/models/enums/Parser';
import { Place } from '@drpg/core/models/place/Place';
import { placeList } from '@drpg/core/models/place/PlaceList';

export function conditionParser(condition: Condition, dinoz: Dinoz, futurPlace?: Place): boolean {
	let result: boolean | undefined;
	const GOTO = condition[ConditionEnum.GOTO];
	const PLACE_IS = condition[ConditionEnum.PLACE_IS];

	if (condition[ConditionEnum.MINLEVEL]) {
		result = dinoz.level >= condition[ConditionEnum.MINLEVEL];
	} else if (condition[ConditionEnum.MAXLEVEL]) {
		result = dinoz.level <= condition[ConditionEnum.MAXLEVEL];
	} else if (condition[ConditionEnum.STATUS]) {
		result = dinoz.status.some(dinozStatus => dinozStatus.statusId === condition[ConditionEnum.STATUS]);
	} else if (condition[ConditionEnum.FINISHED_MISSION]) {
		result = dinoz.missions.find(missions => missions.missionId === condition[ConditionEnum.FINISHED_MISSION])
			?.isFinished;
	} else if (condition[ConditionEnum.SKILL]) {
		result = dinoz.skills.some(DinozSkill => DinozSkill.skillId === condition[ConditionEnum.SKILL]);
	} else if (GOTO) {
		let place = Object.entries(placeList).find(place => place[0].toUpperCase() === GOTO.toUpperCase());
		if (!place) {
			throw new Error(`Place ${GOTO} doesn't exist.`);
		}
		result = place[1].placeId === dinoz.placeId;
	} else if (PLACE_IS) {
		let thisplace = Object.values(placeList).find(place => place.name.toUpperCase() === PLACE_IS.toUpperCase());
		if (!thisplace) {
			throw new Error(`Place ${PLACE_IS} doesn't exist.`);
		}

		const placeIdToCompare = thisplace.placeId === 0 ? dinoz.placeId : thisplace.placeId;
		result = placeIdToCompare === dinoz.placeId;
	} else if (condition[ConditionEnum.SCENARIO]) {
		//TODO: Implement scenario
		result = false;
	} else if (condition[ConditionEnum.POSSESS_OBJECT]) {
		console.log(dinoz.player.items.some(item => item.itemId === condition[ConditionEnum.POSSESS_OBJECT]));
		result = dinoz.player.items.some(item => item.itemId === condition[ConditionEnum.POSSESS_OBJECT]);
	} else if (condition[ConditionEnum.RANDOM]) {
		const score = Math.floor(Math.random() * condition[ConditionEnum.RANDOM]);
		const target = 0;
		result = score == target;
	} else if (condition[ConditionEnum.NEXT_PLACE]) {
		result = futurPlace?.placeId === condition[ConditionEnum.NEXT_PLACE].placeId;
	} else if (condition[ConditionEnum.COLLEC]) {
		const playerRewards = dinoz.player.rewards;
		result = playerRewards.some(reward => reward.rewardId === condition[ConditionEnum.COLLEC]);
	} else if (condition[ConditionEnum.DINOZ_LIFE]) {
		switch (condition[ConditionEnum.DINOZ_LIFE][0]) {
			case '==':
				return dinoz.life === condition[ConditionEnum.DINOZ_LIFE][1];
			case '>':
				return dinoz.life > condition[ConditionEnum.DINOZ_LIFE][1];
			case '>=':
				return dinoz.life >= condition[ConditionEnum.DINOZ_LIFE][1];
			case '<':
				return dinoz.life < condition[ConditionEnum.DINOZ_LIFE][1];
			case '<=':
				return dinoz.life <= condition[ConditionEnum.DINOZ_LIFE][1];
			default:
				return false;
		}
	} else {
		result = false;
	}

	if (!result) result = false;

	return result;
}
