import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { ConditionEnum } from '@drpg/core/models/enums/Parser';
import { MissionsStatus } from '@drpg/core/models/enums/MissionsStatus';
import { FighterType } from '@drpg/core/models/fight/DetailedFighter';
import { monsterList } from '@drpg/core/models/fight/MonsterList';
import { Reward } from '@drpg/core/models/reward/RewardList';
import { makeRequest } from '../helpers/req.js';

// Mock every DAO/util/service the mission logic reaches, plus the core npc/place lookups and
// getActualStep, so each branch can be driven deterministically without a database.
vi.mock('../../dao/playerDao.js', () => ({ auth: vi.fn() }));
vi.mock('../../dao/dinozDao.js', () => ({
	getDinozFicheRequest: vi.fn(),
	getDinozFightDataRequest: vi.fn(),
	getDinozMissionsInfo: vi.fn(),
	getGlobalMissionsData: vi.fn()
}));
vi.mock('../../dao/dinozMissionDao.js', () => ({
	addMissionToDinoz: vi.fn(),
	finishMission: vi.fn(),
	removeMissionFromDinoz: vi.fn(),
	updateMissionProgression: vi.fn(),
	updateMissionStep: vi.fn()
}));
vi.mock('../../dao/playerRewardsDao.js', () => ({ getPlayerRewards: vi.fn() }));
vi.mock('../../dao/playerItemDao.js', () => ({ decreaseItemQuantity: vi.fn(), getPlayerItems: vi.fn() }));
vi.mock('../../utils/rewarder.js', () => ({ rewarder: vi.fn() }));
vi.mock('../../utils/server/translate.js', () => ({ default: vi.fn((key: string) => key) }));
vi.mock('../../business/fightService.js', () => ({
	calculateFightVsMonsters: vi.fn(),
	rewardFightVsMonsters: vi.fn()
}));
vi.mock('@drpg/core/utils/checkCondition', () => ({ checkCondition: vi.fn() }));
vi.mock('@drpg/core/utils/MissionUtils', () => ({ getActualStep: vi.fn() }));
vi.mock('@drpg/core/models/npc/NpcList', () => ({ npcList: {} }));
vi.mock('@drpg/core/models/place/PlaceList', () => ({ placeList: {}, PlacesByMap: {} }));

import { auth } from '../../dao/playerDao.js';
import {
	getDinozFicheRequest,
	getDinozFightDataRequest,
	getDinozMissionsInfo,
	getGlobalMissionsData
} from '../../dao/dinozDao.js';
import {
	addMissionToDinoz,
	finishMission,
	removeMissionFromDinoz,
	updateMissionProgression,
	updateMissionStep
} from '../../dao/dinozMissionDao.js';
import { getPlayerRewards } from '../../dao/playerRewardsDao.js';
import { decreaseItemQuantity, getPlayerItems } from '../../dao/playerItemDao.js';
import { rewarder } from '../../utils/rewarder.js';
import { calculateFightVsMonsters, rewardFightVsMonsters } from '../../business/fightService.js';
import { checkCondition } from '@drpg/core/utils/checkCondition';
import { getActualStep } from '@drpg/core/utils/MissionUtils';
import { npcList } from '@drpg/core/models/npc/NpcList';
import { placeList, PlacesByMap } from '@drpg/core/models/place/PlaceList';
import {
	getMissionsList,
	updateMission,
	startFightMission,
	interactMission,
	endMission,
	getMissionAction,
	checkMissionFight,
	checkProgressEnd,
	getGlobalMissions
} from '../../business/missionsService.js';

