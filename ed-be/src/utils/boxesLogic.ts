import { getBoxHandlerInformations } from '../dao/playerDao.js';
import { ErrorFormator } from '../utils/errorFormator.js';
import gameConfig from '../config/game.config.js';
import { itemList } from '@drpg/core/models/item/ItemList';
import { ItemFiche } from '@drpg/core/models/item/ItemFiche';
import { itemProbability } from '@drpg/core/models/item/itemProbability';

export async function calculatePlayerPower(playerId: number) {
	const boxInfo = await getBoxHandlerInformations(playerId);
	if (!boxInfo) throw new ErrorFormator(500, `Player doesn't exist`);
	const dinozCount = boxInfo._count.dinoz;
	const missionAverage = boxInfo.dinoz.reduce((partialSum, a) => partialSum + a._count.missions, 0) / dinozCount;
	const averageDinoz = boxInfo.dinoz.reduce((partialSum, a) => partialSum + a.level, 0) / dinozCount;
	const totalRewards = boxInfo.rewards.filter(r => r.rewardId <= 24).length;

	const coefficients = {
		dinoz: 1,
		missions: 5,
		level: 3,
		rewards: 10
	};
	const completion =
		(((dinozCount / gameConfig.dinoz.maxQuantity) * coefficients.dinoz +
			(missionAverage / 55) * coefficients.missions +
			(averageDinoz / gameConfig.dinoz.maxLevel) * coefficients.level +
			(totalRewards / 23) * coefficients.rewards) /
			(coefficients.dinoz + coefficients.missions + coefficients.level + coefficients.rewards)) *
		100;

	return completion;
}

export function selectBox(completion: number) {
	const randomBonus = randomNumberWithMedian(0, 20, 6);
	const fullCompletion = randomBonus + completion;
	if (fullCompletion < 45) {
		return itemList.BOX_COMMON;
	} else if (fullCompletion < 75) {
		return itemList.BOX_RARE;
	} else if (fullCompletion < 95) {
		return itemList.BOX_EPIC;
	} else {
		return itemList.BOX_LEGENDARY;
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
		throw new ErrorFormator(500, `Special item ${box.itemId} is not implemented`);
	}

	const flattenLoto: ItemFiche[] = myProba.items.flatMap(i => {
		return new Array(i.probability).fill(i.item);
	});
	for (let i = flattenLoto.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[flattenLoto[i], flattenLoto[j]] = [flattenLoto[j], flattenLoto[i]];
	}

	const myRandom = Math.round(Math.random() * (flattenLoto.length - 1));
	return flattenLoto[myRandom];
}
