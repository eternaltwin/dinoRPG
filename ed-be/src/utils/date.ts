import dayjs from 'dayjs';

/**
 * Returns the next monday (start of the day) in Date format
 */
export function nextMonday(): Date {
	const today = dayjs();
	let daysUntilNextMonday = (1 + 7 - today.day()) % 7;
	if (daysUntilNextMonday === 0) daysUntilNextMonday = 7;
	return today.add(daysUntilNextMonday, 'day').startOf('day').toDate();
}