const mockAuth = vi.mocked(auth);
const mockGetMissionsInfo = vi.mocked(getDinozMissionsInfo);
const mockGetFiche = vi.mocked(getDinozFicheRequest);
const mockGetFightData = vi.mocked(getDinozFightDataRequest);
const mockGetGlobalData = vi.mocked(getGlobalMissionsData);
const mockAddMission = vi.mocked(addMissionToDinoz);
const mockFinishMission = vi.mocked(finishMission);
const mockRemoveMission = vi.mocked(removeMissionFromDinoz);
const mockUpdateProgression = vi.mocked(updateMissionProgression);
const mockUpdateStep = vi.mocked(updateMissionStep);
const mockGetRewards = vi.mocked(getPlayerRewards);
const mockGetItems = vi.mocked(getPlayerItems);
const mockDecreaseItem = vi.mocked(decreaseItemQuantity);
const mockRewarder = vi.mocked(rewarder);
const mockCalcFight = vi.mocked(calculateFightVsMonsters);
const mockRewardFight = vi.mocked(rewardFightVsMonsters);
const mockCheckCondition = vi.mocked(checkCondition);
const mockGetActualStep = vi.mocked(getActualStep);

const DINOZ_ID = 42;
const PLACE_ID = 1;
const OTHER_PLACE = 2;
const NPC_NAME = 'gardener';
const MISSION_ID = 100;
const REWARDS = [{ rewardType: 'item', value: 7, quantity: 1 }];

// A single NPC offering one mission with three steps (talk -> fight -> give item).
const baseNpc = {
	name: NPC_NAME,
	placeId: PLACE_ID,
	missions: [
		{
			missionId: MISSION_ID,
			missionName: 'TestMission',
			rewards: REWARDS,
			steps: [
				{
					stepId: 0,
					place: PLACE_ID,
					displayedAction: 'talk',
					displayedText: 'hello',
					requirement: { actionType: ConditionEnum.TALKTO, target: 'x' }
				},
				{
					stepId: 1,
					place: PLACE_ID,
					displayedAction: 'fight',
					requirement: { actionType: ConditionEnum.LAUNCH_FIGHT, mobList: [{ id: 1 }], target: 'x' }
				},
				{
					stepId: 2,
					place: PLACE_ID,
					displayedAction: 'give',
					displayedText: 'gimme',
					requirement: { actionType: ConditionEnum.GIVE_ITEM, item: { itemId: 50 }, itemQuantity: 2, target: 'x' }
				}
			]
		}
	]
};

/** Player as returned by getDinozMissionsInfo; `step` selects which mission step the dinoz is on. */
function missionPlayer(
	step = 0,
	overrides: Record<string, unknown> = {},
	missionOverrides: Record<string, unknown> = {}
) {
	return {
		id: 'player-1',
		dinoz: [
			{
				id: DINOZ_ID,
				placeId: PLACE_ID,
				canChangeName: false,
				missions: [{ missionId: MISSION_ID, step, isFinished: false, progress: 0, ...missionOverrides }],
				...overrides
			}
		]
	} as never;
}

function req(params: Record<string, string> = {}, body: Record<string, unknown> = {}) {
	return makeRequest({ params: { dinozId: String(DINOZ_ID), id: String(DINOZ_ID), npc: NPC_NAME, ...params }, body });
}

beforeEach(() => {
	vi.clearAllMocks();
	mockAuth.mockResolvedValue({ id: 'player-1' } as Awaited<ReturnType<typeof auth>>);
	mockCheckCondition.mockReturnValue(true);
	// Reset the mocked core lookups to fresh fixtures for each test.
	Object.keys(npcList).forEach(k => delete (npcList as Record<string, unknown>)[k]);
	Object.keys(placeList).forEach(k => delete (placeList as Record<string, unknown>)[k]);
	Object.keys(PlacesByMap).forEach(k => delete (PlacesByMap as Record<string, unknown>)[k]);
	(npcList as Record<string, unknown>)[NPC_NAME] = structuredClone(baseNpc);
	(placeList as Record<string, unknown>).town = { placeId: PLACE_ID, name: 'town' };
});

