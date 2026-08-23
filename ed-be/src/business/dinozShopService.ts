import { DinozRace } from '@drpg/core/models/dinoz/DinozRace';
import { raceList } from '@drpg/core/models/dinoz/RaceList';
import { RaceEnum } from '@drpg/core/models/enums/RaceEnum';
import { Reward } from '@drpg/core/models/reward/RewardList';
import { Prisma } from '@drpg/prisma';
import { Request } from 'express';
import gameConfig from '../config/game.config.js';
import { auth, getPlayerDinozShopRequest } from '../dao/playerDao.js';
import { createMultipleDinoz } from '../dao/playerDinozShopDao.js';
import { getRandomArrayElement } from '../utils/index.js';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { generateDinozDisplay } from '../utils/dinoz.js';
import translate from '../utils/server/translate.js';

/**
 * @summary Get all dinoz data from regular dinoz shop
 * @description If no dinoz is found, then fill the shop with X new dinoz -> X is defined is config file
 * @param req
 * @return Array<DinozShopFiche>
 */
export async function getDinozFromDinozShop(req: Request) {
	const authed = await auth(req);
	
	// Retrieve player with dinoz shop info
	const playerData = await getPlayerDinozShopRequest(authed.id);

	if (!playerData) {
		throw new ExpectedError(translate('playerNotFound', authed, { id: authed.id }));
	}

	// If nothing is found, create N dinoz to fill the shop (based on game config)
	if (playerData.dinozShop.length === 0) {
		const dinozArray = [];
		let randomRace: DinozRace;
		let randomDisplay: string;
		const availableRaces: DinozRace[] = [
			raceList[RaceEnum.WINKS],
			raceList[RaceEnum.SIRAIN],
			raceList[RaceEnum.CASTIVORE],
			raceList[RaceEnum.NUAGOZ],
			raceList[RaceEnum.GORILLOZ],
			raceList[RaceEnum.WANWAN],
			raceList[RaceEnum.PLANAILLE],
			raceList[RaceEnum.MOUEFFE],
			raceList[RaceEnum.PIGMOU]
		];

		playerData.rewards.forEach(playerReward => {
			if (playerReward.rewardId === Reward.ROCKY) {
				availableRaces.push(raceList[RaceEnum.ROCKY]);
			}
			if (playerReward.rewardId === Reward.HIPPO) {
				availableRaces.push(raceList[RaceEnum.HIPPOCLAMP]);
			}
			if (playerReward.rewardId === Reward.PTEROZ) {
				availableRaces.push(raceList[RaceEnum.PTEROZ]);
			}
			if (playerReward.rewardId === Reward.QUETZU && playerData.quetzuBought < gameConfig.shop.buyableQuetzu) {
				availableRaces.push(raceList[RaceEnum.QUETZU]);
			}
		});

		// Make x Dinoz object to fill shop
		for (let i = 0; i < gameConfig.shop.dinozNumber; i++) {
			// Set a random race to the dinoz
			randomRace = getRandomArrayElement(availableRaces);

			// Make a random display
			randomDisplay = generateDinozDisplay(randomRace, '0', '0', '0');

			const dinoz: Prisma.PlayerDinozShopCreateManyInput = {
				playerId: playerData.id,
				raceId: randomRace.raceId,
				display: randomDisplay
			};

			dinozArray.push(dinoz);
		}

		// Save created dinoz in database
		const dinozCreatedInShop = await createMultipleDinoz(dinozArray);

		const listDinozShop = dinozCreatedInShop
			.map(dinozShop => {
				return {
					id: dinozShop.id.toString(),
					race: dinozShop.raceId,
					display: dinozShop.display
				};
			})
			.sort((dinoz1, dinoz2) => +dinoz1.id - +dinoz2.id);

		return listDinozShop;
	} else {
		const listDinozShop = playerData.dinozShop
			.map(dinozShop => {
				return {
					id: dinozShop.id,
					race: dinozShop.raceId,
					display: dinozShop.display
				};
			})
			.sort((dinoz1, dinoz2) => dinoz1.id - dinoz2.id);

		return listDinozShop;
	}
}
