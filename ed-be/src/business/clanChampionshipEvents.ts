import { WsChannel } from '@drpg/core/models/serverEvents/WsChannel';
import { BoardChangedMessage, ChampionshipChangedMessage } from '@drpg/core/models/clan/clanChampionship';
import { LOGGER } from '../context.js';
import { publishToWsChannel, publishToWsChannelFamily } from './serverEventService.js';

type MatchClans = { id: string; homeClanId: number | null; awayClanId: number | null };

/** Tells both clans of a match that its board changed. Called after the commit; never throws. */
export function publishBoardChanged(match: MatchClans, version: number): void {
	const message: BoardChangedMessage = { type: 'boardChanged', matchId: match.id, version };
	for (const clanId of [match.homeClanId, match.awayClanId]) {
		if (clanId === null) continue;
		try {
			publishToWsChannel(`${WsChannel.CLAN_FORUM}.${clanId}`, message);
		} catch (err) {
			LOGGER.error(`Cannot publish the board version of match ${match.id} to clan ${clanId}`, err);
		}
	}
}

/** Tells every connected clan that the championship page changed. Called after the commit; never throws. */
export function publishChampionshipChanged(): void {
	const message: ChampionshipChangedMessage = { type: 'championshipChanged' };
	try {
		publishToWsChannelFamily(`${WsChannel.CLAN_FORUM}.`, message);
	} catch (err) {
		LOGGER.error('Cannot publish the championship change', err);
	}
}
