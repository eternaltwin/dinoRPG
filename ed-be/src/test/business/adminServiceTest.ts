import { Request, Response } from 'express';
import {
	ErrorFormatter,
	Result,
	ValidationError,
	validationResult
} from 'express-validator';
import { mocked } from 'ts-jest/utils';
import {
	dinozId,
	dinozName,
	mockRequest,
	mockResponse,
	player
} from '../utils/constants.js';
import {
	editDinoz,
	editPlayer,
	getAdminDashBoard,
	givePlayerEpicReward,
	listAllDinozFromPlayer,
	listAllPlayerInformationForAdminDashoard,
	setPlayerMoney
} from '../../business/adminService.js';
import { DinozListFromAnAccount } from '../data/dinozData.js';
import {
	PlayerAllData,
	playerMoney,
	playerMoneyLess,
	playerMoneyPlus
} from '../data/playerData.js';

jest.mock('express-validator');

const PlayerDao = require('../../dao/playerDao.js');
const DinozDao = require('../../dao/dinozDao.js');
const assPlayerRewardsDao = require('../../dao/assPlayerRewardsDao.js');
const assDinozStatus = require('../../dao/assDinozStatusDao.js');
const assDinozSkill = require('../../dao/assDinozSkillDao.js');

describe('Function getAdminDashBoard', function () {
	let req: Request;
	let res: Response;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;
		res = mockResponse;

		const result: Result<ValidationError> = new Result(
			{} as ErrorFormatter<ValidationError>,
			[]
		);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => true);
	});

	it('Nominal Case', async function () {
		await getAdminDashBoard(req, res);

		expect(res.status).toHaveBeenCalledWith(200);
	});

	it('Bad request', async function () {
		const result: Result<ValidationError> = new Result(
			{} as ErrorFormatter<ValidationError>,
			[]
		);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => false);

		await getAdminDashBoard(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
	});
});

