import { ConditionEnum } from '../models/enums/Parser.mjs';
import { Condition } from '../models/npc/NpcConditions.mjs';
import { placeList } from '../models/place/PlaceList.mjs';
import { DinozForConditionCheck } from '../constants.mjs';
import dayjs from 'dayjs';
import { ErrorFormator } from '../utils/errorFormator.mjs';

export function conditionParser(
	condition: Condition,
	dinozList: DinozForConditionCheck[],
	secret?: { key: string; value: string }
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
	const COLLEC = condition[ConditionEnum.COLLEC];
	const DINOZ_LIFE = condition[ConditionEnum.DINOZ_LIFE];
	const ACTIVE = condition[ConditionEnum.ACTIVE];
	const DAY = condition[ConditionEnum.DAY];
	const WEEK_PLACE = condition[ConditionEnum.WEEK_PLACE];

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
		const thisplace = placeList[PLACE_IS];

		result = dinozList.every(dinoz => (thisplace.placeId || dinoz.placeId) === dinoz.placeId);
	} else if (SCENARIO) {
		//TODO: Implement scenario
		result = false;
	} else if (POSSESS_OBJECT) {
		result =
			dinozList.every(dinoz => dinoz.player?.items.some(item => item.itemId === POSSESS_OBJECT)) ||
			dinozList.some(dinoz => dinoz.items.some(item => item.itemId === POSSESS_OBJECT));
	} else if (RANDOM) {
		const score = Math.floor(Math.random() * RANDOM);
		const target = 0;
		result = score == target;
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
	} else if (DAY !== undefined) {
		result = dayjs().day() === DAY;
	} else if (WEEK_PLACE) {
		if (secret?.key !== 'itinerant' || isNaN(parseInt(secret.value))) {
			throw new ErrorFormator(500, `No secret found for itinerant`);
		}
		result = dinozList.every(dinoz => dinoz.placeId === parseInt(secret.value));
	} else {
		result = false;
	}

	if (!result) result = false;

	return result;
}
