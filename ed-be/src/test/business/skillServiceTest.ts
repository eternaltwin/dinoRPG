import { Request } from 'express';
import _ from 'lodash';
import { getLearnableSkills, learnSkill } from '../../business/skillService.js';
import { itemList, levelList, raceList, skillList } from '../../constants/index.js';
import { DinozSkillOwnAndUnlockable } from '../../models/index.js';
import { DinozItem, DinozSkill, Dinoz } from '../../entity/index.js';
import {
	DinozLevel11LevelUp,
	DinozLevel1LevelUp,
	DinozLevel1LevelUpInWood,
	DinozLevel2LevelUp,
	DinozLevel50LevelUp
} from '../data/dinozData.js';
import { dinozId, mockRequest, player } from '../utils/constants.js';

const DinozDao = require('../../dao/dinozDao.js');
const DinozSkillUnlockableDao = require('../../dao/dinozSkillUnlockableDao.js');
const DinozSkillDao = require('../../dao/dinozSkillDao.js');
const RankingDao = require('../../dao/rankingDao.js');

describe('Function getLearnableSkills', () => {
	let req: Request;

	beforeEach(() => {
		jest.clearAllMocks();
		req = mockRequest;

		req.params = {
			id: dinozId.toString(),
			tryNumber: '1'
		};

		DinozDao.getDinozSkillAndUnlockablesRequest = jasmine.createSpy().and.returnValue(DinozLevel1LevelUp);
	});

	// Dinoz is level 1, has no skill, doesn't have PDC or cube, tryNumber = 1
	// tb_ass_dinoz_skill_unlockable is empty for this dinoz
	it('Dinoz up to level 2, up element is fire', async () => {
		let response: Partial<DinozSkillOwnAndUnlockable> | undefined = {};
		try {
			response = await getLearnableSkills(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		expect(response!.canRelaunch).toBe(false);
		expect(response!.element).toBe(1);
		response!.learnableSkills?.forEach(skill =>
			expect(
				[skillList.GRIFFES_ENFLAMMEES.skillId, skillList.COLERE.skillId, skillList.FORCE.skillId].includes(
					skill.skillId!
				)
			)
		);
		expect(response!.unlockableSkills).toStrictEqual([]);
		expect(response!.upChance).toBe(raceList.WINKS.upChance);

		expect(DinozDao.getDinozSkillAndUnlockablesRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozSkillAndUnlockablesRequest).toHaveBeenCalledWith(parseInt(req.params.id));
	});

	// No need to test that the DAO can return a null dinoz. It will throw an error if no dinoz is found.

	it("Dinoz doesn't belong to the player who do the request", async () => {
		const dinozToOtherPlayer = _.cloneDeep(DinozLevel1LevelUp);
		dinozToOtherPlayer.player!.id = player.id_2;
		DinozDao.getDinozSkillAndUnlockablesRequest = jasmine.createSpy().and.returnValue(dinozToOtherPlayer);

		try {
			await getLearnableSkills(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`Dinoz ${req.params.id} doesn't belong to player ${req.user!.playerId}`);

			expect(DinozDao.getDinozSkillAndUnlockablesRequest).toHaveBeenCalledTimes(1);
			expect(DinozDao.getDinozSkillAndUnlockablesRequest).toHaveBeenCalledWith(parseInt(req.params.id));
		}
	});

	it("Dinoz doesn't have enough experience", async () => {
		const dinozWithoutXp = _.cloneDeep(DinozLevel1LevelUp);
		dinozWithoutXp.experience = 0;
		DinozDao.getDinozSkillAndUnlockablesRequest = jasmine.createSpy().and.returnValue(dinozWithoutXp);

		try {
			await getLearnableSkills(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`Dinoz ${req.params.id} doesn't have enough experience`);

			expect(DinozDao.getDinozSkillAndUnlockablesRequest).toHaveBeenCalledTimes(1);
			expect(DinozDao.getDinozSkillAndUnlockablesRequest).toHaveBeenCalledWith(parseInt(req.params.id));
		}
	});

	it('Invalid try number (too high)', async () => {
		req.params.tryNumber = '3';

		try {
			await getLearnableSkills(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`tryNumber ${req.params.tryNumber} is invalid`);

			expect(DinozDao.getDinozSkillAndUnlockablesRequest).toHaveBeenCalledTimes(1);
			expect(DinozDao.getDinozSkillAndUnlockablesRequest).toHaveBeenCalledWith(parseInt(req.params.id));
		}
	});

	it("Player try to do a second try with a dinoz level 1, but hasn't 'Plan de carrière' or 'cube' object", async () => {
		req.params.tryNumber = '2';

		try {
			await getLearnableSkills(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`tryNumber ${req.params.tryNumber} is invalid`);

			expect(DinozDao.getDinozSkillAndUnlockablesRequest).toHaveBeenCalledTimes(1);
			expect(DinozDao.getDinozSkillAndUnlockablesRequest).toHaveBeenCalledWith(parseInt(req.params.id));
		}
	});

	it("Player try to do a second try but dinoz is level 11 and doesn't have 'Plan de carrière'", async () => {
		req.params.tryNumber = '2';

		DinozDao.getDinozSkillAndUnlockablesRequest = jasmine.createSpy().and.returnValue(DinozLevel11LevelUp);

		try {
			await getLearnableSkills(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`tryNumber ${req.params.tryNumber} is invalid`);

			expect(DinozDao.getDinozSkillAndUnlockablesRequest).toHaveBeenCalledTimes(1);
			expect(DinozDao.getDinozSkillAndUnlockablesRequest).toHaveBeenCalledWith(parseInt(req.params.id));
		}
	});

	it("Player try to do a second try, dinoz is level 11 and has 'Plan de carrière'", async () => {
		req.params.tryNumber = '2';

		const dinozLevel11withPDC = _.cloneDeep(DinozLevel11LevelUp);
		dinozLevel11withPDC.skills = [{ skillId: skillList.PLAN_DE_CARRIERE.skillId } as DinozSkill];
		DinozDao.getDinozSkillAndUnlockablesRequest = jasmine.createSpy().and.returnValue(dinozLevel11withPDC);

		const response = await getLearnableSkills(req);

		expect(response!.canRelaunch).toBe(true);
		expect(response!.element).toBe(5);
		response!.learnableSkills?.forEach(skill =>
			expect(
				[skillList.GRIFFES_ENFLAMMEES.skillId, skillList.COLERE.skillId, skillList.FORCE.skillId].includes(
					skill.skillId!
				)
			)
		);
		expect(response!.unlockableSkills).toStrictEqual([]);
		expect(response!.upChance).toBe(raceList.WINKS.upChance);

		expect(DinozDao.getDinozSkillAndUnlockablesRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozSkillAndUnlockablesRequest).toHaveBeenCalledWith(parseInt(req.params.id));
	});

	it("Player try to do a second try, dinoz is level 1 and has 'cube' object", async () => {
		req.params.tryNumber = '2';

		const dinozLevel1WithCube = _.cloneDeep(DinozLevel1LevelUp);
		dinozLevel1WithCube.items = [{ itemId: itemList.DINOZ_CUBE.itemId } as DinozItem];
		DinozDao.getDinozSkillAndUnlockablesRequest = jasmine.createSpy().and.returnValue(dinozLevel1WithCube);

		const response = await getLearnableSkills(req);

		expect(response!.canRelaunch).toBe(true);
		expect(response!.element).toBe(1);
		response!.learnableSkills?.forEach(skill =>
			expect(
				[skillList.GRIFFES_ENFLAMMEES.skillId, skillList.COLERE.skillId, skillList.FORCE.skillId].includes(
					skill.skillId!
				)
			)
		);
		expect(response!.unlockableSkills).toStrictEqual([]);
		expect(response!.upChance).toBe(raceList.WINKS.upChance);

		expect(DinozDao.getDinozSkillAndUnlockablesRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozSkillAndUnlockablesRequest).toHaveBeenCalledWith(parseInt(req.params.id));
	});
});

describe('Function learnSkill', () => {
	let req: Request;

	beforeEach(() => {
		jest.clearAllMocks();
		req = mockRequest;

		req.params = {
			id: dinozId.toString()
		};

		req.body = {
			skillIdList: [skillList.COLERE.skillId],
			tryNumber: '1'
		};

		DinozDao.getDinozSkillAndUnlockablesRequest = jasmine.createSpy().and.returnValue(DinozLevel1LevelUp);
		DinozDao.setDinoz = jasmine.createSpy();
		DinozSkillUnlockableDao.removeUnlockableSkillsToDinoz = jasmine.createSpy();
		DinozSkillUnlockableDao.addMultipleUnlockableSkills = jasmine.createSpy();
		DinozSkillDao.addSkillToDinoz = jasmine.createSpy();
		RankingDao.updatePoints = jasmine.createSpy();

		// DinozSkillUnlockable.build = jasmine.createSpy().and.returnValue({ get: jest.fn() });
	});

	it("Dinoz is level 1 and want to learn 'Colère' skill with success", async () => {
		const response: string = await learnSkill(req);

		expect(response).toBe(levelList[1].experience.toString());

		expect(DinozDao.getDinozSkillAndUnlockablesRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozSkillAndUnlockablesRequest).toHaveBeenCalledWith(parseInt(req.params.id));

		expect(DinozSkillDao.addSkillToDinoz).toHaveBeenCalledTimes(1);
		expect(DinozSkillDao.addSkillToDinoz).toHaveBeenCalledWith(
			new DinozSkill(new Dinoz(parseInt(req.params.id)), req.body.skillIdList[0])
		);

		expect(DinozSkillUnlockableDao.addMultipleUnlockableSkills).toHaveBeenCalledTimes(1);

		expect(DinozDao.setDinoz).toHaveBeenCalledTimes(1);
		expect(DinozDao.setDinoz).toHaveBeenCalledWith(
			expect.objectContaining({ id: parseInt(req.params.id), experience: 0, level: 2, nbrUpFire: 1 })
		);

		expect(RankingDao.updatePoints).toHaveBeenCalledTimes(1);
		expect(RankingDao.updatePoints).toHaveBeenCalledWith(player.id_1, 6, 3, 2);
	});

	// No need to test that the DAO can return a null dinoz. It will throw an error if no dinoz is found.

	it("Dinoz wants to learn 'Sumo' but he's only level 1", async () => {
		req.body.skillIdList = [skillList.SUMO.skillId];

		try {
			await learnSkill(req);
			fail();
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`Dinoz ${req.params.id} can't learn this`);

			expect(DinozDao.getDinozSkillAndUnlockablesRequest).toHaveBeenCalledTimes(1);
			expect(DinozDao.getDinozSkillAndUnlockablesRequest).toHaveBeenCalledWith(parseInt(req.params.id));

			expect(DinozSkillDao.addSkillToDinoz).not.toHaveBeenCalled();
		}
	});

	it('Dinoz is level 2 and wants to unlock some skills with success', async () => {
		req.body.skillIdList = [skillList.POCHE_VENTRALE.skillId, skillList.KARATE_SOUS_MARIN.skillId];

		DinozDao.getDinozSkillAndUnlockablesRequest = jasmine.createSpy().and.returnValue(DinozLevel2LevelUp);

		const response = await learnSkill(req);

		expect(response).toBe(levelList[2].experience.toString());

		expect(DinozDao.getDinozSkillAndUnlockablesRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozSkillAndUnlockablesRequest).toHaveBeenCalledWith(parseInt(req.params.id));

		expect(DinozSkillUnlockableDao.removeUnlockableSkillsToDinoz).toHaveBeenCalledTimes(1);
		expect(DinozSkillUnlockableDao.removeUnlockableSkillsToDinoz).toHaveBeenCalledWith(
			parseInt(req.params.id),
			req.body.skillIdList
		);

		expect(DinozDao.setDinoz).toHaveBeenCalledTimes(1);
		expect(DinozDao.setDinoz).toHaveBeenCalledWith(
			expect.objectContaining({ id: parseInt(req.params.id), experience: 0, level: 3, nbrUpWater: 2 })
		);

		expect(RankingDao.updatePoints).toHaveBeenCalledTimes(1);
		expect(RankingDao.updatePoints).toHaveBeenCalledWith(player.id_1, 6, 3, 2);
	});

	it('Dinoz is level 1 and wants to learn a wood skill with success', async () => {
		req.body.skillIdList = [skillList.ENDURANCE.skillId];

		DinozDao.getDinozSkillAndUnlockablesRequest = jasmine.createSpy().and.returnValue(DinozLevel1LevelUpInWood);

		const response: string = await learnSkill(req);

		expect(response).toBe(levelList[1].experience.toString());

		expect(DinozDao.getDinozSkillAndUnlockablesRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozSkillAndUnlockablesRequest).toHaveBeenCalledWith(parseInt(req.params.id));

		expect(DinozSkillDao.addSkillToDinoz).toHaveBeenCalledTimes(1);
		expect(DinozSkillDao.addSkillToDinoz).toHaveBeenCalledWith(
			new DinozSkill(new Dinoz(parseInt(req.params.id)), req.body.skillIdList[0])
		);

		expect(DinozSkillUnlockableDao.addMultipleUnlockableSkills).toHaveBeenCalledTimes(1);

		expect(DinozDao.setDinoz).toHaveBeenCalledTimes(1);
		expect(DinozDao.setDinoz).toHaveBeenCalledWith(
			expect.objectContaining({ id: parseInt(req.params.id), experience: 0, level: 2, nbrUpWood: 1 })
		);

		expect(RankingDao.updatePoints).toHaveBeenCalledTimes(1);
		expect(RankingDao.updatePoints).toHaveBeenCalledWith(player.id_1, 6, 3, 2);
	});

	it('Dinoz is level 50 and wants to learn a lightning skill (Soutien moral) from ether tree with success, tryNumber = 1', async () => {
		req.body.skillIdList = [skillList.SOUTIEN_MORAL.skillId];

		DinozDao.getDinozSkillAndUnlockablesRequest = jasmine.createSpy().and.returnValue(DinozLevel50LevelUp);

		const response: string = await learnSkill(req);

		expect(response).toBe(levelList[50].experience.toString());

		expect(DinozDao.getDinozSkillAndUnlockablesRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozSkillAndUnlockablesRequest).toHaveBeenCalledWith(parseInt(req.params.id));

		expect(DinozSkillDao.addSkillToDinoz).toHaveBeenCalledTimes(1);
		expect(DinozSkillDao.addSkillToDinoz).toHaveBeenCalledWith(
			new DinozSkill(new Dinoz(parseInt(req.params.id)), req.body.skillIdList[0])
		);

		expect(DinozSkillUnlockableDao.addMultipleUnlockableSkills).toHaveBeenCalledTimes(1);

		expect(DinozDao.setDinoz).toHaveBeenCalledTimes(1);
		expect(DinozDao.setDinoz).toHaveBeenCalledWith(
			expect.objectContaining({ id: parseInt(req.params.id), experience: 0, level: 51, nbrUpLightning: 23 })
		);

		expect(RankingDao.updatePoints).toHaveBeenCalledTimes(1);
		expect(RankingDao.updatePoints).toHaveBeenCalledWith(player.id_1, 6, 3, 2);
	});

	it('Dinoz is level 50 and wants to learn an air skill from ether tree with success, tryNumber = 2', async () => {
		req.body = {
			skillIdList: [skillList.MAITRISE_CORPORELLE.skillId],
			tryNumber: '2'
		};

		DinozDao.getDinozSkillAndUnlockablesRequest = jasmine.createSpy().and.returnValue(DinozLevel50LevelUp);

		const response: string = await learnSkill(req);

		expect(response).toBe(levelList[50].experience.toString());

		expect(DinozDao.getDinozSkillAndUnlockablesRequest).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozSkillAndUnlockablesRequest).toHaveBeenCalledWith(parseInt(req.params.id));

		expect(DinozSkillDao.addSkillToDinoz).toHaveBeenCalledTimes(1);
		expect(DinozSkillDao.addSkillToDinoz).toHaveBeenCalledWith(
			new DinozSkill(new Dinoz(parseInt(req.params.id)), req.body.skillIdList[0])
		);

		expect(DinozSkillUnlockableDao.addMultipleUnlockableSkills).toHaveBeenCalledTimes(1);

		expect(DinozDao.setDinoz).toHaveBeenCalledTimes(1);
		expect(DinozDao.setDinoz).toHaveBeenCalledWith(
			expect.objectContaining({ id: parseInt(req.params.id), experience: 0, level: 51, nbrUpAir: 7 })
		);

		expect(RankingDao.updatePoints).toHaveBeenCalledTimes(1);
		expect(RankingDao.updatePoints).toHaveBeenCalledWith(player.id_1, 6, 3, 2);
	});
});