describe('Function editDinoz', function () {
	let req: Request;
	let res: Response;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;
		res = mockResponse;

		const result: Result<ValidationError> = new Result(
			{} as ErrorFormatter<ValidationError>,
			[]
		);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => true);

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
		DinozDao.setDinozNameRequest = jasmine.createSpy();
		DinozDao.freezeDinoz = jasmine.createSpy();
		DinozDao.sacrificeDinoz = jasmine.createSpy();
		DinozDao.setDinozLevel = jasmine.createSpy();
		DinozDao.setDinozPlaceRequest = jasmine.createSpy();
		DinozDao.setDinozCanChangeName = jasmine.createSpy();
		DinozDao.setDinozLife = jasmine.createSpy();
		DinozDao.setDinozMaxLife = jasmine.createSpy();
		DinozDao.setDinozExperience = jasmine.createSpy();
		assDinozStatus.addMultipleStatusToDinoz = jasmine.createSpy();
		assDinozStatus.removeStatusToDinoz = jasmine.createSpy();
		assDinozSkill.addMultipleSkillToDinoz = jasmine.createSpy();
		assDinozSkill.removeSkillToDinoz = jasmine.createSpy();
	});

	it('Bad request', async function () {
		const result: Result<ValidationError> = new Result(
			{} as ErrorFormatter<ValidationError>,
			[]
		);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => false);

		await editDinoz(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
	});

	it('Change Name', async function () {
		req.body.name = 'Nestor';
		await editDinoz(req, res);
		expect(DinozDao.getCanDinozChangeName).toHaveBeenCalledTimes(1);
		expect(DinozDao.setDinozNameRequest).toHaveBeenCalledTimes(1);

		expect(DinozDao.getCanDinozChangeName).toHaveBeenCalledWith(dinozId);
		expect(DinozDao.setDinozNameRequest).toHaveBeenLastCalledWith(
			{
				dinozId: dinozId,
				name: 'Nestor'
			},
			false
		);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith();
	});

	it('Froze Dinoz', async function () {
		req.body.isFrozen = true;
		await editDinoz(req, res);
		expect(DinozDao.freezeDinoz).toHaveBeenCalledTimes(1);

		expect(DinozDao.freezeDinoz).toHaveBeenLastCalledWith(
			dinozId,
			req.body.isFrozen
		);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith();
	});

	it('Unfroze Dinoz', async function () {
		req.body.isFrozen = false;
		await editDinoz(req, res);
		expect(DinozDao.freezeDinoz).toHaveBeenCalledTimes(1);

		expect(DinozDao.freezeDinoz).toHaveBeenLastCalledWith(
			dinozId,
			req.body.isFrozen
		);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith();
	});

	it('Sacrifice Dinoz', async function () {
		req.body.isSacrificed = true;
		await editDinoz(req, res);
		expect(DinozDao.sacrificeDinoz).toHaveBeenCalledTimes(1);

		expect(DinozDao.sacrificeDinoz).toHaveBeenLastCalledWith(
			dinozId,
			req.body.isSacrificed
		);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith();
	});

	it('Unsacrifice Dinoz', async function () {
		req.body.isSacrificed = false;
		await editDinoz(req, res);
		expect(DinozDao.sacrificeDinoz).toHaveBeenCalledTimes(1);

		expect(DinozDao.sacrificeDinoz).toHaveBeenLastCalledWith(
			dinozId,
			req.body.isSacrificed
		);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith();
	});

	it('Change Dinoz Level', async function () {
		req.body.level = 10;
		await editDinoz(req, res);
		expect(DinozDao.setDinozLevel).toHaveBeenCalledTimes(1);

		expect(DinozDao.setDinozLevel).toHaveBeenLastCalledWith(
			dinozId,
			req.body.level
		);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith();
	});

	it('Change Dinoz Place', async function () {
		req.body.placeId = 5;
		await editDinoz(req, res);
		expect(DinozDao.setDinozPlaceRequest).toHaveBeenCalledTimes(1);

		expect(DinozDao.setDinozPlaceRequest).toHaveBeenLastCalledWith(
			dinozId,
			req.body.placeId
		);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith();
	});

	it('Set Can Rename to Dinoz', async function () {
		req.body.canChangeName = true;
		await editDinoz(req, res);
		expect(DinozDao.setDinozCanChangeName).toHaveBeenCalledTimes(1);

		expect(DinozDao.setDinozCanChangeName).toHaveBeenLastCalledWith(
			dinozId,
			req.body.canChangeName
		);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith();
	});

	it('Change Dinoz life', async function () {
		req.body.life = 50;
		await editDinoz(req, res);
		expect(DinozDao.setDinozLife).toHaveBeenCalledTimes(1);

		expect(DinozDao.setDinozLife).toHaveBeenLastCalledWith(
			dinozId,
			req.body.life
		);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith();
	});

	it('Change Dinoz maxLife', async function () {
		req.body.maxLife = 500;
		await editDinoz(req, res);
		expect(DinozDao.setDinozMaxLife).toHaveBeenCalledTimes(1);

		expect(DinozDao.setDinozMaxLife).toHaveBeenLastCalledWith(
			dinozId,
			req.body.maxLife
		);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith();
	});

	it('Change Dinoz experience', async function () {
		req.body.experience = 250;
		await editDinoz(req, res);
		expect(DinozDao.setDinozExperience).toHaveBeenCalledTimes(1);

		expect(DinozDao.setDinozExperience).toHaveBeenLastCalledWith(
			dinozId,
			req.body.experience
		);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith();
	});

	it('Add status', async function () {
		req.body.status = [5, 10];
		req.body.statusOperation = 'add';
		const statusToAdd = [
			{ dinozId: dinozId, statusId: req.body.status[0] },
			{ dinozId: dinozId, statusId: req.body.status[1] }
		];
		await editDinoz(req, res);
		expect(assDinozStatus.addMultipleStatusToDinoz).toHaveBeenCalledTimes(1);

		expect(assDinozStatus.addMultipleStatusToDinoz).toHaveBeenLastCalledWith(
			statusToAdd
		);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith();
	});

	it('Remove status', async function () {
		req.body.status = [5, 10];
		req.body.statusOperation = 'remove';

		await editDinoz(req, res);
		expect(assDinozStatus.removeStatusToDinoz).toHaveBeenCalledTimes(2);

		// check the last call for removeStatusToDinoz.
		// req.body.status[req.body.status.length - 1] means the element 10 because req.body.status.length = 2 and the first index of an array is 0
		expect(assDinozStatus.removeStatusToDinoz).toHaveBeenLastCalledWith(
			dinozId,
			req.body.status[req.body.status.length - 1]
		);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith();
	});

	it('Wrong OperationStatus', async function () {
		req.body.status = [5, 10];
		req.body.statusOperation = 'wrong';

		await editDinoz(req, res);
		expect(assDinozStatus.addMultipleStatusToDinoz).toHaveBeenCalledTimes(0);
		expect(assDinozStatus.removeStatusToDinoz).toHaveBeenCalledTimes(0);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith(`You need to select an operation.`);
	});

	it('Add skill', async function () {
		req.body.skill = [5, 10];
		req.body.skillOperation = 'add';
		const skillsToAdd = [
			{ dinozId: dinozId, skillId: req.body.skill[0] },
			{ dinozId: dinozId, skillId: req.body.skill[1] }
		];
		await editDinoz(req, res);
		expect(assDinozSkill.addMultipleSkillToDinoz).toHaveBeenCalledTimes(1);

		expect(assDinozSkill.addMultipleSkillToDinoz).toHaveBeenLastCalledWith(
			skillsToAdd
		);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith();
	});

	it('Remove skill', async function () {
		req.body.skill = [5, 10];
		req.body.skillOperation = 'remove';

		await editDinoz(req, res);
		expect(assDinozSkill.removeSkillToDinoz).toHaveBeenCalledTimes(2);

		expect(assDinozSkill.removeSkillToDinoz).toHaveBeenLastCalledWith(
			dinozId,
			req.body.skill[req.body.skill.length - 1]
		);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith();
	});

	it('Wrong OperationSkill', async function () {
		req.body.skill = [5, 10];
		req.body.skillOperation = 'wrong';

		await editDinoz(req, res);
		expect(assDinozSkill.addMultipleSkillToDinoz).toHaveBeenCalledTimes(0);
		expect(assDinozSkill.removeSkillToDinoz).toHaveBeenCalledTimes(0);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith(`You need to select an operation.`);
	});
});

