import { Clan, ClanJoinRequest, ClanMember } from '@drpg/prisma';
import { Player } from '../player/Player.mjs';

export interface ClanLite {
	id: number;
	name: string;
	treasureValue: number;
	creationDate: Date;
	leaderId: string;
	leader: Pick<Player, 'id' | 'name'>;
}

export type ClanForList = Pick<Clan, 'id' | 'name' | 'creationDate'> & {
	members: Pick<ClanMember, 'id'>[];
	leader: Pick<Player, 'name'>;
}

export type ClanForSearch = Pick<Clan, 'id' | 'name'>;

export type PlayerClanJoinRequest = Pick<ClanJoinRequest, 'id' | 'date'> & {
	player: Pick<Player, 'id' | 'name'>;
	clan: Pick<Clan, 'id' | 'name'>;
}
