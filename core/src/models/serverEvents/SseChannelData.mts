import { UUID } from 'node:crypto';
import { Response } from 'express';

export interface SseChannelData {
	connectionId: UUID
	playerId: string
	res: Response
}
