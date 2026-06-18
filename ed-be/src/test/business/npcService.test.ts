import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { makeRequest } from '../helpers/req.js';

// Strategy B (see dinozShopService.test): mock the DAO/util/service modules so the business
// logic runs without a database, and mock the core `npcList`/`placeList`/`checkCondition`
// lookups so each conversation branch can be driven deterministically from the test.
vi.mock('../../dao/playerDao.js', () => ({
	auth: vi.fn()
}));
vi.mock('../../dao/dinozDao.js', () => ({
	getDinozNPCRequest: vi.fn(),
	getDinozFightDataRequest: vi.fn()
}));
vi.mock('../../dao/npcDao.js', () => ({
	createDinozStep: vi.fn(),
	updateDinozStep: vi.fn()
}));
vi.mock('../../utils/rewarder.js', () => ({
	rewarder: vi.fn()
}));
vi.mock('../../utils/server/translate.js', () => ({
	default: vi.fn((key: string) => key)
}));
vi.mock('../../business/fightService.js', () => ({
	calculateFightVsMonsters: vi.fn(),
	rewardFightVsMonsters: vi.fn()
}));
vi.mock('@drpg/core/utils/checkCondition', () => ({
	checkCondition: vi.fn()
}));
vi.mock('@drpg/core/models/npc/NpcList', () => ({
	npcList: {}
}));
vi.mock('@drpg/core/models/place/PlaceList', () => ({
	placeList: {}
}));

import { auth } from '../../dao/playerDao.js';
import { getDinozNPCRequest, getDinozFightDataRequest } from '../../dao/dinozDao.js';
import { createDinozStep, updateDinozStep } from '../../dao/npcDao.js';
import { rewarder } from '../../utils/rewarder.js';
import { calculateFightVsMonsters, rewardFightVsMonsters } from '../../business/fightService.js';
import { checkCondition } from '@drpg/core/utils/checkCondition';
import { npcList } from '@drpg/core/models/npc/NpcList';
import { placeList } from '@drpg/core/models/place/PlaceList';
import { getNpcSpeech } from '../../business/npcService.js';

const mockAuth = vi.mocked(auth);
const mockGetNPC = vi.mocked(getDinozNPCRequest);
const mockGetFightData = vi.mocked(getDinozFightDataRequest);
const mockCreateStep = vi.mocked(createDinozStep);
const mockUpdateStep = vi.mocked(updateDinozStep);
const mockRewarder = vi.mocked(rewarder);
const mockCalcFight = vi.mocked(calculateFightVsMonsters);
const mockRewardFight = vi.mocked(rewardFightVsMonsters);
const mockCheckCondition = vi.mocked(checkCondition);

const PLACE_ID = 1;
const NPC_ID = 10;
const DINOZ_ID = 42;

// A small NPC graph: begin → (choice1 → end | choiceReward | choiceFight | choiceAlias).
// `npc` is re-cloned from this template in `beforeEach` so per-test mutations never leak.
const baseNpc = {
	name: 'michel',
	id: NPC_ID,
	placeId: PLACE_ID,
	flashvars: 'fv',
	data: {
		begin: { stepName: 'begin', initialStep: true, nextStep: ['choice1', 'choiceReward'] },
		choice1: { stepName: 'choice1', nextStep: ['end'] },
		choiceReward: { stepName: 'choiceReward', nextStep: [], reward: [{ rewardType: 'item' }] },
		choiceFight: { stepName: 'choiceFight', nextStep: ['victory'], fight: [{ id: 1 }] },
		choiceAlias: { stepName: 'choiceAlias', alias: 'shortcut', nextStep: [] },
		choiceTarget: { stepName: 'choiceTarget', target: 'end', nextStep: [] },
		end: { stepName: 'end', nextStep: [] },
		victory: { stepName: 'victory', nextStep: [] },
		stop: { stepName: 'stop', nextStep: ['begin'] }
	}
};
let npc: typeof baseNpc;

/** Builds the `player` object returned by `getDinozNPCRequest`. */
function buildPlayer(overrides: Partial<Record<string, unknown>> = {}, npcs: { npcId: number; step: string }[] = []) {
	return {
		id: 'player-1',
		dinoz: [
			{
				id: DINOZ_ID,
				canChangeName: false,
				placeId: PLACE_ID,
				npcs,
				...overrides
			}
		]
	};
}

