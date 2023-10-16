/*
import { mockRequest, player } from '../utils/constants.js';
import { Request } from 'express';
import { jest } from '@jest/globals';
import {
	DinozKillMission,
	DinozNPCData,
	DinozSecondMission,
	fightResultlvl1Win,
	missionRewards
} from '../data/dinozData.js';
import {
	checkMissionFight,
	endMission,
	getHUDObjective,
	getMissionAction,
	getMissionsList,
	interactMission,
	updateMission
} from '../../business/missionsService.js';
import { npcList } from '../../constants/npc.js';
import { cloneDeep } from 'lodash';
import { placeList } from '../../constants/index.js';

const DinozDao = require('../../dao/dinozDao.js');
const MissionDao = require('../../dao/dinozMissionDao.js');
const parser = require('../../utils/parser.js');

describe('Function getMissionsList()', function () {
	let req: Request;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;
		req.params = {
			id: DinozNPCData.id.toString(),
			npc: npcList.PAPY.name
		};

		DinozDao.getDinozMissionsInfo = jasmine.createSpy().and.returnValue(DinozNPCData);
	});

	it('Nominal case', async function () {
		try {
			await getMissionsList(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledWith(DinozNPCData.id);
	});

	it('Wrong NPC name', async function () {
		req.params.npc = 'coucou';
		try {
			await getMissionsList(req);
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`NPC ${req.params.npc} doesn't exists`);
		}

		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledWith(DinozNPCData.id);
	});

	it("NPC don't have missions", async function () {
		req.params.npc = npcList.MINEUR.name;
		try {
			await getMissionsList(req);
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`NPC ${req.params.npc} doesn't have any missions`);
		}

		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledWith(DinozNPCData.id);
	});

	it('Dinoz cannot talk to this NPC', async function () {
		const wrongPlace = cloneDeep(DinozNPCData);
		wrongPlace.placeId = 1;
		DinozDao.getDinozMissionsInfo = jasmine.createSpy().and.returnValue(wrongPlace);
		try {
			await getMissionsList(req);
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`Dinoz ${wrongPlace.id} cannot talk to this NPC`);
		}

		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledWith(DinozNPCData.id);
	});

	it("Dinoz doesn't belong to player who made the request", async function () {
		const wrongPlayer = cloneDeep(DinozNPCData);
		wrongPlayer.player.id = player.id_2;
		DinozDao.getDinozMissionsInfo = jasmine.createSpy().and.returnValue(wrongPlayer);
		try {
			await getMissionsList(req);
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`Dinoz ${DinozNPCData.id} doesn't belong to player ${player.id_1}`);
		}

		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledWith(DinozNPCData.id);
	});
});

describe('Function updateMission()', function () {
	let req: Request;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;
		req.params = {
			dinozId: DinozNPCData.id.toString(),
			missionId: npcList.PAPY.missions![1].missionId.toString()
		};
		req.body = {
			status: 'start'
		};

		DinozDao.getDinozMissionsInfo = jasmine.createSpy().and.returnValue(DinozNPCData);
		MissionDao.addMissionToDinoz = jasmine.createSpy();
		MissionDao.removeMissionToDinoz = jasmine.createSpy();
	});

	it("Dinoz doesn't belong to player who made the request", async function () {
		const wrongPlayer = cloneDeep(DinozNPCData);
		wrongPlayer.player.id = player.id_2;
		DinozDao.getDinozMissionsInfo = jasmine.createSpy().and.returnValue(wrongPlayer);
		try {
			await updateMission(req);
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`Dinoz ${DinozNPCData.id} doesn't belong to player ${player.id_1}`);
		}

		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledWith(DinozNPCData.id);

		expect(MissionDao.addMissionToDinoz).toHaveBeenCalledTimes(0);
	});

	it("Mission doesn't exist", async function () {
		req.params.missionId = '0';
		try {
			await updateMission(req);
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`This mission doesn't exist`);
		}

		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledWith(DinozNPCData.id);

		expect(MissionDao.addMissionToDinoz).toHaveBeenCalledTimes(0);
	});

	it('Start mission: wrong place', async function () {
		const wrongPlace = cloneDeep(DinozNPCData);
		wrongPlace.placeId = 1;
		DinozDao.getDinozMissionsInfo = jasmine.createSpy().and.returnValue(wrongPlace);
		try {
			await updateMission(req);
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`Dinoz ${wrongPlace.id} cannot talk to this NPC`);
		}

		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledWith(DinozNPCData.id);

		expect(MissionDao.addMissionToDinoz).toHaveBeenCalledTimes(0);
	});

	it('Start mission: mission already done', async function () {
		req.params.missionId = npcList.PAPY.missions![0].missionId.toString();
		try {
			await updateMission(req);
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`This mission is already done`);
		}

		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledWith(DinozNPCData.id);

		expect(MissionDao.addMissionToDinoz).toHaveBeenCalledTimes(0);
	});

	it('Start mission: another mission is in progress', async function () {
		const missionInProgress = cloneDeep(DinozNPCData);
		missionInProgress.missions[0].isFinished = false;
		DinozDao.getDinozMissionsInfo = jasmine.createSpy().and.returnValue(missionInProgress);
		req.params.missionId = npcList.PAPY.missions![2].missionId.toString();

		try {
			await updateMission(req);
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`A mission is already in progress`);
		}

		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledWith(DinozNPCData.id);

		expect(MissionDao.addMissionToDinoz).toHaveBeenCalledTimes(0);
	});

	it('Start mission: mission unavailable', async function () {
		req.params.missionId = npcList.PAPY.missions![5].missionId.toString();
		try {
			await updateMission(req);
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`This mission is unavailable`);
		}

		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledWith(DinozNPCData.id);

		expect(MissionDao.addMissionToDinoz).toHaveBeenCalledTimes(0);
	});

	it('Start mission: OK', async function () {
		try {
			await updateMission(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledWith(DinozNPCData.id);

		expect(MissionDao.addMissionToDinoz).toHaveBeenCalledTimes(1);
	});

	it('Stop mission: mission already done', async function () {
		req.body.status = 'stop';
		req.params.missionId = npcList.PAPY.missions![0].missionId.toString();
		try {
			await updateMission(req);
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`This mission is already done`);
		}

		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledWith(DinozNPCData.id);

		expect(MissionDao.removeMissionToDinoz).toHaveBeenCalledTimes(0);
	});

	it('Stop mission: no mission in progress', async function () {
		req.body.status = 'stop';
		try {
			await updateMission(req);
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`There is no mission in progress`);
		}

		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledWith(DinozNPCData.id);

		expect(MissionDao.removeMissionToDinoz).toHaveBeenCalledTimes(0);
	});

	it('Stop mission: mission unavailable', async function () {
		req.body.status = 'stop';
		req.params.missionId = npcList.PAPY.missions![5].missionId.toString();
		const missionInProgress = cloneDeep(DinozNPCData);
		missionInProgress.missions[0].isFinished = false;
		DinozDao.getDinozMissionsInfo = jasmine.createSpy().and.returnValue(missionInProgress);

		try {
			await updateMission(req);
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`This mission is unavailable`);
		}

		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledWith(DinozNPCData.id);

		expect(MissionDao.removeMissionToDinoz).toHaveBeenCalledTimes(0);
	});

	it('Stop mission: nominal case', async function () {
		req.body.status = 'stop';
		const missionInProgress = cloneDeep(DinozNPCData);
		missionInProgress.missions[0].isFinished = false;
		DinozDao.getDinozMissionsInfo = jasmine.createSpy().and.returnValue(missionInProgress);

		try {
			await updateMission(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledWith(DinozNPCData.id);

		expect(MissionDao.removeMissionToDinoz).toHaveBeenCalledTimes(1);
		expect(MissionDao.removeMissionToDinoz).toHaveBeenCalledWith(DinozNPCData.id, npcList.PAPY.missions![1].missionId);
	});

	it('Wrong status', async function () {
		req.body.status = 'wrong';
		try {
			await updateMission(req);
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe("This status don't exist");
		}

		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledWith(DinozNPCData.id);

		expect(MissionDao.removeMissionToDinoz).toHaveBeenCalledTimes(0);
		expect(MissionDao.addMissionToDinoz).toHaveBeenCalledTimes(0);
	});
});

describe('Function interactMission()', function () {
	let req: Request;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;
		req.params = {
			dinozId: DinozSecondMission.id.toString()
		};
		req.body = {
			missionId: npcList.PAPY.missions![1].missionId,
			task: 'talkTo'
		};

		DinozDao.getDinozMissionsInfo = jasmine.createSpy().and.returnValue(DinozSecondMission);
		MissionDao.updateMissionStep = jasmine.createSpy();
	});

	it('TalkTo case', async function () {
		try {
			await interactMission(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledWith(DinozSecondMission.id);

		expect(MissionDao.updateMissionStep).toHaveBeenCalledTimes(1);
		expect(MissionDao.updateMissionStep).toHaveBeenCalledWith(
			DinozSecondMission.id,
			DinozSecondMission.missions[1].missionId,
			DinozSecondMission.missions[1].step + 1
		);
	});

	it('Do case', async function () {
		const dinozDo = cloneDeep(DinozSecondMission);
		dinozDo.missions[1].missionId = 7;
		dinozDo.missions[1].step = 1;
		dinozDo.placeId = placeList.FOUTAINE_DE_JOUVENCE.placeId;
		req.body.task = 'do';
		req.body.missionId = npcList.PAPY.missions![6].missionId;
		DinozDao.getDinozMissionsInfo = jasmine.createSpy().and.returnValue(dinozDo);

		try {
			await interactMission(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledWith(DinozSecondMission.id);

		expect(MissionDao.updateMissionStep).toHaveBeenCalledTimes(1);
		expect(MissionDao.updateMissionStep).toHaveBeenCalledWith(DinozSecondMission.id, 7, 2);
	});
});

describe('Function endMission()', function () {
	let req: Request;

	beforeEach(function () {
		jest.clearAllMocks();
		req = mockRequest;
		req.params = {
			dinozId: DinozSecondMission.id.toString()
		};
		req.body = {
			missionId: npcList.PAPY.missions![1].missionId
		};

		parser.rewarder = jasmine.createSpy();
		MissionDao.finishMission = jasmine.createSpy();
		DinozDao.getDinozMissionsInfo = jasmine.createSpy().and.returnValue(DinozSecondMission);
	});

	it('Nominal case', async function () {
		try {
			await endMission(req);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledWith(DinozSecondMission.id);

		expect(parser.rewarder).toHaveBeenCalledTimes(1);
		expect(parser.rewarder).toHaveBeenCalledWith(missionRewards, DinozSecondMission);

		expect(MissionDao.finishMission).toHaveBeenCalledTimes(1);
		expect(MissionDao.finishMission).toHaveBeenCalledWith(DinozSecondMission.id, npcList.PAPY.missions![1].missionId);
	});

	it('CheckMission: not my dinoz case', async function () {
		const wrongPlayer = cloneDeep(DinozSecondMission);
		wrongPlayer.player.id = player.id_2;
		DinozDao.getDinozMissionsInfo = jasmine.createSpy().and.returnValue(wrongPlayer);
		try {
			await endMission(req);
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`Dinoz ${DinozNPCData.id} doesn't belong to player ${player.id_1}`);
		}

		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledWith(DinozSecondMission.id);

		expect(parser.rewarder).toHaveBeenCalledTimes(0);

		expect(MissionDao.finishMission).toHaveBeenCalledTimes(0);
	});

	it('CheckMission: mission not started', async function () {
		req.body.missionId = npcList.PAPY.missions![3].missionId;
		try {
			await endMission(req);
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`This mission is not started yet`);
		}

		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledWith(DinozSecondMission.id);

		expect(parser.rewarder).toHaveBeenCalledTimes(0);

		expect(MissionDao.finishMission).toHaveBeenCalledTimes(0);
	});

	it('CheckMission: mission already done', async function () {
		req.body.missionId = npcList.PAPY.missions![0].missionId;
		try {
			await endMission(req);
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`This mission is already over`);
		}

		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledWith(DinozSecondMission.id);

		expect(parser.rewarder).toHaveBeenCalledTimes(0);

		expect(MissionDao.finishMission).toHaveBeenCalledTimes(0);
	});

	it('CheckMission: dinoz not at the good place', async function () {
		const wrongPlace = cloneDeep(DinozSecondMission);
		wrongPlace.placeId = 1;
		DinozDao.getDinozMissionsInfo = jasmine.createSpy().and.returnValue(wrongPlace);
		try {
			await endMission(req);
		} catch (err) {
			const e: Error = err as Error;
			expect(e.message).toBe(`The dinoz is not at the expected place.`);
		}

		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledTimes(1);
		expect(DinozDao.getDinozMissionsInfo).toHaveBeenCalledWith(DinozSecondMission.id);

		expect(parser.rewarder).toHaveBeenCalledTimes(0);

		expect(MissionDao.finishMission).toHaveBeenCalledTimes(0);
	});
});

describe('Function getMissionAction()', function () {
	beforeEach(function () {
		jest.clearAllMocks();
	});

	it('Nominal case', async function () {
		try {
			await getMissionAction(DinozSecondMission);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}
	});

	it('Kill case', async function () {
		try {
			await getMissionAction(DinozKillMission);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}
	});
});

describe('Function getHUDObjective()', function () {
	beforeEach(function () {
		jest.clearAllMocks();
	});

	it('Nominal case', async function () {
		try {
			await getHUDObjective(DinozSecondMission);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}
	});

	it('Kill case', async function () {
		try {
			await getHUDObjective(DinozKillMission);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}
	});

	it('Finish case', async function () {
		const DinozFinishMission = cloneDeep(DinozSecondMission);
		DinozFinishMission.missions[1].step = 3;
		try {
			await getHUDObjective(DinozFinishMission);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}
	});

	it('Goto normal place case', async function () {
		const DinozGOTOMission = cloneDeep(DinozSecondMission);
		DinozGOTOMission.missions[1].step = 2;
		DinozGOTOMission.placeId = placeList.PORT_DE_PRECHE.placeId;
		try {
			await getHUDObjective(DinozGOTOMission);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}
	});

	it('Goto hidden place case', async function () {
		const DinozGOTOMission = cloneDeep(DinozSecondMission);
		DinozGOTOMission.missions[1].step = 1;
		try {
			await getHUDObjective(DinozGOTOMission);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}
	});
});

describe('Function checkMissionFight()', function () {
	beforeEach(function () {
		jest.clearAllMocks();
		MissionDao.updateMissionProgression = jasmine.createSpy();
		MissionDao.updateMissionStep = jasmine.createSpy();
	});

	it('Nominal case', async function () {
		try {
			await checkMissionFight(DinozKillMission, fightResultlvl1Win);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		expect(MissionDao.updateMissionProgression).toHaveBeenCalledTimes(1);
		expect(MissionDao.updateMissionProgression).toHaveBeenCalledWith(
			DinozKillMission.id,
			npcList.PAPY.missions![2].missionId,
			1
		);
		expect(MissionDao.updateMissionStep).toHaveBeenCalledTimes(0);
	});

	it('Step is finished', async function () {
		const dinozOver = cloneDeep(DinozKillMission);
		dinozOver.missions[2].progress = 5;
		try {
			await checkMissionFight(dinozOver, fightResultlvl1Win);
		} catch (err) {
			const e: Error = err as Error;
			console.log(e.message);
			expect(e.message).toBe(`An unexpected error occurred during the test, check the test logs`);
		}

		expect(MissionDao.updateMissionProgression).toHaveBeenCalledTimes(1);
		expect(MissionDao.updateMissionProgression).toHaveBeenCalledWith(
			dinozOver.id,
			npcList.PAPY.missions![2].missionId,
			1
		);

		expect(MissionDao.updateMissionStep).toHaveBeenCalledTimes(1);
		expect(MissionDao.updateMissionStep).toHaveBeenCalledWith(dinozOver.id, npcList.PAPY.missions![2].missionId, 1);
	});
});
*/
