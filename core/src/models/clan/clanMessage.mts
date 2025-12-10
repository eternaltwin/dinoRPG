import { Clan, Player, PlayerTracking } from '@drpg/prisma';

export interface ClanMessage {
	id: number;
	clanId: number;
	date: Date;
	content: string;
	authorId?: string;
	author?:
		| (Pick<Player, 'id' | 'name'> & {
				playerTracking: PlayerTracking[];
		  })
		| null;
	authorName: string;
	clan: Pick<Clan, 'leaderId'> | null;
}
