import { PlayerForConditionCheck } from '../constants.mjs';
import { Operator } from '../models/enums/Parser.mjs';
import { Condition } from '../models/npc/NpcConditions.mjs';
import { conditionParser } from './parser.mjs';

export function checkCondition(
	condition: Condition | undefined,
	player: PlayerForConditionCheck,
	activeDinoz: number
): boolean {
	if (!condition) return true;
	let conditionResult = true;

	if (condition[Operator.AND]) {
		for (const subCondition of condition[Operator.AND]) {
			conditionResult = conditionResult && checkCondition(subCondition, player, activeDinoz);
		}
	} else if (condition[Operator.OR]) {
		conditionResult = false;
		for (const subCondition of condition[Operator.OR]) {
			conditionResult = checkCondition(subCondition, player, activeDinoz) || conditionResult;
		}
	} else if (condition[Operator.NOT]) {
		conditionResult = !checkCondition(condition[Operator.NOT], player, activeDinoz);
	}

	if (condition[Operator.AND] || condition[Operator.OR] || condition[Operator.NOT]) {
		return conditionResult;
	}

	return conditionParser(condition, player, activeDinoz);
}
