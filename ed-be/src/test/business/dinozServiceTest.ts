import {
	getDinozFiche,
	buyDinoz,
	setDinozName,
	getDinozSkill,
	setSkillState,
	betaMove
} from '../../business/dinozService.js';
import { raceList } from '../../constants';
import {
	player,
	dinozId,
	mockRequest,
	mockResponse,
	dinozName,
	skillId,
	skillId2,
	place1,
	place1Alias,
	defaultFight,
	inexistantPlace,
	notClosePlace
} from '../utils/constants.js';
import {
	BasicDinoz,
	DinozFiche,
	DinozToChangeName,
	DinozWithSkills,
	DinozWithSkillsAndStatus,
	DinozWithSkillsAndStatusReadyToMove
} from '../data/dinozData.js';
import { DinozFromShop } from '../data/dinozShopData.js';
import { AssDinozSkill, AssDinozStatus, Dinoz } from '../../models/index.js';
import { ErrorFormatter, Result, ValidationError, validationResult } from 'express-validator';
import { mocked } from 'ts-jest/utils';
import { Request, Response } from 'express';
import { cloneDeep } from 'lodash';
import { playerRanking } from '../data/rankingData.js';
import { getRandomNumber } from '../../utils/tools.js';

jest.mock('express-validator');

const DinozDao = require('../../dao/dinozDao.js');
const DinozShopDao = require('../../dao/shopDao.js');
const PlayerDao = require('../../dao/playerDao.js');
const AssDinozSkillDao = require('../../dao/assDinozSkillDao.js');
const RankingDao = require('../../dao/rankingDao.js');
const tools = require('../../utils/tools.js');

describe('Function getDinozFiche()', function () {
	let req: Request;
	let res: Response;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;
		res = mockResponse;

		req.params = {
			id: dinozId.toString()
		};

		// Mock express-validator
		const result: Result<ValidationError> = new Result({} as ErrorFormatter<ValidationError>, []);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => true);

		DinozFiche.setDataValue = jest.fn();

		DinozDao.getDinozFicheRequest = jasmine.createSpy().and.returnValue(DinozFiche);
	});

	it('Nominal case', async function () {
		await getDinozFiche(req, res);

		expect(DinozDao.getDinozFicheRequest).toHaveBeenCalledTimes(1);

		expect(DinozDao.getDinozFicheRequest).toHaveBeenCalledWith(dinozId);

		expect(res.status).toHaveBeenCalledWith(200);
	});

	it('Player different from the one who do the request', async function () {
		DinozFiche.playerId = player.id_2;

		await getDinozFiche(req, res);

		expect(DinozDao.getDinozFicheRequest).toHaveBeenCalledTimes(1);

		expect(DinozDao.getDinozFicheRequest).toHaveBeenCalledWith(dinozId);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(`Cannot get dinoz details, dinozId : ${dinozId} for player ${player.id_1}`);
	});

	it("Dinoz wanted doesn't exists", async function () {
		DinozDao.getDinozFicheRequest = jasmine.createSpy().and.returnValue(null);

		await getDinozFiche(req, res);

		expect(DinozDao.getDinozFicheRequest).toHaveBeenCalledTimes(1);

		expect(DinozDao.getDinozFicheRequest).toHaveBeenCalledWith(dinozId);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(`Dinoz ${dinozId} doesn't exists`);
	});

	it('Bad request', async function () {
		const result = new Result({} as ErrorFormatter<ValidationError>, []);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => false);

		await getDinozFiche(req, res);

		expect(DinozDao.getDinozFicheRequest).not.toHaveBeenCalled();

		expect(res.status).toHaveBeenCalledWith(400);
	});
});

describe('Function getDinozSkill()', function () {
	let req: Request;
	let res: Response;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;
		res = mockResponse;

		req.params = {
			id: dinozId.toString()
		};

		// Mock express-validator
		const result: Result<ValidationError> = new Result({} as ErrorFormatter<ValidationError>, []);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => true);

		DinozDao.getDinozSkillRequest = jasmine.createSpy().and.returnValue(DinozWithSkills);
	});

	it('Nominal case', async function () {
		await getDinozSkill(req, res);

		expect(DinozDao.getDinozSkillRequest).toHaveBeenCalledTimes(1);

		expect(DinozDao.getDinozSkillRequest).toHaveBeenCalledWith(dinozId);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ skillId: 11101 })]));
	});

	it("Dinoz wanted doesn't exists", async function () {
		DinozDao.getDinozSkillRequest = jasmine.createSpy().and.returnValue(null);

		await getDinozSkill(req, res);

		expect(DinozDao.getDinozSkillRequest).toHaveBeenCalledTimes(1);

		expect(DinozDao.getDinozSkillRequest).toHaveBeenCalledWith(dinozId);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(`Dinoz ${dinozId} doesn't exist`);
	});

	it('Player different from the one who do the request', async function () {
		DinozWithSkills.playerId = player.id_2;

		await getDinozSkill(req, res);

		expect(DinozDao.getDinozSkillRequest).toHaveBeenCalledTimes(1);

		expect(DinozDao.getDinozSkillRequest).toHaveBeenCalledWith(dinozId);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(`Dinoz ${dinozId} doesn't belong to player ${player.id_2}`);
	});

	it('Bad request', async function () {
		const result = new Result({} as ErrorFormatter<ValidationError>, []);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => false);

		await getDinozSkill(req, res);

		expect(DinozDao.getDinozSkillRequest).not.toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(400);
	});
});

