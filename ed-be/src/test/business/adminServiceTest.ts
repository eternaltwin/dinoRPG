import { Request } from 'express';
import { jest } from '@jest/globals';
import {
	editDinoz,
	editPlayer,
	getAdminDashBoard,
	givePlayerEpicReward,
	listAllDinozFromPlayer,
	listAllPlayerInformationForAdminDashboard,
	setPlayerMoney
} from '../../business/adminService.js';
import { DinozSkill, DinozStatus, Dinoz, PlayerReward, Player } from '../../entity/index.js';
import { DinozListFromAnAccount, DinozFicheListFromAnAccount } from '../data/dinozData.js';
import { dinozId, mockRequest, player } from '../utils/constants.js';
import {
	PlayerAdminData,
	playerMoney,
	playerMoneyLess,
	playerMoneyPlus,
	PlayerTypeToSendAllData
} from '../data/playerData.js';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { PlayerTypeToSend } from '@drpg/core/models/player/PlayerTypeToSend';

const PlayerDao = require('../../dao/playerDao.js');
const DinozDao = require('../../dao/dinozDao.js');
const assPlayerRewardsDao = require('../../dao/playerRewardsDao.js');
const assDinozStatus = require('../../dao/dinozStatusDao.js');
const assDinozSkill = require('../../dao/dinozSkillDao.js');

describe('Function getAdminDashBoard', function () {
	let req: Request;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;
	});

	it('Nominal Case', async function () {
		let response: boolean = false;
		try {
			response = await getAdminDashBoard(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		expect(response).toStrictEqual(true);
	});
});

