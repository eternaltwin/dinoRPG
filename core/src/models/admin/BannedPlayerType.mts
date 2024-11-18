import { ModerationActionFront } from '../enums/ModerationActionFront.mjs';

export type BannedPlayerType = {
	id: number;
	name: string;
	banCase: {
		id: number;
		sorted: ModerationActionFront | null;
		banDate: Date | null;
		banEndDate: Date | null;
	} | null;
};
