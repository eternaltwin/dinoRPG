import { Request, Response } from 'express';
import { Config, Dinoz, DinozRace, DinozShop, Player } from '../models/index.js';
import {
	getDinozFromDinozShopRequest,
	createMultipleDinoz,
} from '../dao/shopDao.js';
import { getPlayerRewardsRequest } from '../dao/playerDao.js';
import { getRacesDetailsRequest } from '../dao/dinozRaceDao.js';
import _ from 'lodash';
import { race, reward } from '../utils/constants.js';
import { getConfig } from '../utils/context.js';

const getDinozFromDinozShop = async (
	req: Request,
	res: Response
): Promise<Response> => {
	// Retrieve dinoz from dinoz shop if exists
	let data: Array<DinozShop> = await getDinozFromDinozShopRequest(
		req.user!.playerId!
	);

	// If nothing is found, create 15 dinoz to fill the shop
	if (_.isEmpty(data)) {
		let dinoz: Dinoz;
		let dinozArray: Array<DinozShop> = [];
		let randomRace: number;
		let randomDisplay: string;
		const raceArray: Array<string> = [
			race.winks,
			race.sirain,
			race.castivore,
			race.nuagoz,
			race.gorilloz,
			race.wanwan,
			race.pigmou,
			race.planaille,
			race.moueffe,
		];
		const rewardArray: Array<string> = [
			reward.tropheeHippoclamp,
			reward.tropheePteroz,
			reward.tropheeRocky,
			reward.tropheeQuetzu,
		];
		const config: Config = getConfig();

		// Check if player has Rocky, Pteroz, Hippoclamp or Quetzu trophy
		const player: Player | null = await getPlayerRewardsRequest(
			req.user!.playerId!,
			rewardArray
		);

		if (_.isNull(player)) {
			return res.status(500).send('Player not found');
		}

		player.reward.forEach((playerReward) => {
			if (playerReward.name === reward.tropheeRocky) {
				raceArray.push(race.rocky);
			}
			if (playerReward.name === reward.tropheeHippoclamp) {
				raceArray.push(race.hippoclamp);
			}
			if (playerReward.name === reward.tropheePteroz) {
				raceArray.push(race.pteroz);
			}
			if (
				playerReward.name === reward.tropheeQuetzu &&
				player.quetzuBought < config.shop.buyableQuetzu
			) {
				raceArray.push(race.quetzu);
			}
		});

		// Get all buyable races from a dinoz array
		let races: Array<DinozRace> = await getRacesDetailsRequest(raceArray);

		// Make 15 Dinoz object
		for (let i = 0; i < config.shop.dinozInShop; i++) {
			// Set a random race to the dinoz
			randomRace = getRandomNumber(1, races.length);
			// Set a random display to the dinoz
			randomDisplay = `${races[randomRace].swfLetter}0${getCosmetique()}000`;

			dinoz = Dinoz.build({
				playerId: req.user!.playerId,
				raceId: races[randomRace].raceId,
				display: randomDisplay,
			});

			dinozArray!.push(dinoz.get());
		}

		// Save created dinoz in database
		await createMultipleDinoz(dinozArray!);

		// Get created dinoz and their races
		let response: Array<DinozShop> = await getDinozFromDinozShopRequest(
			req.user!.playerId!
		);

		response = _.orderBy(response, ['id', 'desc']);

		return res.status(200).send(response);
	} else {
		data = _.orderBy(data, ['id', 'desc']);

		return res.status(200).send(data);
	}
};

// Return a String with a length of 11
function getCosmetique() {
	var params = {
		includeUpperCase: true,
		includeNumbers: true,
		length: 11,
	};
	return strRandom(params);
}

// Generate random number or letter
function strRandom(o: {
	includeUpperCase: boolean;
	includeNumbers: boolean;
	startsWithLowerCase?: boolean;
	length: number;
}) {
	var a = 10,
		b = 'abcdefghijklmnopqrstuvwxyz',
		c = '',
		d = 0,
		e = '' + b;
	if (o) {
		if (o.startsWithLowerCase) {
			c = b[Math.floor(Math.random() * b.length)];
			d = 1;
		}
		if (o.length) {
			a = o.length;
		}
		if (o.includeUpperCase) {
			e += b.toUpperCase();
		}
		if (o.includeNumbers) {
			e += '1234567890';
		}
	}
	for (; d < a; d++) {
		c += e[Math.floor(Math.random() * e.length)];
	}
	return c;
}

// Return a random number [min, max[
function getRandomNumber(min: number, max: number) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}

export { getDinozFromDinozShop };
