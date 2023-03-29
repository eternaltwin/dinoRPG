import { Request } from 'express';
import { cloneDeep } from 'lodash';
import {
	getDinozFiche,
	buyDinoz,
	setDinozName,
	getDinozSkill,
	setSkillState,
	betaMove,
	resurrectDinoz
} from '../../business/dinozService.js';
import { actionList, itemList, placeList, raceList, shopList, skillList, statusList } from '../../constants/index.js';
import { ActionFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { DinozSkillFiche } from '@drpg/core/models/dinoz/DinozSkillFiche';
import { FightResult } from '@drpg/core/models/fight/FightResult';
import { ShopType } from '@drpg/core/models/enums/ShopType';
import { DinozSkill, DinozStatus, Dinoz, Player, PlayerItem } from '../../entity/index.js';
import {
	player,
	dinozId,
	mockRequest,
	dinozName,
	skillId,
	skillId2,
	place1,
	place1Alias,
	inexistantPlace,
	notClosePlace
} from '../utils/constants.js';
import {
	BasicDinoz,
	DinozDead,
	DinozFicheData,
	DinozFicheDataWithMission,
	DinozFightData,
	DinozToChangeName,
	DinozWithSkills,
	DinozWithSkillsAndStatus,
	DinozWithSkillsAndStatusReadyToMove,
	multipleDinoz
} from '../data/dinozData.js';
import { PlayerData } from '../data/playerData.js';
import { DinozFromShop } from '../data/dinozShopData.js';
import { playerRanking } from '../data/rankingData.js';

const DinozDao = require('../../dao/dinozDao.js');
const DinozSkillDao = require('../../dao/dinozSkillDao.js');
const fight = require('../../business/fightService.js');
const PlayerDao = require('../../dao/playerDao.js');
const DinozShopDao = require('../../dao/playerDinozShopDao.js');
const RankingDao = require('../../dao/rankingDao.js');
const tools = require('../../utils/tools.js');
const dinozHelper = require('../../utils/helpers/DinozHelper.js');
let DinozTestData: Dinoz;
let PlayerTestData: Player;

describe('Function getDinozFiche()', function () {
	let req: Request;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;

		req.params = {
			id: dinozId.toString()
		};

		DinozTestData = cloneDeep(DinozFicheData);
		PlayerTestData = cloneDeep(PlayerData);

		DinozDao.getDinozFicheRequest = jasmine.createSpy().and.returnValue(DinozTestData);
	});

	it('Nominal case', async function () {
		try {
			await getDinozFiche(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		expect(DinozDao.getDinozFicheRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozFicheRequest).toHaveBeenCalledWith(dinozId);
	});

	it('Dinoz with a mission ongoing', async function () {
		DinozDao.getDinozFicheRequest = jasmine.createSpy().and.returnValue(DinozFicheDataWithMission);
		try {
			await getDinozFiche(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		expect(DinozDao.getDinozFicheRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozFicheRequest).toHaveBeenCalledWith(DinozFicheDataWithMission.id);
	});

	it.each(Object.values(shopList))('Nominal case - test all shops action: Shop %#', async shopToTest => {
		// Update dinoz location and status as necessary depending on the shop
		DinozTestData.placeId = shopToTest.placeId;
		if (shopToTest.type === ShopType.CURSED) {
			DinozTestData.status.push({
				statusId: statusList.CURSED
			} as DinozStatus);
		}

		if (shopToTest.type === ShopType.MAGICAL) {
			DinozTestData.player.items.push({
				itemId: itemList.GOLDEN_NAPODINO.itemId,
				quantity: 1
			} as PlayerItem);
		}

		// Override this as necessary if you change DinozTestData
		DinozDao.getDinozFicheRequest = jasmine.createSpy().and.returnValue(DinozTestData);

		try {
			await getDinozFiche(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		// Build expected actions
		const availableActions: Array<ActionFiche> = [];

		// Default actions
		availableActions.push(actionList.FIGHT);
		availableActions.push(actionList.FOLLOW);
		// Shop action
		availableActions.push({
			name: actionList.SHOP.name,
			imgName: actionList.SHOP.imgName,
			prop: shopToTest.shopId
		});
		availableActions.push({
			name: actionList.LEVEL_UP.name,
			imgName: actionList.LEVEL_UP.imgName
		});

		expect(DinozDao.getDinozFicheRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozFicheRequest).toHaveBeenCalledWith(dinozId);

		// expect(DinozTestData.setDataValue).toHaveBeenNthCalledWith(7, 'actions', availableActions);
	});

	it('Nominal case - dinoz is dead', async function () {
		DinozTestData.life = 0;

		// Override this as necessary if you change DinozTestData
		DinozDao.getDinozFicheRequest = jasmine.createSpy().and.returnValue(DinozTestData);

		try {
			await getDinozFiche(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		// Build expected actions
		const availableActions: Array<ActionFiche> = [];

		// Default actions
		availableActions.push(actionList.RESURRECT);

		expect(DinozDao.getDinozFicheRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozFicheRequest).toHaveBeenCalledWith(dinozId);

		// expect(DinozTestData.setDataValue).toHaveBeenNthCalledWith(7, 'actions', availableActions);
	});

	it('Player different from the one who does the request', async function () {
		PlayerTestData.id = player.id_2;
		DinozTestData.player = PlayerTestData;

		// Override this as necessary if you change DinozTestData
		DinozDao.getDinozFicheRequest = jasmine.createSpy().and.returnValue(DinozTestData);

		try {
			await getDinozFiche(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(
				`Cannot get dinoz details, dinozId : ${dinozId} belongs to player ${player.id_2} instead of player ${player.id_1}`
			);
		}

		expect(DinozDao.getDinozFicheRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozFicheRequest).toHaveBeenCalledWith(dinozId);
	});

	// No need to test that the DAO can return a null dinoz. It will throw an error if no dinoz is found.

	// Bad requests are handled in routes
});

describe('Function getDinozSkill()', function () {
	let req: Request;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;

		req.params = {
			id: dinozId.toString()
		};

		DinozDao.getDinozSkillRequest = jasmine.createSpy().and.returnValue(DinozWithSkills);
	});

	it('Nominal case', async function () {
		let dinozSkillResult: Array<DinozSkillFiche> = [];
		try {
			dinozSkillResult = await getDinozSkill(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		expect(DinozDao.getDinozSkillRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozSkillRequest).toHaveBeenCalledWith(dinozId);

		expect(dinozSkillResult).toStrictEqual(expect.arrayContaining([expect.objectContaining({ skillId: 11101 })]));
	});

	// No need to test that the DAO can return a null dinoz. It will throw an error if no dinoz is found.

	it('Player different from the one who do the request', async function () {
		DinozWithSkills.player.id = player.id_2;

		try {
			await getDinozSkill(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`Dinoz ${dinozId} doesn't belong to player ${player.id_2}`);
		}

		expect(DinozDao.getDinozSkillRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozSkillRequest).toHaveBeenCalledWith(dinozId);
	});

	// Bad requests are handled in routes
});

describe('Test de la fonction buyDinoz()', function () {
	let req: Request;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;

		req.params = {
			id: dinozId.toString()
		};

		DinozShopDao.getDinozShopDetailsRequest = jasmine.createSpy().and.returnValue(DinozFromShop);
		PlayerDao.setPlayerMoneyRequest = jasmine.createSpy();
		DinozShopDao.deleteDinozInShopRequest = jasmine.createSpy();
		DinozSkillDao.addSkillToDinoz = jasmine.createSpy();
		RankingDao.updatePoints = jasmine.createSpy();
		DinozDao.setDinoz = jasmine.createSpy().and.returnValue(BasicDinoz);
		DinozDao.getActiveDinoz = jasmine.createSpy().and.returnValue(multipleDinoz);
		dinozHelper.getRandomUpElement = jasmine.createSpy().and.returnValue(3);
	});

	it('Cas nominal', async function () {
		const expectedMoney: number = DinozFromShop.player.money - raceList.WINKS.price;

		const expectedDinoz: Partial<Dinoz> = {
			name: '?',
			isFrozen: false,
			isSacrificed: false,
			raceId: DinozFromShop.raceId,
			level: 1,
			player: DinozFromShop.player,
			placeId: placeList.DINOVILLE.placeId,
			display: DinozFromShop.display,
			life: 100,
			maxLife: 100,
			experience: 0,
			canChangeName: true,
			canGather: false,
			nbrUpFire: raceList.WINKS.nbrFire,
			nbrUpWood: raceList.WINKS.nbrWood,
			nbrUpWater: raceList.WINKS.nbrWater,
			nbrUpLightning: raceList.WINKS.nbrLightning,
			nbrUpAir: raceList.WINKS.nbrAir,
			nextUpElementId: 3,
			nextUpAltElementId: 3
		};

		const tempDinoz: Dinoz = (expectedDinoz as unknown) as Dinoz;

		const expectedDinozFiche: DinozFiche = {
			id: expectedDinoz.id,
			display: expectedDinoz.display,
			experience: expectedDinoz.experience,
			following: undefined,
			life: expectedDinoz.life,
			maxLife: expectedDinoz.maxLife,
			name: expectedDinoz.name,
			placeId: expectedDinoz.placeId,
			level: expectedDinoz.level
		};

		let dinozFicheResult: DinozFiche = {};

		DinozDao.setDinoz = jasmine.createSpy().and.returnValue(tempDinoz);

		try {
			dinozFicheResult = await buyDinoz(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		expect(DinozShopDao.getDinozShopDetailsRequest).toHaveBeenCalledTimes(1);
		expect(DinozShopDao.getDinozShopDetailsRequest).toHaveBeenCalledWith(dinozId);

		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledWith(player.id_1, expectedMoney);

		expect(DinozShopDao.deleteDinozInShopRequest).toHaveBeenCalledTimes(1);
		expect(DinozShopDao.deleteDinozInShopRequest).toHaveBeenCalledWith(player.id_1);

		expect(DinozDao.setDinoz).toHaveBeenCalledTimes(1);
		expect(DinozDao.setDinoz).toHaveBeenCalledWith(expectedDinoz);

		expect(DinozSkillDao.addSkillToDinoz).toHaveBeenCalledTimes(1);
		expect(DinozSkillDao.addSkillToDinoz).toHaveBeenLastCalledWith(new DinozSkill(tempDinoz, skillList.COQUE.skillId));

		expect(RankingDao.updatePoints).toHaveBeenCalledTimes(1);
		expect(RankingDao.updatePoints).toHaveBeenLastCalledWith(
			player.id_1,
			playerRanking.sumPoints + 1,
			(playerRanking.sumPoints + 1) / (playerRanking.dinozCount + 1),
			playerRanking.dinozCount + 1
		);

		expect(dinozFicheResult).toStrictEqual(expectedDinozFiche);
	});

	// No need to test that the DAO can return a null dinoz. It will throw an error if no dinoz is found.
	it('Player already had enought active dinoz without leader', async function () {
		const tooMuchDinoz = cloneDeep(multipleDinoz);
		multipleDinoz[0].player.leader = false;
		tooMuchDinoz.length = 18;

		DinozDao.getActiveDinoz = jasmine.createSpy().and.returnValue(tooMuchDinoz);

		try {
			await buyDinoz(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`tooManyActiveDinoz`);
		}

		DinozFromShop.player.money = 200000;

		expect(DinozShopDao.getDinozShopDetailsRequest).toHaveBeenCalledTimes(0);

		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledTimes(0);
	});

	it('Player already had enought active dinoz with leader', async function () {
		const tooMuchDinozLeader = cloneDeep(multipleDinoz);
		tooMuchDinozLeader.length = 21;

		DinozDao.getActiveDinoz = jasmine.createSpy().and.returnValue(tooMuchDinozLeader);

		try {
			await buyDinoz(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`tooManyActiveDinoz`);
		}

		DinozFromShop.player.money = 200000;

		expect(DinozShopDao.getDinozShopDetailsRequest).toHaveBeenCalledTimes(0);

		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledTimes(0);
	});

	it("Player doesn't have enough money to buy the dinoz", async function () {
		DinozFromShop.player.money = 0;

		try {
			await buyDinoz(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`notEnoughMoney`);
		}

		DinozFromShop.player.money = 200000;

		expect(DinozShopDao.getDinozShopDetailsRequest).toHaveBeenCalledTimes(1);
		expect(DinozShopDao.getDinozShopDetailsRequest).toHaveBeenCalledWith(dinozId);

		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledTimes(0);
	});

	it("Dinoz doesn't belong to player who made the request", async function () {
		DinozFromShop.player.id = player.id_2;

		try {
			await buyDinoz(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`Dinoz ${dinozId} doesn't belong to your account`);
		}

		expect(DinozShopDao.getDinozShopDetailsRequest).toHaveBeenCalledTimes(1);
		expect(DinozShopDao.getDinozShopDetailsRequest).toHaveBeenCalledWith(dinozId);
		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledTimes(0);
	});

	// Bad requests are handled in routes
});

describe('Function setDinozName()', function () {
	let req: Request;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;

		req.body = {
			newName: dinozName
		};

		DinozDao.getCanDinozChangeName = jasmine.createSpy().and.returnValue(DinozToChangeName);
		DinozDao.setDinoz = jasmine.createSpy();
	});

	it('Cas nominal', async function () {
		try {
			await setDinozName(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		expect(DinozDao.getCanDinozChangeName).toHaveBeenCalledTimes(1);
		expect(DinozDao.getCanDinozChangeName).toHaveBeenLastCalledWith(dinozId);

		expect(DinozDao.setDinoz).toHaveBeenCalledTimes(1);
		expect(DinozDao.setDinoz).toHaveBeenLastCalledWith({
			id: dinozId,
			name: dinozName,
			canChangeName: false
		});
	});

	it("Dinoz doesn't belong to player who made the request", async function () {
		const dinozToChangeNamePlayer2: Dinoz = cloneDeep(DinozToChangeName);
		dinozToChangeNamePlayer2.player.id = player.id_2;

		DinozDao.getCanDinozChangeName = jasmine.createSpy().and.returnValue(dinozToChangeNamePlayer2);

		try {
			await setDinozName(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`Dinoz ${dinozId} doesn't belong to player ${player.id_1}`);
		}

		expect(DinozDao.getCanDinozChangeName).toHaveBeenCalledTimes(1);
		expect(DinozDao.setDinoz).toHaveBeenCalledTimes(0);

		expect(DinozDao.getCanDinozChangeName).toHaveBeenLastCalledWith(dinozId);
	});

	it('Dinoz name cannot be updated', async function () {
		DinozToChangeName.canChangeName = false;

		try {
			await setDinozName(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`Can't update dinoz name`);
		}

		expect(DinozDao.getCanDinozChangeName).toHaveBeenCalledTimes(1);
		expect(DinozDao.getCanDinozChangeName).toHaveBeenLastCalledWith(dinozId);

		expect(DinozDao.setDinoz).toHaveBeenCalledTimes(0);
	});

	// No need to test that the DAO can return a null dinoz. It will throw an error if no dinoz is found.

	// Bad requests are handled in routes
});

describe('Function setSkillState', function () {
	let req: Request;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;

		req.params = {
			id: dinozId.toString()
		};
		req.body = {
			skillId: skillId2,
			skillState: true
		};

		DinozDao.getDinozSkillAndStatusRequest = jasmine.createSpy().and.returnValue(DinozWithSkillsAndStatus);
		DinozSkillDao.setSkillStateRequest = jasmine.createSpy();
	});

	it('Nominal case', async function () {
		try {
			await setSkillState(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		expect(DinozDao.getDinozSkillAndStatusRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozSkillAndStatusRequest).toHaveBeenCalledWith(dinozId);

		expect(DinozSkillDao.setSkillStateRequest).toHaveBeenCalledTimes(1);
		expect(DinozSkillDao.setSkillStateRequest).toHaveBeenCalledWith(dinozId, skillId2, req.body.skillState);
	});

	// No need to test that the DAO can return a null dinoz. It will throw an error if no dinoz is found.

	it("Dinoz doesn't belongs to player who do the request", async function () {
		const dinozWithNoAmulst = cloneDeep(DinozWithSkillsAndStatus);
		dinozWithNoAmulst.player.id = player.id_2;

		DinozDao.getDinozSkillAndStatusRequest = jasmine.createSpy().and.returnValue(dinozWithNoAmulst);

		try {
			await setSkillState(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`Dinoz ${dinozId} doesn't belong to player ${player.id_1}`);
		}

		expect(DinozDao.getDinozSkillAndStatusRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozSkillAndStatusRequest).toHaveBeenCalledWith(dinozId);

		expect(DinozSkillDao.setSkillStateRequest).not.toHaveBeenCalled();
	});

	it("Dinoz doesn't have amulst", async function () {
		const dinozWithNoAmulst = cloneDeep(DinozWithSkillsAndStatus);
		dinozWithNoAmulst.status = [{ statusId: 1 }] as Array<DinozStatus>;

		DinozDao.getDinozSkillAndStatusRequest = jasmine.createSpy().and.returnValue(dinozWithNoAmulst);

		try {
			await setSkillState(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`Dinoz ${dinozId} doesn't have the right status`);
		}

		expect(DinozDao.getDinozSkillAndStatusRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozSkillAndStatusRequest).toHaveBeenCalledWith(dinozId);

		expect(DinozSkillDao.setSkillStateRequest).not.toHaveBeenCalled();
	});

	it("Dinoz doesn't know the skill", async function () {
		const dinozWithNotGoodSkill = cloneDeep(DinozWithSkillsAndStatus);
		dinozWithNotGoodSkill.skills = [{ skillId: skillId }] as Array<DinozSkill>;

		DinozDao.getDinozSkillAndStatusRequest = jasmine.createSpy().and.returnValue(dinozWithNotGoodSkill);

		try {
			await setSkillState(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`Dinoz ${dinozId} doesn't know skill : ${skillId2}`);
		}

		expect(DinozDao.getDinozSkillAndStatusRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozSkillAndStatusRequest).toHaveBeenCalledWith(dinozId);

		expect(DinozSkillDao.setSkillStateRequest).not.toHaveBeenCalled();
	});

	it("Skill ins't activatable", async function () {
		req.body.skillId = skillId;
		const dinozWithNotGoodSkill = cloneDeep(DinozWithSkillsAndStatus);
		dinozWithNotGoodSkill.skills = [{ skillId: skillId }] as Array<DinozSkill>;

		DinozDao.getDinozSkillAndStatusRequest = jasmine.createSpy().and.returnValue(dinozWithNotGoodSkill);

		try {
			await setSkillState(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`Skill ${skillId} cannot be activated`);
		}

		expect(DinozDao.getDinozSkillAndStatusRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozSkillAndStatusRequest).toHaveBeenCalledWith(dinozId);

		expect(DinozSkillDao.setSkillStateRequest).not.toHaveBeenCalled();
	});

	// Bad requests are handled in routes
});

describe('Function betaMove', function () {
	let req: Request;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;

		req.body = {
			placeId: place1,
			dinozId: DinozFightData.id
		};

		let FightResult: FightResult = {
			opponent: 'goupignon',
			goldEarned: 100,
			xpEarned: 20,
			hpLost: 10,
			result: true,
			dinozId: DinozFightData.id
		};

		DinozDao.getDinozFightDataRequest = jasmine.createSpy().and.returnValue(DinozFightData);
		DinozDao.setDinozPlaceRequest = jasmine.createSpy();
		fight.moveFight = jasmine.createSpy().and.returnValue(FightResult);
		jest.spyOn(tools, 'getRandomNumber').mockReturnValue(999);
	});

	it('Nominal case', async function () {
		req.body.placeId = 10;

		try {
			await betaMove(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		expect(DinozDao.getDinozFightDataRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozFightDataRequest).toHaveBeenCalledWith(DinozFightData.id);

		expect(fight.moveFight).toHaveBeenCalledTimes(1);
		expect(fight.moveFight).toHaveBeenCalledWith(DinozFightData, place1Alias);

		expect(DinozDao.setDinozPlaceRequest).toHaveBeenCalledWith(DinozFightData.id, place1Alias);
		expect(DinozDao.setDinozPlaceRequest).toHaveBeenCalledTimes(1);

		//expect(res.send).toHaveBeenCalledWith(defaultFight);
	});

	it('Dinoz doesnt leave the actual map', async function () {
		req.body.placeId = 7;
		try {
			await betaMove(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		expect(DinozDao.getDinozFightDataRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozFightDataRequest).toHaveBeenCalledWith(DinozFightData.id);

		expect(fight.moveFight).toHaveBeenCalledTimes(1);
		expect(fight.moveFight).toHaveBeenCalledWith(DinozFightData, 7);

		expect(DinozDao.setDinozPlaceRequest).toHaveBeenCalledWith(DinozFightData.id, 7);
		expect(DinozDao.setDinozPlaceRequest).toHaveBeenCalledTimes(1);

		//expect(res.send).toHaveBeenCalledWith(defaultFight);
	});

	// No need to test that the DAO can return a null dinoz. It will throw an error if no dinoz is found.

	it("Dinoz doesn't belongs to player who do the request", async function () {
		const dinozWithNoBouee = cloneDeep(DinozWithSkillsAndStatusReadyToMove);
		dinozWithNoBouee.player.id = player.id_2;

		DinozDao.getDinozFightDataRequest = jasmine.createSpy().and.returnValue(dinozWithNoBouee);

		try {
			await betaMove(req);
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`Dinoz ${dinozId} doesn't belong to player ${player.id_1}`);
		}

		expect(DinozDao.getDinozFightDataRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozFightDataRequest).toHaveBeenCalledWith(DinozFightData.id);

		expect(fight.moveFight).toHaveBeenCalledTimes(0);

		expect(DinozDao.setDinozPlaceRequest).toHaveBeenCalledTimes(0);
	});

	it('Dinoz want to go to an inexistant place', async function () {
		req.body.placeId = inexistantPlace;
		try {
			await betaMove(req);
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`Dinoz ${dinozId} want to go in the void`);
		}

		expect(DinozDao.getDinozFightDataRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozFightDataRequest).toHaveBeenCalledWith(DinozFightData.id);

		expect(fight.moveFight).toHaveBeenCalledTimes(0);

		expect(DinozDao.setDinozPlaceRequest).toHaveBeenCalledTimes(0);
	});

	it('Dinoz is already at this place', async function () {
		req.body.placeId = 1;

		try {
			await betaMove(req);
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`Dinoz ${dinozId} is already at port`);
		}

		expect(DinozDao.getDinozFightDataRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozFightDataRequest).toHaveBeenCalledWith(DinozFightData.id);

		expect(fight.moveFight).toHaveBeenCalledTimes(0);

		expect(DinozDao.setDinozPlaceRequest).toHaveBeenCalledTimes(0);
	});

	it('Dinoz want to go to a non adjascent place', async function () {
		req.body.placeId = notClosePlace;

		try {
			await betaMove(req);
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`port is not adjacent with ilac2`);
		}

		expect(DinozDao.getDinozFightDataRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozFightDataRequest).toHaveBeenCalledWith(DinozFightData.id);

		expect(fight.moveFight).toHaveBeenCalledTimes(0);

		expect(DinozDao.setDinozPlaceRequest).toHaveBeenCalledTimes(0);
	});

	it("Dinoz doesn't fulfill requirement to go this place", async function () {
		const dinozWithNoBouee = cloneDeep(DinozWithSkillsAndStatusReadyToMove);
		dinozWithNoBouee.status = [{ statusId: 1 }] as Array<DinozStatus>;

		DinozDao.getDinozFightDataRequest = jasmine.createSpy().and.returnValue(dinozWithNoBouee);

		try {
			await betaMove(req);
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`Dinoz ${dinozId} doesn't fulfill requirement to go this place`);
		}

		expect(DinozDao.getDinozFightDataRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozFightDataRequest).toHaveBeenCalledWith(DinozFightData.id);

		expect(fight.moveFight).toHaveBeenCalledTimes(0);

		expect(DinozDao.setDinozPlaceRequest).toHaveBeenCalledTimes(0);
	});

	// Bad requests are handled in routes
});

describe('Function resurrectDinoz', function () {
	let req: Request;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;

		req.params = {
			id: dinozId.toString()
		};

		DinozDao.getDinozFicheLiteRequest = jasmine.createSpy().and.returnValue(DinozDead);
		DinozDao.setDinoz = jasmine.createSpy();
	});

	it('Nominal case', async function () {
		try {
			await resurrectDinoz(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		const dinozResurrected = {
			id: DinozDead.id,
			life: 1,
			experience: Math.round(DinozDead.experience / 2),
			placeId: placeList.DINOVILLE.placeId
		} as Dinoz;

		expect(DinozDao.getDinozFicheLiteRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozFicheLiteRequest).toHaveBeenCalledWith(dinozId);

		expect(DinozDao.setDinoz).toHaveBeenCalledTimes(1);
		expect(DinozDao.setDinoz).toHaveBeenCalledWith(dinozResurrected);
	});

	// No need to test that the DAO can return a null dinoz. It will throw an error if no dinoz is found.

	it("Dinoz doesn't belongs to player who do the request", async function () {
		const dinozNotPlayer = cloneDeep(DinozDead);
		dinozNotPlayer.player.id = player.id_2;

		DinozDao.getDinozFicheLiteRequest = jasmine.createSpy().and.returnValue(dinozNotPlayer);

		try {
			await resurrectDinoz(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`Dinoz ${dinozId} doesn't belong to player.`);
		}

		expect(DinozDao.getDinozFicheLiteRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozFicheLiteRequest).toHaveBeenCalledWith(dinozId);
		expect(DinozDao.setDinoz).toHaveBeenCalledTimes(0);
	});

	it('Dinoz is not dead', async function () {
		const dinozNotDead = cloneDeep(DinozDead);
		dinozNotDead.life = 10;

		DinozDao.getDinozFicheLiteRequest = jasmine.createSpy().and.returnValue(dinozNotDead);

		try {
			await resurrectDinoz(req);
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`${dinozNotDead.name} is not dead`);
		}

		expect(DinozDao.getDinozFicheLiteRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozFicheLiteRequest).toHaveBeenCalledWith(dinozId);

		expect(DinozDao.setDinoz).toHaveBeenCalledTimes(0);
	});
});
