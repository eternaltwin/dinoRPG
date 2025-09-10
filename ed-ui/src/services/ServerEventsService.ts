import { http } from '../utils';
import { WsChannel } from '@drpg/core/models/serverEvents/WsChannel';
import { ServerEventTicketDto } from '@drpg/core/models/serverEvents/ServerEventTicketDto';

export const ServerEventsService = {
	async getWsTicket(channel: WsChannel): Promise<ServerEventTicketDto> {
		try {
			const res = await http().post('/server-events/websockets/authenticate', { channel });
			return res.data;
		} catch (err) {
			return Promise.reject(err);
		}
	}
};
