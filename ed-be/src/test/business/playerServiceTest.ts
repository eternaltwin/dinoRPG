import { cloneDeep } from 'lodash';
import { Request } from 'express';
import {jest} from '@jest/globals';
import { PlayerAllData, playerList } from '../data/playerData.js';
import { importPlayerData, mockRequest, player } from '../utils/constants.js';
import {
	getAccountData,
	getCommonData,
	importAccount,
	searchPlayers,
	setCustomText
} from '../../business/playerService.js';
import { Player } from '../../entity/player.js';
import { rewardList } from '../../constants/reward.js';
import { PlayerReward } from '../../entity/playerReward.js';

const PlayerDao = require('../../dao/playerDao.js');
const DinozDao = require('../../dao/dinozDao.js');
const assPlayerRewardsDao = require('../../dao/playerRewardsDao.js');

let PlayerTestData: Player;

describe('Function getCommonData()', function () {
	let req: Request;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;

		// Repopulate PlayerTestData and DinozData before each test to start with clean data
		PlayerTestData = cloneDeep(PlayerAllData);

		// Override this as necessary if you change PlayerTestData
		PlayerDao.getCommonDataRequest = jasmine.createSpy().and.returnValue(PlayerTestData);
		DinozDao.getDinozTotalCount = jasmine.createSpy().and.returnValue(2);

		// PlayerWithDinoz.setDataValue = jasmine.createSpy().and.returnValue([]);
	});

	it('Nominal case', async function () {
		try {
			await getCommonData(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		expect(PlayerDao.getCommonDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getCommonDataRequest).toHaveBeenCalledWith(req.user!.playerId);

		expect(DinozDao.getDinozTotalCount).toHaveBeenCalledTimes(1);
	});
});

describe('Function getAccountData', function () {
	let req: Request;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;

		req.params = {
			id: player.id_1.toString()
		};

		// Repopulate PlayerTestData and DinozData before each test to start with clean data
		PlayerTestData = cloneDeep(PlayerAllData);

		// Override this as necessary if you change PlayerTestData
		PlayerDao.getPlayerDataRequest = jasmine.createSpy().and.returnValue(PlayerTestData);
	});

	it('Nominal case', async function () {
		try {
			await getAccountData(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		expect(PlayerDao.getPlayerDataRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getPlayerDataRequest).toHaveBeenCalledWith(player.id_1);

		// expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ dinozCount: 1 }));
	});

	// No need to test that the DAO can return a null player. It will throw an error if no player is found.

	// Bad requests are handled in routes
});

describe('Function importAccount', function () {
	let req: Request;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;

		req.user = {
			playerId: player.id_1
		};
		req.body = {
			server: 'fr'
		};

		// Repopulate PlayerTestData and DinozData before each test to start with clean data
		PlayerTestData = cloneDeep(PlayerAllData);

		// Override this as necessary if you change PlayerTestData
		PlayerDao.getImportedData = jasmine.createSpy().and.returnValue(PlayerTestData);
		PlayerDao.resetUser = jasmine.createSpy();
		assPlayerRewardsDao.addRewardToPlayer = jasmine.createSpy();
		PlayerDao.setPlayer = jasmine.createSpy();
	});

	it('Nominal case', async function () {
		PlayerTestData.hasImported = false;
		PlayerDao.getImportedData = jasmine.createSpy().and.returnValue(PlayerTestData);

		try {
			await importAccount(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		expect(PlayerDao.getImportedData).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getImportedData).toHaveBeenCalledWith(player.id_1);

		expect(PlayerDao.resetUser).toHaveBeenCalledTimes(1);
		expect(PlayerDao.resetUser).toHaveBeenCalledWith(player.id_1);

		expect(assPlayerRewardsDao.addRewardToPlayer).toHaveBeenCalledTimes(1);
		expect(assPlayerRewardsDao.addRewardToPlayer).toHaveBeenCalledWith(importPlayerData);

		expect(PlayerDao.setPlayer).toHaveBeenCalledTimes(1);
		expect(PlayerDao.setPlayer).toHaveBeenCalledWith({
			id: player.id_1,
			hasImported: true
		});
	});

	// No need to test that the DAO can return a null player. It will throw an error if no player is found.

	it('Player has already imported his account', async function () {
		PlayerTestData.hasImported = true;
		PlayerDao.getImportedData = jasmine.createSpy().and.returnValue(PlayerTestData);

		try {
			await importAccount(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`Player ${player.id_1} has already imported his account`);
		}

		expect(PlayerDao.getImportedData).toHaveBeenCalledTimes(1);

		expect(PlayerDao.getImportedData).toHaveBeenCalledWith(player.id_1);
	});

	// Bad requests are handled in routes
});

describe('Function setCustomText', function () {
	let req: Request;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;

		req.params = {
			id: player.id_1.toString()
		};
		req.body = {
			message: 'bonjour'
		};

		// Repopulate PlayerTestData and DinozData before each test to start with clean data
		PlayerTestData = cloneDeep(PlayerAllData);

		// Override this as necessary if you change PlayerTestData
		PlayerDao.getPlayerRewardsRequest = jasmine.createSpy().and.returnValue(PlayerTestData);
		PlayerDao.setPlayer = jasmine.createSpy();
	});

	it('Nominal case', async function () {
		PlayerTestData.rewards = [
			({
				rewardId: rewardList.PLUME
			} as unknown) as PlayerReward
		];
		PlayerDao.getPlayerRewardsRequest = jasmine.createSpy().and.returnValue(PlayerTestData);

		try {
			await setCustomText(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		expect(PlayerDao.getPlayerRewardsRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.setPlayer).toHaveBeenCalledTimes(1);

		expect(PlayerDao.getPlayerRewardsRequest).toHaveBeenCalledWith(player.id_1);
		expect(PlayerDao.setPlayer).toHaveBeenCalledWith({
			id: player.id_1,
			customText: req.body.message
		});
	});

	// No need to test that the DAO can return a null player. It will throw an error if no player is found.

	it('Player cannot edit', async function () {
		PlayerTestData.rewards = [];
		PlayerDao.getPlayerRewardsRequest = jasmine.createSpy().and.returnValue(PlayerTestData);

		try {
			await setCustomText(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`Player ${player.id_1} cannot edit this field`);
		}

		expect(PlayerDao.getPlayerRewardsRequest).toHaveBeenCalledTimes(1);

		expect(PlayerDao.getPlayerRewardsRequest).toHaveBeenCalledWith(player.id_1);
	});

	// Bad requests are handled in routes
});

describe('Function searchPlayers', function () {
	let req: Request;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;

		req.params = {
			name: 'Bio'
		};

		PlayerDao.searchPlayersByName = jasmine.createSpy().and.returnValue(playerList);
	});

	it('Nominal case', async function () {
		try {
			await searchPlayers(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		expect(PlayerDao.searchPlayersByName).toHaveBeenCalledTimes(1);

		expect(PlayerDao.searchPlayersByName).toHaveBeenCalledWith(req.params.name);

		//expect(res.send).toHaveBeenCalledWith(playerList);
	});

	// Bad requests are handled in routes
});
