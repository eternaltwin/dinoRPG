import { Moderation, Player } from '@drpg/prisma';

export type BannedPlayerType = Pick<Player, 'id' | 'name'> & {
	banCase: Pick<Moderation, 'id' | 'sorted' | 'banDate' | 'banEndDate' | 'reason'> | null;
};
