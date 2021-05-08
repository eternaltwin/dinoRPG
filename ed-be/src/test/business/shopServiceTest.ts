import { Request, Response } from 'express';
import { Dinoz } from '../../models';
import { DinozShopArray } from '../data/dinozShopData';
import { PlayerWithRewards } from '../data/playerData';
import { DinozRaceArray } from '../data/raceData';
import { player } from '../utils/constants';
import { getDinozFromDinozShop } from '../../business/shopService';

const DinozShopDao = require('../../dao/shopDao');
const PlayerDao = require('../../dao/playerDao');
const DinozRaceDao = require('../../dao/dinozRaceDao');
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

		spyOn(DinozRaceDao, 'getRacesDetailsRequest').and.returnValue(
			DinozRaceArray
		);
		spyOn(DinozShopDao, 'createMultipleDinoz');
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

		expect(DinozShopDao.getDinozFromDinozShopRequest).toHaveBeenCalledTimes(2);
		expect(PlayerDao.getPlayerRewardsRequest).toHaveBeenCalledTimes(1);
		expect(DinozRaceDao.getRacesDetailsRequest).toHaveBeenCalledTimes(1);
		expect(DinozShopDao.createMultipleDinoz).toHaveBeenCalledTimes(1);

		expect(DinozShopDao.getDinozFromDinozShopRequest).toHaveBeenCalledWith(
			req.user!.playerId!
		);
		expect(PlayerDao.getPlayerRewardsRequest).toHaveBeenCalledWith(
			req.user!.playerId!,
			expect.any(Array)
		);
		expect(DinozRaceDao.getRacesDetailsRequest).toHaveBeenLastCalledWith(
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
		expect(DinozRaceDao.getRacesDetailsRequest).toHaveBeenCalledTimes(0);

		expect(DinozShopDao.getDinozFromDinozShopRequest).toHaveBeenCalledWith(
			req.user!.playerId!
		);
		expect(PlayerDao.getPlayerRewardsRequest).toHaveBeenCalledWith(
			req.user!.playerId!,
			expect.any(Array)
		);
	});
});
