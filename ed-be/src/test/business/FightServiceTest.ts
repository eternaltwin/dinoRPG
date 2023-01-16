import { mockRequest } from '../utils/constants.js';
import { Request } from 'express';
import { processFight } from '../../business/fightService.js';
import { DinozFightData } from '../data/dinozData.js';
import { cloneDeep } from 'lodash';

const PlayerDao = require('../../dao/playerDao.js');
const DinozDao = require('../../dao/dinozDao.js');

describe('Function processFight()', function () {
	let req: Request;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;
		req.body = {
			dinozId: DinozFightData.id
		};

		PlayerDao.addPlayerMoney = jasmine.createSpy();
		DinozDao.getDinozFightDataRequest = jasmine.createSpy().and.returnValue(DinozFightData);
		DinozDao.addExperience = jasmine.createSpy();
		DinozDao.addLife = jasmine.createSpy();
	});

	it('Nominal case', async function () {
		try {
			await processFight(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		expect(DinozDao.getDinozFightDataRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozFightDataRequest).toHaveBeenCalledWith(DinozFightData.id);

		expect(DinozDao.addLife).toHaveBeenCalledTimes(1);
	});

	it("Dinoz doesn't belongs to player who do the request", async function () {
		const wrongDinoz = cloneDeep(DinozFightData);
		wrongDinoz.player.id = 2;
		DinozDao.getDinozFightDataRequest = jasmine.createSpy().and.returnValue(wrongDinoz);
		try {
			await processFight(req);
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`Dinoz ${DinozFightData.id} doesn't belong to player ${DinozFightData.player.id}`);
		}

		expect(DinozDao.getDinozFightDataRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozFightDataRequest).toHaveBeenCalledWith(DinozFightData.id);
	});

	// No need to test that the DAO can return a null dinoz. It will throw an error if no player is found.

	// Bad requests are handled in routes
});
