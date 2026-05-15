import { ClanLite } from '../clan/clan.mjs';

export interface StoreClan {
	clan?: ClanLite;
	clanEvent?: { id: string; endDate: Date };
}
