import { FighterRecap } from './FightResult.mjs';

/** Archives older than this are deleted every night, unless a player keeps them as a favorite. */
export const FIGHT_ARCHIVE_RETENTION_MONTHS = 6;
/** How many archived fights a player can keep as favorites. */
export const MAX_FAVORITE_FIGHTS = 25;
/** Archived fights per page in the replay list. */
export const FIGHT_ARCHIVE_PAGE_SIZE = 10;

export type FightArchiveKind = 'dojo' | 'tournament' | 'forceBrute' | 'clanWar' | 'clanChampionship';

export interface FightArchiveSummary {
	id: string;
	kind: FightArchiveKind;
	createdDate: string;
	/** When the nightly purge deletes it; null while someone keeps it as a favorite. */
	expiresAt: string | null;
	favorite: boolean;
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