describe('Function setPlayerMoney', function () {
	let req: Request;
	let res: Response;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;
		res = mockResponse;

		const result: Result<ValidationError> = new Result(
			{} as ErrorFormatter<ValidationError>,
			[]
		);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => true);

		req.params = {
			id: player.id_1.toString()
		};
		PlayerDao.setPlayerMoneyRequest = jasmine.createSpy();
	});

	it('Bad request', async function () {
		const result: Result<ValidationError> = new Result(
			{} as ErrorFormatter<ValidationError>,
			[]
		);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => false);

		await setPlayerMoney(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
	});

	it("Player doesn't exist", async function () {
		PlayerDao.getPlayerMoney = jasmine.createSpy().and.returnValue(null);

		await setPlayerMoney(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(
			`Player ${parseInt(req.params.id)} doesn't exist`
		);
	});

	it('Add gold', async function () {
		req.body.gold = 10000;
		req.body.operation = 'add';
		PlayerDao.getPlayerMoney = jasmine
			.createSpy()
			.and.returnValues(playerMoney, playerMoneyPlus);

		await setPlayerMoney(req, res);
		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledWith(
			parseInt(req.params.id),
			playerMoney.money + req.body.gold
		);

		expect(PlayerDao.getPlayerMoney).toHaveBeenCalledTimes(2);
		expect(PlayerDao.getPlayerMoney).toHaveBeenLastCalledWith(
			parseInt(req.params.id)
		);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith(playerMoney.money + req.body.gold);
	});

	it('Remove gold', async function () {
		req.body.gold = 10000;
		req.body.operation = 'remove';
		PlayerDao.getPlayerMoney = jasmine
			.createSpy()
			.and.returnValues(playerMoney, playerMoneyLess);

		await setPlayerMoney(req, res);
		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledWith(
			parseInt(req.params.id),
			playerMoney.money - req.body.gold
		);

		expect(PlayerDao.getPlayerMoney).toHaveBeenCalledTimes(2);
		expect(PlayerDao.getPlayerMoney).toHaveBeenLastCalledWith(
			parseInt(req.params.id)
		);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith(playerMoney.money - req.body.gold);
	});

	it('Wrong OperationStatus', async function () {
		req.body.gold = 10000;
		req.body.operation = 'wrong';
		PlayerDao.getPlayerMoney = jasmine.createSpy().and.returnValue(playerMoney);

		await setPlayerMoney(req, res);
		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledTimes(0);
		expect(PlayerDao.getPlayerMoney).toHaveBeenCalledTimes(1);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith(`You need to select an operation.`);
	});
});

