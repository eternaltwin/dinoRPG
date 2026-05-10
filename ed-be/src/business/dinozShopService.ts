import { DinozRace } from '@drpg/core/models/dinoz/DinozRace';
import { raceList } from '@drpg/core/models/dinoz/RaceList';
import { RaceEnum } from '@drpg/core/models/enums/RaceEnum';
import { Reward } from '@drpg/core/models/reward/RewardList';
import { Prisma } from '@drpg/prisma';
import { Request } from 'express';
import gameConfig from '../config/game.config.js';
import { auth, getPlayerDinozShopRequest, getPlayerRewardsRequest } from '../dao/playerDao.js';
import { createMultipleDinoz } from '../dao/playerDinozShopDao.js';
import { getRandomArrayElement, getRandomLetter } from '../utils/index.js';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';

/**
 * @summary Get all dinoz data from regular dinoz shop
 * @description If no dinoz is found, then fill the shop with X new dinoz -> X is defined is config file
 * @param req
 * @return Array<DinozShopFiche>
 */

// TODO: Refaire cette fonction en construisant un objet de retour
export async function getDinozFromDinozShop(req: Request) {
	const authed = await auth(req);

	// Retrieve player with dinoz shop info
	const playerData = await getPlayerDinozShopRequest(authed.id);

	if (!playerData) {
		throw new ExpectedError(`Player ${authed.id} doesn't exist.`);
	}

	// If nothing is found, create 15 (?) dinoz to fill the shop
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

		// Check if player has Rocky, Pteroz, Hippoclamp or Quetzu trophy
		const player = await getPlayerRewardsRequest(authed.id);

		if (!player) {
			throw new ExpectedError(`Player ${authed.id} doesn't exist.`);
		}

		player.rewards.forEach(playerReward => {
			if (playerReward.rewardId === Reward.ROCKY) {
				availableRaces.push(raceList[RaceEnum.ROCKY]);
			}
			if (playerReward.rewardId === Reward.HIPPO) {
				availableRaces.push(raceList[RaceEnum.HIPPOCLAMP]);
			}
			if (playerReward.rewardId === Reward.PTEROZ) {
				availableRaces.push(raceList[RaceEnum.PTEROZ]);
			}
			if (playerReward.rewardId === Reward.QUETZU && player.quetzuBought < gameConfig.shop.buyableQuetzu) {
				availableRaces.push(raceList[RaceEnum.QUETZU]);
			}
		});

		// Make x Dinoz object to fill shop
		for (let i = 0; i < gameConfig.shop.dinozNumber; i++) {
			// Set a random race to the dinoz
			randomRace = getRandomArrayElement(availableRaces);

			// Make a random display
			// First 2 digits are the race specific letters
			randomDisplay = randomRace.swfLetter;

			// For the next 11 digits, randomly generate them between '0' and 'z'
			for (let i = 0; i < 11; i++) {
				randomDisplay += getRandomLetter('z');
			}
			// Set the last 3 digits (for rare color palette, rare trait 1 & 2) to '0'
			randomDisplay += '000';

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
					id: dinozShop.id.toString(),
					race: dinozShop.raceId,
					display: dinozShop.display
				};
			})
			.sort((dinoz1, dinoz2) => parseInt(dinoz1.id) - parseInt(dinoz2.id));

		return listDinozShop;
	}
}
