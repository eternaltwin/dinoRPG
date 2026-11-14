import { describe, it, expect } from 'vitest';
import { CHAMPIONSHIP_REGISTRATION_WEEKS } from '@drpg/core/models/clan/clanChampionship';
import {
	computeMatchSlots,
	computeMatchSlotsFrom,
	computeRegistrationWindow,
	isMonday
} from '../../utils/clanChampionship/schedule.js';

describe('computeRegistrationWindow', () => {
	it('spans CHAMPIONSHIP_REGISTRATION_WEEKS weeks from Monday 00:00 UTC', () => {
		const w = computeRegistrationWindow('2026-11-09');
		expect(w.registrationStart.toISOString()).toBe('2026-11-09T00:00:00.000Z');
		expect(w.registrationEnd).toEqual(new Date(Date.UTC(2026, 10, 9 + 7 * CHAMPIONSHIP_REGISTRATION_WEEKS)));
	});
});
describe('isMonday', () => {
	it('accepts a Monday and rejects a Sunday', () => {
		expect(isMonday('2026-11-09')).toBe(true);
		expect(isMonday('2026-11-08')).toBe(false);
	});
});
describe('computeMatchSlots', () => {
	it('alternates Mon→Wed and Thu→Sat at 18:00 UTC', () => {
		const s = computeMatchSlots(new Date('2026-11-23T00:00:00.000Z'), 3).map(x => [
			x.startsAt.toISOString(),
			x.endsAt.toISOString()
		]);
		expect(s).toEqual([
			['2026-11-23T18:00:00.000Z', '2026-11-25T18:00:00.000Z'],
			['2026-11-26T18:00:00.000Z', '2026-11-28T18:00:00.000Z'],
			['2026-11-30T18:00:00.000Z', '2026-12-02T18:00:00.000Z']
		]);
	});
});
describe('computeMatchSlotsFrom', () => {
	it('starts day 1 at the given instant, any day and hour, then keeps the 0-2 / 3-5 / 7-9 rhythm', () => {
		const s = computeMatchSlotsFrom(new Date('2026-11-06T14:37:00.000Z'), 3).map(x => [
			x.startsAt.toISOString(),
			x.endsAt.toISOString()
		]);
		expect(s).toEqual([
			['2026-11-06T14:37:00.000Z', '2026-11-08T14:37:00.000Z'],
			['2026-11-09T14:37:00.000Z', '2026-11-11T14:37:00.000Z'],
			['2026-11-13T14:37:00.000Z', '2026-11-15T14:37:00.000Z']
		]);
	});
});