describe('Function givePlayerEpicReward', function () {
	let req: Request;
	let res: Response;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;
		res = mockResponse;

		const result: Result<ValidationError> = new Result(
			{} as ErrorFormatter<ValidationError>,
			[]
		);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => true);
		assPlayerRewardsDao.addMultipleRewardToPlayer = jasmine.createSpy();
		assPlayerRewardsDao.removeRewardToPlayer = jasmine.createSpy();

		req.params = {
			id: player.id_1.toString()
		};
	});

	it('Bad request', async function () {
		const result: Result<ValidationError> = new Result(
			{} as ErrorFormatter<ValidationError>,
			[]
		);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => false);

		await givePlayerEpicReward(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
	});

	it('Add rewards', async function () {
		req.body.epicRewardId = [1, 2];
		req.body.operation = 'add';

		const rewardsToAdd = [
			{ playerId: 12345, rewardId: 1 },
			{ playerId: 12345, rewardId: 2 }
		];

		await givePlayerEpicReward(req, res);
		expect(assPlayerRewardsDao.addMultipleRewardToPlayer).toHaveBeenCalledTimes(
			1
		);
		expect(assPlayerRewardsDao.addMultipleRewardToPlayer).toHaveBeenCalledWith(
			rewardsToAdd
		);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith();
	});

	it('Remove rewards', async function () {
		req.body.epicRewardId = [1, 2];
		req.body.operation = 'remove';

		await givePlayerEpicReward(req, res);
		expect(assPlayerRewardsDao.removeRewardToPlayer).toHaveBeenCalledTimes(2);

		expect(assPlayerRewardsDao.removeRewardToPlayer).toHaveBeenLastCalledWith(
			parseInt(req.params.id),
			req.body.epicRewardId[req.body.epicRewardId.length - 1]
		);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith();
	});

	it('Wrong operation', async function () {
		req.body.epicRewardId = [5, 10];
		req.body.operation = 'wrong';

		await givePlayerEpicReward(req, res);
		expect(assPlayerRewardsDao.addMultipleRewardToPlayer).toHaveBeenCalledTimes(
			0
		);
		expect(assPlayerRewardsDao.removeRewardToPlayer).toHaveBeenCalledTimes(0);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith(`You need to select an operation.`);
	});
});

describe('Function listAllDinozFromPlayer', function () {
	let req: Request;
	let res: Response;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;
		res = mockResponse;

		const result: Result<ValidationError> = new Result(
			{} as ErrorFormatter<ValidationError>,
			[]
		);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => true);

		req.params = {
			id: player.id_1.toString()
		};
	});

	it('Bad request', async function () {
		const result: Result<ValidationError> = new Result(
			{} as ErrorFormatter<ValidationError>,
			[]
		);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => false);

		await listAllDinozFromPlayer(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
	});

	it('Nominal case', async function () {
		DinozListFromAnAccount.forEach(dinoz => (dinoz.setDataValue = jest.fn));
		DinozDao.getAllDinozFromAccount = jasmine
			.createSpy()
			.and.returnValue(DinozListFromAnAccount);
		await listAllDinozFromPlayer(req, res);
		expect(DinozDao.getAllDinozFromAccount).toHaveBeenCalledTimes(1);
		expect(DinozDao.getAllDinozFromAccount).toHaveBeenCalledWith(
			parseInt(req.params.id)
		);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith(DinozListFromAnAccount);
	});
});

describe('Function listAllPlayerInformationForAdminDashoard', function () {
	let req: Request;
	let res: Response;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;
		res = mockResponse;

		const result: Result<ValidationError> = new Result(
			{} as ErrorFormatter<ValidationError>,
			[]
		);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => true);

		req.params = {
			id: player.id_1.toString()
		};
	});

	it('Bad request', async function () {
		const result: Result<ValidationError> = new Result(
			{} as ErrorFormatter<ValidationError>,
			[]
		);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => false);

		await listAllPlayerInformationForAdminDashoard(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
	});

	it('Nominal case', async function () {
		PlayerAllData.setDataValue = jest.fn;
		PlayerDao.getAllInformationFromPlayer = jasmine
			.createSpy()
			.and.returnValue(PlayerAllData);
		await listAllPlayerInformationForAdminDashoard(req, res);
		expect(PlayerDao.getAllInformationFromPlayer).toHaveBeenCalledTimes(1);
		expect(PlayerDao.getAllInformationFromPlayer).toHaveBeenCalledWith(
			parseInt(req.params.id)
		);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith(PlayerAllData);
	});

	it("Player doesn't exist", async function () {
		PlayerDao.getAllInformationFromPlayer = jasmine
			.createSpy()
			.and.returnValue(null);

		await listAllPlayerInformationForAdminDashoard(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(
			`Player ${parseInt(req.params.id)} doesn't exist`
		);
	});
});

