import { FighterTimesStep } from '../models/fight/FightStep.mjs';
import { FighterTooltipStats } from '../models/fight/transpiler.mjs';
import { OVERTIME_THRESHOLD, TIME_FACTOR } from './fightConstants.mjs';

// Displayed when a fighter will not play in the foreseeable future (asleep, petrified, static monster...)
export const NEVER_PLAYS = '∞';

export interface FighterTooltipLabels {
	// Label of the time left before the fighter's next turn
	nextTurn: string;
	// Label of the speed of the fighter
	speed: string;
	// Formats the speed percentage (ex: 150 => '150 %')
	formatSpeed: (percent: number) => string;
}

/**
 * Time left before the next turn of a fighter, in initiative points (the unit of the initiative stat:
 * a fighter with a normal speed waits 10 points between two of its turns).
 */
export function getNextTurnDisplay(fighterTime: number, fightTime: number): number | string {
	const timeLeft = fighterTime - fightTime;
	// Further than the whole fight before overtime: the fighter is not expected to play (asleep, petrified...)
	if (timeLeft >= OVERTIME_THRESHOLD) {
		return NEVER_PLAYS;
	}
	return Math.max(0, Math.round(timeLeft / TIME_FACTOR));
}

/**
 * Speed of a fighter as a percentage of the normal speed (higher is faster).
 * The engine's speed factor multiplies the time between two turns, so the displayed speed is its inverse.
 */
export function getSpeedPercent(speed: number): number | undefined {
	if (speed <= 0) {
		return undefined;
	}
	return Math.round(100 / speed);
}

/**
 * Turns the `fighterTimes` steps of a fight history into the stats displayed in the fighters' tooltips.
 * Only the stats that changed since the previous call are returned, so they can be sent as is in a Stats action.
 */
export class FighterTooltipStatsTracker {
	private fightTime = 0;
	// Last known timing of each fighter still in the fight
	private readonly timings = new Map<number, { time: number; speed: number }>();
	// Last known speed of each fighter, kept when it leaves the fight since it is only sent when it changes
	private readonly speeds = new Map<number, number>();
	// Last displayed stats of each fighter
	private readonly displayed = new Map<number, { nextTurn: number | string; speed: string | null }>();

	constructor(private readonly labels: FighterTooltipLabels) {}

	update(step: FighterTimesStep): FighterTooltipStats[] {
		this.fightTime = step.time;
		step.fighters.forEach(f => {
			if (f.speed !== undefined) {
				this.speeds.set(f.fid, f.speed);
			}
			const speed = this.speeds.get(f.fid);
			if (speed === undefined) {
				console.warn(`No speed received for fighter ${f.fid}`);
				return;
			}
			this.timings.set(f.fid, { time: f.time, speed });
		});

		const changes: FighterTooltipStats[] = [];
		this.timings.forEach((timing, fid) => {
			const nextTurn = getNextTurnDisplay(timing.time, this.fightTime);
			const speedPercent = getSpeedPercent(timing.speed);
			const speed = speedPercent === undefined ? null : this.labels.formatSpeed(speedPercent);
			const previous = this.displayed.get(fid);

			const stats: FighterTooltipStats['stats'] = {};
			if (!previous || previous.nextTurn !== nextTurn) {
				stats[this.labels.nextTurn] = nextTurn;
			}
			if (!previous || previous.speed !== speed) {
				stats[this.labels.speed] = speed;
			}
			if (Object.keys(stats).length > 0) {
				changes.push({ fid, stats });
				this.displayed.set(fid, { nextTurn, speed });
			}
		});
		return changes;
	}

	/**
	 * The fighter left the fight (death, escape): forget its timing and clear its stats.
	 * It is displayed again once a `fighterTimes` step lists it.
	 */
	remove(fid: number): FighterTooltipStats | undefined {
		this.timings.delete(fid);
		if (!this.displayed.delete(fid)) {
			return undefined;
		}
		return { fid, stats: { [this.labels.nextTurn]: null, [this.labels.speed]: null } };
	}
}
