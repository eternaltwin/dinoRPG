import { WebSocket } from 'ws';

export interface WebSocketCustom extends WebSocket {
	id: string;
	isAlive: boolean;
}
