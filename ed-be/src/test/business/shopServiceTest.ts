import { Request, Response } from 'express';
import { Dinoz, DinozShop } from '../../models/index.js';
import { DinozFromShop, DinozShopArray } from '../data/dinozShopData.js';
import { PlayerWithRewards } from '../data/playerData.js';
import { DinozRaceArray } from '../data/raceData.js';
import { player } from '../utils/constants.js';
import { getDinozFromDinozShop } from '../../business/shopService.js';

const DinozShopDao = require('../../dao/shopDao');
const PlayerDao = require('../../dao/playerDao');
const Config = require('../../utils/context');

let req = {
	user: {
		playerId: player.id_1,
	},
} as Request;
let res = ({
	status: jest.fn().mockReturnThis(),
	send: jest.fn().mockReturnThis(),
} as unknown) as Response;

describe('Test de la fonction getDinozFromDinozShop', function () {
	let dinozCreated: any;

	beforeEach(function () {
		dinozCreated = {
			playerId: player.id_1,
			raceId: 54,
			display: '651fdsf68s',
		};

		const dinozBuilt = {
			get: jest.fn().mockResolvedValue(dinozCreated),
		};

		DinozFromShop.setDataValue = jest.fn().mockResolvedValue([]);

		spyOn(DinozShopDao, 'createMultipleDinoz').and.returnValue(DinozShopArray);
		spyOn(Config, 'getConfig').and.returnValue({
			shop: { dinozInShop: 4, buyableQuetzu: 6 },
		});
		spyOn(Dinoz, 'build').and.returnValue(dinozBuilt);
	});

	it('No dinoz found, shop must be initialized', async function () {
		spyOn(DinozShopDao, 'getDinozFromDinozShopRequest').and.returnValue([]);
		spyOn(PlayerDao, 'getPlayerRewardsRequest').and.returnValue(
			PlayerWithRewards
		);

		await getDinozFromDinozShop(req, res);

		expect(DinozShopDao.getDinozFromDinozShopRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerRewardsRequest).toHaveBeenCalledTimes(1);
		expect(DinozShopDao.createMultipleDinoz).toHaveBeenCalledTimes(1);

		expect(DinozShopDao.getDinozFromDinozShopRequest).toHaveBeenCalledWith(
			req.user!.playerId!
		);
		expect(PlayerDao.getPlayerRewardsRequest).toHaveBeenCalledWith(
			req.user!.playerId!,
			expect.any(Array)
		);
		expect(DinozShopDao.createMultipleDinoz).toHaveBeenLastCalledWith(
			expect.any(Array)
		);
	});

	it('Dinoz already exist in shop', async function () {
		spyOn(DinozShopDao, 'getDinozFromDinozShopRequest').and.returnValue(
			DinozShopArray
		);
		spyOn(PlayerDao, 'getPlayerRewardsRequest').and.returnValue(
			PlayerWithRewards
		);

		await getDinozFromDinozShop(req, res);

		expect(DinozShopDao.getDinozFromDinozShopRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerRewardsRequest).toHaveBeenCalledTimes(0);

		expect(DinozShopDao.getDinozFromDinozShopRequest).toHaveBeenCalledWith(
			req.user!.playerId!
		);
	});

	it('Player found is null', async function () {
		spyOn(DinozShopDao, 'getDinozFromDinozShopRequest').and.returnValue([]);
		spyOn(PlayerDao, 'getPlayerRewardsRequest').and.returnValue(null);

		await getDinozFromDinozShop(req, res);

		expect(DinozShopDao.getDinozFromDinozShopRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerRewardsRequest).toHaveBeenCalledTimes(1);

		expect(DinozShopDao.getDinozFromDinozShopRequest).toHaveBeenCalledWith(
			req.user!.playerId!
		);
		expect(PlayerDao.getPlayerRewardsRequest).toHaveBeenCalledWith(
			req.user!.playerId!,
			expect.any(Array)
		);
	});
});
