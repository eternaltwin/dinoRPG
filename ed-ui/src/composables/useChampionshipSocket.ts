import { getCurrentInstance, onBeforeUnmount, ref, Ref, watch } from 'vue';
import { WsChannel } from '@drpg/core/models/serverEvents/WsChannel';
import { BoardChangedMessage } from '@drpg/core/models/clan/clanChampionship';
import { ServerEventsService } from '../services/ServerEventsService.js';

const MIN_DELAY = 1000;
const MAX_DELAY = 30000;

/**
 * Follows the board channel of the player's current match. Calls `onChanged(version)` on every `boardChanged`
 * message and `onChanged(-1)` after every successful (re)connection so the caller refetches the board.
 */
export function useChampionshipSocket(
	onChanged: (version: number) => void,
	options?: { matchId?: Ref<string | null> }
): { connected: Ref<boolean>; reconnect(): void; close(): void } {
	const connected = ref(false);
	let socket: WebSocket | null = null;
	let timer: ReturnType<typeof setTimeout> | null = null;
	let delay = MIN_DELAY;
	let closed = false;
	// Incremented on every (re)connection so stale callbacks of a replaced socket are ignored
	let generation = 0;

	function dropSocket() {
		if (timer) {
			clearTimeout(timer);
			timer = null;
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

	function scheduleRetry(gen: number) {
		if (closed || gen !== generation || timer) return;
		const wait = delay;
		delay = Math.min(delay * 2, MAX_DELAY);
		timer = setTimeout(() => {
			timer = null;
			void connect();
		}, wait);
	}

	async function connect() {
		if (closed) return;
		dropSocket();
		const gen = ++generation;
		try {
			const ticket = await ServerEventsService.getWsTicket(WsChannel.CLAN_CHAMPIONSHIP);
			if (closed || gen !== generation) return;
			const ws = await ServerEventsService.connectToWs(ticket);
			if (closed || gen !== generation) {
				ws.close();
				return;
			}
			socket = ws;
			ws.onopen = () => {
				if (gen !== generation) return;
				delay = MIN_DELAY;
				connected.value = true;
				onChanged(-1);
			};
			ws.onmessage = (event: MessageEvent) => {
				if (gen !== generation) return;
				try {
					const message = JSON.parse(event.data) as Partial<BoardChangedMessage>;
					if (message?.type === 'boardChanged' && typeof message.version === 'number') {
						onChanged(message.version);
					}
				} catch {
					// malformed message: ignore
				}
			};
			ws.onerror = () => {
				if (gen !== generation) return;
				connected.value = false;
			};
			ws.onclose = () => {
				if (gen !== generation) return;
				connected.value = false;
				socket = null;
				scheduleRetry(gen);
			};
		} catch {
			if (gen !== generation) return;
			connected.value = false;
			scheduleRetry(gen);
		}
	}

	function reconnect() {
		if (closed) return;
		delay = MIN_DELAY;
		void connect();
	}

	function close() {
		closed = true;
		generation++;
		dropSocket();
	}

	if (options?.matchId) {
		watch(options.matchId, () => reconnect());
	}
	if (getCurrentInstance()) onBeforeUnmount(close);

	void connect();

	return { connected, reconnect, close };
}
