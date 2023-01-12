import { mockRequest } from '../utils/constants.js';
import { Request } from 'express';
import { processFight } from '../../business/fightService.js';
import { DinozFightData } from '../data/dinozData.js';

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
	});

	// No need to test that the DAO can return a null dinoz. It will throw an error if no player is found.

	// Bad requests are handled in routes
});
