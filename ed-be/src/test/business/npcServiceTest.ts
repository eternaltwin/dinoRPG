import { Request } from 'express';
import { mockRequest, player } from '../utils/constants.js';
import { getNpcSpeech } from '../../business/npcService.js';
import { DinozLevel1LevelUp } from '../data/dinozData.js';
import _ from 'lodash';
import { NPC } from '../../entity/index.js';

const NPCDao = require('../../dao/npcDao.js');
const DinozDao = require('../../dao/dinozDao.js');
const parser = require('../../utils/parser.js');

describe('Function getNpcSpeech', function () {
	let req: Request;

	beforeEach(() => {
		jest.clearAllMocks();
		req = mockRequest;

		req.params = {
			dinozId: DinozLevel1LevelUp.id!.toString()
		};
		req.body = {
			step: 'talk'
		};

		DinozDao.getDinozNPCRequest = jasmine.createSpy().and.returnValue(DinozLevel1LevelUp);
		NPCDao.createDinozStep = jasmine.createSpy();
		NPCDao.updateDinozStep = jasmine.createSpy();
	});

	it("Dinoz doesn't belong to the player who do the request", async () => {
		req.params.npc = 'alpha_test';
		const dinozToOtherPlayer = _.cloneDeep(DinozLevel1LevelUp);
		dinozToOtherPlayer.player!.id = player.id_2;
		DinozDao.getDinozNPCRequest = jasmine.createSpy().and.returnValue(dinozToOtherPlayer);
		try {
			await getNpcSpeech(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`Dinoz ${req.params.dinozId} doesn't belong to player ${req.user!.playerId}`);
		}
	});

	it('Invalid NPC', async () => {
		req.params.npc = 'nope';
		try {
			await getNpcSpeech(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`NPC ${req.params.npc} doesn't exists`);
		}
	});

	it('Invalid place', async () => {
		req.params.npc = 'alpha_test';
		const dinozAtWrongPlace = _.cloneDeep(DinozLevel1LevelUp);
		dinozAtWrongPlace.placeId = 1;
		DinozDao.getDinozNPCRequest = jasmine.createSpy().and.returnValue(dinozAtWrongPlace);
		try {
			await getNpcSpeech(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`Dinoz ${req.params.dinozId} cannot talk to this NPC`);
		}
	});

	it('Invalid step', async () => {
		req.params.npc = 'alpha_test';
		req.body.step = 'futur';
		try {
			await getNpcSpeech(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`The step ${req.body.step} doesn't exist for the NPC ${req.params.npc}`);
		}
	});

	it('Dinoz never talk to this NPC', async () => {
		req.params.npc = 'alpha_test';
		req.body.step = 'begin';
		let dinozStepNominal = {
			npcId: 0,
			step: 'begin'
		};
		NPCDao.createDinozStep = jasmine.createSpy().and.returnValue(dinozStepNominal);
		try {
			await getNpcSpeech(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}
		let createDinozStep = {
			dinoz: {
				NPC: undefined,
				canChangeName: undefined,
				canGather: undefined,
				createdDate: undefined,
				display: undefined,
				experience: undefined,
				following: undefined,
				id: 123456789,
				isFrozen: undefined,
				isSacrificed: undefined,
				items: undefined,
				level: undefined,
				life: undefined,
				maxLife: undefined,
				missionId: undefined,
				missions: undefined,
				name: undefined,
				nbrUpAir: undefined,
				nbrUpFire: undefined,
				nbrUpLightning: undefined,
				nbrUpWater: undefined,
				nbrUpWood: undefined,
				nextUpAltElementId: undefined,
				nextUpElementId: undefined,
				placeId: undefined,
				player: undefined,
				raceId: undefined,
				skills: undefined,
				skillsUnlockable: undefined,
				status: undefined,
				updatedDate: undefined
			},
			id: undefined,
			npcId: 0,
			step: 'begin'
		};

		expect(NPCDao.createDinozStep).toHaveBeenCalledTimes(1);
		expect(NPCDao.createDinozStep).toHaveBeenCalledWith(createDinozStep);
	});

	it('Stop step', async () => {
		req.params.npc = 'professor';
		req.body.stop = true;
		const dinozAtWrongPlace = _.cloneDeep(DinozLevel1LevelUp);
		dinozAtWrongPlace.placeId = 6;
		dinozAtWrongPlace.NPC = [{ npcId: 3, step: 'begin' } as NPC];
		DinozDao.getDinozNPCRequest = jasmine.createSpy().and.returnValue(dinozAtWrongPlace);
		try {
			await getNpcSpeech(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		expect(NPCDao.updateDinozStep).toHaveBeenCalledTimes(1);
		expect(NPCDao.updateDinozStep).toHaveBeenCalledWith(parseInt(req.params.dinozId), 3, 'begin');
	});

	it('Step unreachable', async () => {
		req.params.npc = 'alpha_test';
		req.body.step = 'back';
		const dinozAtWrongPlace = _.cloneDeep(DinozLevel1LevelUp);
		dinozAtWrongPlace.NPC = [{ npcId: 0, step: 'talk' } as NPC];
		DinozDao.getDinozNPCRequest = jasmine.createSpy().and.returnValue(dinozAtWrongPlace);
		try {
			await getNpcSpeech(req);
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`This step is not reachable.`);
		}
	});

	it('Step with conditions', async () => {
		req.params.npc = 'professor';
		req.body.step = 'learn';
		const dinozAtWrongPlace = _.cloneDeep(DinozLevel1LevelUp);
		dinozAtWrongPlace.placeId = 6;
		dinozAtWrongPlace.NPC = [{ npcId: 3, step: 'talk' } as NPC];
		DinozDao.getDinozNPCRequest = jasmine.createSpy().and.returnValue(dinozAtWrongPlace);
		try {
			await getNpcSpeech(req);
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`The dinoz doesn't fullfill the conditions.`);
		}
	});

	it('Step with actions and reward', async () => {
		req.params.npc = 'professor';
		req.body.step = 'fire_fight';
		const dinozAtWrongPlace = _.cloneDeep(DinozLevel1LevelUp);
		dinozAtWrongPlace.placeId = 6;
		dinozAtWrongPlace.NPC = [{ npcId: 3, step: 'learn_fire' } as NPC];
		DinozDao.getDinozNPCRequest = jasmine.createSpy().and.returnValue(dinozAtWrongPlace);
		parser.triggerAction = jasmine.createSpy().and.returnValue(true);
		parser.rewarder = jasmine.createSpy();
		try {
			await getNpcSpeech(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		expect(parser.triggerAction).toHaveBeenCalledTimes(1);
		expect(parser.triggerAction).toHaveBeenCalledWith('fight(efire)', dinozAtWrongPlace);
		expect(parser.rewarder).toHaveBeenCalledTimes(1);
		expect(parser.rewarder).toHaveBeenCalledWith(['status(climbing_gear)'], dinozAtWrongPlace);
	});

	it('Empty conditions', async () => {
		req.params.npc = 'professor';
		req.body.step = 'talk';
		const dinozAtWrongPlace = _.cloneDeep(DinozLevel1LevelUp);
		dinozAtWrongPlace.placeId = 6;
		DinozDao.getDinozNPCRequest = jasmine.createSpy().and.returnValue(dinozAtWrongPlace);
		try {
			await getNpcSpeech(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}
	});

	it('Rewards only', async function () {
		req.params.npc = 'alpha_test';
		req.body.step = 'water';
		const dinozAtWrongPlace = _.cloneDeep(DinozLevel1LevelUp);
		dinozAtWrongPlace.placeId = 5;
		dinozAtWrongPlace.NPC = [{ npcId: 0, step: 'element' } as NPC];
		DinozDao.getDinozNPCRequest = jasmine.createSpy().and.returnValue(dinozAtWrongPlace);
		parser.triggerAction = jasmine.createSpy();
		parser.rewarder = jasmine.createSpy();
		try {
			await getNpcSpeech(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		expect(parser.rewarder).toHaveBeenCalledTimes(1);
		expect(parser.rewarder).toHaveBeenCalledWith(['changeelem(water)'], dinozAtWrongPlace);
	});

	// Bad requests are handled in routes
});
