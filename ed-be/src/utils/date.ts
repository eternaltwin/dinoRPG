import dayjs from 'dayjs';
import { PROSPECTOR_EVENING_WINDOW, PROSPECTOR_MORNING_WINDOW } from '@drpg/core/models/clan/clanWar';
import { getRandomInteger } from './tools.js';

/**
 * Returns the next monday (start of the day) in Date format
 */
export function nextMonday(): Date {
	const today = dayjs();
	let daysUntilNextMonday = (1 + 7 - today.day()) % 7;
	if (daysUntilNextMonday === 0) daysUntilNextMonday = 7;
	return today.add(daysUntilNextMonday, 'day').startOf('day').toDate();
}

/**
 * Returns the Prospector's next visit time: a random moment inside the next un-fired daily window.
 * The window is chosen by its start boundary (not a random point) so exactly one visit fires per
 * window per day, and the returned time is always strictly after `now`.
 */
export function computeNextProspectorRun(now: Date = new Date()): Date {
	const d = dayjs(now);
	const morningStart = d.startOf('day').add(PROSPECTOR_MORNING_WINDOW.startHour, 'hour');
	const eveningStart = d.startOf('day').add(PROSPECTOR_EVENING_WINDOW.startHour, 'hour');

	let windowStart: dayjs.Dayjs;
	let window = PROSPECTOR_MORNING_WINDOW;
	if (d.isBefore(morningStart)) {
		windowStart = morningStart; // today's morning
	} else if (d.isBefore(eveningStart)) {
		windowStart = eveningStart; // today's evening
		window = PROSPECTOR_EVENING_WINDOW;
	} else {
		windowStart = morningStart.add(1, 'day'); // tomorrow's morning
	}

	const spanMinutes = (window.endHour - window.startHour) * 60;
	return windowStart.add(getRandomInteger(0, spanMinutes), 'minute').toDate();
}