describe('Function editDinoz', function () {
	let req: Request;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;

		req.params = {
			id: dinozId.toString()
		};

		req.body = {
			status: [],
			skill: [],
			canChangeName: null,
			isSacrificed: null,
			isFrozen: null
		};

		DinozDao.getCanDinozChangeName = jasmine.createSpy().and.returnValue({
			canChangeName: false,
			player: {
				playerId: player.id_1
			}
		});
		DinozDao.setDinoz = jasmine.createSpy();
		assDinozStatus.addMultipleStatusToDinoz = jasmine.createSpy();
		assDinozStatus.removeStatusToDinoz = jasmine.createSpy();
		assDinozSkill.addMultipleSkillToDinoz = jasmine.createSpy();
		assDinozSkill.removeSkillToDinoz = jasmine.createSpy();
	});

	it('Change Name', async function () {
		req.body.name = 'Nestor';
		try {
			await editDinoz(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}
		expect(DinozDao.setDinoz).toHaveBeenCalledTimes(1);
		expect(DinozDao.setDinoz).toHaveBeenCalledWith({
			canChangeName: null,
			experience: undefined,
			isFrozen: null,
			isSacrificed: null,
			level: undefined,
			life: undefined,
			maxLife: undefined,
			placeId: undefined,
			id: dinozId,
			name: req.body.name
		});
	});

	it('Froze Dinoz', async function () {
		req.body.isFrozen = true;
		try {
			await editDinoz(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}
		expect(DinozDao.setDinoz).toHaveBeenCalledTimes(1);
		expect(DinozDao.setDinoz).toHaveBeenLastCalledWith({
			canChangeName: null,
			experience: undefined,
			isSacrificed: null,
			level: undefined,
			life: undefined,
			maxLife: undefined,
			placeId: undefined,
			name: undefined,
			id: dinozId,
			isFrozen: req.body.isFrozen
		});
	});

	it('Unfroze Dinoz', async function () {
		req.body.isFrozen = false;
		try {
			await editDinoz(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}
		expect(DinozDao.setDinoz).toHaveBeenCalledTimes(1);
		expect(DinozDao.setDinoz).toHaveBeenLastCalledWith({
			canChangeName: null,
			experience: undefined,
			isSacrificed: null,
			level: undefined,
			life: undefined,
			maxLife: undefined,
			placeId: undefined,
			name: undefined,
			id: dinozId,
			isFrozen: req.body.isFrozen
		});
	});

	it('Sacrifice Dinoz', async function () {
		req.body.isSacrificed = true;
		try {
			await editDinoz(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}
		expect(DinozDao.setDinoz).toHaveBeenCalledTimes(1);
		expect(DinozDao.setDinoz).toHaveBeenLastCalledWith({
			canChangeName: null,
			experience: undefined,
			isFrozen: null,
			level: undefined,
			life: undefined,
			maxLife: undefined,
			placeId: undefined,
			name: undefined,
			id: dinozId,
			isSacrificed: req.body.isSacrificed
		});
	});

	it('Unsacrifice Dinoz', async function () {
		req.body.isSacrificed = false;
		try {
			await editDinoz(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}
		expect(DinozDao.setDinoz).toHaveBeenCalledTimes(1);
		expect(DinozDao.setDinoz).toHaveBeenLastCalledWith({
			canChangeName: null,
			experience: undefined,
			isFrozen: null,
			level: undefined,
			life: undefined,
			maxLife: undefined,
			placeId: undefined,
			name: undefined,
			id: dinozId,
			isSacrificed: req.body.isSacrificed
		});
	});

	it('Change Dinoz Level', async function () {
		req.body.level = 10;
		try {
			await editDinoz(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}
		expect(DinozDao.setDinoz).toHaveBeenCalledTimes(1);
		expect(DinozDao.setDinoz).toHaveBeenLastCalledWith({
			canChangeName: null,
			experience: undefined,
			isFrozen: null,
			isSacrificed: null,
			life: undefined,
			maxLife: undefined,
			placeId: undefined,
			name: undefined,
			id: dinozId,
			level: req.body.level
		});
	});

	it('Change Dinoz Place', async function () {
		req.body.placeId = 5;
		try {
			await editDinoz(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}
		expect(DinozDao.setDinoz).toHaveBeenCalledTimes(1);
		expect(DinozDao.setDinoz).toHaveBeenLastCalledWith({
			canChangeName: null,
			experience: undefined,
			isFrozen: null,
			isSacrificed: null,
			level: undefined,
			life: undefined,
			maxLife: undefined,
			name: undefined,
			id: dinozId,
			placeId: req.body.placeId
		});
	});

	it('Set Can Rename to Dinoz', async function () {
		req.body.canChangeName = true;
		try {
			await editDinoz(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}
		expect(DinozDao.setDinoz).toHaveBeenCalledTimes(1);
		expect(DinozDao.setDinoz).toHaveBeenLastCalledWith({
			experience: undefined,
			isFrozen: null,
			isSacrificed: null,
			level: undefined,
			life: undefined,
			maxLife: undefined,
			placeId: undefined,
			name: undefined,
			id: dinozId,
			canChangeName: req.body.canChangeName
		});
	});

	it('Change Dinoz life', async function () {
		req.body.life = 50;
		try {
			await editDinoz(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}
		expect(DinozDao.setDinoz).toHaveBeenCalledTimes(1);
		expect(DinozDao.setDinoz).toHaveBeenLastCalledWith({
			canChangeName: null,
			experience: undefined,
			isFrozen: null,
			isSacrificed: null,
			level: undefined,
			maxLife: undefined,
			placeId: undefined,
			name: undefined,
			id: dinozId,
			life: req.body.life
		});
	});

	it('Change Dinoz maxLife', async function () {
		req.body.maxLife = 500;
		try {
			await editDinoz(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}
		expect(DinozDao.setDinoz).toHaveBeenCalledTimes(1);
		expect(DinozDao.setDinoz).toHaveBeenLastCalledWith({
			canChangeName: null,
			experience: undefined,
			isFrozen: null,
			isSacrificed: null,
			level: undefined,
			life: undefined,
			placeId: undefined,
			name: undefined,
			id: dinozId,
			maxLife: req.body.maxLife
		});
	});

	it('Change Dinoz experience', async function () {
		req.body.experience = 250;
		try {
			await editDinoz(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}
		expect(DinozDao.setDinoz).toHaveBeenCalledTimes(1);
		expect(DinozDao.setDinoz).toHaveBeenLastCalledWith({
			canChangeName: null,
			isFrozen: null,
			isSacrificed: null,
			level: undefined,
			life: undefined,
			maxLife: undefined,
			placeId: undefined,
			name: undefined,
			id: dinozId,
			experience: req.body.experience
		});
	});

	it('Add status', async function () {
		const statusToAdd = [5, 10];
		req.body.status = statusToAdd;
		req.body.statusOperation = 'add';

		const expectedStatusObject: Array<DinozStatus> = statusToAdd.map(
			status => new DinozStatus(new Dinoz(parseInt(req.params.id)), status)
		);

		try {
			await editDinoz(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}
		expect(assDinozStatus.addMultipleStatusToDinoz).toHaveBeenCalledTimes(1);
		expect(assDinozStatus.addMultipleStatusToDinoz).toHaveBeenLastCalledWith(expectedStatusObject);
	});

	it('Remove status', async function () {
		req.body.status = [5, 10];
		req.body.statusOperation = 'remove';

		try {
			await editDinoz(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}
		expect(assDinozStatus.removeStatusToDinoz).toHaveBeenCalledTimes(2);

		// check the last call for removeStatusToDinoz.
		// req.body.status[req.body.status.length - 1] means the element 10 because req.body.status.length = 2 and the first index of an array is 0
		expect(assDinozStatus.removeStatusToDinoz).toHaveBeenLastCalledWith(
			dinozId,
			req.body.status[req.body.status.length - 1]
		);
	});

	it('Wrong OperationStatus', async function () {
		req.body.status = [5, 10];
		req.body.statusOperation = 'wrong';

		try {
			await editDinoz(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`You need to select an operation.`);
		}
		expect(assDinozStatus.addMultipleStatusToDinoz).toHaveBeenCalledTimes(0);
		expect(assDinozStatus.removeStatusToDinoz).toHaveBeenCalledTimes(0);
	});

	it('Add skill', async function () {
		const skillsToAdd = [5, 10];
		req.body.skill = skillsToAdd;
		req.body.skillOperation = 'add';

		const expectedSkillsObject: Array<DinozSkill> = skillsToAdd.map(
			skill => new DinozSkill(new Dinoz(parseInt(req.params.id)), skill)
		);

		try {
			await editDinoz(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}
		expect(assDinozSkill.addMultipleSkillToDinoz).toHaveBeenCalledTimes(1);
		expect(assDinozSkill.addMultipleSkillToDinoz).toHaveBeenLastCalledWith(expectedSkillsObject);
	});

	it('Remove skill', async function () {
		req.body.skill = [5, 10];
		req.body.skillOperation = 'remove';

		try {
			await editDinoz(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}
		expect(assDinozSkill.removeSkillToDinoz).toHaveBeenCalledTimes(2);

		expect(assDinozSkill.removeSkillToDinoz).toHaveBeenLastCalledWith(
			dinozId,
			req.body.skill[req.body.skill.length - 1]
		);
	});

	it('Wrong OperationSkill', async function () {
		req.body.skill = [5, 10];
		req.body.skillOperation = 'wrong';

		try {
			await editDinoz(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`You need to select an operation.`);
		}
		expect(assDinozSkill.addMultipleSkillToDinoz).toHaveBeenCalledTimes(0);
		expect(assDinozSkill.removeSkillToDinoz).toHaveBeenCalledTimes(0);
	});
});

describe('Function setPlayerMoney', function () {
	let req: Request;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;

		req.params = {
			id: player.id_1.toString()
		};
		PlayerDao.setPlayerMoneyRequest = jasmine.createSpy();
	});

	// No need to test that the DAO can return a null player. It will throw an error if no player is found.

	it('Add gold', async function () {
		req.body.gold = 10000;
		req.body.operation = 'add';
		PlayerDao.getPlayerMoney = jasmine.createSpy().and.returnValues(playerMoney, playerMoneyPlus);

		const expectedMoney: string = (playerMoney.money + req.body.gold).toString();

		let response: string = '';
		try {
			response = await setPlayerMoney(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledWith(
			parseInt(req.params.id),
			playerMoney.money + req.body.gold
		);

		expect(PlayerDao.getPlayerMoney).toHaveBeenCalledTimes(2);
		expect(PlayerDao.getPlayerMoney).toHaveBeenLastCalledWith(parseInt(req.params.id));

		expect(response).toStrictEqual(expectedMoney);
	});

	it('Remove gold', async function () {
		req.body.gold = 10000;
		req.body.operation = 'remove';
		PlayerDao.getPlayerMoney = jasmine.createSpy().and.returnValues(playerMoney, playerMoneyLess);

		const expectedMoney: string = (playerMoney.money - req.body.gold).toString();

		let response: string = '';
		try {
			response = await setPlayerMoney(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledWith(
			parseInt(req.params.id),
			playerMoney.money - req.body.gold
		);

		expect(PlayerDao.getPlayerMoney).toHaveBeenCalledTimes(2);
		expect(PlayerDao.getPlayerMoney).toHaveBeenLastCalledWith(parseInt(req.params.id));

		expect(response).toStrictEqual(expectedMoney);
	});

	it('Wrong OperationStatus', async function () {
		req.body.gold = 10000;
		req.body.operation = 'wrong';
		PlayerDao.getPlayerMoney = jasmine.createSpy().and.returnValue(playerMoney);

		try {
			await setPlayerMoney(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`You need to select an operation.`);
		}
		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledTimes(0);
		expect(PlayerDao.getPlayerMoney).toHaveBeenCalledTimes(1);
	});
});

describe('Function givePlayerEpicReward', function () {
	let req: Request;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;

		assPlayerRewardsDao.addMultipleRewardToPlayer = jasmine.createSpy();
		assPlayerRewardsDao.removeRewardToPlayer = jasmine.createSpy();

		req.params = {
			id: player.id_1.toString()
		};
	});

	it('Add rewards', async function () {
		const rewardsToAdd = [1, 2];

		req.body.epicRewardId = rewardsToAdd;
		req.body.operation = 'add';

		const expectedRewardsObject: Array<PlayerReward> = rewardsToAdd.map(
			reward => new PlayerReward(new Player(parseInt(req.params.id)), reward)
		);

		try {
			await givePlayerEpicReward(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}
		expect(assPlayerRewardsDao.addMultipleRewardToPlayer).toHaveBeenCalledTimes(1);
		expect(assPlayerRewardsDao.addMultipleRewardToPlayer).toHaveBeenCalledWith(expectedRewardsObject);
	});

	it('Remove rewards', async function () {
		req.body.epicRewardId = [1, 2];
		req.body.operation = 'remove';

		try {
			await givePlayerEpicReward(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}
		expect(assPlayerRewardsDao.removeRewardToPlayer).toHaveBeenCalledTimes(2);

		expect(assPlayerRewardsDao.removeRewardToPlayer).toHaveBeenLastCalledWith(
			parseInt(req.params.id),
			req.body.epicRewardId[req.body.epicRewardId.length - 1]
		);
	});

	it('Wrong operation', async function () {
		req.body.epicRewardId = [5, 10];
		req.body.operation = 'wrong';

		try {
			await givePlayerEpicReward(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`You need to select an operation.`);
		}
		expect(assPlayerRewardsDao.addMultipleRewardToPlayer).toHaveBeenCalledTimes(0);
		expect(assPlayerRewardsDao.removeRewardToPlayer).toHaveBeenCalledTimes(0);
	});
});

describe('Function listAllDinozFromPlayer', function () {
	let req: Request;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;

		DinozDao.getAllDinozFromAccount = jasmine.createSpy().and.returnValue(DinozListFromAnAccount);

		req.params = {
			id: player.id_1.toString()
		};
	});

	it('Nominal case', async function () {
		let response: Array<DinozFiche> = [];
		try {
			response = await listAllDinozFromPlayer(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}
		expect(DinozDao.getAllDinozFromAccount).toHaveBeenCalledTimes(1);
		expect(DinozDao.getAllDinozFromAccount).toHaveBeenCalledWith(parseInt(req.params.id));

		expect(response).toStrictEqual(DinozFicheListFromAnAccount);
	});
});

describe('Function listAllPlayerInformationForAdminDashboard', function () {
	let req: Request;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;

		PlayerDao.getAllInformationFromPlayer = jasmine.createSpy().and.returnValue(PlayerAdminData);
		PlayerDao.setPlayer = jasmine.createSpy();

		req.params = {
			id: player.id_1.toString()
		};
	});

	it('Nominal case', async function () {
		let response: Partial<PlayerTypeToSend> = {};
		try {
			response = await listAllPlayerInformationForAdminDashboard(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}
		expect(PlayerDao.getAllInformationFromPlayer).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getAllInformationFromPlayer).toHaveBeenCalledWith(parseInt(req.params.id));

		expect(response).toStrictEqual(PlayerTypeToSendAllData);
	});

	// No need to test that the DAO can return a null player. It will throw an error if no player is found.
});

describe('Function editPlayer', function () {
	let req: Request;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;

		req.params = {
			id: player.id_1.toString()
		};

		req.body = {
			hasImported: null,
			leader: null,
			engineer: null,
			cooker: null,
			shopKeeper: null,
			merchant: null,
			priest: null,
			teacher: null
		};

		PlayerDao.editCustomText = jasmine.createSpy();
		PlayerDao.setPlayer = jasmine.createSpy();
		PlayerDao.setPlayer = jasmine.createSpy();
	});

	it('Change HasImported', async function () {
		req.body.hasImported = true;
		try {
			await editPlayer(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}
		expect(PlayerDao.setPlayer).toHaveBeenCalledTimes(1);
		expect(PlayerDao.setPlayer).toHaveBeenCalledWith(
			expect.objectContaining({
				id: parseInt(req.params.id),
				hasImported: req.body.hasImported
			})
		);
	});

	it('editCustomText', async function () {
		req.body.customText = 'Nouveau custom text';
		try {
			await editPlayer(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}
		expect(PlayerDao.setPlayer).toHaveBeenCalledTimes(1);
		expect(PlayerDao.setPlayer).toHaveBeenCalledWith(
			expect.objectContaining({
				id: parseInt(req.params.id),
				customText: req.body.customText
			})
		);
	});

	it('Change quetzuBought', async function () {
		req.body.quetzuBought = 5;
		try {
			await editPlayer(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}
		expect(PlayerDao.setPlayer).toHaveBeenCalledTimes(1);
		expect(PlayerDao.setPlayer).toHaveBeenCalledWith(
			expect.objectContaining({
				id: parseInt(req.params.id),
				quetzuBought: req.body.quetzuBought
			})
		);
	});

	it('Change leader', async function () {
		req.body.leader = false;
		try {
			await editPlayer(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}
		expect(PlayerDao.setPlayer).toHaveBeenCalledTimes(1);
		expect(PlayerDao.setPlayer).toHaveBeenCalledWith(
			expect.objectContaining({
				id: parseInt(req.params.id),
				leader: req.body.leader
			})
		);
	});

	it('Change engineer', async function () {
		req.body.engineer = true;
		try {
			await editPlayer(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}
		expect(PlayerDao.setPlayer).toHaveBeenCalledTimes(1);
		expect(PlayerDao.setPlayer).toHaveBeenCalledWith(
			expect.objectContaining({
				id: parseInt(req.params.id),
				engineer: req.body.engineer
			})
		);
	});

	it('Change cooker', async function () {
		req.body.cooker = false;
		try {
			await editPlayer(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}
		expect(PlayerDao.setPlayer).toHaveBeenCalledTimes(1);
		expect(PlayerDao.setPlayer).toHaveBeenCalledWith(
			expect.objectContaining({
				id: parseInt(req.params.id),
				cooker: req.body.cooker
			})
		);
	});

	it('Change shopKeeper', async function () {
		req.body.shopKeeper = false;
		try {
			await editPlayer(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}
		expect(PlayerDao.setPlayer).toHaveBeenCalledTimes(1);
		expect(PlayerDao.setPlayer).toHaveBeenCalledWith(
			expect.objectContaining({
				id: parseInt(req.params.id),
				shopKeeper: req.body.shopKeeper
			})
		);
	});

	it('Change merchant', async function () {
		req.body.merchant = true;
		try {
			await editPlayer(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}
		expect(PlayerDao.setPlayer).toHaveBeenCalledTimes(1);
		expect(PlayerDao.setPlayer).toHaveBeenCalledWith(
			expect.objectContaining({
				id: parseInt(req.params.id),
				merchant: req.body.merchant
			})
		);
	});

	it('Change priest', async function () {
		req.body.priest = false;
		try {
			await editPlayer(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}
		expect(PlayerDao.setPlayer).toHaveBeenCalledTimes(1);
		expect(PlayerDao.setPlayer).toHaveBeenCalledWith(
			expect.objectContaining({
				id: parseInt(req.params.id),
				priest: req.body.priest
			})
		);
	});

	it('Change teacher', async function () {
		req.body.teacher = false;
		try {
			await editPlayer(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}
		expect(PlayerDao.setPlayer).toHaveBeenCalledTimes(1);
		expect(PlayerDao.setPlayer).toHaveBeenCalledWith(
			expect.objectContaining({
				id: parseInt(req.params.id),
				teacher: req.body.teacher
			})
		);
	});
});
