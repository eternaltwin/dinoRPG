import { ResolvedWar } from '../dao/clansDao.js';
import { Ingredient, ingredientList } from '@drpg/core/models/ingredient/ingredientList';
import { WAR_BASE_VALUE, WAR_SCALE_PER_100_POINTS, WarCost, WarCostIngredient } from '@drpg/core/models/clan/clanWar';

export function computeWarPowers(war: ResolvedWar, attackerWon: boolean) {
	const attackerRanking = war.attacker.clanWarRanking[0];
	const defenderRanking = war.defender.clanWarRanking[0];

	const pWin = computePWin(attackerRanking.reputation, defenderRanking.reputation);
	const pLost = computePLost(attackerRanking.reputation, defenderRanking.reputation);

	return {
		attacker: {
			attackerPWin: attackerWon ? Math.round(pWin) : 0,
			attackerPLost: attackerWon ? 0 : Math.round(pLost)
		},
		defender: {
			defenderPWin: attackerWon ? 0 : Math.round(pWin),
			defenderPLost: attackerWon ? Math.round(pLost) : 0
		}
	};
}

export function computePWin(yourRank: number, enemyRank: number): number {
	const raw = (100 * (10000 + enemyRank)) / (10000 + yourRank);
	return clamp(raw, 10, 300);
}

export function computePLost(yourRank: number, enemyRank: number): number {
	const raw = (100 * (10000 + yourRank)) / (10000 + enemyRank);
	return clamp(raw, 10, 300);
}

function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

export function computeWarCost(
	clanReputation: number,
	clanIngredients: { ingredientId: number; quantity: number }[]
): WarCost {
	const totalValue = WAR_BASE_VALUE + Math.floor(clanReputation / 100) * WAR_SCALE_PER_100_POINTS;

	const sortedIngredients = clanIngredients
		.map(ci => ({
			...ci,
			fiche: ingredientList[ci.ingredientId as Ingredient]
		}))
		.filter(ci => ci.fiche)
		.sort((a, b) => a.fiche.price - b.fiche.price);

	let remainingValue = totalValue;
	const result: WarCostIngredient[] = [];

	for (const ci of sortedIngredients) {
		if (remainingValue <= 0) break;

		const qtyNeeded = Math.ceil(remainingValue / ci.fiche.price);
		const qtyUsed = Math.min(qtyNeeded, ci.quantity);
		const valueConsumed = qtyUsed * ci.fiche.price;

		if (qtyUsed > 0) {
			result.push({
				ingredientId: ci.ingredientId,
				quantity: qtyUsed
			});
			remainingValue -= valueConsumed;
		}
	}

	return {
		ingredients: result,
		totalValue,
		canAfford: remainingValue <= 0
	};
}
