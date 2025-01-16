import { Player } from '../player/Player.mjs';
import { Clan } from './clan.mjs';

export interface ClanMember {
	id: number;
	clanId: number;
	dateJoin: Date;
	nickname?: string;
	rights: string[];
	donation: number;
	playerId: string;
	player: Pick<Player, 'id' | 'name' | 'lastLogin'> & { leaderOf?: { id: number } };
	clan: Pick<Clan, 'id'>;
}