describe('Test de la fonction buyDinoz()', function () {
	let req: Request;
	let res: Response;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;
		res = mockResponse;

		req.params = {
			id: dinozId.toString()
		};

		// Mock express-validator
		const result: Result<ValidationError> = new Result({} as ErrorFormatter<ValidationError>, []);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => true);

		DinozShopDao.getDinozDetailsRequest = jasmine.createSpy().and.returnValue(DinozFromShop);
		PlayerDao.setPlayerMoneyRequest = jasmine.createSpy();
		DinozShopDao.deleteDinozInShopRequest = jasmine.createSpy();
		AssDinozSkillDao.addSkillToDinoz = jasmine.createSpy();
		RankingDao.updatePoints = jasmine.createSpy();
		DinozDao.createDinozRequest = jasmine.createSpy().and.returnValue(BasicDinoz);

		Dinoz.build = jasmine.createSpy().and.returnValue({ get: jest.fn().mockResolvedValue(DinozFromShop) });
		Dinoz.create = jasmine.createSpy().and.returnValue({ get: jest.fn().mockResolvedValue(DinozFromShop) });
	});

	it('Cas nominal', async function () {
		const expectedMoney: number = DinozFromShop.player.money - raceList.WINKS.price;
		await buyDinoz(req, res);

		expect(DinozShopDao.getDinozDetailsRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledTimes(1);
		expect(DinozShopDao.deleteDinozInShopRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.createDinozRequest).toHaveBeenCalledTimes(1);
		expect(AssDinozSkillDao.addSkillToDinoz).toHaveBeenCalledTimes(1);
		expect(RankingDao.updatePoints).toHaveBeenCalledTimes(1);

		expect(DinozShopDao.getDinozDetailsRequest).toHaveBeenCalledWith(dinozId);
		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledWith(player.id_1, expectedMoney);
		expect(DinozShopDao.deleteDinozInShopRequest).toHaveBeenCalledWith(player.id_1);
		expect(DinozDao.createDinozRequest).toHaveBeenCalledWith(Promise.resolve(DinozFromShop));
		expect(AssDinozSkillDao.addSkillToDinoz).toHaveBeenLastCalledWith(dinozId, raceList.WINKS.skillId[0]);
		expect(RankingDao.updatePoints).toHaveBeenLastCalledWith(
			player.id_1,
			playerRanking.sumPoints + 1,
			(playerRanking.sumPoints + 1) / (playerRanking.dinozCount + 1),
			playerRanking.dinozCount + 1
		);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith(
			expect.objectContaining({
				dinozId: dinozId,
				display: '63cvi4d1fs',
				life: 100
			})
		);
	});

	it('Dinoz not found in database', async function () {
		DinozShopDao.getDinozDetailsRequest = jasmine.createSpy().and.returnValue(null);

		await buyDinoz(req, res);

		expect(DinozShopDao.getDinozDetailsRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.setPlayerMoneyRequest).not.toHaveBeenCalled();

		expect(DinozShopDao.getDinozDetailsRequest).toHaveBeenCalledWith(dinozId);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(`Dinoz ${dinozId} doesn't exist`);
	});

	it("Player doesn't have enough money to buy the dinoz", async function () {
		DinozFromShop.player.money = 0;

		await buyDinoz(req, res);

		DinozFromShop.player.money = 200000;

		expect(DinozShopDao.getDinozDetailsRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledTimes(0);

		expect(DinozShopDao.getDinozDetailsRequest).toHaveBeenCalledWith(dinozId);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(`You don't have enough money to buy dinoz ${dinozId}`);
	});

	it("Dinoz doesn't belong to player who made the request", async function () {
		DinozFromShop.player.playerId = player.id_2;

		await buyDinoz(req, res);

		expect(DinozShopDao.getDinozDetailsRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledTimes(0);

		expect(DinozShopDao.getDinozDetailsRequest).toHaveBeenCalledWith(dinozId);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(`Dinoz ${dinozId} doesn't belong to your account`);
	});

	it('Bad request', async function () {
		const result = new Result({} as ErrorFormatter<ValidationError>, []);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => false);

		await buyDinoz(req, res);

		expect(DinozShopDao.getDinozDetailsRequest).not.toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(400);
	});
});

