import { Request } from 'express';
import dayjs from 'dayjs';
import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { FighterRecap } from '@drpg/core/models/fight/FightResult';
import {
	FIGHT_ARCHIVE_PAGE_SIZE,
	FIGHT_ARCHIVE_RETENTION_MONTHS,
	FightArchiveKind,
	FightArchivePage,
	FightArchiveSummary,
	FightFavorites,
	MAX_FAVORITE_FIGHTS
} from '@drpg/core/models/fight/FightArchiveList';
import {
	getArchivedFightRequest,
	getFavoriteFightArchives,
	getPlayerFightArchives,
	isFavoriteFight,
	purgeFightArchivesBefore,
	setFavoriteFight
} from '../dao/archiveDao.js';
import { auth } from '../dao/playerDao.js';
import { assertCanReadArchive } from '../utils/archiveAccess.js';
import translate from '../utils/server/translate.js';

const PURGE_BATCH_SIZE = 5000;

export interface ArchiveSummaryRow {
	id: string;
	createdDate: Date;
	result: boolean;
	fighters: string;
	metadata: string | null;
	tournamentId: string | null;
	FBTournamentId: string | null;
	leftPlayer: { id: string; name: string } | null;
	rightPlayer: { id: string; name: string } | null;
	FightWatched: { playerId: string }[];
}

function parseMetadata(raw: string | null): { kind?: string; rightClanName?: string } {
	if (!raw) return {};
	try {
		return (JSON.parse(raw) as { kind?: string; rightClanName?: string } | null) ?? {};
	} catch {
		return {};
	}
}

/** What the fight was, from the columns and metadata each archiving call leaves. */
export function fightArchiveKind(row: ArchiveSummaryRow): FightArchiveKind {
	const metadata = parseMetadata(row.metadata);
	if (metadata.kind === 'clanChampionship') return 'clanChampionship';
	if (row.tournamentId) return 'tournament';
	if (row.FBTournamentId) return 'forceBrute';
	if (metadata.rightClanName) return 'clanWar';
	// Force brute opponent fights are archived without metadata nor right player
	if (!row.metadata && !row.rightPlayer) return 'forceBrute';
	return 'dojo';
}

/** The date the nightly purge deletes an archive created at `createdDate`. */
export function fightArchiveExpiry(createdDate: Date): Date {
	return dayjs(createdDate).add(FIGHT_ARCHIVE_RETENTION_MONTHS, 'month').add(1, 'day').startOf('day').toDate();
}

export function toFightArchiveSummary(row: ArchiveSummaryRow, playerId: string): FightArchiveSummary {
	let fighters: FighterRecap[] = [];
	try {
		fighters = JSON.parse(row.fighters) as FighterRecap[];
	} catch {
		// A broken archive still shows in the list
	}
	const kind = fightArchiveKind(row);
	// The purge spares favorites and clan championship fights
	const kept = row.FightWatched.length > 0 || kind === 'clanChampionship';
	return {
		id: row.id,
		kind,
		createdDate: row.createdDate.toISOString(),
		expiresAt: kept ? null : fightArchiveExpiry(row.createdDate).toISOString(),
		favorite: row.FightWatched.some(w => w.playerId === playerId),
		result: row.result,
		fighters: fighters.map(f => ({ id: f.id, type: f.type, name: f.name, attacker: f.attacker })),
		leftPlayer: row.leftPlayer,
		rightPlayer: row.rightPlayer,
		rightClanName: parseMetadata(row.metadata).rightClanName ?? null
	};
}

export async function getMyFightArchives(req: Request): Promise<FightArchivePage> {
	const authed = await auth(req);
	const page = +req.params.page;
	const { total, archives } = await getPlayerFightArchives(authed.id, page, FIGHT_ARCHIVE_PAGE_SIZE);
	return { total, fights: archives.map(a => toFightArchiveSummary(a, authed.id)) };
}

export async function getMyFavoriteFights(req: Request): Promise<FightFavorites> {
	const authed = await auth(req);
	const archives = await getFavoriteFightArchives(authed.id);
	return { max: MAX_FAVORITE_FIGHTS, fights: archives.map(a => toFightArchiveSummary(a, authed.id)) };
}

export async function getFavoriteState(req: Request): Promise<{ favorite: boolean }> {
	const authed = await auth(req);
	return { favorite: await isFavoriteFight(authed.id, req.params.archiveId) };
}

export async function updateFavoriteFight(req: Request): Promise<{ favorite: boolean; count: number; max: number }> {
	const authed = await auth(req);
	const archiveId = req.params.archiveId;
	const favorite = req.body.favorite as boolean;

	const fight = await getArchivedFightRequest(archiveId);
	if (!fight) {
		throw new ExpectedError(translate('dojo.archiveNotFound', authed));
	}
	await assertCanReadArchive(fight.metadata, archiveId, authed.id);

	const count = await setFavoriteFight(authed.id, archiveId, favorite, MAX_FAVORITE_FIGHTS);
	if (count === null) {
		throw new ExpectedError(translate('favoriteFightLimit', authed, { max: MAX_FAVORITE_FIGHTS }));
	}
	return { favorite, count, max: MAX_FAVORITE_FIGHTS };
}

/** Deletes the archives past the retention period, except the favorites. Returns how many were deleted. */
export async function purgeExpiredFightArchives(now = new Date()): Promise<number> {
	const before = dayjs(now).subtract(FIGHT_ARCHIVE_RETENTION_MONTHS, 'month').toDate();
	return purgeFightArchivesBefore(before, PURGE_BATCH_SIZE);
}
