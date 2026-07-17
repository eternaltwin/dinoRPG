import { ExpectedError } from "@drpg/core/utils/ExpectedError";
import { DinozRace } from "@drpg/core/models/dinoz/DinozRace";
import { raceList } from "@drpg/core/models/dinoz/RaceList";
import { checkCondition } from "@drpg/core/utils/checkCondition";
import { auth } from "../dao/playerDao.js";
import gameConfig from "../config/game.config.js";
import { getRandomArrayElement } from "../utils/index.js";
import { Request } from 'express';
import { generateDinozDisplay } from "../utils/dinoz.js";
import { getPlayerDemonShopRequest } from "../dao/demonShopDao.js";
import { Reward } from "@drpg/core/models/reward/RewardList";
import { PlaceEnum } from "@drpg/core/models/enums/PlaceEnum";
import translate from "../utils/server/translate.js";

/**
 * @summary Get all dinoz data from demon dinoz shop
 * @description If no dinoz is found, then fill the shop with X new dinoz -> X is defined is config file
 * @param req DinozID at the shop
 * @return Array<DinozShopFiche>
 */
export async function getDinozFromDemonShop(req: Request) {
	const authed = await auth(req);

	// Retrieve player with dinoz shop info
	const player = await getPlayerDemonShopRequest(authed.id);

	if (!player) {
		throw new ExpectedError(`Player ${authed.id} doesn't exist.`);
	}

	console.log(`Player OK`);

	// Player must have a Dinoz at the cemetary
	const dinoz = player.dinoz.find(d => d.placeId === PlaceEnum.CIMETIERE);
	if (!dinoz) {
		throw new ExpectedError(translate('noDinozAtCemetary', authed));
	}

	console.log(`Dinoz OK`);

	const hasBelius = player.rewards.some(r => r.rewardId === Reward.BELIUS);

	console.log(`Belius: ${hasBelius}`);

	// Expected number of Dinoz is based on game config plus some extra for the Belius reward.
	// TODO: change to 50% more with Belius
	const totalDinoz = gameConfig.demonShop.dinozNumber + (hasBelius ? 3 : 0);

	console.log(`Config: ${gameConfig.demonShop.dinozNumber}`);
	console.log(`Total: ${totalDinoz}`);
	
	// If the shop does not have the matching  create N dinoz to fill the shop (based on game config) 
	// if (playerData.demonShop.length !== totalDinoz) {
		const dinozArray = [];
		let randomRace: DinozRace;
		let randomDisplay: string;
		const availableRaces: DinozRace[] = Object.values(raceList).filter(r => r.demon && checkCondition(r.demon.condition, player, dinoz.id))

		console.log(`Races: ${availableRaces.length}`);

		// Make x Dinoz object to fill shop
		for (let i = 0; i < totalDinoz; i++) {
			// Set a random race to the dinoz
			randomRace = getRandomArrayElement(availableRaces);

			// Make a random display
			randomDisplay = generateDinozDisplay(randomRace, '0', '0', '0');
            
			const dinoz = {
				playerId: player.id,
				id: i,
				raceId: randomRace.raceId,
				level: 1,
				display: randomDisplay
			};

			dinozArray.push(dinoz);
		}

		console.log(`Array: ${dinozArray.length}`);

		// Save created dinoz in database
		// const dinozCreatedInShop = await createMultipleDemonDinoz(dinozArray);

		const listDinozShop = dinozArray
			.map(dinozShop => {
				return {
					id: dinozShop.id.toString(),
					race: dinozShop.raceId,
					display: dinozShop.display
				};
			})
			.sort((dinoz1, dinoz2) => +dinoz1.id - +dinoz2.id);

		console.log(`List: ${listDinozShop.length}`);

		return listDinozShop;
	// } else {
	// 	const listDinozShop = playerData.dinozShop
	// 		.map(dinozShop => {
	// 			return {
	// 				id: dinozShop.id.toString(),
	// 				race: dinozShop.raceId,
	// 				display: dinozShop.display
	// 			};
	// 		})
	// 		.sort((dinoz1, dinoz2) => parseInt(dinoz1.id) - parseInt(dinoz2.id));

	// 	return listDinozShop;
	// }
}


export async function sacrificeDinoz(req: Request) {
	return;
}

export async function resurectDinoz(req: Request) {
	return;
}

export async function buyDemonDinoz(req: Request) {
	return;
}