describe('Function setDinozName()', function () {
	let req: Request;
	let res: Response;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;
		res = mockResponse;

		req.body = {
			newName: dinozName
		};

		const result: Result<ValidationError> = new Result({} as ErrorFormatter<ValidationError>, []);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => true);

		DinozDao.getCanDinozChangeName = jasmine.createSpy().and.returnValue(DinozToChangeName);
		DinozDao.setDinozNameRequest = jasmine.createSpy();

		Dinoz.build = jasmine.createSpy().and.returnValue({ dinozId: dinozId, name: dinozName });
	});

	it('Cas nominal', async function () {
		await setDinozName(req, res);

		expect(DinozDao.getCanDinozChangeName).toHaveBeenCalledTimes(1);
		expect(DinozDao.setDinozNameRequest).toHaveBeenCalledTimes(1);

		expect(DinozDao.getCanDinozChangeName).toHaveBeenLastCalledWith(dinozId);
		expect(DinozDao.setDinozNameRequest).toHaveBeenLastCalledWith(
			{
				dinozId: dinozId,
				name: dinozName
			},
			false
		);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith();
	});

	it("Dinoz doesn't belong to player who made the request", async function () {
		const dinozToChangeNamePlayer2: Dinoz = cloneDeep(DinozToChangeName);
		dinozToChangeNamePlayer2.player.playerId = player.id_2;

		DinozDao.getCanDinozChangeName = jasmine.createSpy().and.returnValue(dinozToChangeNamePlayer2);

		await setDinozName(req, res);

		expect(DinozDao.getCanDinozChangeName).toHaveBeenCalledTimes(1);
		expect(DinozDao.setDinozNameRequest).toHaveBeenCalledTimes(0);

		expect(DinozDao.getCanDinozChangeName).toHaveBeenLastCalledWith(dinozId);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(`Dinoz ${dinozId} doesn't belong to player ${player.id_1}`);
	});

	it('Dinoz name cannot be updated', async function () {
		DinozToChangeName.canChangeName = false;

		await setDinozName(req, res);

		expect(DinozDao.getCanDinozChangeName).toHaveBeenCalledTimes(1);
		expect(DinozDao.setDinozNameRequest).toHaveBeenCalledTimes(0);

		expect(DinozDao.getCanDinozChangeName).toHaveBeenLastCalledWith(dinozId);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(`Can't update dinoz name`);
	});

	it('Dinoz not found in database', async function () {
		DinozDao.getCanDinozChangeName = jasmine.createSpy().and.returnValue(null);

		await setDinozName(req, res);

		expect(DinozDao.getCanDinozChangeName).toHaveBeenCalledTimes(1);

		expect(DinozDao.getCanDinozChangeName).toHaveBeenCalledWith(dinozId);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(`Dinoz ${dinozId} doesn't exist`);
	});

	it('Bad request', async function () {
		const result: Result<ValidationError> = new Result({} as ErrorFormatter<ValidationError>, []);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => false);

		await setDinozName(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
	});
});

