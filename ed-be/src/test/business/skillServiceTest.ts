import { Request } from 'express';
import _ from 'lodash';
import { getLearnableSkills, learnSkill } from '../../business/skillService';
import { itemList, levelList, raceList, skillList } from '../../constants';
import { AssDinozItem, AssDinozSkill, AssDinozSkillUnlockable, DinozSkillOwnAndUnlockable } from '../../models';
import {
	DinozLevel11LevelUp,
	DinozLevel1LevelUp,
	DinozLevel1LevelUpInWood,
	DinozLevel2LevelUp,
	DinozLevel50LevelUp
} from '../data/dinozData';
import { dinozId, mockRequest, player } from '../utils/constants';

const DinozDao = require('../../dao/dinozDao.js');
const AssDinozSkillUnlockableDao = require('../../dao/assDinozSkillUnlockable.js');
const AssDinozSkillDao = require('../../dao/assDinozSkillDao.js');
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

		DinozDao.getDinozSkillsOwnAndUnlockable = jasmine.createSpy().and.returnValue(DinozLevel1LevelUp);
	});

	// Dinoz is level 1, has no skill, doesn't have PDC or cube, tryNumber = 1
	// tb_ass_dinoz_skill_unlockable is empty for this dinoz
	it('Dinoz up to level 2, up element is fire', async () => {
		const response: Partial<DinozSkillOwnAndUnlockable> | undefined = await getLearnableSkills(mockRequest);

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

		expect(DinozDao.getDinozSkillsOwnAndUnlockable).toHaveBeenCalledTimes(1);

		expect(DinozDao.getDinozSkillsOwnAndUnlockable).toHaveBeenCalledWith(parseInt(req.params.id));
	});

	it("Dinoz doesn't exist", async () => {
		DinozDao.getDinozSkillsOwnAndUnlockable = jasmine.createSpy().and.returnValue(null);

		try {
			await getLearnableSkills(mockRequest);
			fail();
		} catch (err) {
			expect(err.message).toBe(`Dinoz ${req.params.id} doesn't exist`);

			expect(DinozDao.getDinozSkillsOwnAndUnlockable).toHaveBeenCalledTimes(1);
			expect(DinozDao.getDinozSkillsOwnAndUnlockable).toHaveBeenCalledWith(parseInt(req.params.id));
		}
	});

	it("Dinoz doesn't belong to the player who do the request", async () => {
		const dinozToOtherPlayer = _.cloneDeep(DinozLevel1LevelUp);
		dinozToOtherPlayer.player!.playerId = player.id_2;
		DinozDao.getDinozSkillsOwnAndUnlockable = jasmine.createSpy().and.returnValue(dinozToOtherPlayer);

		try {
			await getLearnableSkills(mockRequest);
			fail();
		} catch (err) {
			expect(err.message).toBe(`Dinoz ${req.params.id} doesn't belong to player ${mockRequest.user!.playerId}`);

			expect(DinozDao.getDinozSkillsOwnAndUnlockable).toHaveBeenCalledTimes(1);
			expect(DinozDao.getDinozSkillsOwnAndUnlockable).toHaveBeenCalledWith(parseInt(req.params.id));
		}
	});

	it("Dinoz doesn't have enough experience", async () => {
		const dinozWithoutXp = _.cloneDeep(DinozLevel1LevelUp);
		dinozWithoutXp.experience = 0;
		DinozDao.getDinozSkillsOwnAndUnlockable = jasmine.createSpy().and.returnValue(dinozWithoutXp);

		try {
			await getLearnableSkills(mockRequest);
			fail();
		} catch (err) {
			expect(err.message).toBe(`Dinoz ${req.params.id} doesn't have enough experience`);

			expect(DinozDao.getDinozSkillsOwnAndUnlockable).toHaveBeenCalledTimes(1);
			expect(DinozDao.getDinozSkillsOwnAndUnlockable).toHaveBeenCalledWith(parseInt(req.params.id));
		}
	});

	it('Invalid try number (too high)', async () => {
		req.params.tryNumber = '3';

		try {
			await getLearnableSkills(mockRequest);
			fail();
		} catch (err) {
			expect(err.message).toBe(`tryNumber ${req.params.tryNumber} is invalid`);

			expect(DinozDao.getDinozSkillsOwnAndUnlockable).toHaveBeenCalledTimes(1);
			expect(DinozDao.getDinozSkillsOwnAndUnlockable).toHaveBeenCalledWith(parseInt(req.params.id));
		}
	});

	it("Player try to do a second try with a dinoz level 1, but hasn't 'Plan de carrière' or 'cube' object", async () => {
		req.params.tryNumber = '2';

		try {
			await getLearnableSkills(mockRequest);
			fail();
		} catch (err) {
			expect(err.message).toBe(`tryNumber ${req.params.tryNumber} is invalid`);

			expect(DinozDao.getDinozSkillsOwnAndUnlockable).toHaveBeenCalledTimes(1);
			expect(DinozDao.getDinozSkillsOwnAndUnlockable).toHaveBeenCalledWith(parseInt(req.params.id));
		}
	});

	it("Player try to do a second try but dinoz is level 11 and doesn't have 'Plan de carrière'", async () => {
		req.params.tryNumber = '2';

		DinozDao.getDinozSkillsOwnAndUnlockable = jasmine.createSpy().and.returnValue(DinozLevel11LevelUp);

		try {
			await getLearnableSkills(mockRequest);
			fail();
		} catch (err) {
			expect(err.message).toBe(`tryNumber ${req.params.tryNumber} is invalid`);

			expect(DinozDao.getDinozSkillsOwnAndUnlockable).toHaveBeenCalledTimes(1);
			expect(DinozDao.getDinozSkillsOwnAndUnlockable).toHaveBeenCalledWith(parseInt(req.params.id));
		}
	});

	it("Player try to do a second try, dinoz is level 11 and has 'Plan de carrière'", async () => {
		req.params.tryNumber = '2';

		const dinozLevel11withPDC = _.cloneDeep(DinozLevel11LevelUp);
		dinozLevel11withPDC.skill = [{ skillId: skillList.PLAN_DE_CARRIERE.skillId } as AssDinozSkill];
		DinozDao.getDinozSkillsOwnAndUnlockable = jasmine.createSpy().and.returnValue(dinozLevel11withPDC);

		const response = await getLearnableSkills(mockRequest);

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

		expect(DinozDao.getDinozSkillsOwnAndUnlockable).toHaveBeenCalledTimes(1);

		expect(DinozDao.getDinozSkillsOwnAndUnlockable).toHaveBeenCalledWith(parseInt(req.params.id));
	});

	it("Player try to do a second try, dinoz is level 1 and has 'cube' object", async () => {
		req.params.tryNumber = '2';

		const dinozLevel1WithCube = _.cloneDeep(DinozLevel1LevelUp);
		dinozLevel1WithCube.item = [{ itemId: itemList.DINOZ_CUBE.itemId } as AssDinozItem];
		DinozDao.getDinozSkillsOwnAndUnlockable = jasmine.createSpy().and.returnValue(dinozLevel1WithCube);

		const response = await getLearnableSkills(mockRequest);

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

		expect(DinozDao.getDinozSkillsOwnAndUnlockable).toHaveBeenCalledTimes(1);

		expect(DinozDao.getDinozSkillsOwnAndUnlockable).toHaveBeenCalledWith(parseInt(req.params.id));
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

		DinozDao.getDinozSkillsOwnAndUnlockable = jasmine.createSpy().and.returnValue(DinozLevel1LevelUp);
		DinozDao.setLevelUpData = jasmine.createSpy();
		AssDinozSkillUnlockableDao.removeUnlockableSkillsToDinoz = jasmine.createSpy();
		AssDinozSkillUnlockableDao.addMultipleUnlockableSkills = jasmine.createSpy();
		AssDinozSkillDao.addSkillToDinoz = jasmine.createSpy();
		RankingDao.updatePoints = jasmine.createSpy();

		AssDinozSkillUnlockable.build = jasmine.createSpy().and.returnValue({ get: jest.fn() });
	});

	it("Dinoz is level 1 and want to learn 'Colère' skill with success", async () => {
		const response: string = await learnSkill(mockRequest);

		expect(response).toBe(levelList[1].experience.toString());

		expect(DinozDao.getDinozSkillsOwnAndUnlockable).toHaveBeenCalledTimes(1);
		expect(AssDinozSkillDao.addSkillToDinoz).toHaveBeenCalledTimes(1);
		expect(AssDinozSkillUnlockableDao.addMultipleUnlockableSkills).toHaveBeenCalledTimes(1);
		expect(DinozDao.setLevelUpData).toHaveBeenCalledTimes(1);
		expect(RankingDao.updatePoints).toHaveBeenCalledTimes(1);

		expect(DinozDao.getDinozSkillsOwnAndUnlockable).toHaveBeenCalledWith(parseInt(req.params.id));
		expect(AssDinozSkillDao.addSkillToDinoz).toHaveBeenCalledWith(parseInt(req.params.id), req.body.skillIdList[0]);
		expect(DinozDao.setLevelUpData).toHaveBeenCalledWith(
			expect.objectContaining({ dinozId: parseInt(req.params.id), experience: 0, level: 2, nbrUpFire: 1 })
		);
		expect(RankingDao.updatePoints).toHaveBeenCalledWith(player.id_1, 6, 3, 2);
	});

	it("Dinoz doesn't exist", async () => {
		DinozDao.getDinozSkillsOwnAndUnlockable = jasmine.createSpy().and.returnValue(null);

		try {
			await learnSkill(mockRequest);
			fail();
		} catch (err) {
			expect(err.message).toBe(`Dinoz ${req.params.id} doesn't exist`);

			expect(DinozDao.getDinozSkillsOwnAndUnlockable).toHaveBeenCalledTimes(1);
			expect(AssDinozSkillDao.addSkillToDinoz).not.toHaveBeenCalled();

			expect(DinozDao.getDinozSkillsOwnAndUnlockable).toHaveBeenCalledWith(parseInt(req.params.id));
		}
	});

	it("Dinoz wants to learn 'Sumo' but he's only level 1", async () => {
		req.body.skillIdList = [skillList.SUMO.skillId];

		try {
			await learnSkill(mockRequest);
			fail();
		} catch (err) {
			expect(err.message).toBe(`Dinoz ${req.params.id} can't learn this`);

			expect(DinozDao.getDinozSkillsOwnAndUnlockable).toHaveBeenCalledTimes(1);
			expect(AssDinozSkillDao.addSkillToDinoz).not.toHaveBeenCalled();

			expect(DinozDao.getDinozSkillsOwnAndUnlockable).toHaveBeenCalledWith(parseInt(req.params.id));
		}
	});

	it('Dinoz is level 2 and wants to unlock some skills with success', async () => {
		req.body.skillIdList = [skillList.POCHE_VENTRALE.skillId, skillList.KARATE_SOUS_MARIN.skillId];

		DinozDao.getDinozSkillsOwnAndUnlockable = jasmine.createSpy().and.returnValue(DinozLevel2LevelUp);

		const response = await learnSkill(mockRequest);

		expect(response).toBe(levelList[2].experience.toString());

		expect(DinozDao.getDinozSkillsOwnAndUnlockable).toHaveBeenCalledTimes(1);
		expect(AssDinozSkillUnlockableDao.removeUnlockableSkillsToDinoz).toHaveBeenCalledTimes(1);
		expect(DinozDao.setLevelUpData).toHaveBeenCalledTimes(1);
		expect(RankingDao.updatePoints).toHaveBeenCalledTimes(1);

		expect(DinozDao.getDinozSkillsOwnAndUnlockable).toHaveBeenCalledWith(parseInt(req.params.id));
		expect(AssDinozSkillUnlockableDao.removeUnlockableSkillsToDinoz).toHaveBeenCalledWith(
			parseInt(req.params.id),
			req.body.skillIdList
		);
		expect(DinozDao.setLevelUpData).toHaveBeenCalledWith(
			expect.objectContaining({ dinozId: parseInt(req.params.id), experience: 0, level: 3, nbrUpWater: 2 })
		);
		expect(RankingDao.updatePoints).toHaveBeenCalledWith(player.id_1, 6, 3, 2);
	});

	it('Dinoz is level 1 and wants to learn a wood skill with success', async () => {
		req.body.skillIdList = [skillList.ENDURANCE.skillId];

		DinozDao.getDinozSkillsOwnAndUnlockable = jasmine.createSpy().and.returnValue(DinozLevel1LevelUpInWood);

		const response: string = await learnSkill(mockRequest);

		expect(response).toBe(levelList[1].experience.toString());

		expect(DinozDao.getDinozSkillsOwnAndUnlockable).toHaveBeenCalledTimes(1);
		expect(AssDinozSkillDao.addSkillToDinoz).toHaveBeenCalledTimes(1);
		expect(AssDinozSkillUnlockableDao.addMultipleUnlockableSkills).toHaveBeenCalledTimes(1);
		expect(DinozDao.setLevelUpData).toHaveBeenCalledTimes(1);
		expect(RankingDao.updatePoints).toHaveBeenCalledTimes(1);

		expect(DinozDao.getDinozSkillsOwnAndUnlockable).toHaveBeenCalledWith(parseInt(req.params.id));
		expect(AssDinozSkillDao.addSkillToDinoz).toHaveBeenCalledWith(parseInt(req.params.id), req.body.skillIdList[0]);
		expect(DinozDao.setLevelUpData).toHaveBeenCalledWith(
			expect.objectContaining({ dinozId: parseInt(req.params.id), experience: 0, level: 2, nbrUpWood: 1 })
		);
		expect(RankingDao.updatePoints).toHaveBeenCalledWith(player.id_1, 6, 3, 2);
	});

	it('Dinoz is level 50 and wants to learn a lightning skill (Soutien moral) from ether tree with success, tryNumber = 1', async () => {
		req.body.skillIdList = [skillList.SOUTIEN_MORAL.skillId];

		DinozDao.getDinozSkillsOwnAndUnlockable = jasmine.createSpy().and.returnValue(DinozLevel50LevelUp);

		const response: string = await learnSkill(mockRequest);

		expect(response).toBe(levelList[50].experience.toString());

		expect(DinozDao.getDinozSkillsOwnAndUnlockable).toHaveBeenCalledTimes(1);
		expect(AssDinozSkillDao.addSkillToDinoz).toHaveBeenCalledTimes(1);
		expect(AssDinozSkillUnlockableDao.addMultipleUnlockableSkills).toHaveBeenCalledTimes(1);
		expect(DinozDao.setLevelUpData).toHaveBeenCalledTimes(1);
		expect(RankingDao.updatePoints).toHaveBeenCalledTimes(1);

		expect(DinozDao.getDinozSkillsOwnAndUnlockable).toHaveBeenCalledWith(parseInt(req.params.id));
		expect(AssDinozSkillDao.addSkillToDinoz).toHaveBeenCalledWith(parseInt(req.params.id), req.body.skillIdList[0]);
		expect(DinozDao.setLevelUpData).toHaveBeenCalledWith(
			expect.objectContaining({ dinozId: parseInt(req.params.id), experience: 0, level: 51, nbrUpLightning: 23 })
		);
		expect(RankingDao.updatePoints).toHaveBeenCalledWith(player.id_1, 6, 3, 2);
	});

	it('Dinoz is level 50 and wants to learn an air skill from ether tree with success, tryNumber = 2', async () => {
		req.body = {
			skillIdList: [skillList.MAITRISE_CORPORELLE.skillId],
			tryNumber: '2'
		};

		DinozDao.getDinozSkillsOwnAndUnlockable = jasmine.createSpy().and.returnValue(DinozLevel50LevelUp);

		const response: string = await learnSkill(mockRequest);

		expect(response).toBe(levelList[50].experience.toString());

		expect(DinozDao.getDinozSkillsOwnAndUnlockable).toHaveBeenCalledTimes(1);
		expect(AssDinozSkillDao.addSkillToDinoz).toHaveBeenCalledTimes(1);
		expect(AssDinozSkillUnlockableDao.addMultipleUnlockableSkills).toHaveBeenCalledTimes(1);
		expect(DinozDao.setLevelUpData).toHaveBeenCalledTimes(1);
		expect(RankingDao.updatePoints).toHaveBeenCalledTimes(1);

		expect(DinozDao.getDinozSkillsOwnAndUnlockable).toHaveBeenCalledWith(parseInt(req.params.id));
		expect(AssDinozSkillDao.addSkillToDinoz).toHaveBeenCalledWith(parseInt(req.params.id), req.body.skillIdList[0]);
		expect(DinozDao.setLevelUpData).toHaveBeenCalledWith(
			expect.objectContaining({ dinozId: parseInt(req.params.id), experience: 0, level: 51, nbrUpAir: 7 })
		);
		expect(RankingDao.updatePoints).toHaveBeenCalledWith(player.id_1, 6, 3, 2);
	});
});
