import { Clan, Events, Player } from '@drpg/prisma';

export interface ClanMember {
	id: number;
	clanId: number;
	dateJoin: Date;
	nickname?: string;
	rights: string[];
	donation: number;
	playerId: string;
	player: Pick<Player, 'id' | 'name' | 'lastLogin'> & { leaderOf?: Pick<Clan, 'id'> } & {
		Events: Pick<Events, 'totalProgression'>[];
	};
	clan: Pick<Clan, 'id'>;
}
