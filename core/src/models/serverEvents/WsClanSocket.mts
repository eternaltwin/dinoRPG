import {
	BoardChangedMessage,
	BoardDirection,
	BoardMoveResult,
	ChampionshipChangedMessage,
	FightJournalEntryDTO,
	MatchBoardDTO
} from '../clan/clanChampionship.mjs';

/** What a client may ask over the clan socket and get an answer to. Forum messages keep their own format. */
export enum WsClanAction {
	CHAMPIONSHIP_REGISTER = 'championship.register',
	CHAMPIONSHIP_UNREGISTER = 'championship.unregister',
	CHAMPIONSHIP_GET_MATCH = 'championship.getMatch',
	CHAMPIONSHIP_GET_FIGHTS = 'championship.getFights',
	CHAMPIONSHIP_ENTER = 'championship.enter',
	CHAMPIONSHIP_LEAVE = 'championship.leave',
	CHAMPIONSHIP_MOVE = 'championship.move'
}

export type WsClanCalls = {
	[WsClanAction.CHAMPIONSHIP_REGISTER]: { payload: undefined; result: null };
	[WsClanAction.CHAMPIONSHIP_UNREGISTER]: { payload: undefined; result: null };
	[WsClanAction.CHAMPIONSHIP_GET_MATCH]: { payload: undefined; result: MatchBoardDTO | null };
	[WsClanAction.CHAMPIONSHIP_GET_FIGHTS]: {
		payload: { matchId: string; before: number };
		result: FightJournalEntryDTO[];
	};
	[WsClanAction.CHAMPIONSHIP_ENTER]: { payload: { dinozId: number }; result: null };
	[WsClanAction.CHAMPIONSHIP_LEAVE]: { payload: { dinozId: number }; result: null };
	[WsClanAction.CHAMPIONSHIP_MOVE]: {
		payload: { dinozId: number; direction: BoardDirection };
		result: BoardMoveResult;
	};
};

/** A request is answered only to the connection that sent it, with the same `requestId`. */
export type WsClanRequest<A extends WsClanAction = WsClanAction> = {
	requestId: string;
	action: A;
	payload: WsClanCalls[A]['payload'];
};

export type WsClanResponse<A extends WsClanAction = WsClanAction> =
	| { type: 'response'; requestId: string; ok: true; data: WsClanCalls[A]['result'] }
	| { type: 'response'; requestId: string; ok: false; error: string };

/** Sent once the server listens to the connection: anything a client sends earlier would be lost. */
export type WsClanReadyMessage = { type: 'ready' };

/**
 * The members of the clan who have the game open, i.e. at least one clan socket. Sent to a connection once it is ready,
 * then to the whole clan each time a member comes or goes.
 */
export type WsClanPresenceMessage = { type: 'presence'; playerIds: string[] };

export type WsClanPushMessage =
	| WsClanReadyMessage
	| WsClanPresenceMessage
	| BoardChangedMessage
	| ChampionshipChangedMessage;
