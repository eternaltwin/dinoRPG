import { ExpectedError } from '@drpg/core/utils/ExpectedError';
import { getClanChampionshipFightParticipants, isClanChampionshipFightReplayable } from '../dao/archiveDao.js';

/** True when the raw archive metadata JSON marks a clan championship fight (tolerates malformed metadata). */
export function isClanChampionshipArchive(rawMetadata: string | null | undefined): boolean {
	if (!rawMetadata) return false;
	try {
		return (JSON.parse(rawMetadata) as { kind?: string } | null)?.kind === 'clanChampionship';
	} catch {
		return false;
	}
}

/**
 * Clan championship fights are only readable by their participants, and by both clans once the match is over
 * (its replay). Throws the same error as a missing archive so existence is not revealed. Other archives are readable
 * by anyone.
 */
export async function assertCanReadArchive(
	rawMetadata: string | null | undefined,
	archiveId: string,
	playerId: string
) {
	if (!isClanChampionshipArchive(rawMetadata)) return;
	const participants = await getClanChampionshipFightParticipants(archiveId);
	if (participants?.includes(playerId)) return;
	if (!participants || !(await isClanChampionshipFightReplayable(archiveId, playerId))) {
		throw new ExpectedError('No replay found.');
	}
}