describe('getMissionsList', () => {
	it('returns the npc missions with their computed status', async () => {
		mockGetMissionsInfo.mockResolvedValue(missionPlayer(0, { missions: [] }));
		const result = await getMissionsList(req());
		expect(result).toEqual([{ missionId: MISSION_ID, status: MissionsStatus.AVAILABLE }]);
	});

	it('throws when the dinoz still needs a name', async () => {
		mockGetMissionsInfo.mockResolvedValue(missionPlayer(0, { canChangeName: true, missions: [] }));
		await expect(getMissionsList(req())).rejects.toThrow('has to be named');
	});

	it('throws when the npc is not at the dinoz place', async () => {
		(npcList as Record<string, unknown>)[NPC_NAME] = { ...structuredClone(baseNpc), placeId: OTHER_PLACE };
		mockGetMissionsInfo.mockResolvedValue(missionPlayer(0, { missions: [] }));
		await expect(getMissionsList(req())).rejects.toThrow('cannot talk to this NPC');
	});

	it('throws when the player does not exist', async () => {
		mockGetMissionsInfo.mockResolvedValue(null);
		await expect(getMissionsList(req())).rejects.toThrow("doesn't exist");
	});
});

describe('updateMission', () => {
	const startReq = (status: string) => req({ dinozId: String(DINOZ_ID), missionId: String(MISSION_ID) }, { status });

	it('starts an available mission', async () => {
		mockGetMissionsInfo.mockResolvedValue(missionPlayer(0, { missions: [] }));
		const result = await updateMission(startReq('start'));
		expect(result).toBe(true);
		expect(mockAddMission).toHaveBeenCalledOnce();
	});

	it('refuses to start when a mission is already ongoing', async () => {
		mockGetMissionsInfo.mockResolvedValue(missionPlayer(0));
		await expect(updateMission(startReq('start'))).rejects.toThrow('already in progress');
	});

	it('stops an ongoing mission', async () => {
		mockGetMissionsInfo.mockResolvedValue(missionPlayer(0));
		const result = await updateMission(startReq('stop'));
		expect(result).toBe(true);
		expect(mockRemoveMission).toHaveBeenCalledWith('player-1', DINOZ_ID, MISSION_ID);
	});

	it('rejects an unknown status', async () => {
		mockGetMissionsInfo.mockResolvedValue(missionPlayer(0, { missions: [] }));
		await expect(updateMission(startReq('weird'))).rejects.toThrow("don't exist");
	});
});

describe('interactMission', () => {
	const interactReq = () => req({ dinozId: String(DINOZ_ID) }, { missionId: MISSION_ID });

	it('advances a talk step', async () => {
		mockGetMissionsInfo.mockResolvedValue(missionPlayer(0));
		const result = await interactMission(interactReq());
		expect(mockUpdateStep).toHaveBeenCalledWith('player-1', [DINOZ_ID], MISSION_ID, 1);
		expect(result).toBe('TestMission.hello');
	});

	it('consumes the required item on a give-item step', async () => {
		mockGetMissionsInfo.mockResolvedValue(missionPlayer(2));
		mockGetItems.mockResolvedValue([{ quantity: 5 }] as never);
		const result = await interactMission(interactReq());
		expect(mockDecreaseItem).toHaveBeenCalledWith('player-1', 50, 2);
		expect(mockUpdateStep).toHaveBeenCalledWith('player-1', [DINOZ_ID], MISSION_ID, 3);
		expect(result).toBe('TestMission.gimme');
	});

	it('throws when the dinoz lacks the required item', async () => {
		mockGetMissionsInfo.mockResolvedValue(missionPlayer(2));
		mockGetItems.mockResolvedValue([{ quantity: 1 }] as never);
		await expect(interactMission(interactReq())).rejects.toThrow('notEnoughItem');
		expect(mockDecreaseItem).not.toHaveBeenCalled();
	});
});

