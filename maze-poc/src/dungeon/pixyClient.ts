/**
 * pixyClient — the ONLY channel to the maze layout.
 *
 * The layout lives encrypted on the backend ("pixy"); this client never receives
 * it. Starting a run yields the starting fog-of-war reveal; each move is
 * validated server-side and returns only the newly revealed cells. Everything
 * the browser knows about the maze arrives through these two calls.
 */

export interface Cell {
	l: number;
	x: number;
	y: number;
}

/** One cell pixy has allowed us to see. */
export interface RevealedCell {
	l: number;
	x: number;
	y: number;
	/** true = walkable floor, false = wall. */
	floor: boolean;
	/** Entity token ('start' | 'exit' | 'stair_up' | 'stair_down' | 'door_v' | 'door_h' | 'monster' | 'key' | 'gold' | 'heal' | 'scroll'). */
	icon?: string;
}

export interface StartRunResult {
	runId: string;
	pos: Cell;
	width: number;
	height: number;
	levels: number;
	skinSalt: number;
	reveal: RevealedCell[];
}

export interface MoveResult {
	ok: boolean;
	pos: Cell;
	reveal: RevealedCell[];
}

const BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? 'http://localhost:8081';

async function post<T>(path: string, payload?: unknown): Promise<T> {
	const res = await fetch(`${BASE}${path}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: payload === undefined ? undefined : JSON.stringify(payload)
	});
	if (!res.ok) throw new Error(`pixy ${path} -> ${res.status} ${await res.text()}`);
	return (await res.json()) as T;
}

export function startRun(): Promise<StartRunResult> {
	return post<StartRunResult>('/api/v1/dungeon');
}

/** One step: dx/dy for a cell move, dl (±1) to take a stair under the dinoz. */
export function move(runId: string, dx: number, dy: number, dl = 0): Promise<MoveResult> {
	return post<MoveResult>(`/api/v1/dungeon/${runId}/move`, { dx, dy, dl });
}
