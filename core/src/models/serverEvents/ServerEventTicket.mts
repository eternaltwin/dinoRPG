import { ServerEventType } from './ServerEventType.mjs';

export interface ServerEventTicket {
	uuid: string;
	channel: string;
	userAgent: string;
	ipAddress: string;
	playerId: string;
	timestamp: number;
	type: ServerEventType;
}