function req(body: Record<string, unknown> = {}) {
	return makeRequest({
		params: { dinozId: String(DINOZ_ID), npc: 'michel' },
		body
	});
}

beforeEach(() => {
	vi.clearAllMocks();
	mockAuth.mockResolvedValue({ id: 'player-1' } as Awaited<ReturnType<typeof auth>>);
	// Most branches assume conditions are met; individual tests override as needed.
	mockCheckCondition.mockReturnValue(true);
	// Reset the mocked core lists to a fresh clone of the fixtures for each test.
	npc = structuredClone(baseNpc);
	Object.keys(npcList).forEach(k => delete (npcList as Record<string, unknown>)[k]);
	Object.keys(placeList).forEach(k => delete (placeList as Record<string, unknown>)[k]);
	(npcList as Record<string, unknown>).michel = npc;
	(placeList as Record<string, unknown>).town = { placeId: PLACE_ID, name: 'town' };
});

describe('getNpcSpeech - guard clauses', () => {
	it('throws when the player does not exist', async () => {
		mockGetNPC.mockResolvedValue(null);
		await expect(getNpcSpeech(req())).rejects.toThrow(ExpectedError);
	});

	it('throws when the dinoz is not in the player team', async () => {
		mockGetNPC.mockResolvedValue(buildPlayer({ id: 999 }) as never);
		await expect(getNpcSpeech(req())).rejects.toThrow('Dinoz is not here');
	});

	it('throws when the dinoz still needs to be named', async () => {
		mockGetNPC.mockResolvedValue(buildPlayer({ canChangeName: true }) as never);
		await expect(getNpcSpeech(req())).rejects.toThrow('has to be named');
	});

	it('throws when the place does not exist', async () => {
		delete (placeList as Record<string, unknown>).town;
		mockGetNPC.mockResolvedValue(buildPlayer() as never);
		await expect(getNpcSpeech(req())).rejects.toThrow("Place 1 doesn't exist");
	});

	it('throws when the NPC does not exist', async () => {
		delete (npcList as Record<string, unknown>).michel;
		mockGetNPC.mockResolvedValue(buildPlayer() as never);
		await expect(getNpcSpeech(req())).rejects.toThrow("NPC michel doesn't exists");
	});

	it('throws when the dinoz does not meet the NPC condition', async () => {
		(npcList as Record<string, unknown>).michel = { ...npc, condition: { minLevel: 5 } };
		mockGetNPC.mockResolvedValue(buildPlayer() as never);
		mockCheckCondition.mockReturnValue(false);
		await expect(getNpcSpeech(req())).rejects.toThrow('requirement to talk');
	});

	it('throws when the dinoz is not on the same place as the NPC', async () => {
		(placeList as Record<string, unknown>).town = { placeId: PLACE_ID, name: 'town' };
		(npcList as Record<string, unknown>).michel = { ...npc, placeId: 999 };
		mockGetNPC.mockResolvedValue(buildPlayer() as never);
		await expect(getNpcSpeech(req())).rejects.toThrow('cannot talk to this NPC');
	});

	it('throws when no valid initial step is found', async () => {
		// The only initial step carries a condition that is not met.
		(npc.data.begin as Record<string, unknown>).condition = { minLevel: 99 };
		mockGetNPC.mockResolvedValue(buildPlayer() as never);
		mockCheckCondition.mockImplementation((condition: unknown) => condition === undefined);
		await expect(getNpcSpeech(req({ step: 'begin' }))).rejects.toThrow('No valid initial step');
	});

	it('throws when the requested step does not exist', async () => {
		mockGetNPC.mockResolvedValue(buildPlayer() as never);
		await expect(getNpcSpeech(req({ step: 'unknown' }))).rejects.toThrow("step unknown doesn't exist");
	});
});

describe('getNpcSpeech - stop step', () => {
	it('resets the conversation to begin and returns the stop step', async () => {
		mockGetNPC.mockResolvedValue(buildPlayer() as never);
		const result = await getNpcSpeech(req({ stop: true }));
		expect(mockUpdateStep).toHaveBeenCalledWith(DINOZ_ID, NPC_ID, 'begin');
		expect(result).toEqual({ name: 'michel', speech: 'stop', playerChoice: ['begin'] });
	});

	it('throws when the NPC has no stop step', async () => {
		const noStop = { ...npc, data: { ...npc.data } };
		delete (noStop.data as Record<string, unknown>).stop;
		(npcList as Record<string, unknown>).michel = noStop;
		mockGetNPC.mockResolvedValue(buildPlayer() as never);
		await expect(getNpcSpeech(req({ stop: true }))).rejects.toThrow("step stop doesn't exist");
	});
});

