export type WsReadyStateName = 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED';

/** One WebSocket connection known by the server, as seen by the admin panel. */
export interface WsConnectionMonitoring {
	/** Unset while the connection waits for its ticket to be checked. */
	connectionId: string | null;
	readyState: WsReadyStateName;
	/** False once a ping is left unanswered: the next heartbeat terminates the connection. */
	isAlive: boolean;
	/** Bytes queued and not yet sent: a growing value means a slow or stuck client. */
	bufferedAmount: number;
	channel: string | null;
	clanId: number | null;
	clanName: string | null;
	playerId: string | null;
	playerName: string | null;
	ip: string | null;
	userAgent: string | null;
	connectedAt: string | null;
	lastPingAt: string | null;
	lastPongAt: string | null;
	messagesIn: number;
	messagesOut: number;
	lastMessageInAt: string | null;
	lastMessageOutAt: string | null;
	/** True when the server holds the connection, but no channel lists it: nothing is ever pushed to it. */
	orphan: boolean;
}

export interface WsChannelMonitoring {
	channel: string;
	clanId: number | null;
	clanName: string | null;
	members: number;
	players: number;
	/** Channel members that no live connection matches: they leak until the channel empties. */
	ghostMembers: number;
}

export interface SseConnectionMonitoring {
	channel: string;
	playerId: string;
	playerName: string | null;
	ip: string | null;
	userAgent: string | null;
	connectedAt: string | null;
	/** False when the underlying response is ended or its socket destroyed (cleaned up within a minute). */
	open: boolean;
	messagesOut: number;
	lastMessageOutAt: string | null;
}

export interface ServerEventsMonitoring {
	generatedAt: string;
	wsServerRunning: boolean;
	pendingTickets: { websocket: number; sse: number; oldestAgeMs: number | null };
	ws: {
		total: number;
		byState: Record<WsReadyStateName, number>;
		uniquePlayers: number;
		channels: WsChannelMonitoring[];
		connections: WsConnectionMonitoring[];
	};
	sse: {
		total: number;
		uniquePlayers: number;
		connections: SseConnectionMonitoring[];
	};
}
