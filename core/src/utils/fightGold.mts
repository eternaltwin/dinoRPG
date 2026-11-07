export interface GoldDiminishingCurve {
	/** Raw gold earned in the day from which the rate starts to fall. */
	start: number;
	/** Raw gold earned in the day at which the rate reaches `floorRate`. */
	end: number;
	/** Rate applied past `end`. */
	floorRate: number;
}

/** Gold paid for the first `raw` gold of the day: the area under the rate curve. */
const paidUpTo = (raw: number, { start, end, floorRate }: GoldDiminishingCurve) => {
	if (raw <= start) return raw;
	const slope = end - start;
	if (raw <= end) {
		const past = raw - start;
		return start + past - ((1 - floorRate) * past * past) / (2 * slope);
	}
	return start + (slope * (1 + floorRate)) / 2 + floorRate * (raw - end);
};

/**
 * Applies the daily diminishing returns to a fight's gold.
 * @param alreadyEarned Raw gold earned from fights earlier in the day.
 * @param rawGold Raw gold earned from this fight.
 * @returns The gold to pay for this fight.
 */
export const applyGoldDiminishing = (alreadyEarned: number, rawGold: number, curve: GoldDiminishingCurve) => {
	if (rawGold <= 0) return 0;
	return Math.round(paidUpTo(alreadyEarned + rawGold, curve) - paidUpTo(alreadyEarned, curve));
};
