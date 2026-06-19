import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Reward } from '@drpg/core/models/reward/RewardList';
import { makeRequest } from '../helpers/req.js';

// Mock the DAO layer and the prisma client so the build logic runs without a database.
vi.mock('../../dao/playerDao.js', () => ({
	auth: vi.fn(),
	getPlayerForDinozBuildChecks: vi.fn(),
	ownsDinoz: vi.fn()
}));
vi.mock('../../dao/dinozBuildDao.js', () => ({
	assignBuildToDinoz: vi.fn(),
	createBuild: vi.fn(),
	deleteBuild: vi.fn(),
	getBuild: vi.fn(),
	getClanSharedBuilds: vi.fn(),
	getPlayerBuilds: vi.fn(),
	updateBuildSkills: vi.fn()
}));
vi.mock('../../prisma.js', () => ({
	prisma: { clanMember: { findUnique: vi.fn() } }
}));

import { auth, getPlayerForDinozBuildChecks, ownsDinoz } from '../../dao/playerDao.js';
import {
	assignBuildToDinoz,
	createBuild,
	deleteBuild,
	getBuild,
	getClanSharedBuilds,
	getPlayerBuilds,
	updateBuildSkills
} from '../../dao/dinozBuildDao.js';
import { prisma } from '../../prisma.js';
import {
	listBuilds,
	createNewBuild,
	updateBuild,
	removeBuild,
	listClanSharedBuilds,
	copySharedBuild,
	assignBuild
} from '../../business/dinozBuildService.js';

const mockAuth = vi.mocked(auth);
const mockGetPlayer = vi.mocked(getPlayerForDinozBuildChecks);
const mockOwnsDinoz = vi.mocked(ownsDinoz);
const mockAssign = vi.mocked(assignBuildToDinoz);
const mockCreate = vi.mocked(createBuild);
const mockDelete = vi.mocked(deleteBuild);
const mockGetBuild = vi.mocked(getBuild);
const mockGetClanShared = vi.mocked(getClanSharedBuilds);
const mockGetPlayerBuilds = vi.mocked(getPlayerBuilds);
const mockUpdateSkills = vi.mocked(updateBuildSkills);
const mockFindClanMember = vi.mocked(prisma.clanMember.findUnique);

const PLAYER_ID = 'player-1';
const BUILD_ID = 'build-1';
const DINOZ_ID = 42;

function buildPlayer(overrides: Record<string, unknown> = {}) {
	return {
		rewards: [{ rewardId: Reward.PAC }],
		discoveredSkills: [1, 2, 3],
		...overrides
	} as never;
}

function req(params: Record<string, string> = {}, body: Record<string, unknown> = {}) {
	return makeRequest({ params, body });
}

beforeEach(() => {
	vi.clearAllMocks();
	mockAuth.mockResolvedValue({ id: PLAYER_ID } as Awaited<ReturnType<typeof auth>>);
	mockGetPlayer.mockResolvedValue(buildPlayer());
});

describe('listBuilds', () => {
	it('returns the authenticated player builds', async () => {
		mockGetPlayerBuilds.mockResolvedValue([{ id: BUILD_ID }] as never);
		const result = await listBuilds(req());
		expect(mockGetPlayerBuilds).toHaveBeenCalledWith(PLAYER_ID);
		expect(result).toEqual([{ id: BUILD_ID }]);
	});
});

