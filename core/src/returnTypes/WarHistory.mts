import { Clan, ClanWar } from '@drpg/prisma';

export type WarHistoryItem = Pick<ClanWar, 'id' | 'startedAt'> & {
	attacker: Pick<Clan, 'id' | 'name'>;
	defender: Pick<Clan, 'id' | 'name'>;
	endReason: string | null;
};

export type WarHistoryResponse = WarHistoryItem[];
