import { Clan, ClanMessage, Player } from '@drpg/prisma';

export type CreateClanMessage = Omit<ClanMessage, 'clanId' | 'authorId'> & {
	author: Pick<Player, 'id' | 'name'> | null;
	clan: Pick<Clan, 'leaderId'> | null;
};
