import { Request, Response } from 'express';
import { Config, Dinoz, DinozShop, Player, DinozRace } from '../models/index.js';
import { getDinozFromDinozShopRequest, createMultipleDinoz } from '../dao/shopDao.js';
import { getPlayerRewardsRequest } from '../dao/playerDao.js';
import _ from 'lodash';
import { getConfig } from '../utils/context.js';
import { raceList, rewardList } from '../constants/index.js';
import { getRandomLetter, getRandomNumber } from '../utils/tools.js';

/**
 * @summary Get all dinoz data from regular dinoz shop
 * @description If no dinoz is found, then fill the shop with X new dinoz -> X is defined is config file
 * @param req
 * @param res {Array<DinozShop>}
 * @return Array<DinozShop>
 */
const getDinozFromDinozShop = async (req: Request, res: Response): Promise<Response> => {
	// Retrieve dinoz from dinoz shop if exists
	let data: Array<DinozShop> = await getDinozFromDinozShopRequest(req.user!.playerId!);

	// If nothing is found, create 15 dinoz to fill the shop
	if (_.isEmpty(data)) {
		let dinoz: Dinoz;
		let dinozArray: Array<DinozShop> = [];
		let randomRace: number;
		let randomDisplay: string;
		const availableRaces: Array<DinozRace> = [
			/*raceList.WINKS,
			raceList.SIRAIN,
			raceList.CASTIVORE,
			raceList.NUAGOZ,
			raceList.GORILLOZ,
			raceList.WANWAN,
			raceList.PIGMOU,
			raceList.PLANAILLE,*/
			raceList.MOUEFFE
		];

		const config: Config = getConfig();

		// Check if player has Rocky, Pteroz, Hippoclamp or Quetzu trophy
		const player: Player | null = await getPlayerRewardsRequest(req.user!.playerId!);

		if (player === null) {
			return res.status(500).send('Player not found');
		}

		player.reward.forEach(playerReward => {
			if (playerReward.rewardId === rewardList.TROPHEE_ROCKY) {
				availableRaces.push(raceList.ROCKY);
			}
			if (playerReward.rewardId === rewardList.TROPHEE_HIPPOCLAMP) {
				availableRaces.push(raceList.HIPPOCLAMP);
			}
			if (playerReward.rewardId === rewardList.TROPHEE_PTEROZ) {
				availableRaces.push(raceList.PTEROZ);
			}
			if (playerReward.rewardId === rewardList.TROPHEE_QUETZU && player.quetzuBought < config.shop.buyableQuetzu) {
				availableRaces.push(raceList.QUETZU);
			}
		});

		// Make x Dinoz object to fill shop
		for (let i = 0; i < config.shop.dinozInShop; i++) {
			// Set a random race to the dinoz
			randomRace = availableRaces[getRandomNumber(0, availableRaces.length - 1)].raceId;

			const dinozRaceData: DinozRace = Object.values(raceList).find(race => race.raceId === randomRace)!;

			// Make a random display
			randomDisplay = `${randomRace}0`;

			for (let i = 2; i < 16; i++) {
				randomDisplay += getRandomLetter(dinozRaceData.display![i]);
			}

			dinoz = Dinoz.build({
				playerId: req.user!.playerId,
				raceId: randomRace,
				display: randomDisplay
			});

			dinozArray!.push(dinoz.get());
		}

		// Save created dinoz in database
		let dinozCreatedInShop = await createMultipleDinoz(dinozArray!);

		dinozCreatedInShop.forEach(dinoz => setDinozRaceAndSkill(dinoz));

		dinozCreatedInShop = _.orderBy(dinozCreatedInShop, ['id', 'desc']);

		return res.status(200).send(dinozCreatedInShop);
	} else {
		data.forEach(dinoz => {
			setDinozRaceAndSkill(dinoz);
		});

		data = _.orderBy(data, ['id', 'desc']);

		return res.status(200).send(data);
	}
};

/**
 * @summary Map the race and skill to a new dinoz
 * @param dinoz {DinozShop}
 * @return void
 */
function setDinozRaceAndSkill(dinoz: DinozShop) {
	const raceFound: DinozRace = Object.values(raceList).find(race => race.raceId === dinoz.raceId)!;

	if (raceFound.skillId.length > 0) {
		raceFound.skillId.forEach(skillId => dinoz.setDataValue('skill', skillId));
	}

	dinoz.setDataValue('race', raceFound);
	dinoz.setDataValue('raceId', undefined);
	dinoz.setDataValue('playerId', undefined);
}

export { getDinozFromDinozShop };
