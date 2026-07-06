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
import { ConditionEnum, RewardEnum } from '@drpg/core/models/enums/Parser';
import { ServiceEnum } from '@drpg/core/models/enums/ServiceEnum';
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
		choiceRedirect: { stepName: 'choiceRedirect', redirect: 'end', nextStep: [] },
		end: { stepName: 'end', nextStep: [] },
		victory: { stepName: 'victory', nextStep: [] }
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
				life: 1,
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

describe('getNpcSpeech - 1st guard clauses', () => {
	it('throws when the player does not exist', async () => {
		mockGetNPC.mockResolvedValue(null);
		await expect(getNpcSpeech(req())).rejects.toThrow(ExpectedError);
	});

	it('throws when the dinoz is not in the player team', async () => {
		mockGetNPC.mockResolvedValue(buildPlayer({ id: 999 }) as never);
		await expect(getNpcSpeech(req())).rejects.toThrow('Dinoz not found');
	});

	it('throws when the dinoz still needs to be named', async () => {
		mockGetNPC.mockResolvedValue(buildPlayer({ canChangeName: true }) as never);
		await expect(getNpcSpeech(req())).rejects.toThrow('has to be named');
	});

	it('throws when the dinoz is dead', async () => {
		mockGetNPC.mockResolvedValue(buildPlayer({ life: 0 }) as never);
		await expect(getNpcSpeech(req())).rejects.toThrow('Dinoz is dead');
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

	it('throws when the dinoz is not on the same place as the NPC', async () => {
		(placeList as Record<string, unknown>).town = { placeId: PLACE_ID, name: 'town' };
		(npcList as Record<string, unknown>).michel = { ...npc, placeId: 999 };
		mockGetNPC.mockResolvedValue(buildPlayer() as never);
		await expect(getNpcSpeech(req())).rejects.toThrow('not in same location as NPC');
	});
});

describe('getNpcSpeech - undefined input guards', () => {
	it('throws when no initial step exist', async () => {
		(npc.data.begin as Record<string, unknown>).initialStep = false;
		mockGetNPC.mockResolvedValue(buildPlayer() as never);
		await expect(getNpcSpeech(req())).rejects.toThrow('No valid initial step found');
	});

	it('throws when initial step conditions are not met', async () => {
		(npc.data.begin as Record<string, unknown>).condition = { [ConditionEnum.MINLEVEL]: 99 };
		mockGetNPC.mockResolvedValue(buildPlayer() as never);
		mockCheckCondition.mockImplementation((condition: unknown) => condition === undefined);
		await expect(getNpcSpeech(req())).rejects.toThrow('No valid initial step found');
	});

	it('throws when more than one initial step possible', async () => {
		(npc.data.choiceAlias as Record<string, unknown>).initialStep = true;
		mockGetNPC.mockResolvedValue(buildPlayer() as never);
		await expect(getNpcSpeech(req())).rejects.toThrow('Too many initial steps found');
	});
});

describe('getNpcSpeech - defined input guards', () => {
	it('throws when the requested step does not exist', async () => {
		(npc.data.choice1 as Record<string, unknown>).nextStep = [];
		mockGetNPC.mockResolvedValue(buildPlayer() as never);
		await expect(getNpcSpeech(req({ step: 'thisStepDoesNotExist' }))).rejects.toThrow('No step (thisStepDoesNotExist) found');
	});

	it('throws when there are too many matching steps in NPC data', async () => {
		(npc.data.choiceReward as Record<string, unknown>).stepName = 'choice1';
		mockGetNPC.mockResolvedValue(buildPlayer() as never);
		await expect(getNpcSpeech(req({ step: 'choice1' }))).rejects.toThrow('Too many steps (choice1) found');
	});

	it('throws when there are too many matching steps in NPC data w/ alias', async () => {
		(npc.data.choiceReward as Record<string, unknown>).alias = 'choice1';
		await expect(getNpcSpeech(req({ step: 'choice1' }))).rejects.toThrow('Too many steps (choice1) found');
	});
});

describe('getNpcSpeech - redirect guards', () => {
	it('throws when there is no step that match the redirection', async () => {
		(npc.data.choiceRedirect as Record<string, unknown>).redirect = 'ThisStepDoesNotExist';
		mockGetNPC.mockResolvedValue(buildPlayer() as never);
		await expect(getNpcSpeech(req({ step: 'choiceRedirect' }))).rejects.toThrow('No redirection (ThisStepDoesNotExist) found');
	});

	it('throws when there are too many steps that match the redirection', async () => {
		(npc.data.choice1 as Record<string, unknown>).stepName = 'end';
		mockGetNPC.mockResolvedValue(buildPlayer() as never);
		await expect(getNpcSpeech(req({ step: 'choiceRedirect' }))).rejects.toThrow('Too many redirections (end) found');
	});
});

describe('getNpcSpeech - initial step processing', () => {
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

	it('updates existing NPC entry and returns the initial step with filtered choices', async () => {
		mockGetNPC.mockResolvedValue(buildPlayer({}, [{ npcId: NPC_ID, step: 'end' }]) as never);
		mockCreateStep.mockResolvedValue({ npcId: NPC_ID, step: 'begin' } as never);

		const result = await getNpcSpeech(req({ step: 'begin' }));

		expect(mockUpdateStep).toHaveBeenCalledWith(DINOZ_ID, NPC_ID, 'begin');
		expect(result).toEqual({
			name: 'michel',
			speech: 'begin',
			playerChoice: ['choice1', 'choiceReward']
		});
	});

	it('filters out initial-step choices whose condition is not met', async () => {
		(npc.data.choiceReward as Record<string, unknown>).condition = { [ConditionEnum.MINLEVEL]: 99 };
		mockGetNPC.mockResolvedValue(buildPlayer() as never);
		mockCreateStep.mockResolvedValue({ npcId: NPC_ID, step: 'begin' } as never);
		mockCheckCondition.mockImplementation((condition: unknown) => condition === undefined);

		const result = await getNpcSpeech(req({ step: 'begin' }));

		// Only `choice1` has no condition object; `choiceReward` is excluded because its condition is not met
		expect(result.playerChoice).toEqual(['choice1']);
	});

	it('initial step also works if requested explicitely - create', async () => {
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

	it('initial step also works if requested explicitely - update', async () => {
		mockGetNPC.mockResolvedValue(buildPlayer({}, [{ npcId: NPC_ID, step: 'end' }]) as never);
		mockCreateStep.mockResolvedValue({ npcId: NPC_ID, step: 'begin' } as never);

		const result = await getNpcSpeech(req({ step: 'begin' }));

		expect(mockUpdateStep).toHaveBeenCalledWith(DINOZ_ID, NPC_ID, 'begin');
		expect(result).toEqual({
			name: 'michel',
			speech: 'begin',
			playerChoice: ['choice1', 'choiceReward']
		});
	});

	it('throws when the NPC condition are not met at initial step', async () => {
		(npcList as Record<string, unknown>).michel = { ...npc, condition: { [ConditionEnum.MINLEVEL]: 99 } };
		mockGetNPC.mockResolvedValue(buildPlayer() as never);
		mockCheckCondition.mockImplementation((condition: unknown) => condition === undefined);
		await expect(getNpcSpeech(req())).rejects.toThrow("doesn't meet requirement to talk to");
	});

	it('works when the NPC condition are met at initial step', async () => {
		(npcList as Record<string, unknown>).michel = { ...npc, condition: { [ConditionEnum.MINLEVEL]: 99 } };
		mockGetNPC.mockResolvedValue(buildPlayer() as never);
		mockCheckCondition.mockImplementation((_condition: unknown) => true);
		let result = await getNpcSpeech(req());

		expect(mockCreateStep).toHaveBeenCalledWith(DINOZ_ID, { npcId: NPC_ID, step: 'begin' });
		expect(result).toEqual({
			name: 'michel',
			speech: 'begin',
			playerChoice: ['choice1', 'choiceReward']
		});
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
			flashvars: 'fv',
			rewards: {}
		});
	});

	it('resolves an alias to its underlying step name', async () => {
		(npc.data.begin.nextStep as string[]) = ['choiceAlias'];
		mockGetNPC.mockResolvedValue(buildPlayer({}, [{ npcId: NPC_ID, step: 'begin' }]) as never);

		// Use the alias of choiceAlias which is `shortcut`
		const result = await getNpcSpeech(req({ step: 'shortcut' }));
		// The real step name is returned
		expect(result.speech).toBe('choiceAlias');
		expect(mockUpdateStep).toHaveBeenCalledWith(DINOZ_ID, NPC_ID, 'choiceAlias');
	});

	it('proceeds when the requested step is reachable', async () => {
		mockGetNPC.mockResolvedValue(buildPlayer({}, [{ npcId: NPC_ID, step: 'choice1' }]) as never);

		const result = await getNpcSpeech(req({ step: 'end' }));

		expect(mockUpdateStep).toHaveBeenCalledWith(DINOZ_ID, NPC_ID, 'end');
		expect(result).toEqual({
			name: 'michel',
			speech: 'end',
			playerChoice: [],
			flashvars: 'fv',
			rewards: {},
			service: undefined
		});
	});

	it('throws when the requested step is not reachable', async () => {
		// Remove 'end' from 'choice1' nest steps.
		(npc.data.choice1 as Record<string, unknown>).nextStep = [];
		// Set current step as 'choice1'
		mockGetNPC.mockResolvedValue(buildPlayer({}, [{ npcId: NPC_ID, step: 'choice1' }]) as never);
		await expect(getNpcSpeech(req({ step: 'end' }))).rejects.toThrow('not available for your Dinoz');
	});

	it('throws when the stored current step no longer exists', async () => {
		mockGetNPC.mockResolvedValue(buildPlayer({}, [{ npcId: NPC_ID, step: 'ghost' }]) as never);
		await expect(getNpcSpeech(req({ step: 'choice1' }))).rejects.toThrow('does not exist for NPC');
	});

	it('throws when the requested step condition is not fulfilled', async () => {
		(npc.data.choice1 as Record<string, unknown>).condition = { minLevel: 99 };
		mockGetNPC.mockResolvedValue(buildPlayer({}, [{ npcId: NPC_ID, step: 'begin' }]) as never);
		// NPC condition + reachability pass; only the step condition fails.
		mockCheckCondition.mockImplementation((condition: unknown) => condition === undefined);

		await expect(getNpcSpeech(req({ step: 'choice1' }))).rejects.toThrow("doesn't fulfill the conditions");
	});

	it('redirects when the requested step has a redirection set', async () => {
		// Current step is 'begin' with possible next step 'choiceRedirect' that redirects to 'end'
		(npc.data.begin.nextStep as string[]) = ['choiceRedirect'];
		mockGetNPC.mockResolvedValue(buildPlayer({}, [{ npcId: NPC_ID, step: 'begin' }]) as never);

		const result = await getNpcSpeech(req({ step: 'choiceRedirect' }));

		expect(result.speech).toBe('end');
		expect(mockUpdateStep).toHaveBeenCalledWith(DINOZ_ID, NPC_ID, 'end');
	});

	it('redirects when the requested step has a redirection set', async () => {
		// Current step is 'choice1' with possible next step 'end'.
		// 'choiceRedirect' is sent but it's ok because it redirects to 'end'
		// even if 'choiceRedirect' is not explicitely in the next steps of 'choice1'
		mockGetNPC.mockResolvedValue(buildPlayer({}, [{ npcId: NPC_ID, step: 'choice1' }]) as never);

		const result = await getNpcSpeech(req({ step: 'choiceRedirect' }));

		expect(result.speech).toBe('end');
		expect(mockUpdateStep).toHaveBeenCalledWith(DINOZ_ID, NPC_ID, 'end');
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

	it('runs the redirect reward path and surfaces its services', async () => {
		// A redirect reward exercises checkRedirect and the service aggregation of the response.
		(npc.data.choiceReward as Record<string, unknown>).reward = [
			{ rewardType: RewardEnum.REDIRECT, service: [ServiceEnum.REFRESH_PLAYER] }
		];
		mockGetNPC.mockResolvedValue(buildPlayer({}, [{ npcId: NPC_ID, step: 'begin' }]) as never);
		mockRewarder.mockResolvedValue([]);

		const result = await getNpcSpeech(req({ step: 'choiceReward' }));

		expect(mockUpdateStep).toHaveBeenCalledWith(DINOZ_ID, NPC_ID, 'choiceReward');
		expect(result.speech).toBe('choiceReward');
		expect(result.service).toEqual([ServiceEnum.REFRESH_PLAYER]);
		expect(result.rewards).toEqual({});
	});

	it('throws if current step does not contain requested step', async () => {
		mockGetNPC.mockResolvedValue(buildPlayer({}, [{ npcId: NPC_ID, step: 'begin' }]) as never);
		await expect(getNpcSpeech(req({ step: 'end' }))).rejects.toThrow('dialog (end) is not available');
	});

	it('throws when the player vanishes during the post-reward refresh', async () => {
		// choiceReward carries a reward, so the player is re-fetched; a null refresh must be rejected
		// while building the next player choices.
		(npc.data.choiceReward as Record<string, unknown>).nextStep = ['end'];
		mockGetNPC
			.mockResolvedValueOnce(buildPlayer({}, [{ npcId: NPC_ID, step: 'begin' }]) as never)
			.mockResolvedValueOnce(null);
		mockRewarder.mockResolvedValue([]);

		await expect(getNpcSpeech(req({ step: 'choiceReward' }))).rejects.toThrow("doesn't exist");
	});
});

describe('getNpcSpeech - no current step', () => {
	it('if no existing current step then redirect to initial step if one valid exists', async () => {
		// No existing current step. Ask for 'choiceReward'. Expect redirect to 'begin'.
		mockGetNPC.mockResolvedValue(buildPlayer() as never);
		const result = await getNpcSpeech(req({ step: 'choiceReward' }));
		expect(mockCreateStep).toHaveBeenCalledWith(DINOZ_ID, { npcId: NPC_ID, step: 'begin' });
		expect(result).toEqual({
			name: 'michel',
			speech: 'begin',
			playerChoice: ['choice1', 'choiceReward']
		});
	});

	it('throws if no existing current and NPC conditions not met for only initial step', async () => {
		(npcList as Record<string, unknown>).michel = { ...npc, condition: { [ConditionEnum.MINLEVEL]: 99 } };
		mockGetNPC.mockResolvedValue(buildPlayer() as never);
		mockCheckCondition.mockImplementation((condition: unknown) => condition === undefined);
		await expect(getNpcSpeech(req({ step: 'choiceReward' }))).rejects.toThrow('doesn\'t meet requirement to talk');
	});

	it('redirect to initial step works if NPC condition is met', async () => {
		// No existing current step. Ask for 'choiceReward'. Expect redirect to 'begin'.
		(npc.data.begin as Record<string, unknown>).condition = { [ConditionEnum.MINLEVEL]: 99 };
		mockGetNPC.mockResolvedValue(buildPlayer() as never);
		mockCheckCondition.mockImplementation((_condition: unknown) => true);
		const result = await getNpcSpeech(req({ step: 'choiceReward' }));
		expect(mockCreateStep).toHaveBeenCalledWith(DINOZ_ID, { npcId: NPC_ID, step: 'begin' });
		expect(result).toEqual({
			name: 'michel',
			speech: 'begin',
			playerChoice: ['choice1', 'choiceReward']
		});
	});

	it('redirect to only possible initial step amongst multiple valid ones', async () => {
		// Set 'choiceRedirect' as initial step but with a condition that cannot be met.
		(npc.data.choiceRedirect as Record<string, unknown>).condition = { [ConditionEnum.MINLEVEL]: 99 };
		mockGetNPC.mockResolvedValue(buildPlayer() as never);
		mockCheckCondition.mockImplementation((condition: unknown) => condition === undefined);
		const result = await getNpcSpeech(req({ step: 'choiceReward' }));
		expect(mockCreateStep).toHaveBeenCalledWith(DINOZ_ID, { npcId: NPC_ID, step: 'begin' });
		expect(result).toEqual({
			name: 'michel',
			speech: 'begin',
			playerChoice: ['choice1', 'choiceReward']
		});
	});

	it('throws if no existing current and no valid initial step can be found to redirect to', async () => {
		(npc.data.begin as Record<string, unknown>).initialStep = false;
		mockGetNPC.mockResolvedValue(buildPlayer() as never);
		await expect(getNpcSpeech(req({ step: 'choiceReward' }))).rejects.toThrow('No valid initial step found');
	});

	it('throws if no existing current and too many valid initial steps found to redirect to', async () => {
		(npc.data.choiceAlias as Record<string, unknown>).initialStep = true;
		mockGetNPC.mockResolvedValue(buildPlayer() as never);
		await expect(getNpcSpeech(req({ step: 'choiceReward' }))).rejects.toThrow('Too many initial steps found');
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

	it('grants the step reward after a won fight', async () => {
		(npc.data.choiceFight as Record<string, unknown>).reward = [{ rewardType: RewardEnum.ITEM, value: 1, quantity: 1 }];
		mockGetNPC.mockResolvedValue(buildPlayer({}, [{ npcId: NPC_ID, step: 'begin' }]) as never);
		mockGetFightData.mockResolvedValue(fightPlayer() as never);
		mockCalcFight.mockReturnValue({ rounds: [] } as never);
		mockRewardFight.mockResolvedValue({ result: true } as never);

		await getNpcSpeech(req({ step: 'choiceFight' }));

		expect(mockRewarder).toHaveBeenCalledOnce();
		const [rewardArg, , playerIdArg, applyFlag] = mockRewarder.mock.calls[0];
		expect(rewardArg).toEqual([{ rewardType: RewardEnum.ITEM, value: 1, quantity: 1 }]);
		expect(playerIdArg).toBe('player-1');
		expect(applyFlag).toBe(true);
	});

	it('does not advance the step when the fight is lost', async () => {
		mockGetNPC.mockResolvedValue(buildPlayer({}, [{ npcId: NPC_ID, step: 'begin' }]) as never);
		mockGetFightData.mockResolvedValue(fightPlayer() as never);
		mockCalcFight.mockReturnValue({ rounds: [] } as never);
		mockRewardFight.mockResolvedValue({ result: false } as never);

		await getNpcSpeech(req({ step: 'choiceFight' }));

		expect(mockUpdateStep).not.toHaveBeenCalled();
	});

	it('throws when no fight data is found for the player', async () => {
		mockGetNPC.mockResolvedValue(buildPlayer({}, [{ npcId: NPC_ID, step: 'begin' }]) as never);
		mockGetFightData.mockResolvedValue(null);

		await expect(getNpcSpeech(req({ step: 'choiceFight' }))).rejects.toThrow('No player');
	});

	it('throws when the fight data does not contain the requested dinoz', async () => {
		mockGetNPC.mockResolvedValue(buildPlayer({}, [{ npcId: NPC_ID, step: 'begin' }]) as never);
		mockGetFightData.mockResolvedValue({ id: 'player-1', dinoz: [{ id: 999, placeId: PLACE_ID, life: 100 }] } as never);

		await expect(getNpcSpeech(req({ step: 'choiceFight' }))).rejects.toThrow("doesn't exist");
	});
});