describe('startFightMission', () => {
	const fightReq = () => req({ dinozId: String(DINOZ_ID) }, { missionId: MISSION_ID });

	it('returns early when the current step is not a launch-fight step', async () => {
		mockGetMissionsInfo.mockResolvedValue(missionPlayer(0)); // step 0 is TALKTO
		const result = await startFightMission(fightReq());
		expect(result).toBeUndefined();
		expect(mockCalcFight).not.toHaveBeenCalled();
	});

	it('runs the fight and advances the step on a launch-fight step', async () => {
		mockGetMissionsInfo.mockResolvedValue(missionPlayer(1)); // step 1 is LAUNCH_FIGHT
		mockGetFiche.mockResolvedValue({ dinoz: [{ id: DINOZ_ID, leaderId: null }] } as never);
		mockGetFightData.mockResolvedValue({ dinoz: [{ id: DINOZ_ID, placeId: PLACE_ID }] } as never);
		mockCalcFight.mockReturnValue({ rounds: [] } as never);
		mockRewardFight.mockResolvedValue({ result: true } as never);

		const result = await startFightMission(fightReq());

		expect(mockCalcFight).toHaveBeenCalledOnce();
		expect(mockUpdateStep).toHaveBeenCalledWith('player-1', [DINOZ_ID], MISSION_ID, 2);
		expect(result).toEqual({ result: true });
	});
});

describe('endMission', () => {
	it('grants the mission rewards and finishes the mission', async () => {
		mockGetMissionsInfo.mockResolvedValue(missionPlayer(0));
		mockRewarder.mockResolvedValue([] as never);

		const result = await endMission(req({ dinozId: String(DINOZ_ID) }, { missionId: MISSION_ID }));

		expect(mockRewarder).toHaveBeenCalledOnce();
		expect(mockFinishMission).toHaveBeenCalledWith('player-1', DINOZ_ID, MISSION_ID);
		expect(result).toEqual(REWARDS);
	});

	it('throws when the mission was never started', async () => {
		mockGetMissionsInfo.mockResolvedValue(missionPlayer(0, { missions: [] }));
		await expect(endMission(req({ dinozId: String(DINOZ_ID) }, { missionId: MISSION_ID }))).rejects.toThrow(
			'not started'
		);
	});
});

describe('getMissionAction', () => {
	it('returns the displayed action when the dinoz is on the step place', () => {
		mockGetActualStep.mockReturnValue({ place: PLACE_ID, displayedAction: 'gather', requirement: {} } as never);
		expect(getMissionAction({ placeId: PLACE_ID, missions: [] })).toBe('gather');
	});

	it('returns undefined for a kill action', () => {
		mockGetActualStep.mockReturnValue({ place: PLACE_ID, displayedAction: 'kill goupignon', requirement: {} } as never);
		expect(getMissionAction({ placeId: PLACE_ID, missions: [] })).toBeUndefined();
	});

	it('returns undefined when the dinoz is elsewhere', () => {
		mockGetActualStep.mockReturnValue({ place: OTHER_PLACE, displayedAction: 'gather', requirement: {} } as never);
		expect(getMissionAction({ placeId: PLACE_ID, missions: [] })).toBeUndefined();
	});

	it('returns undefined when there is no active step', () => {
		mockGetActualStep.mockReturnValue(undefined as never);
		expect(getMissionAction({ placeId: PLACE_ID, missions: [] })).toBeUndefined();
	});
});

describe('checkProgressEnd', () => {
	const killStep = {
		stepId: 0,
		place: PLACE_ID,
		displayedAction: 'kill',
		requirement: { actionType: ConditionEnum.KILL, target: ['Goupignon'], value: 3, zone: 'z' }
	} as never;
	const dinoz = (progress = 0) =>
		({
			id: DINOZ_ID,
			playerId: 'player-1',
			missions: [{ missionId: MISSION_ID, isFinished: false, progress }]
		}) as never;

	it('advances the step once the kill target is reached', async () => {
		await checkProgressEnd(dinoz(2), { result: true } as never, killStep, 1);
		expect(mockUpdateStep).toHaveBeenCalledWith('player-1', [DINOZ_ID], MISSION_ID, 1);
	});

	it('does not advance the step while below the target', async () => {
		await checkProgressEnd(dinoz(0), { result: true } as never, killStep, 1);
		expect(mockUpdateStep).not.toHaveBeenCalled();
	});

	it('ignores non-kill steps', async () => {
		const talkStep = { stepId: 0, requirement: { actionType: ConditionEnum.TALKTO } } as never;
		await checkProgressEnd(dinoz(9), { result: true } as never, talkStep, 5);
		expect(mockUpdateStep).not.toHaveBeenCalled();
	});

	it('throws when the dinoz has no player', async () => {
		const orphan = { id: DINOZ_ID, playerId: null, missions: [] } as never;
		await expect(checkProgressEnd(orphan, { result: true } as never, killStep, 1)).rejects.toThrow('No player');
	});
});

