import { WebSocketCustom } from './WebSocketCustom.mjs';
import { WebSocketServer } from 'ws';

export interface WebSocketServerCustom extends WebSocketServer {
	clients: Set<WebSocketCustom>;
}
