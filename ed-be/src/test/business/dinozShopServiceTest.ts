import { DinozShopArray } from '../data/dinozShopData.js';
import { PlayerWithoutDinozShop, PlayerWithDinozShop, PlayerWithRewards } from '../data/playerData.js';
import { mockRequest, player } from '../utils/constants.js';
import { raceList, skillList } from '../../constants/index.js';
import { DinozShopFiche } from '@drpg/core/models/shop/DinozShopFiche';
import { DinozRace } from '@drpg/core/models/dinoz/DinozRace';
import { getDinozFromDinozShop } from '../../business/dinozShopService.js';
import { Request } from 'express';

const DinozShopDao = require('../../dao/playerDinozShopDao.js');
const PlayerDao = require('../../dao/playerDao.js');
const Config = require('../../utils/context');

describe('Function getDinozFromDinozShop()', function () {
	let req: Request;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;

		PlayerDao.getPlayerDinozShopRequest = jasmine.createSpy().and.returnValue(PlayerWithoutDinozShop);
		PlayerDao.getPlayerRewardsRequest = jasmine.createSpy().and.returnValue(PlayerWithRewards);
		DinozShopDao.createMultipleDinoz = jasmine.createSpy().and.returnValue(DinozShopArray);
		Config.getConfig = jasmine.createSpy().and.returnValue({
			shop: { dinozInShop: 4, buyableQuetzu: 6 }
		});
	});

	it('No dinoz found, shop must be initialized', async function () {
		try {
			await getDinozFromDinozShop(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		expect(PlayerDao.getPlayerDinozShopRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerDinozShopRequest).toHaveBeenCalledWith(player.id_1);

		expect(PlayerDao.getPlayerRewardsRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerRewardsRequest).toHaveBeenCalledWith(player.id_1);

		expect(DinozShopDao.createMultipleDinoz).toHaveBeenCalledTimes(1);
		expect(DinozShopDao.createMultipleDinoz).toHaveBeenCalledWith(expect.any(Array));
	});

	it('Dinoz already exists in shop', async function () {
		PlayerDao.getPlayerDinozShopRequest = jasmine.createSpy().and.returnValue(PlayerWithDinozShop);

		const expectedResult: Array<DinozShopFiche> = PlayerWithDinozShop.dinozShop.map(dinozShop => {
			const raceFound: DinozRace = Object.values(raceList).find(race => race.raceId === dinozShop.raceId)!;

			raceFound.skillId = Object.values(skillList)
				.filter(skill => skill.raceId?.some(raceId => raceId === raceFound.raceId) && skill.isBaseSkill)
				.map(skill => skill.skillId);

			return {
				id: dinozShop.id.toString(),
				race: raceFound,
				display: dinozShop.display
			};
		});

		let result: Array<DinozShopFiche> = [];

		try {
			result = await getDinozFromDinozShop(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		expect(PlayerDao.getPlayerDinozShopRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerDinozShopRequest).toHaveBeenCalledWith(player.id_1);

		expect(PlayerDao.getPlayerRewardsRequest).not.toHaveBeenCalled();

		expect(result).toStrictEqual(expectedResult);
	});

	// No need to test that the DAO can return a null player. It will throw an error if no player is found.
});
