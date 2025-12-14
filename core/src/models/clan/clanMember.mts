import { Clan, Events, Player } from '@drpg/prisma';

export interface ClanMember {
	id: number;
	dateJoin: Date;
	nickname: string | null;
	rights: string[];
	donation: number;
	player: Pick<Player, 'id' | 'name' | 'lastLogin'> & { leaderOf: Pick<Clan, 'id'> | null } & {
		Events: Pick<Events, 'totalProgression'>[];
	};
	clan: Pick<Clan, 'id'>;
}
