import { ref } from 'vue';
import { WsChannel } from '@drpg/core/models/serverEvents/WsChannel';
import { WsClanAction, WsClanCalls, WsClanResponse } from '@drpg/core/models/serverEvents/WsClanSocket';
import { ServerEventsService } from './ServerEventsService.js';
import { WsRequestError } from '../utils/WsRequestError.js';

const MIN_DELAY = 1000;
const MAX_DELAY = 30000;
/** Longer than the 15 s transaction of a board action. */
const REQUEST_TIMEOUT = 20000;

type Listener = (message: Record<string, unknown>) => void;
type Pending = { resolve(data: unknown): void; reject(err: Error): void; timer: ReturnType<typeof setTimeout> };
type ReadyWaiter = { resolve(): void; reject(err: Error): void };

/** Whether the server listens to the connection, i.e. after its `ready` message. */
const connected = ref(false);

const listeners = new Set<Listener>();
const readyListeners = new Set<() => void>();
const pending = new Map<string, Pending>();
let readyWaiters: ReadyWaiter[] = [];

let clanId: number | null = null;
let socket: WebSocket | null = null;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let delay = MIN_DELAY;
// Incremented on every (re)connection so stale callbacks of a replaced socket are ignored
let generation = 0;

function dropSocket() {
	if (retryTimer) {
		clearTimeout(retryTimer);
		retryTimer = null;
	}
	if (socket) {
		const old = socket;
		socket = null;
		old.onopen = old.onmessage = old.onerror = old.onclose = null;
		try {
			old.close();
		} catch {
			// already closed
		}
	}
	connected.value = false;
}

/** What was sent may or may not have been handled: it is refused here, never sent again by itself. */
function rejectPending() {
	for (const request of pending.values()) {
		clearTimeout(request.timer);
		request.reject(new WsRequestError('connectionLost'));
	}
	pending.clear();
}

function scheduleRetry(gen: number) {
	if (clanId === null || gen !== generation || retryTimer) return;
	const wait = delay;
	delay = Math.min(delay * 2, MAX_DELAY);
	retryTimer = setTimeout(() => {
		retryTimer = null;
		void connect();
	}, wait);
}

function onMessage(raw: string) {
	let message: Record<string, unknown>;
	try {
		message = JSON.parse(raw);
	} catch {
		return;
	}
	if (message?.type === 'ready') {
		delay = MIN_DELAY;
		connected.value = true;
		const waiters = readyWaiters;
		readyWaiters = [];
		waiters.forEach(waiter => waiter.resolve());
		readyListeners.forEach(listener => listener());
		return;
	}
	if (message?.type === 'response') {
		const response = message as unknown as WsClanResponse;
		const request = pending.get(response.requestId);
		if (!request) return;
		pending.delete(response.requestId);
		clearTimeout(request.timer);
		if (response.ok) request.resolve(response.data);
		else request.reject(new WsRequestError(response.error, response.error));
		return;
	}
	listeners.forEach(listener => listener(message));
}

async function connect() {
	dropSocket();
	const gen = ++generation;
	if (clanId === null) return;
	try {
		const ticket = await ServerEventsService.getWsTicket(WsChannel.CLAN_FORUM);
		if (gen !== generation) return;
		const ws = await ServerEventsService.connectToWs(ticket);
		if (gen !== generation) {
			ws.close();
			return;
		}
		socket = ws;
		ws.onmessage = (event: MessageEvent) => {
			if (gen === generation) onMessage(String(event.data));
		};
		ws.onclose = () => {
			if (gen !== generation) return;
			connected.value = false;
			socket = null;
			rejectPending();
			scheduleRetry(gen);
		};
	} catch {
		if (gen === generation) scheduleRetry(gen);
	}
}

function waitUntilReady(): Promise<void> {
	if (connected.value) return Promise.resolve();
	if (clanId === null) return Promise.reject(new WsRequestError('connectionLost'));
	return new Promise((resolve, reject) => {
		const waiter: ReadyWaiter = {
			resolve() {
				clearTimeout(timer);
				resolve();
			},
			reject
		};
		const timer = setTimeout(() => {
			readyWaiters = readyWaiters.filter(other => other !== waiter);
			reject(new WsRequestError('connectionLost'));
		}, REQUEST_TIMEOUT);
		readyWaiters.push(waiter);
	});
}

function subscribe<T>(set: Set<T>, listener: T): () => void {
	set.add(listener);
	return () => set.delete(listener);
}

/**
 * The player's clan socket, one per tab and open for the whole session (started by TopBar, like the SSE), so that
 * any page can use it wherever the player is in the game.
 */
export const clanSocket = {
	connected,

	/** Follows the player's clan: connects, moves to the new clan's channel, or closes when `newClanId` is null. */
	follow(newClanId: number | null): void {
		if (newClanId === clanId) return;
		clanId = newClanId;
		delay = MIN_DELAY;
		rejectPending();
		if (clanId === null) {
			const waiters = readyWaiters;
			readyWaiters = [];
			waiters.forEach(waiter => waiter.reject(new WsRequestError('connectionLost')));
		}
		void connect();
	},

	/** Asks the server and waits for its answer. Waits for the connection first if it is not ready yet. */
	async request<A extends WsClanAction>(
		action: A,
		...[payload]: WsClanCalls[A]['payload'] extends undefined ? [] : [WsClanCalls[A]['payload']]
	): Promise<WsClanCalls[A]['result']> {
		await waitUntilReady();
		const ws = socket;
		if (!ws) throw new WsRequestError('connectionLost');
		const requestId = crypto.randomUUID();
		return new Promise((resolve, reject) => {
			const timer = setTimeout(() => {
				pending.delete(requestId);
				reject(new WsRequestError('connectionLost'));
			}, REQUEST_TIMEOUT);
			pending.set(requestId, { resolve: resolve as (data: unknown) => void, reject, timer });
			ws.send(JSON.stringify({ requestId, action, payload }));
		});
	},

	/** Sends a message that gets no direct answer (forum). Returns false when the socket is not ready. */
	send(message: object): boolean {
		if (!connected.value || !socket) return false;
		socket.send(JSON.stringify(message));
		return true;
	},

	/** Listens to what the server pushes. Returns the function that stops listening. */
	onMessage(listener: Listener): () => void {
		return subscribe(listeners, listener);
	},

	/** Called on every (re)connection: pushes may have been missed, so anything on screen must be read again. */
	onReady(listener: () => void): () => void {
		return subscribe(readyListeners, listener);
	}
};
