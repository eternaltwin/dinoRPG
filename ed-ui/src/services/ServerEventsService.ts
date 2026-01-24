import { API_BASE, http } from '../utils';
import { WsChannel } from '@drpg/core/models/serverEvents/WsChannel';
import { ServerEventTicketDto } from '@drpg/core/models/serverEvents/ServerEventTicketDto';
import { SseChannel } from '@drpg/core/models/serverEvents/SseChannel';

export const ServerEventsService = {
	// WebSockets
	async getWsTicket(channel: WsChannel): Promise<ServerEventTicketDto> {
		const res = await http().post('/server-events/websockets/authenticate', { channel }, { silent: true });
		return res.data;
	},
	async connectToWs(ticket: ServerEventTicketDto): Promise<WebSocket> {
		try {
			if (import.meta.env.MODE === 'development') {
				return new WebSocket(`ws://localhost:8082/ws?ticket=${ticket.ticket}`);
			} else {
				return new WebSocket(`wss://${document.location.host}/ws?ticket=${ticket.ticket}`);
			}
		} catch (err) {
			return Promise.reject(err);
		}
	},
	// SSE
	async getSseTicket(channel: SseChannel): Promise<ServerEventTicketDto> {
		const res = await http().post('/server-events/sse/authenticate', { channel }, { silent: true });
		return res.data;
	},
	async connectToSse(ticket: ServerEventTicketDto): Promise<EventSource> {
		try {
			return new EventSource(`${API_BASE}/server-events/events?ticket=${ticket.ticket}`);
		} catch (err) {
			return Promise.reject(err);
		}
	}
};
