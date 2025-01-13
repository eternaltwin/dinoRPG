import { Player } from '../player/Player.mjs';
import { ClanHistoryType } from '../enums/ClanHistoryType.mjs';

export interface ClanHistory {
	id: number;
	clanId: number;
	date: Date;
	authorId?: string;
	author?: Pick<Player, 'name' | 'id'>;
	authorName: string;
	type: ClanHistoryType;
}
