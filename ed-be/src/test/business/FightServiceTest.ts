import { mockRequest } from '../utils/constants.js';
import { Request } from 'express';
import { jest } from '@jest/globals';
import { moveFight, processFight } from '../../business/fightService.js';
import {
	DinozFightData,
	DinozFightDataWithMission,
	fightLvl1Win,
	fightResultlvl1Win,
	fightResultlvl7Win,
	MonsterDataLvl1
} from '../data/dinozData.js';
import { cloneDeep } from 'lodash';

const PlayerDao = require('../../dao/playerDao.js');
const DinozDao = require('../../dao/dinozDao.js');
const MissionsDinoz = require('../../business/missionsService.js');
const tools = require('../../utils/tools.js');

describe('Function processFight()', function () {
	let req: Request;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;
		req.body = {
			dinozId: DinozFightData.id
		};

		PlayerDao.addPlayerMoney = jasmine.createSpy();
		DinozDao.getDinozFightDataRequest = jasmine.createSpy().and.returnValue(DinozFightDataWithMission);
		DinozDao.addExperience = jasmine.createSpy();
		DinozDao.addLife = jasmine.createSpy();
		MissionsDinoz.checkMissionFight = jasmine.createSpy();
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
		expect(DinozDao.getDinozFightDataRequest).toHaveBeenCalledWith(DinozFightDataWithMission.id);

		expect(DinozDao.addExperience).toHaveBeenCalledTimes(1);
		expect(DinozDao.addExperience).toHaveBeenCalledWith(DinozFightDataWithMission.id, fightResultlvl1Win.xpEarned);

		expect(PlayerDao.addPlayerMoney).toHaveBeenCalledTimes(1);
		expect(PlayerDao.addPlayerMoney).toHaveBeenCalledWith(
			DinozFightDataWithMission.player.id,
			fightResultlvl1Win.goldEarned
		);

		expect(DinozDao.addLife).toHaveBeenCalledTimes(1);
		expect(DinozDao.addLife).toHaveBeenCalledWith(DinozFightDataWithMission.id, -fightResultlvl1Win.hpLost);

		expect(MissionsDinoz.checkMissionFight).toHaveBeenCalledTimes(1);
		expect(MissionsDinoz.checkMissionFight).toHaveBeenCalledWith(DinozFightDataWithMission, fightResultlvl1Win);
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

	it('Nominal case at level 7', async function () {
		jest.spyOn(tools, 'getRandomNumber').mockReturnValue(101);
		const dinozLevel7 = cloneDeep(DinozFightDataWithMission);
		dinozLevel7.level = 7;
		DinozDao.getDinozFightDataRequest = jasmine.createSpy().and.returnValue(dinozLevel7);
		try {
			await processFight(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		expect(DinozDao.getDinozFightDataRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozFightDataRequest).toHaveBeenCalledWith(dinozLevel7.id);

		expect(DinozDao.addExperience).toHaveBeenCalledTimes(1);
		expect(DinozDao.addExperience).toHaveBeenCalledWith(dinozLevel7.id, fightResultlvl7Win.xpEarned);

		expect(PlayerDao.addPlayerMoney).toHaveBeenCalledTimes(1);
		expect(PlayerDao.addPlayerMoney).toHaveBeenCalledWith(dinozLevel7.player.id, fightResultlvl7Win.goldEarned);

		expect(DinozDao.addLife).toHaveBeenCalledTimes(1);
		expect(DinozDao.addLife).toHaveBeenCalledWith(dinozLevel7.id, -fightResultlvl7Win.hpLost);

		expect(MissionsDinoz.checkMissionFight).toHaveBeenCalledTimes(1);
		expect(MissionsDinoz.checkMissionFight).toHaveBeenCalledWith(dinozLevel7, fightResultlvl7Win);
	});

	// No need to test that the DAO can return a null dinoz. It will throw an error if no player is found.

	// Bad requests are handled in routes
});

describe('Function moveFight()', function () {
	let req: Request;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;
		req.body = {
			dinozId: DinozFightDataWithMission.id
		};

		PlayerDao.addPlayerMoney = jasmine.createSpy();
		DinozDao.getDinozFightDataRequest = jasmine.createSpy().and.returnValue(DinozFightDataWithMission);
		DinozDao.addExperience = jasmine.createSpy();
		DinozDao.addLife = jasmine.createSpy();
		MissionsDinoz.prepareFight = jasmine.createSpy().and.returnValue(MonsterDataLvl1);
		MissionsDinoz.calculateFight = jasmine.createSpy();
		MissionsDinoz.rewardFight = jasmine.createSpy();
		MissionsDinoz.getFightResult = jasmine.createSpy();
		MissionsDinoz.checkMissionFight = jasmine.createSpy();
	});

	it('Nominal case', async function () {
		MissionsDinoz.calculateFight = jasmine.createSpy().and.returnValue(fightLvl1Win);
		MissionsDinoz.getFightResult = jasmine.createSpy().and.returnValue(fightResultlvl1Win);
		const dinozCloned = cloneDeep(DinozFightDataWithMission);
		dinozCloned.placeId = 6;
		try {
			await moveFight(DinozFightDataWithMission, 8);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		expect(DinozDao.addExperience).toHaveBeenCalledTimes(1);
		expect(DinozDao.addExperience).toHaveBeenCalledWith(dinozCloned.id, fightResultlvl1Win.xpEarned);

		expect(PlayerDao.addPlayerMoney).toHaveBeenCalledTimes(1);
		expect(PlayerDao.addPlayerMoney).toHaveBeenCalledWith(dinozCloned.player.id, fightResultlvl1Win.goldEarned);

		expect(DinozDao.addLife).toHaveBeenCalledTimes(1);
		expect(DinozDao.addLife).toHaveBeenCalledWith(dinozCloned.id, -fightResultlvl1Win.hpLost);

		dinozCloned.placeId = 8;
		expect(MissionsDinoz.checkMissionFight).toHaveBeenCalledTimes(1);
		expect(MissionsDinoz.checkMissionFight).toHaveBeenCalledWith(dinozCloned, fightResultlvl1Win);
	});

	// No need to test that the DAO can return a null dinoz. It will throw an error if no player is found.

	// Bad requests are handled in routes
});
