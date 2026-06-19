import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeRequest } from '../helpers/req.js';

vi.mock('../../dao/pantheonDao.js', () => ({ getPantheonIllus: vi.fn(), getPantheons: vi.fn() }));

import { getPantheonIllus, getPantheons } from '../../dao/pantheonDao.js';
import { getPantheon, getPantheonIllustration } from '../../business/pantheonService.js';

beforeEach(() => vi.clearAllMocks());

describe('pantheonService', () => {
	it('getPantheon resolves race name to id and queries', async () => {
		vi.mocked(getPantheons).mockResolvedValue([{ id: 1 }] as never);
		const result = await getPantheon(
			makeRequest({ params: { type: 'epic' }, query: { level: '20', race: 'nope', rewardId: '3' } } as never)
		);
		expect(getPantheons).toHaveBeenCalled();
		expect(result).toEqual([{ id: 1 }]);
	});
	it('getPantheon handles missing query params', async () => {
		vi.mocked(getPantheons).mockResolvedValue([] as never);
		await getPantheon(makeRequest({ params: { type: 'epic' }, query: {} } as never));
		expect(getPantheons).toHaveBeenCalledWith('epic', null, null, null);
	});
	it('getPantheonIllustration returns the image', async () => {
		vi.mocked(getPantheonIllus).mockResolvedValue({ image: 'img' } as never);
		expect(await getPantheonIllustration(makeRequest({ params: { id: '1' } }))).toBe('img');
	});
});
