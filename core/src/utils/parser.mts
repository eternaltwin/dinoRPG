import { ConditionEnum } from '../models/enums/Parser.mjs';
import { Condition } from '../models/npc/NpcConditions.mjs';
import { Place } from '../models/place/Place.mjs';
import { placeList } from '../models/place/PlaceList.mjs';
import { DinozForConditionCheck } from '../constants.mjs';

export function conditionParser(
	condition: Condition,
	dinozList: DinozForConditionCheck[],
	futurPlace?: Place
): boolean {
	let result;
	const GOTO = condition[ConditionEnum.GOTO];
	const PLACE_IS = condition[ConditionEnum.PLACE_IS];

	const MIN_LEVEL = condition[ConditionEnum.MINLEVEL];
	const MAX_LEVEL = condition[ConditionEnum.MAXLEVEL];
	const STATUS = condition[ConditionEnum.STATUS];
	const FINISHED_MISSION = condition[ConditionEnum.FINISHED_MISSION];
	const SKILL = condition[ConditionEnum.SKILL];
	const SCENARIO = condition[ConditionEnum.SCENARIO];
	const POSSESS_OBJECT = condition[ConditionEnum.POSSESS_OBJECT];
	const RANDOM = condition[ConditionEnum.RANDOM];
	const NEXT_PLACE = condition[ConditionEnum.NEXT_PLACE];
	const COLLEC = condition[ConditionEnum.COLLEC];
	const DINOZ_LIFE = condition[ConditionEnum.DINOZ_LIFE];
	const ACTIVE = condition[ConditionEnum.ACTIVE];

	if (MIN_LEVEL) {
		result = dinozList.every(dinoz => dinoz.level >= MIN_LEVEL);
	} else if (MAX_LEVEL) {
		result = dinozList.every(dinoz => dinoz.level <= MAX_LEVEL);
	} else if (STATUS) {
		result = dinozList.every(dinoz => dinoz.status.some(st => st.statusId === STATUS));
	} else if (FINISHED_MISSION) {
		result = dinozList.every(
			dinoz => dinoz.missions.find(missions => missions.missionId === FINISHED_MISSION)?.isFinished ?? false
		);
	} else if (SKILL) {
		result = dinozList.every(dinoz => dinoz.skills.some(dinozSkill => dinozSkill.skillId === SKILL));
	} else if (GOTO) {
		const place = Object.entries(placeList).find(place => place[0].toUpperCase() === GOTO.toUpperCase());
		if (!place) {
			throw new Error(`Place ${GOTO} doesn't exist.`);
		}
		result = dinozList.every(dinoz => place[1].placeId === dinoz.placeId);
	} else if (PLACE_IS) {
		const thisplace = Object.values(placeList).find(place => place.name.toUpperCase() === PLACE_IS.toUpperCase());
		if (!thisplace) {
			throw new Error(`Place ${PLACE_IS} doesn't exist.`);
		}

		result = dinozList.every(dinoz => (thisplace.placeId || dinoz.placeId) === dinoz.placeId);
	} else if (SCENARIO) {
		//TODO: Implement scenario
		result = false;
	} else if (POSSESS_OBJECT) {
		result = dinozList.every(dinoz => dinoz.player?.items.some(item => item.itemId === POSSESS_OBJECT));
	} else if (RANDOM) {
		const score = Math.floor(Math.random() * RANDOM);
		const target = 0;
		result = score == target;
	} else if (NEXT_PLACE) {
		result = futurPlace?.placeId === NEXT_PLACE.placeId;
	} else if (COLLEC) {
		result = dinozList.every(dinoz => dinoz.player?.rewards.some(reward => reward.rewardId === COLLEC));
	} else if (DINOZ_LIFE) {
		switch (DINOZ_LIFE[0]) {
			case '==':
				return dinozList.every(dinoz => dinoz.life === DINOZ_LIFE[1]);
			case '>':
				return dinozList.every(dinoz => dinoz.life > DINOZ_LIFE[1]);
			case '>=':
				return dinozList.every(dinoz => dinoz.life >= DINOZ_LIFE[1]);
			case '<':
				return dinozList.every(dinoz => dinoz.life < DINOZ_LIFE[1]);
			case '<=':
				return dinozList.every(dinoz => dinoz.life <= DINOZ_LIFE[1]);
			default:
				return false;
		}
	} else if (ACTIVE) {
		result = ACTIVE;
	} else {
		result = false;
	}

	if (!result) result = false;

	return result;
}
