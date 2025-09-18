import { Response } from 'express';

export interface SseChannelData {
	ticketUuid: string
	playerId: string
	res: Response
}