describe('createNewBuild', () => {
	it('creates a build with the provided skills, name and shareable flag', async () => {
		mockCreate.mockResolvedValue({ id: BUILD_ID } as never);
		const result = await createNewBuild(req({}, { skills: [1, 2], name: 'My build', shareable: true }));
		expect(mockCreate).toHaveBeenCalledWith(PLAYER_ID, [1, 2], 'My build', true);
		expect(result).toEqual({ id: BUILD_ID });
	});

	it('throws when the player has no PAC', async () => {
		mockGetPlayer.mockResolvedValue(buildPlayer({ rewards: [] }));
		await expect(createNewBuild(req({}, { skills: [1], name: 'x' }))).rejects.toThrow('PAC is required');
		expect(mockCreate).not.toHaveBeenCalled();
	});

	it('throws when a skill has not been discovered', async () => {
		await expect(createNewBuild(req({}, { skills: [99], name: 'x' }))).rejects.toThrow('not been discovered');
	});

	it('throws when the skills array contains a non-integer', async () => {
		await expect(createNewBuild(req({}, { skills: [1.5], name: 'x' }))).rejects.toThrow('Invalid skills array');
	});

	it('throws when the name is empty', async () => {
		await expect(createNewBuild(req({}, { skills: [1], name: '' }))).rejects.toThrow('cannot be empty');
	});

	it('treats a non-array skills payload as empty', async () => {
		mockCreate.mockResolvedValue({ id: BUILD_ID } as never);
		await createNewBuild(req({}, { skills: 'nope', name: 'x' }));
		expect(mockCreate).toHaveBeenCalledWith(PLAYER_ID, [], 'x', false);
	});
});

describe('updateBuild', () => {
	const updateReq = (body: Record<string, unknown> = {}) =>
		req({ buildId: BUILD_ID }, { skills: [1], name: 'name', shareable: false, ...body });

	it('updates an owned build', async () => {
		mockGetBuild.mockResolvedValue({ id: BUILD_ID, playerId: PLAYER_ID } as never);
		await updateBuild(updateReq({ skills: [1, 2], name: 'renamed', shareable: true }));
		expect(mockUpdateSkills).toHaveBeenCalledWith(BUILD_ID, [1, 2], 'renamed', true);
	});

	it('throws when the player has no PAC', async () => {
		mockGetPlayer.mockResolvedValue(buildPlayer({ rewards: [] }));
		await expect(updateBuild(updateReq())).rejects.toThrow('PAC is required');
	});

	it('throws when the build does not exist', async () => {
		mockGetBuild.mockResolvedValue(null as never);
		await expect(updateBuild(updateReq())).rejects.toThrow('Build not found');
	});

	it('throws when the build belongs to another player', async () => {
		mockGetBuild.mockResolvedValue({ id: BUILD_ID, playerId: 'other' } as never);
		await expect(updateBuild(updateReq())).rejects.toThrow('Build not found');
	});

	it('throws when a skill has not been discovered', async () => {
		mockGetBuild.mockResolvedValue({ id: BUILD_ID, playerId: PLAYER_ID } as never);
		await expect(updateBuild(updateReq({ skills: [99] }))).rejects.toThrow('not been discovered');
	});

	it('throws when the name is empty', async () => {
		mockGetBuild.mockResolvedValue({ id: BUILD_ID, playerId: PLAYER_ID } as never);
		await expect(updateBuild(updateReq({ name: '' }))).rejects.toThrow('cannot be empty');
	});
});

describe('removeBuild', () => {
	it('deletes an owned build', async () => {
		mockGetBuild.mockResolvedValue({ id: BUILD_ID, playerId: PLAYER_ID } as never);
		await removeBuild(req({ buildId: BUILD_ID }));
		expect(mockDelete).toHaveBeenCalledWith(BUILD_ID);
	});

	it('throws when the player has no PAC', async () => {
		mockGetPlayer.mockResolvedValue(buildPlayer({ rewards: [] }));
		await expect(removeBuild(req({ buildId: BUILD_ID }))).rejects.toThrow('PAC is required');
		expect(mockDelete).not.toHaveBeenCalled();
	});

	it('throws when the build is not owned by the player', async () => {
		mockGetBuild.mockResolvedValue({ id: BUILD_ID, playerId: 'other' } as never);
		await expect(removeBuild(req({ buildId: BUILD_ID }))).rejects.toThrow('Build not found');
	});
});

