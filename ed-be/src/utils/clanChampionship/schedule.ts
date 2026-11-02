import { CHAMPIONSHIP_MATCH_UTC_HOUR, CHAMPIONSHIP_REGISTRATION_WEEKS } from '@drpg/core/models/clan/clanChampionship';

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parses a `YYYY-MM-DD` string as UTC midnight, or returns null if it is not a real calendar date. */
function parseUtcDay(date: string): Date | null {
	const match = DATE_RE.exec(date);
	if (!match) return null;
	const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
	const parsed = new Date(Date.UTC(year, month - 1, day));
	if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) {
		return null;
	}
	return parsed;
}

/** Whether `date` (`YYYY-MM-DD`, evaluated in UTC) is a Monday. Invalid dates return false. */
export function isMonday(date: string): boolean {
	const parsed = parseUtcDay(date);
	return parsed !== null && parsed.getUTCDay() === 1;
}

/** Registration opens at Monday 00:00 UTC and closes exactly CHAMPIONSHIP_REGISTRATION_WEEKS later. */
export function computeRegistrationWindow(start: string): { registrationStart: Date; registrationEnd: Date } {
	const registrationStart = parseUtcDay(start);
	if (registrationStart === null) throw new Error(`Invalid date: ${start}`);
	return {
		registrationStart,
		registrationEnd: new Date(registrationStart.getTime() + CHAMPIONSHIP_REGISTRATION_WEEKS * WEEK_MS)
	};
}

/**
 * Match slots, starting from the Monday registration closes. Slot k belongs to week floor(k / 2):
 * even k runs Mon -> Wed 18:00 UTC, odd k runs Thu -> Sat 18:00 UTC.
 */
export function computeMatchSlots(registrationEnd: Date, count: number): { startsAt: Date; endsAt: Date }[] {
	const hourMs = CHAMPIONSHIP_MATCH_UTC_HOUR * 60 * 60 * 1000;
	return Array.from({ length: count }, (_, k) => {
		const weekStart = registrationEnd.getTime() + Math.floor(k / 2) * WEEK_MS;
		const [startOffsetDays, endOffsetDays] = k % 2 === 0 ? [0, 2] : [3, 5];
		return {
			startsAt: new Date(weekStart + startOffsetDays * DAY_MS + hourMs),
			endsAt: new Date(weekStart + endOffsetDays * DAY_MS + hourMs)
		};
	});
}
