import { Request } from 'express';
import { DinozRace, DinozShopFiche } from '../models/index.js';
import { createMultipleDinoz } from '../dao/playerDinozShopDao.js';
import { getPlayerDinozShopRequest, getPlayerRewardsRequest } from '../dao/playerDao.js';
import { getRandomLetter, getRandomNumber } from '../utils/tools.js';
import { raceList, rewardList, skillList } from '../constants/index.js';
import { Player, PlayerDinozShop } from '../entity/index.js';
import gameConfig from '../config/game.config.js';

/**
 * @summary Get all dinoz data from regular dinoz shop
 * @description If no dinoz is found, then fill the shop with X new dinoz -> X is defined is config file
 * @param req
 * @return Array<DinozShopFiche>
 */

// TODO: Refaire cette fonction en construisant un objet de retour
const getDinozFromDinozShop = async (req: Request): Promise<Array<DinozShopFiche>> => {
	// Retrieve player with dinoz shop info
	const playerData: Player = await getPlayerDinozShopRequest(req.user!.playerId!);

	// If nothing is found, create 15 (?) dinoz to fill the shop
	if (playerData.dinozShop.length === 0) {
		let dinozArray: Array<PlayerDinozShop> = [];
		let randomRace: DinozRace;
		let randomDisplay: string;
		const availableRaces: Array<DinozRace> = [
			raceList.WINKS,
			raceList.SIRAIN,
			raceList.CASTIVORE,
			raceList.NUAGOZ,
			raceList.GORILLOZ,
			raceList.WANWAN,
			raceList.PLANAILLE,
			raceList.MOUEFFE,
			raceList.PIGMOU
		];

		// Check if player has Rocky, Pteroz, Hippoclamp or Quetzu trophy
		const player: Player = await getPlayerRewardsRequest(req.user!.playerId!);

		player.rewards.forEach(playerReward => {
			if (playerReward.rewardId === rewardList.TROPHEE_ROCKY) {
				availableRaces.push(raceList.ROCKY);
			}
			if (playerReward.rewardId === rewardList.TROPHEE_HIPPOCLAMP) {
				availableRaces.push(raceList.HIPPOCLAMP);
			}
			if (playerReward.rewardId === rewardList.TROPHEE_PTEROZ) {
				availableRaces.push(raceList.PTEROZ);
			}
			if (playerReward.rewardId === rewardList.TROPHEE_QUETZU && player.quetzuBought < gameConfig.shop.buyableQuetzu) {
				availableRaces.push(raceList.QUETZU);
			}
		});

		// Make x Dinoz object to fill shop
		for (let i = 0; i < gameConfig.shop.dinozNumber; i++) {
			// Set a random race to the dinoz
			randomRace = availableRaces[getRandomNumber(0, availableRaces.length)];

			// Make a random display
			randomDisplay = randomRace.swfLetter;

			for (let i = 0; i < 14; i++) {
				randomDisplay += getRandomLetter(randomRace.display![i]);
			}

			let dinoz: PlayerDinozShop = new PlayerDinozShop();
			dinoz.player = playerData;
			dinoz.raceId = randomRace.raceId;
			dinoz.display = randomDisplay;

			dinozArray.push(dinoz);
		}

		// Save created dinoz in database
		const dinozCreatedInShop: PlayerDinozShop[] = await createMultipleDinoz(dinozArray);

		const listDinozShop: DinozShopFiche[] = dinozCreatedInShop
			.map(dinozShop => setDinozShopFiche(dinozShop))
			.sort((dinoz1, dinoz2) => parseInt(dinoz1.id) - parseInt(dinoz2.id));

		return listDinozShop;
	} else {
		const listDinozShop: DinozShopFiche[] = playerData.dinozShop
			.map(dinozShop => setDinozShopFiche(dinozShop))
			.sort((dinoz1, dinoz2) => parseInt(dinoz1.id) - parseInt(dinoz2.id));

		return listDinozShop;
	}
};

/**
 * @summary Map the race and skill to a new dinoz
 * @param dinozShop {PlayerDinozShop}
 * @return void
 */
function setDinozShopFiche(dinozShop: PlayerDinozShop): DinozShopFiche {
	const raceFound: DinozRace = Object.values(raceList).find(race => race.raceId === dinozShop.raceId)!;

	raceFound.skillId = Object.values(skillList)
		.filter(skill => skill.raceId?.some(raceId => raceId === raceFound.raceId) && skill.isBaseSkill)
		.map(skill => skill.skillId);

	return {
		id: dinozShop.id.toString(),
		race: raceFound,
		display: dinozShop.display
	};
}

export { getDinozFromDinozShop };
