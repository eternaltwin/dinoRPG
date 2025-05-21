import { StatTracking } from '../models/enums/statTracking.mjs';
import { PlayerStats } from '../models/player/PlayerStats.mjs';
import { twinoidGoals } from '../models/goals/twinoidGoals.mjs';
import { ExpectedError } from './ExpectedError.mjs';

declare const Languages: readonly ['en', 'fr', 'de', 'es'];
type Language = (typeof Languages)[number];
interface Goal {
	id: StatTracking;
	name: Record<Language, string>;
	description?: Record<Language, string>;
	rare: number;
	hidden?: boolean;
	unlocks: Unlock[];
}
interface Unlock {
	count: number;
	points: number;
	icon?: string;
	title?: Record<Language, string>;
	description?: Record<Language, string>;
	prefix?: boolean;
	suffix?: boolean;
}

/**
 * Get the total points for a game
 * @param goals
 * @returns
 */
export const getTotalPoints = (goals: Record<StatTracking, Goal>) =>
	Object.values(goals).reduce(
		(total, goal) => total + goal.unlocks.reduce((total, unlock) => total + unlock.points, 0),
		0
	);

/**
 * Adjust goal points so that the total is 1000
 * @param goals
 * @returns
 */
export const adjustGoals = (goals: Record<StatTracking, Goal>): Record<StatTracking, Goal> => {
	const totalPoints = getTotalPoints(goals);
	const adjustmentRatio = 1000 / totalPoints;

	const adjustedGoals = Object.values(goals).map(goal => ({
		...(goal as Goal),
		unlocks: (goal as Goal).unlocks.map(unlock => ({
			...unlock,
			points: Math.round(unlock.points * adjustmentRatio)
		}))
	}));

	return Object.fromEntries(adjustedGoals.map(goal => [goal.id, goal])) as Record<StatTracking, Goal>;
};

/**
 * Get a goal by id
 */
export function getGoal(id: StatTracking): Goal {
	const goal = twinoidGoals[id];
	if (!goal) throw new ExpectedError('Invalid StatTracking id.');
	return goal;
}

/**
 * Get the unlocked goals for a given number of points
 */
export function getUnlockedGoals(stat: PlayerStats): Unlock[] {
	const goal = getGoal(stat.stat);
	if (!goal) return [];

	const unlocked = goal.unlocks.filter(unlock => unlock.count <= stat.quantity);
	return unlocked;
}

/**
 * Convert prisma output to PlayerStats
 */
export function convertToPlayerStats(rawStats: { stat: string; quantity: number }[]): PlayerStats[] {
	return rawStats
		.filter((s): s is { stat: StatTracking; quantity: number } =>
			Object.values(StatTracking).includes(s.stat as StatTracking)
		)
		.map(s => ({
			stat: s.stat,
			quantity: s.quantity
		}));
}