describe('checkMissionFight', () => {
	const killStep = {
		stepId: 0,
		place: PLACE_ID,
		displayedAction: 'kill',
		requirement: { actionType: ConditionEnum.KILL, target: ['Goupignon'], value: 3, zone: 'z' }
	};
	const killDinoz = {
		id: DINOZ_ID,
		playerId: 'player-1',
		placeId: PLACE_ID,
		missions: [{ missionId: MISSION_ID, isFinished: false, progress: 0 }]
	};

	it('increments the kill progress for a matching monster', async () => {
		mockGetActualStep.mockReturnValue(killStep as never);
		(PlacesByMap as Record<string, number[]>).z = [PLACE_ID];
		const fight = { result: true, fighters: [{ name: 'Goupignon', type: FighterType.MONSTER }] } as never;

		await checkMissionFight(killDinoz as never, fight);

		expect(mockUpdateProgression).toHaveBeenCalledWith(DINOZ_ID, MISSION_ID, { progress: { increment: 1 } });
	});

	it('does nothing when the fight was lost', async () => {
		mockGetActualStep.mockReturnValue(killStep as never);
		(PlacesByMap as Record<string, number[]>).z = [PLACE_ID];
		const fight = { result: false, fighters: [{ name: 'Goupignon', type: FighterType.MONSTER }] } as never;

		await checkMissionFight(killDinoz as never, fight);

		expect(mockUpdateProgression).not.toHaveBeenCalled();
	});

	it('throws when there is no active mission step', async () => {
		mockGetActualStep.mockReturnValue(undefined as never);
		await expect(checkMissionFight(killDinoz as never, { result: true, fighters: [] } as never)).rejects.toThrow(
			'No mission found'
		);
	});
});

describe('getGlobalMissions', () => {
	it('throws when the player has no PMI reward', async () => {
		mockGetRewards.mockResolvedValue([] as never);
		await expect(getGlobalMissions(req())).rejects.toThrow('no PMI');
	});

	it('returns each dinoz with its finished missions grouped by npc', async () => {
		mockGetRewards.mockResolvedValue([{ rewardId: Reward.PMI }] as never);
		mockGetGlobalData.mockResolvedValue([
			{
				id: DINOZ_ID,
				name: 'Rex',
				display: 'disp',
				missions: [{ missionId: MISSION_ID, isFinished: true }]
			}
		] as never);

		const result = await getGlobalMissions(req());

		expect(result).toEqual([
			{
				id: DINOZ_ID,
				name: 'Rex',
				display: 'disp',
				missions: [{ npc: NPC_NAME, missions: [{ id: MISSION_ID, name: 'TestMission' }] }]
			}
		]);
	});
});

