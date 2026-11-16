import { Response } from 'express';

export interface SseChannelData {
	ticketUuid: string;
	playerId: string;
	res: Response;
	ip: string;
	userAgent: string;
	connectedAt: number;
	messagesOut: number;
	lastMessageOutAt: number | null;
}