describe('listClanSharedBuilds', () => {
	it('returns the shared builds of the player clan', async () => {
		mockFindClanMember.mockResolvedValue({ clanId: 7 } as never);
		mockGetClanShared.mockResolvedValue([{ id: BUILD_ID }] as never);
		const result = await listClanSharedBuilds(req());
		expect(mockGetClanShared).toHaveBeenCalledWith(7);
		expect(result).toEqual([{ id: BUILD_ID }]);
	});

	it('returns an empty list when the player is in no clan', async () => {
		mockFindClanMember.mockResolvedValue(null as never);
		const result = await listClanSharedBuilds(req());
		expect(result).toEqual([]);
		expect(mockGetClanShared).not.toHaveBeenCalled();
	});

	it('throws when the player has no PAC', async () => {
		mockGetPlayer.mockResolvedValue(buildPlayer({ rewards: [] }));
		await expect(listClanSharedBuilds(req())).rejects.toThrow('PAC is required');
	});
});

describe('copySharedBuild', () => {
	const sharedBuild = { id: BUILD_ID, playerId: 'other', skills: [1, 2], name: 'shared', shareable: true };

	it('copies a shareable build owned by another player', async () => {
		mockGetBuild.mockResolvedValue(sharedBuild as never);
		mockCreate.mockResolvedValue({ id: 'copy-1' } as never);
		const result = await copySharedBuild(req({ buildId: BUILD_ID }));
		expect(mockCreate).toHaveBeenCalledWith(PLAYER_ID, [1, 2], 'shared', true);
		expect(result).toEqual({ id: 'copy-1' });
	});

	it('throws when the player has no PAC', async () => {
		mockGetPlayer.mockResolvedValue(buildPlayer({ rewards: [] }));
		await expect(copySharedBuild(req({ buildId: BUILD_ID }))).rejects.toThrow('PAC is required');
	});

	it('throws when the build does not exist', async () => {
		mockGetBuild.mockResolvedValue(null as never);
		await expect(copySharedBuild(req({ buildId: BUILD_ID }))).rejects.toThrow('Build not found');
	});

	it('throws when trying to copy your own build', async () => {
		mockGetBuild.mockResolvedValue({ ...sharedBuild, playerId: PLAYER_ID } as never);
		await expect(copySharedBuild(req({ buildId: BUILD_ID }))).rejects.toThrow('Cannot copy own build');
	});

	it('throws when the build is not shareable', async () => {
		mockGetBuild.mockResolvedValue({ ...sharedBuild, shareable: false } as never);
		await expect(copySharedBuild(req({ buildId: BUILD_ID }))).rejects.toThrow('not shareable');
	});
});

describe('assignBuild', () => {
	it('assigns an owned build to an owned dinoz', async () => {
		mockOwnsDinoz.mockResolvedValue(true as never);
		mockGetBuild.mockResolvedValue({ id: BUILD_ID, playerId: PLAYER_ID } as never);
		await assignBuild(req({ id: String(DINOZ_ID) }, { buildId: BUILD_ID }));
		expect(mockAssign).toHaveBeenCalledWith(DINOZ_ID, BUILD_ID);
	});

	it('clears the build when no buildId is provided', async () => {
		mockOwnsDinoz.mockResolvedValue(true as never);
		await assignBuild(req({ id: String(DINOZ_ID) }, {}));
		expect(mockGetBuild).not.toHaveBeenCalled();
		expect(mockAssign).toHaveBeenCalledWith(DINOZ_ID, null);
	});

	it('throws when the player has no PAC', async () => {
		mockGetPlayer.mockResolvedValue(buildPlayer({ rewards: [] }));
		await expect(assignBuild(req({ id: String(DINOZ_ID) }, { buildId: BUILD_ID }))).rejects.toThrow('PAC is required');
	});

	it('throws when the dinoz is not owned by the player', async () => {
		mockOwnsDinoz.mockResolvedValue(false as never);
		await expect(assignBuild(req({ id: String(DINOZ_ID) }, { buildId: BUILD_ID }))).rejects.toThrow('Invalid dinoz');
		expect(mockAssign).not.toHaveBeenCalled();
	});

	it('throws when the build is not owned by the player', async () => {
		mockOwnsDinoz.mockResolvedValue(true as never);
		mockGetBuild.mockResolvedValue({ id: BUILD_ID, playerId: 'other' } as never);
		await expect(assignBuild(req({ id: String(DINOZ_ID) }, { buildId: BUILD_ID }))).rejects.toThrow('Build not found');
		expect(mockAssign).not.toHaveBeenCalled();
	});
});
