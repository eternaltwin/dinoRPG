import { getBoxHandlerInformations } from '../dao/playerDao.js';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import gameConfig from '../config/game.config.js';
import { Item, itemList } from '@drpg/core/models/item/ItemList';
import { ItemFiche } from '@drpg/core/models/item/ItemFiche';
import { itemProbability } from '@drpg/core/models/item/itemProbability';
import weightedRandom from './fight/weightedRandom.js';

export async function calculatePlayerPower(playerId: string) {
	const boxInfo = await getBoxHandlerInformations(playerId);
	if (!boxInfo) throw new ExpectedError(`Player doesn't exist`);
	const dinozCount = boxInfo._count.dinoz;
	if (dinozCount <= 0) return dinozCount;
	const missionTotal = boxInfo.dinoz.reduce((partialSum, a) => partialSum + a._count.missions, 0);
	const AVAILABLE_MISSIONS = 55;
	const dinozLevelTotal = boxInfo.dinoz.reduce((partialSum, a) => partialSum + a.level, 0);
	const totalRewards = boxInfo.rewards.filter(r => r.rewardId <= 24).length;
	const AVAILABLE_REWARDS = 23;
	const universalCount =
		(boxInfo.cooker ? 1 : 0) +
		(boxInfo.engineer ? 1 : 0) +
		(boxInfo.matelasseur ? 1 : 0) +
		(boxInfo.merchant ? 1 : 0) +
		(boxInfo.messie ? 1 : 0) +
		(boxInfo.leader ? 1 : 0) +
		(boxInfo.priest ? 1 : 0) +
		(boxInfo.shopKeeper ? 1 : 0) +
		(boxInfo.teacher ? 1 : 0);
	const AVAILABLE_UNIVERSAL = 9;

	const coefficients = {
		dinoz: 1,
		universal: 1,
		missions: 5,
		level: 3,
		rewards: 10
	};
	const completion =
		(((dinozCount / gameConfig.dinoz.maxQuantity) * coefficients.dinoz +
			(universalCount / AVAILABLE_UNIVERSAL) * coefficients.universal +
			(missionTotal / (AVAILABLE_MISSIONS * gameConfig.dinoz.maxQuantity)) * coefficients.missions +
			(dinozLevelTotal / (gameConfig.dinoz.maxLevel * gameConfig.dinoz.maxQuantity)) * coefficients.level +
			(totalRewards / AVAILABLE_REWARDS) * coefficients.rewards) /
			(coefficients.dinoz +
				coefficients.universal +
				coefficients.missions +
				coefficients.level +
				coefficients.rewards)) *
		100;

	return completion;
}

export function selectBox(completion: number) {
	const randomBonus = randomNumberWithMedian(0, 20, 6);
	const fullCompletion = randomBonus + completion;
	if (fullCompletion < 45) {
		return itemList[Item.BOX_COMMON];
	} else if (fullCompletion < 75) {
		return itemList[Item.BOX_RARE];
	} else if (fullCompletion < 95) {
		return itemList[Item.BOX_EPIC];
	} else {
		return itemList[Item.BOX_LEGENDARY];
	}
}

function randomNumberWithMedian(min: number, max: number, median: number): number {
	// Calcul de la probabilité cumulative pour le médian
	const medianProb = (median - min) / (max - min);

	// Génération d'un nombre aléatoire entre 0 et 1
	const random = Math.random();

	// Application de la distribution triangulaire
	if (random <= medianProb) {
		return min + Math.sqrt(random * (max - min) * (median - min));
	} else {
		return max - Math.sqrt((1 - random) * (max - min) * (max - median));
	}
}

export function boxOpening(box: ItemFiche) {
	const myBox = Object.values(itemList).find(i => i.itemId === box.itemId);
	const myProba = itemProbability.find(b => b.boxType === myBox?.name);
	if (!myProba) {
		throw new ExpectedError(`Special item ${box.itemId} is not implemented`);
	}

	const flattenLoto: ItemFiche[] = myProba.items.flatMap(i => {
		return new Array(i.probability).fill(i.item);
	});
	for (let i = flattenLoto.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[flattenLoto[i], flattenLoto[j]] = [flattenLoto[j], flattenLoto[i]];
	}

	const myItem = flattenLoto[Math.round(Math.random() * (flattenLoto.length - 1))];

	if (myItem.itemId === Item.COUPONS_TREASURE_HANDLER) {
		const couponsOdds = [
			{ quantity: 1, odds: 2 },
			{ quantity: 2, odds: 3 },
			{ quantity: 3, odds: 5 },
			{ quantity: 4, odds: 3 },
			{ quantity: 5, odds: 3 }
		];
		const total = couponsOdds.reduce((acc, item) => acc + item.odds, 0);
		return { item: itemList[Item.TREASURE_COUPON], quantity: weightedRandom(couponsOdds, total).quantity };
	}

	return { item: myItem, quantity: 1 };
}