describe('Function setSkillState', function () {
	let req: Request;
	let res: Response;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;
		res = mockResponse;

		const result: Result<ValidationError> = new Result({} as ErrorFormatter<ValidationError>, []);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => true);

		req.params = {
			id: dinozId.toString()
		};
		req.body = {
			skillId: skillId2,
			skillState: true
		};

		DinozDao.getDinozSkillAndStatusRequest = jasmine.createSpy().and.returnValue(DinozWithSkillsAndStatus);
		DinozDao.setSkillStateRequest = jasmine.createSpy();
	});

	it('Nominal case', async function () {
		await setSkillState(req, res);

		expect(DinozDao.getDinozSkillAndStatusRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.setSkillStateRequest).toHaveBeenCalledTimes(1);

		expect(DinozDao.getDinozSkillAndStatusRequest).toHaveBeenCalledWith(dinozId);
		expect(DinozDao.setSkillStateRequest).toHaveBeenCalledWith(dinozId, skillId2, req.body.skillState);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith(false);
	});

	it("Dinoz doesn't exists", async function () {
		DinozDao.getDinozSkillAndStatusRequest = jasmine.createSpy().and.returnValue(null);

		await setSkillState(req, res);

		expect(DinozDao.getDinozSkillAndStatusRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.setSkillStateRequest).not.toHaveBeenCalled();

		expect(DinozDao.getDinozSkillAndStatusRequest).toHaveBeenCalledWith(dinozId);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(`Dinoz ${dinozId} doesn't exists`);
	});

	it("Dinoz doesn't belongs to player who do the request", async function () {
		const dinozWithNoAmulst = cloneDeep(DinozWithSkillsAndStatus);
		dinozWithNoAmulst.playerId = player.id_2;

		DinozDao.getDinozSkillAndStatusRequest = jasmine.createSpy().and.returnValue(dinozWithNoAmulst);

		await setSkillState(req, res);

		expect(DinozDao.getDinozSkillAndStatusRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.setSkillStateRequest).not.toHaveBeenCalled();

		expect(DinozDao.getDinozSkillAndStatusRequest).toHaveBeenCalledWith(dinozId);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(`Dinoz ${dinozId} doesn't belong to player ${player.id_1}`);
	});

	it("Dinoz doesn't have amulst", async function () {
		const dinozWithNoAmulst = cloneDeep(DinozWithSkillsAndStatus);
		dinozWithNoAmulst.status = [{ statusId: 1 }] as Array<AssDinozStatus>;

		DinozDao.getDinozSkillAndStatusRequest = jasmine.createSpy().and.returnValue(dinozWithNoAmulst);

		await setSkillState(req, res);

		expect(DinozDao.getDinozSkillAndStatusRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.setSkillStateRequest).not.toHaveBeenCalled();

		expect(DinozDao.getDinozSkillAndStatusRequest).toHaveBeenCalledWith(dinozId);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(`Dinoz ${dinozId} doesn't have the good status`);
	});

	it("Dinoz doesn't know the skill", async function () {
		const dinozWithNotGoodSkill = cloneDeep(DinozWithSkillsAndStatus);
		dinozWithNotGoodSkill.skill = [{ skillId: skillId }] as Array<AssDinozSkill>;

		DinozDao.getDinozSkillAndStatusRequest = jasmine.createSpy().and.returnValue(dinozWithNotGoodSkill);

		await setSkillState(req, res);

		expect(DinozDao.getDinozSkillAndStatusRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.setSkillStateRequest).not.toHaveBeenCalled();

		expect(DinozDao.getDinozSkillAndStatusRequest).toHaveBeenCalledWith(dinozId);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(`Dinoz ${dinozId} doesn't know skill : ${skillId2}`);
	});

	it("Skill ins't activatable", async function () {
		req.body.skillId = skillId;
		const dinozWithNotGoodSkill = cloneDeep(DinozWithSkillsAndStatus);
		dinozWithNotGoodSkill.skill = [{ skillId: skillId }] as Array<AssDinozSkill>;

		DinozDao.getDinozSkillAndStatusRequest = jasmine.createSpy().and.returnValue(dinozWithNotGoodSkill);

		await setSkillState(req, res);

		expect(DinozDao.getDinozSkillAndStatusRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.setSkillStateRequest).not.toHaveBeenCalled();

		expect(DinozDao.getDinozSkillAndStatusRequest).toHaveBeenCalledWith(dinozId);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(`Skill ${skillId} cannot be activated`);
	});

	it('Bad request', async function () {
		const result: Result<ValidationError> = new Result({} as ErrorFormatter<ValidationError>, []);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => false);

		await setSkillState(req, res);

		expect(DinozDao.getDinozSkillAndStatusRequest).not.toHaveBeenCalled();

		expect(res.status).toHaveBeenCalledWith(400);
	});
});

