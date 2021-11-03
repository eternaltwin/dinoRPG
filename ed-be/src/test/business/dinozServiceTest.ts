import {
	getDinozFiche,
	buyDinoz,
	setDinozName
} from '../../business/dinozService.js';
import { Request, Response } from 'express';
import { player, dinozId } from '../utils/constants.js';
import { BasicDinoz } from '../data/dinozData.js';
import { DinozFromShop } from '../data/dinozShopData.js';
import { Dinoz } from '../../models/index.js';

const DinozDao = require('../../dao/dinozDao.js');
const DinozShopDao = require('../../dao/shopDao.js');
const PlayerDao = require('../../dao/playerDao.js');
const assDinozSkillDao = require('../../dao/assDinozSkillDao.js');

let req = {
	user: {
		playerId: player.id_1
	}
} as Request;
let res = ({
	status: jest.fn().mockReturnThis(),
	send: jest.fn().mockReturnThis()
} as unknown) as Response;

describe('Test de la fonction getDinozFiche()', function () {
	beforeEach(function () {
		req.params = {
			id: dinozId.toString()
		};

		BasicDinoz.setDataValue = jest.fn().mockResolvedValue([]);

		spyOn(DinozDao, 'getDinozFicheRequest').and.returnValue(BasicDinoz);
	});

	it('Cas nominal', async function () {
		await getDinozFiche(req, res);

		expect(DinozDao.getDinozFicheRequest).toHaveBeenCalledTimes(1);

		expect(DinozDao.getDinozFicheRequest).toHaveBeenCalledWith(dinozId);
	});

	it('Cas unauthorized action', async function () {
		BasicDinoz.player.playerId = player.id_2;

		await getDinozFiche(req, res);

		expect(DinozDao.getDinozFicheRequest).toHaveBeenCalledTimes(1);
	});
});

describe('Test de la fonction buyDinoz()', function () {
	let dinozCreated: any;

	beforeEach(function () {
		req.params = {
			id: dinozId.toString()
		};

		dinozCreated = {
			dinozId: 100,
			display: DinozFromShop.display,
			experience: 0,
			life: 100,
			name: '?',
			place: { name: 'dinoville' }
		};

		spyOn(PlayerDao, 'setPlayerMoneyRequest');
		spyOn(DinozShopDao, 'deleteDinozInShopRequest');
		spyOn(assDinozSkillDao, 'addSkillToDinoz');
		spyOn(DinozDao, 'createDinozRequest').and.returnValue(dinozCreated);
		const dinozBuilt = {
			get: jest.fn().mockResolvedValue(DinozFromShop),
			create: jest.fn()
		};
		spyOn(Dinoz, 'build').and.returnValue(dinozBuilt);
		spyOn(Dinoz, 'create').and.returnValue(dinozBuilt);
		
	});

	it('Cas nominal', async function () {
		spyOn(DinozShopDao, 'getDinozDetailsRequest').and.returnValue(
			DinozFromShop
		);

		await buyDinoz(req, res);

		expect(DinozShopDao.getDinozDetailsRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledTimes(1);
		expect(DinozShopDao.deleteDinozInShopRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.createDinozRequest).toHaveBeenCalledTimes(1);
		expect(assDinozSkillDao.addSkillToDinoz).toHaveBeenCalledTimes(1);

		expect(DinozShopDao.getDinozDetailsRequest).toHaveBeenCalledWith(
			parseInt(req.params.id)
		);
		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledWith(
			req.user!.playerId,
			parseInt(DinozFromShop.player.money.toString()) - DinozFromShop.race.price
		);
		expect(DinozShopDao.deleteDinozInShopRequest).toHaveBeenCalledWith(
			req.user!.playerId
		);
		expect(DinozDao.createDinozRequest).toHaveBeenCalledWith(
			Promise.resolve(DinozFromShop)
		);
	});

	it('Dinoz found in database is null', async function () {
		spyOn(DinozShopDao, 'getDinozDetailsRequest').and.returnValue(null);

		await buyDinoz(req, res);

		expect(DinozShopDao.getDinozDetailsRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledTimes(0);

		expect(DinozShopDao.getDinozDetailsRequest).toHaveBeenCalledWith(
			parseInt(req.params.id)
		);
	});

	it("Player doesn't have enough money to buy the dinoz", async function () {
		DinozFromShop.player.money = 0;
		spyOn(DinozShopDao, 'getDinozDetailsRequest').and.returnValue(
			DinozFromShop
		);

		await buyDinoz(req, res);

		expect(DinozShopDao.getDinozDetailsRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledTimes(0);

		expect(DinozShopDao.getDinozDetailsRequest).toHaveBeenCalledWith(
			parseInt(req.params.id)
		);
	});

	it("Dinoz doesn't belong to player who made the request", async function () {
		DinozFromShop.player.money = 200000;
		DinozFromShop.player.playerId = player.id_2;
		spyOn(DinozShopDao, 'getDinozDetailsRequest').and.returnValue(
			DinozFromShop
		);

		await buyDinoz(req, res);

		expect(DinozShopDao.getDinozDetailsRequest).toHaveBeenCalledTimes(1);
		expect(PlayerDao.setPlayerMoneyRequest).toHaveBeenCalledTimes(0);

		expect(DinozShopDao.getDinozDetailsRequest).toHaveBeenCalledWith(
			parseInt(req.params.id)
		);
	});
});

describe('Test de la fonction setDinozName()', function () {
	let dinozToUpdate: Dinoz;

	beforeEach(function () {
		req.body = {
			newName: 'Potato'
		};

		dinozToUpdate = {
			canChangeName: true,
			player: {
				playerId: player.id_1
			}
		} as Dinoz;

		spyOn(Dinoz, 'build').and.returnValue(dinozToUpdate);

		spyOn(DinozDao, 'getCanDinozChangeName').and.returnValue(dinozToUpdate);
		spyOn(DinozDao, 'setDinozNameRequest');
	});

	it('Cas nominal', async function () {
		await setDinozName(req, res);

		expect(DinozDao.getCanDinozChangeName).toHaveBeenCalledTimes(1);
		expect(DinozDao.setDinozNameRequest).toHaveBeenCalledTimes(1);

		expect(DinozDao.getCanDinozChangeName).toHaveBeenLastCalledWith(
			parseInt(req.params.id)
		);
		expect(DinozDao.setDinozNameRequest).toHaveBeenLastCalledWith(
			dinozToUpdate
		);
	});

	it("Dinoz doesn't belong to player who made the request", async function () {
		dinozToUpdate.player.playerId = player.id_2;

		await setDinozName(req, res);

		expect(DinozDao.getCanDinozChangeName).toHaveBeenCalledTimes(1);
		expect(DinozDao.setDinozNameRequest).toHaveBeenCalledTimes(0);

		expect(DinozDao.getCanDinozChangeName).toHaveBeenLastCalledWith(
			parseInt(req.params.id)
		);
	});

	it('Dinoz name cannot be updated', async function () {
		dinozToUpdate.canChangeName = false;

		await setDinozName(req, res);

		expect(DinozDao.getCanDinozChangeName).toHaveBeenCalledTimes(1);
		expect(DinozDao.setDinozNameRequest).toHaveBeenCalledTimes(0);

		expect(DinozDao.getCanDinozChangeName).toHaveBeenLastCalledWith(
			parseInt(req.params.id)
		);
	});
});
