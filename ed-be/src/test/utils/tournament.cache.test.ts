import { describe, it, expect, vi, beforeEach } from 'vitest';

// The cache only delegates to TournamentManager.getActiveTeams and logs through the global
// context; stub both so the caching behaviour can be tested in isolation.
vi.mock('../../utils/tournamentManager.js', () => ({
	default: { getActiveTeams: vi.fn() }
}));
vi.mock('../../context.js', () => ({
	LOGGER: { log: vi.fn() }
}));

import TournamentManager from '../../utils/tournamentManager.js';
import { getActiveTeamsCached, invalidateTournamentCache } from '../../utils/tournament.cache.js';

const mockGetActiveTeams = vi.mocked(TournamentManager.getActiveTeams);
const fakePrisma = {} as never;

beforeEach(() => {
	vi.clearAllMocks();
	invalidateTournamentCache();
});

describe('getActiveTeamsCached', () => {
	it('fetches and returns the active teams on the first call', async () => {
		const teams = { id: 'tournament-1', winners: [] };
		mockGetActiveTeams.mockResolvedValue(teams as never);

		expect(await getActiveTeamsCached(fakePrisma)).toBe(teams);
		expect(mockGetActiveTeams).toHaveBeenCalledOnce();
	});

	it('serves the cached value without refetching', async () => {
		mockGetActiveTeams.mockResolvedValue({ id: 'tournament-1', winners: [] } as never);

		await getActiveTeamsCached(fakePrisma);
		await getActiveTeamsCached(fakePrisma);

		expect(mockGetActiveTeams).toHaveBeenCalledOnce();
	});

	it('caches the absence of a tournament (null) and does not refetch', async () => {
		mockGetActiveTeams.mockResolvedValue(null);

		expect(await getActiveTeamsCached(fakePrisma)).toBeNull();
		await getActiveTeamsCached(fakePrisma);

		expect(mockGetActiveTeams).toHaveBeenCalledOnce();
	});

	it('refetches after the cache is invalidated', async () => {
		mockGetActiveTeams.mockResolvedValue({ id: 'tournament-1', winners: [] } as never);

		await getActiveTeamsCached(fakePrisma);
		invalidateTournamentCache();
		await getActiveTeamsCached(fakePrisma);

		expect(mockGetActiveTeams).toHaveBeenCalledTimes(2);
	});
});