describe('getNpcSpeech - first conversation', () => {
	it('creates the NPC entry and returns the initial step with filtered choices', async () => {
		mockGetNPC.mockResolvedValue(buildPlayer() as never);
		mockCreateStep.mockResolvedValue({ npcId: NPC_ID, step: 'begin' } as never);

		const result = await getNpcSpeech(req({ step: 'begin' }));

		expect(mockCreateStep).toHaveBeenCalledWith(DINOZ_ID, { npcId: NPC_ID, step: 'begin' });
		expect(result).toEqual({
			name: 'michel',
			speech: 'begin',
			playerChoice: ['choice1', 'choiceReward']
		});
	});

	it('filters out initial-step choices whose condition is not met', async () => {
		mockGetNPC.mockResolvedValue(buildPlayer() as never);
		mockCreateStep.mockResolvedValue({ npcId: NPC_ID, step: 'begin' } as never);
		// Only `choice1` has no condition object; treat the rest as locked.
		mockCheckCondition.mockImplementation((condition: unknown) => condition === undefined);

		const result = await getNpcSpeech(req({ step: 'begin' }));

		expect(result.playerChoice).toEqual(['choice1', 'choiceReward']);
	});
});

describe('getNpcSpeech - ongoing conversation', () => {
	it('advances to a plain next step and returns choices, flashvars and rewards', async () => {
		mockGetNPC.mockResolvedValue(buildPlayer({}, [{ npcId: NPC_ID, step: 'begin' }]) as never);

		const result = await getNpcSpeech(req({ step: 'choice1' }));

		expect(mockUpdateStep).toHaveBeenCalledWith(DINOZ_ID, NPC_ID, 'choice1');
		expect(result).toMatchObject({
			name: 'michel',
			speech: 'choice1',
			playerChoice: ['end'],
			flashvars: 'fv'
		});
		expect(result.rewards).toEqual({});
	});

	it('resolves an alias to its underlying step name', async () => {
		(npc.data.begin.nextStep as string[]) = ['choiceAlias'];
		mockGetNPC.mockResolvedValue(buildPlayer({}, [{ npcId: NPC_ID, step: 'begin' }]) as never);

		const result = await getNpcSpeech(req({ step: 'shortcut' }));

		expect(result.speech).toBe('choiceAlias');
		expect(mockUpdateStep).toHaveBeenCalledWith(DINOZ_ID, NPC_ID, 'choiceAlias');
	});

	it('resets to the initial step when the requested step is not reachable', async () => {
		// Current step is `choice1`, whose only next step is `end`; ask for `choiceReward`.
		mockGetNPC.mockResolvedValue(buildPlayer({}, [{ npcId: NPC_ID, step: 'choice1' }]) as never);

		const result = await getNpcSpeech(req({ step: 'choiceReward' }));

		expect(mockUpdateStep).toHaveBeenCalledWith(DINOZ_ID, NPC_ID, 'begin');
		expect(result).toEqual({
			name: 'michel',
			speech: 'begin',
			playerChoice: ['choice1', 'choiceReward']
		});
	});

	it('throws when the stored current step no longer exists', async () => {
		mockGetNPC.mockResolvedValue(buildPlayer({}, [{ npcId: NPC_ID, step: 'ghost' }]) as never);
		await expect(getNpcSpeech(req({ step: 'choice1' }))).rejects.toThrow("step ghost doesn't exist");
	});

	it('throws when the requested step condition is not fulfilled', async () => {
		(npc.data.choice1 as Record<string, unknown>).condition = { minLevel: 99 };
		mockGetNPC.mockResolvedValue(buildPlayer({}, [{ npcId: NPC_ID, step: 'begin' }]) as never);
		// NPC condition + reachability pass; only the step condition fails.
		mockCheckCondition.mockImplementation((condition: unknown) => condition === undefined);

		await expect(getNpcSpeech(req({ step: 'choice1' }))).rejects.toThrow("doesn't fullfill the conditions");
	});

	it('redirects to the target step when the requested step has a target', async () => {
		(npc.data.begin.nextStep as string[]) = ['choiceTarget'];
		mockGetNPC.mockResolvedValue(buildPlayer({}, [{ npcId: NPC_ID, step: 'begin' }]) as never);

		const result = await getNpcSpeech(req({ step: 'choiceTarget' }));

		expect(result.speech).toBe('end');
		expect(mockUpdateStep).toHaveBeenCalledWith(DINOZ_ID, NPC_ID, 'end');
	});

	it('throws when the target step is invalid', async () => {
		(npc.data.begin.nextStep as string[]) = ['choiceTarget'];
		(npc.data.choiceTarget as Record<string, unknown>).target = 'missing';
		mockGetNPC.mockResolvedValue(buildPlayer({}, [{ npcId: NPC_ID, step: 'begin' }]) as never);

		await expect(getNpcSpeech(req({ step: 'choiceTarget' }))).rejects.toThrow('Invalid target');
	});

	it('grants rewards and refreshes the player on a rewarding step', async () => {
		mockGetNPC.mockResolvedValue(buildPlayer({}, [{ npcId: NPC_ID, step: 'begin' }]) as never);
		mockRewarder.mockResolvedValue([['rock' as never, 2]]);

		const result = await getNpcSpeech(req({ step: 'choiceReward' }));

		expect(mockRewarder).toHaveBeenCalledOnce();
		// Player is re-fetched after the reward so later condition checks see fresh data.
		expect(mockGetNPC).toHaveBeenCalledTimes(2);
		expect(mockUpdateStep).toHaveBeenCalledWith(DINOZ_ID, NPC_ID, 'choiceReward');
		expect(result.rewards).toEqual({ rock: 2 });
	});
});

