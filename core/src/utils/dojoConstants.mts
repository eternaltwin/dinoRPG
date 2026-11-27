export const DOJO_MAX_SERIES = 5;
export const DOJO_FIGHT_COST = 300;
export const DOJO_FIGHT_FRIENDS_DINOZ_COST = 50;
export const DOJO_OPPONENT_IN_SERIE = 5;
export const DOJO_REPUTATION_WIN = 4;
export const DOJO_REPUTATION_CHALLENGE = 4;
export const DOJO_MAX_DAILY_CHALLENGE = 5;
// Minimum number of distinct races in the qualification team (a demon counts as its race)
export const DOJO_MIN_RACES = 5;
// Bonus applied for each side (attacker, target) being of the race of the day
export const DOJO_FEATURED_BONUS = 0.5;
// One extra point every DOJO_LEVEL_GAP_STEP levels when the target is stronger than the attacker
export const DOJO_LEVEL_GAP_STEP = 5;
// Number of days of the qualification, one featured race each
export const DOJO_QUALIFICATION_DAYS = 7;

// A race is drawn (monorace, race of the day...) only once DOJO_RACE_MIN_OWNERS players own DOJO_RACE_MIN_OWNED of them
export const DOJO_RACE_MIN_OWNERS = 128;
export const DOJO_RACE_MIN_OWNED = 2;

export default DOJO_MAX_SERIES;
