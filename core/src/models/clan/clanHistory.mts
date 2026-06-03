import { Player } from '@drpg/prisma';
import { ClanHistoryType } from '../enums/ClanHistoryType.mjs';

export interface ClanHistory {
	id: number;
	clanId: number;
	date: Date;
	authorId?: string;
	author?: Pick<Player, 'name' | 'id'>;
	authorName: string;
	authorMessage: string;
	type: ClanHistoryType;
}
