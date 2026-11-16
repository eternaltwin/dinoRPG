import { SseChannel } from '@drpg/core/models/serverEvents/SseChannel';
import { SseData } from '@drpg/core/models/serverEvents/SseData';
import { ServerEventsService } from './ServerEventsService.js';

const MIN_DELAY = 1000;
const MAX_DELAY = 30000;
/** The server pushes the live stats every 30 s: a silent stream past this is dead even if the browser says otherwise. */
const WATCHDOG_DELAY = 45000;

type Listener = (data: SseData) => void;

const listeners = new Set<Listener>();

let playerId: string | null = null;
let source: EventSource | null = null;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let watchdogTimer: ReturnType<typeof setTimeout> | null = null;
let delay = MIN_DELAY;
// Incremented on every (re)connection so stale callbacks of a replaced stream are ignored
let generation = 0;

function clearTimers() {
	if (retryTimer) {
		clearTimeout(retryTimer);
		retryTimer = null;
	}
	if (watchdogTimer) {
		clearTimeout(watchdogTimer);
		watchdogTimer = null;
	}
}

function dropSource() {
	clearTimers();
	if (source) {
		const old = source;
		source = null;
		old.onmessage = old.onerror = null;
		old.close();
	}
}

function scheduleRetry(gen: number) {
	if (playerId === null || gen !== generation || retryTimer) return;
	// Jitter: after a server restart, every open tab must not ask for its ticket in the same second
	const wait = delay + Math.random() * (delay / 2);
	delay = Math.min(delay * 2, MAX_DELAY);
	retryTimer = setTimeout(() => {
		retryTimer = null;
		void connect();
	}, wait);
}

/** Replaces the stream: the ticket in its URL was consumed, so the browser's own reconnection is always refused. */
function restart(gen: number) {
	if (gen !== generation) return;
	dropSource();
	scheduleRetry(gen);
}

function armWatchdog(gen: number) {
	if (watchdogTimer) clearTimeout(watchdogTimer);
	watchdogTimer = setTimeout(() => {
		watchdogTimer = null;
		restart(gen);
	}, WATCHDOG_DELAY);
}

async function connect() {
	dropSource();
	const gen = ++generation;
	if (playerId === null) return;
	try {
		const ticket = await ServerEventsService.getSseTicket(SseChannel.NOTIFICATION);
		if (gen !== generation) return;
		const stream = await ServerEventsService.connectToSse(ticket);
		if (gen !== generation) {
			stream.close();
			return;
		}
		source = stream;
		armWatchdog(gen);
		stream.onmessage = (message: MessageEvent<string>) => {
			if (gen !== generation) return;
			delay = MIN_DELAY;
			armWatchdog(gen);
			let data: SseData;
			try {
				data = JSON.parse(message.data);
			} catch {
				return;
			}
			listeners.forEach(listener => listener(data));
		};
		stream.onerror = () => restart(gen);
	} catch {
		// Ticket refused or network down: try again later, without bothering the player
		if (gen === generation) scheduleRetry(gen);
	}
}

/** Back on the tab or the network: no reason to sit out the rest of a long backoff. */
function wakeUp() {
	if (playerId === null || !retryTimer) return;
	if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
	delay = MIN_DELAY;
	void connect();
}

if (typeof window !== 'undefined') {
	window.addEventListener('online', wakeUp);
	document.addEventListener('visibilitychange', wakeUp);
}

/**
 * The player's notification stream (SSE), one per tab and open for the whole session (started by TopBar). It
 * reconnects on its own, without limit, with a growing delay capped at 30 s.
 */
export const notificationStream = {
	/** Opens the stream for this player, or closes it when `newPlayerId` is null. */
	follow(newPlayerId: string | null): void {
		if (newPlayerId === playerId) return;
		playerId = newPlayerId;
		delay = MIN_DELAY;
		void connect();
	},

	/** Listens to what the server pushes. Returns the function that stops listening. */
	onMessage(listener: Listener): () => void {
		listeners.add(listener);
		return () => listeners.delete(listener);
	}
};
