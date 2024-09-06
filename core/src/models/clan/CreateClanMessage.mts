import { Clan, ClanMessage, Player } from '@drpg/prisma';

export type CreateClanMessage = Omit<ClanMessage, 'clanId' | 'authorId'> & {
    author: Pick<Player, 'id' | 'name'>;
    clan: Pick<Clan, 'leaderId'> | null;
};
