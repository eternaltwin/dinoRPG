import { FighterRecap } from './FightResult.mjs';
import { FighterType } from './DetailedFighter.mjs';

/** Archives older than this are deleted every night, unless a player keeps them as a favorite or they are clan championship fights. */
export const FIGHT_ARCHIVE_RETENTION_MONTHS = 6;
/** How many archived fights a player can keep as favorites. */
export const MAX_FAVORITE_FIGHTS = 25;
/** Archived fights per page in the replay list. */
export const FIGHT_ARCHIVE_PAGE_SIZE = 10;

/** A fight can be kept as a favorite only when it is PvP: a player's dinoz on each side. */
export function isPvPFight(fighters: Pick<FighterRecap, 'type' | 'attacker'>[]): boolean {
	const dinoz = fighters.filter(f => f.type === FighterType.DINOZ);
	return dinoz.some(f => f.attacker) && dinoz.some(f => !f.attacker);
}

export type FightArchiveKind = 'dojo' | 'tournament' | 'forceBrute' | 'clanWar' | 'clanChampionship';

export interface FightArchiveSummary {
	id: string;
	kind: FightArchiveKind;
	createdDate: string;
	/** When the nightly purge deletes it; null while someone keeps it as a favorite. */
	expiresAt: string | null;
	favorite: boolean;
	/** Only PvP fights can be kept as favorites. */
	pvp: boolean;
	/** True when the left side (the attacker) won. */
	result: boolean;
	fighters: Pick<FighterRecap, 'id' | 'type' | 'name' | 'attacker'>[];
	leftPlayer: { id: string; name: string } | null;
	rightPlayer: { id: string; name: string } | null;
	rightClanName: string | null;
}

export interface FightArchivePage {
	fights: FightArchiveSummary[];
	total: number;
}

export interface FightFavorites {
	fights: FightArchiveSummary[];
	max: number;
}
