import { http } from '../utils/http-common.js';
import { WsChannel } from '@drpg/core/models/webSocket/WsChannel';

export const WebSocketService = {
	getWsTicket(channel: WsChannel): Promise<string> {
		return http()
			.post('/websockets/authenticate', { channel })
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
