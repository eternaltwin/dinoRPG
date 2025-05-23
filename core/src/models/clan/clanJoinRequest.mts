import { ClanLite } from './clan.mjs';
import { Player } from '../player/Player.mjs';

export interface ClanJoinRequest {
	id: number;
	clanId: number;
	date: Date;
	playerId: string;
	player: Pick<Player, 'id' | 'name'>;
	clan: Pick<ClanLite, 'id'>;
}