describe('getNpcSpeech - fight step', () => {
	beforeEach(() => {
		(npc.data.begin.nextStep as string[]) = ['choiceFight'];
	});

	function fightPlayer(life = 100) {
		return {
			id: 'player-1',
			dinoz: [{ id: DINOZ_ID, placeId: PLACE_ID, life }]
		};
	}

	it('runs the fight, rewards on victory and returns the fight result', async () => {
		mockGetNPC.mockResolvedValue(buildPlayer({}, [{ npcId: NPC_ID, step: 'begin' }]) as never);
		mockGetFightData.mockResolvedValue(fightPlayer() as never);
		mockCalcFight.mockReturnValue({ rounds: [] } as never);
		mockRewardFight.mockResolvedValue({ result: true } as never);

		const result = await getNpcSpeech(req({ step: 'choiceFight' }));

		expect(mockCalcFight).toHaveBeenCalledOnce();
		expect(mockUpdateStep).toHaveBeenCalledWith(DINOZ_ID, NPC_ID, 'choiceFight');
		expect(result).toMatchObject({
			name: 'michel',
			speech: 'victory',
			playerChoice: [],
			fight: { result: true }
		});
		expect(result.service).toEqual(['fight']);
	});

	it('does not advance the step when the fight is lost', async () => {
		mockGetNPC.mockResolvedValue(buildPlayer({}, [{ npcId: NPC_ID, step: 'begin' }]) as never);
		mockGetFightData.mockResolvedValue(fightPlayer() as never);
		mockCalcFight.mockReturnValue({ rounds: [] } as never);
		mockRewardFight.mockResolvedValue({ result: false } as never);

		await getNpcSpeech(req({ step: 'choiceFight' }));

		expect(mockUpdateStep).not.toHaveBeenCalled();
	});

	it('throws when the dinoz is dead', async () => {
		mockGetNPC.mockResolvedValue(buildPlayer({}, [{ npcId: NPC_ID, step: 'begin' }]) as never);
		mockGetFightData.mockResolvedValue(fightPlayer(0) as never);

		await expect(getNpcSpeech(req({ step: 'choiceFight' }))).rejects.toThrow('dead');
	});

	it('throws when no fight data is found for the player', async () => {
		mockGetNPC.mockResolvedValue(buildPlayer({}, [{ npcId: NPC_ID, step: 'begin' }]) as never);
		mockGetFightData.mockResolvedValue(null);

		await expect(getNpcSpeech(req({ step: 'choiceFight' }))).rejects.toThrow('No player');
	});
});