describe('Function betaMove', function () {
	let req: Request;
	let res: Response;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;
		res = mockResponse;

		const result: Result<ValidationError> = new Result({} as ErrorFormatter<ValidationError>, []);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => true);

		req.params = {
			id: dinozId.toString()
		};
		req.body = {
			placeId: place1
		};

		DinozDao.getDinozPlaceRequest = jasmine.createSpy().and.returnValue(DinozWithSkillsAndStatusReadyToMove);
		DinozDao.getDinozSkillAndStatusRequest = jasmine.createSpy().and.returnValue(DinozWithSkillsAndStatusReadyToMove);
		DinozDao.setDinozPlaceRequest = jasmine.createSpy();
		DinozDao.getDinozFicheRequest = jasmine.createSpy().and.returnValue(DinozWithSkillsAndStatusReadyToMove);
		PlayerDao.addPlayerMoney = jasmine.createSpy();
		DinozDao.addExperience = jasmine.createSpy();
		jest.spyOn(tools, 'getRandomNumber').mockReturnValue(999);
	});

	it('Nominal case', async function () {
		await betaMove(req, res);

		expect(DinozDao.getDinozPlaceRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozSkillAndStatusRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.setDinozPlaceRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozFicheRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.addPlayerMoney).toHaveBeenCalledTimes(1);
		expect(DinozDao.addExperience).toHaveBeenCalledTimes(1);

		expect(DinozDao.getDinozPlaceRequest).toHaveBeenCalledWith(dinozId);
		expect(DinozDao.getDinozSkillAndStatusRequest).toHaveBeenCalledWith(dinozId);
		expect(DinozDao.setDinozPlaceRequest).toHaveBeenCalledWith(dinozId, place1Alias);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith(defaultFight);
	});

	it("Dinoz doesn't exists", async function () {
		DinozDao.getDinozPlaceRequest = jasmine.createSpy().and.returnValue(null);

		await betaMove(req, res);

		expect(DinozDao.getDinozPlaceRequest).toHaveBeenCalledTimes(1);

		expect(DinozDao.getDinozPlaceRequest).toHaveBeenCalledWith(dinozId);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(`Dinoz ${dinozId} doesn't exists`);
	});

	it("Dinoz doesn't belongs to player who do the request", async function () {
		const dinozWithNoBouee = cloneDeep(DinozWithSkillsAndStatusReadyToMove);
		dinozWithNoBouee.playerId = player.id_2;

		DinozDao.getDinozPlaceRequest = jasmine.createSpy().and.returnValue(dinozWithNoBouee);

		await betaMove(req, res);

		expect(DinozDao.getDinozPlaceRequest).toHaveBeenCalledTimes(1);

		expect(DinozDao.getDinozPlaceRequest).toHaveBeenCalledWith(dinozId);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(`Dinoz ${dinozId} doesn't belong to player ${player.id_1}`);
	});

	it('Dinoz want to go to an inexistant place', async function () {
		req.body = {
			placeId: inexistantPlace
		};

		await betaMove(req, res);

		expect(DinozDao.getDinozPlaceRequest).toHaveBeenCalledTimes(1);

		expect(DinozDao.getDinozPlaceRequest).toHaveBeenCalledWith(dinozId);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(`Dinoz ${dinozId} want to go in the void`);
	});

	it('Dinoz is already at this place', async function () {
		req.body = {
			placeId: 1
		};

		await betaMove(req, res);

		expect(DinozDao.getDinozPlaceRequest).toHaveBeenCalledTimes(1);

		expect(DinozDao.getDinozPlaceRequest).toHaveBeenCalledWith(dinozId);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(`Dinoz ${dinozId} is already at port`);
	});

	it('Dinoz want to go to a non adjascent place', async function () {
		req.body = {
			placeId: notClosePlace
		};

		await betaMove(req, res);

		expect(DinozDao.getDinozPlaceRequest).toHaveBeenCalledTimes(1);

		expect(DinozDao.getDinozPlaceRequest).toHaveBeenCalledWith(dinozId);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(`port is not adjascent with ilac2`);
	});

	it("Dinoz doesn't fullfill requirement to go this place", async function () {
		const dinozWithNoBouee = cloneDeep(DinozWithSkillsAndStatusReadyToMove);
		dinozWithNoBouee.status = [{ statusId: 1 }] as Array<AssDinozStatus>;

		DinozDao.getDinozPlaceRequest = jasmine.createSpy().and.returnValue(dinozWithNoBouee);

		DinozDao.getDinozSkillAndStatusRequest = jasmine.createSpy().and.returnValue(dinozWithNoBouee);

		await betaMove(req, res);

		expect(DinozDao.getDinozPlaceRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozSkillAndStatusRequest).toHaveBeenCalledTimes(1);

		expect(DinozDao.getDinozPlaceRequest).toHaveBeenCalledWith(dinozId);
		expect(DinozDao.getDinozSkillAndStatusRequest).toHaveBeenCalledWith(dinozId);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(`Dinoz ${dinozId} doesn't fullfill requirement to go this place`);
	});

	it('Bad request', async function () {
		const result: Result<ValidationError> = new Result({} as ErrorFormatter<ValidationError>, []);
		mocked(validationResult).mockImplementation(() => result);
		mocked(result.isEmpty).mockImplementation(() => false);

		await betaMove(req, res);

		expect(DinozDao.getDinozSkillAndStatusRequest).not.toHaveBeenCalled();

		expect(res.status).toHaveBeenCalledWith(400);
	});
});
