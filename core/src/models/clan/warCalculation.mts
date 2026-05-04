import { Ingredient, ingredientList } from '../ingredient/ingredientList.mjs';
import {
	REPAIR_BASE_VALUE,
	REPAIR_MAX_HP,
	REPAIR_MAX_TICKS,
	REPAIR_SCALE_FACTOR,
	RepairFrequency,
	WarCost,
	WarCostIngredient
} from './clanWar.mjs';
import { treasureIngredient } from './clan.mjs';

export function computeRepairCost(
	hpPerTick: number,
	frequency: RepairFrequency,
	ticks: number,
	clanIngredients: treasureIngredient[]
): WarCost {
	const hpPerHour = (hpPerTick * 60) / frequency;
	const totalValue = Math.round(REPAIR_BASE_VALUE * Math.pow(hpPerHour, REPAIR_SCALE_FACTOR));

	const tickRatio = ticks / REPAIR_MAX_TICKS;
	const adjustedValue = Math.round(totalValue * tickRatio);

	const sortedIngredients = clanIngredients
		.map(ci => ({
			...ci,
			fiche: ingredientList[ci.ingredientId as Ingredient]
		}))
		.filter(ci => ci.fiche)
		.sort((a, b) => a.fiche.price - b.fiche.price);

	let remainingValue = adjustedValue;
	const result: WarCostIngredient[] = [];

	for (const ci of sortedIngredients) {
		if (remainingValue <= 0) break;

		const qtyNeeded = Math.ceil(remainingValue / ci.fiche.price);
		const qtyUsed = Math.min(qtyNeeded, ci.quantity);
		const valueConsumed = qtyUsed * ci.fiche.price;

		if (qtyUsed > 0) {
			result.push({ ingredientId: ci.ingredientId, quantity: qtyUsed });
			remainingValue -= valueConsumed;
		}
	}

	return {
		ingredients: result,
		totalValue: adjustedValue,
		totalHp: Math.min(hpPerTick * ticks, REPAIR_MAX_HP),
		canAfford: remainingValue <= 0
	};
}
