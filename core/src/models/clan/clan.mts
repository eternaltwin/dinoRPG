import { Clan, ClanCastle, ClanJoinRequest, ClanMember, Player } from '@drpg/prisma';

export type ClanLite = Pick<Clan, 'id' | 'name' | 'treasureValue' | 'creationDate' | 'leaderId' | 'langs'> & {
	members: Pick<ClanMember, 'id'>[];
	leader: Pick<Player, 'id' | 'name'>;
	totalScore?: number;
	bannerUrl?: string;
	castle?: ClanCastle;
};

export type ClanForSearch = Pick<Clan, 'id' | 'name'>;

export type PlayerClanJoinRequest = Pick<ClanJoinRequest, 'id' | 'date'> & {
	player: Pick<Player, 'id' | 'name'>;
	clan: Pick<Clan, 'id' | 'name' | 'leaderId'> & {
		members: Pick<ClanMember, 'playerId' | 'rights'>[];
	};
};
