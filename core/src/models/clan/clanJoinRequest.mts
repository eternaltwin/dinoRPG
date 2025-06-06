import { Clan, ClanJoinRequest, ClanMember, Player } from '@drpg/prisma';

export type JoinClanResponse = Pick<ClanJoinRequest, 'id' | 'date'> & {
	clan: Pick<Clan, 'id' | 'name' | 'leaderId'> & {
		members: Pick<ClanMember, 'playerId' | 'rights'>[];
	};
	player: Pick<Player, 'id' | 'name'>;
};

export type JoinRequestListResponse = (Pick<ClanJoinRequest, 'id' | 'date'> & {
	player: Pick<Player, 'id' | 'name'>;
})[];