describe('missionsService - guards and extra branches', () => {
	const idReq = (body: Record<string, unknown> = {}) =>
		req({ dinozId: String(DINOZ_ID), missionId: String(MISSION_ID) }, body);

	it('getMissionsList throws when the place is unknown', async () => {
		delete (placeList as Record<string, unknown>).town;
		mockGetMissionsInfo.mockResolvedValue(missionPlayer(0, { missions: [] }));
		await expect(getMissionsList(req())).rejects.toThrow("Place 1 doesn't exist");
	});

	it('getMissionsList throws when the npc has no missions', async () => {
		(npcList as Record<string, unknown>)[NPC_NAME] = { name: NPC_NAME, placeId: PLACE_ID };
		mockGetMissionsInfo.mockResolvedValue(missionPlayer(0, { missions: [] }));
		await expect(getMissionsList(req())).rejects.toThrow("doesn't have any missions");
	});

	it('getMissionsList reports finished and unavailable statuses', async () => {
		// One npc offering two missions: one already finished, one gated by an unmet condition.
		(npcList as Record<string, unknown>)[NPC_NAME] = {
			name: NPC_NAME,
			placeId: PLACE_ID,
			missions: [
				{ missionId: MISSION_ID, missionName: 'A', rewards: REWARDS, steps: [] },
				{ missionId: 200, missionName: 'B', condition: { foo: 1 }, rewards: REWARDS, steps: [] }
			]
		};
		mockCheckCondition.mockReturnValue(false);
		mockGetMissionsInfo.mockResolvedValue(
			missionPlayer(0, { missions: [{ missionId: MISSION_ID, step: 0, isFinished: true, progress: 0 }] })
		);
		const result = await getMissionsList(req());
		expect(result).toEqual([
			{ missionId: MISSION_ID, status: MissionsStatus.FINISHED },
			{ missionId: 200, status: MissionsStatus.UNAVAILABLE }
		]);
	});

	it('updateMission refuses to start an already finished mission', async () => {
		mockGetMissionsInfo.mockResolvedValue(
			missionPlayer(0, { missions: [{ missionId: MISSION_ID, step: 0, isFinished: true, progress: 0 }] })
		);
		await expect(updateMission(idReq({ status: 'start' }))).rejects.toThrow('already done');
	});

	it('updateMission refuses to start from the wrong place', async () => {
		(npcList as Record<string, unknown>)[NPC_NAME] = { ...structuredClone(baseNpc), placeId: OTHER_PLACE };
		mockGetMissionsInfo.mockResolvedValue(missionPlayer(0, { missions: [] }));
		await expect(updateMission(idReq({ status: 'start' }))).rejects.toThrow('cannot talk to this NPC');
	});

	it('updateMission refuses to stop when nothing is in progress', async () => {
		mockGetMissionsInfo.mockResolvedValue(missionPlayer(0, { missions: [] }));
		await expect(updateMission(idReq({ status: 'stop' }))).rejects.toThrow('no mission in progress');
	});

	it('updateMission throws when the mission belongs to no npc', async () => {
		Object.keys(npcList).forEach(k => delete (npcList as Record<string, unknown>)[k]);
		mockGetMissionsInfo.mockResolvedValue(missionPlayer(0, { missions: [] }));
		await expect(updateMission(idReq({ status: 'start' }))).rejects.toThrow("doesn't exist");
	});

	it('interactMission returns error for an unsupported action', async () => {
		mockGetMissionsInfo.mockResolvedValue(missionPlayer(1)); // the launch-fight step is not handled here
		const result = await interactMission(req({ dinozId: String(DINOZ_ID) }, { missionId: MISSION_ID }));
		expect(result).toBe('error');
	});

	it('endMission throws when the mission is already over', async () => {
		mockGetMissionsInfo.mockResolvedValue(
			missionPlayer(0, { missions: [{ missionId: MISSION_ID, step: 0, isFinished: true, progress: 0 }] })
		);
		await expect(endMission(req({ dinozId: String(DINOZ_ID) }, { missionId: MISSION_ID }))).rejects.toThrow(
			'already over'
		);
	});

	it('checkMissionFight counts every monster for an ANY target', async () => {
		mockGetActualStep.mockReturnValue({
			stepId: 0,
			place: PLACE_ID,
			displayedAction: 'kill',
			requirement: { actionType: ConditionEnum.KILL, target: [monsterList.ANY.name], value: 5, zone: 'z' }
		} as never);
		(PlacesByMap as Record<string, number[]>).z = [PLACE_ID];
		const fight = {
			result: true,
			fighters: [
				{ name: 'Whatever', type: FighterType.MONSTER },
				{ name: 'Else', type: FighterType.MONSTER }
			]
		} as never;

		await checkMissionFight(
			{
				id: DINOZ_ID,
				playerId: 'player-1',
				placeId: PLACE_ID,
				missions: [{ missionId: MISSION_ID, isFinished: false, progress: 0 }]
			} as never,
			fight
		);

		expect(mockUpdateProgression).toHaveBeenCalledWith(DINOZ_ID, MISSION_ID, { progress: { increment: 2 } });
	});
});
