import { describe, it, expect } from 'vitest';
import dayjs from 'dayjs';
import { PROSPECTOR_EVENING_WINDOW, PROSPECTOR_MORNING_WINDOW } from '@drpg/core/models/clan/clanWar';
import { computeNextProspectorRun, nextMonday } from '../../utils/date.js';

describe('nextMonday', () => {
	it('returns a Monday at the start of the day, strictly in the future', () => {
		const result = dayjs(nextMonday());
		expect(result.day()).toBe(1); // 1 = Monday
		expect(result.hour()).toBe(0);
		expect(result.minute()).toBe(0);
		expect(result.isAfter(dayjs())).toBe(true);
	});
});

describe('computeNextProspectorRun', () => {
	// The visit time is randomised inside a window, so we assert it lands inside the
	// expected window rather than on an exact instant.
	function expectInWindow(run: Date, day: dayjs.Dayjs, window: { startHour: number; endHour: number }) {
		const start = day.startOf('day').add(window.startHour, 'hour');
		const end = day.startOf('day').add(window.endHour, 'hour');
		const r = dayjs(run);
		expect(r.isBefore(start)).toBe(false);
		expect(r.isAfter(end)).toBe(false);
	}

	it('picks todays morning window when called before it', () => {
		const now = dayjs('2026-06-17T05:00:00');
		const run = computeNextProspectorRun(now.toDate());
		expectInWindow(run, now, PROSPECTOR_MORNING_WINDOW);
		expect(dayjs(run).isAfter(now)).toBe(true);
	});

	it('picks todays evening window when called between the two windows', () => {
		const now = dayjs('2026-06-17T12:00:00');
		const run = computeNextProspectorRun(now.toDate());
		expectInWindow(run, now, PROSPECTOR_EVENING_WINDOW);
		expect(dayjs(run).isAfter(now)).toBe(true);
	});

	it('rolls over to tomorrows morning window when called after the evening window', () => {
		const now = dayjs('2026-06-17T23:30:00');
		const run = computeNextProspectorRun(now.toDate());
		expectInWindow(run, now.add(1, 'day'), PROSPECTOR_MORNING_WINDOW);
		expect(dayjs(run).isAfter(now)).toBe(true);
	});
});