describe('Function editPlayer', function () {
	let req: Request;
	let res: Response;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;
		res = mockResponse;

		const result: Result<ValidationError> = new Result(
			{} as ErrorFormatter<ValidationError>,
			[]
		);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => true);

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

		PlayerDao.setHasImported = jasmine.createSpy();
		PlayerDao.editCustomText = jasmine.createSpy();
		PlayerDao.setQuetzuBought = jasmine.createSpy();
		PlayerDao.setLeader = jasmine.createSpy();
		PlayerDao.setEngineer = jasmine.createSpy();
		PlayerDao.setCooker = jasmine.createSpy();
		PlayerDao.setShopKeeper = jasmine.createSpy();
		PlayerDao.setMerchant = jasmine.createSpy();
		PlayerDao.setPriest = jasmine.createSpy();
		PlayerDao.setTeacher = jasmine.createSpy();
	});

	it('Bad request', async function () {
		const result: Result<ValidationError> = new Result(
			{} as ErrorFormatter<ValidationError>,
			[]
		);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => false);

		await editPlayer(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
	});

	it('Change HasImported', async function () {
		req.body.hasImported = true;
		await editPlayer(req, res);
		expect(PlayerDao.setHasImported).toHaveBeenCalledTimes(1);

		expect(PlayerDao.setHasImported).toHaveBeenCalledWith(
			parseInt(req.params.id),
			req.body.hasImported
		);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith();
	});

	it('editCustomText', async function () {
		req.body.customText = 'Nouveau custom text';
		await editPlayer(req, res);
		expect(PlayerDao.editCustomText).toHaveBeenCalledTimes(1);

		expect(PlayerDao.editCustomText).toHaveBeenLastCalledWith(
			parseInt(req.params.id),
			req.body.customText
		);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith();
	});

	it('Change quetzuBought', async function () {
		req.body.quetzuBought = 5;
		await editPlayer(req, res);
		expect(PlayerDao.setQuetzuBought).toHaveBeenCalledTimes(1);

		expect(PlayerDao.setQuetzuBought).toHaveBeenLastCalledWith(
			parseInt(req.params.id),
			req.body.quetzuBought
		);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith();
	});

	it('Change leader', async function () {
		req.body.leader = false;
		await editPlayer(req, res);
		expect(PlayerDao.setLeader).toHaveBeenCalledTimes(1);

		expect(PlayerDao.setLeader).toHaveBeenLastCalledWith(
			parseInt(req.params.id),
			req.body.leader
		);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith();
	});

	it('Change engineer', async function () {
		req.body.engineer = true;
		await editPlayer(req, res);
		expect(PlayerDao.setEngineer).toHaveBeenCalledTimes(1);

		expect(PlayerDao.setEngineer).toHaveBeenLastCalledWith(
			parseInt(req.params.id),
			req.body.engineer
		);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith();
	});

	it('Change cooker', async function () {
		req.body.cooker = false;
		await editPlayer(req, res);
		expect(PlayerDao.setCooker).toHaveBeenCalledTimes(1);

		expect(PlayerDao.setCooker).toHaveBeenLastCalledWith(
			parseInt(req.params.id),
			req.body.cooker
		);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith();
	});

	it('Change shopKeeper', async function () {
		req.body.shopKeeper = false;
		await editPlayer(req, res);
		expect(PlayerDao.setShopKeeper).toHaveBeenCalledTimes(1);

		expect(PlayerDao.setShopKeeper).toHaveBeenLastCalledWith(
			parseInt(req.params.id),
			req.body.shopKeeper
		);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith();
	});

	it('Change merchant', async function () {
		req.body.merchant = true;
		await editPlayer(req, res);
		expect(PlayerDao.setMerchant).toHaveBeenCalledTimes(1);

		expect(PlayerDao.setMerchant).toHaveBeenLastCalledWith(
			parseInt(req.params.id),
			req.body.merchant
		);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith();
	});

	it('Change priest', async function () {
		req.body.priest = false;
		await editPlayer(req, res);
		expect(PlayerDao.setPriest).toHaveBeenCalledTimes(1);

		expect(PlayerDao.setPriest).toHaveBeenLastCalledWith(
			parseInt(req.params.id),
			req.body.priest
		);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith();
	});

	it('Change teacher', async function () {
		req.body.teacher = false;
		await editPlayer(req, res);
		expect(PlayerDao.setTeacher).toHaveBeenCalledTimes(1);

		expect(PlayerDao.setTeacher).toHaveBeenLastCalledWith(
			parseInt(req.params.id),
			req.body.teacher
		);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith();
	});
});
