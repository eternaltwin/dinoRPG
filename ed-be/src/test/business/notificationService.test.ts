import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeRequest } from '../helpers/req.js';

vi.mock('../../dao/playerDao.js', () => ({ auth: vi.fn() }));
vi.mock('../../dao/notificationDao.js', () => ({ readAllNotification: vi.fn(), readNotification: vi.fn() }));

import { auth } from '../../dao/playerDao.js';
import { readAllNotification, readNotification } from '../../dao/notificationDao.js';
import { setNotificationRead, setAllNotificationRead } from '../../business/notificationService.js';

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(auth).mockResolvedValue({ id: 'p1' } as never);
});

describe('notificationService', () => {
	it('marks one notification read', async () => {
		expect(await setNotificationRead(makeRequest({ params: { notificationId: 'n1' } }))).toBe(true);
		expect(readNotification).toHaveBeenCalledWith('n1', 'p1');
	});
	it('marks all notifications read', async () => {
		expect(await setAllNotificationRead(makeRequest())).toBe(true);
		expect(readAllNotification).toHaveBeenCalledWith('p1');
	});
});
