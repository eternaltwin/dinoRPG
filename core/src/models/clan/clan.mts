import { Player } from '../player/Player.mjs';

export interface Clan {
	id: number;
	name: string;
	treasureValue: number;
	creationDate: Date;
	leaderId: string;
	leader: Pick<Player, 'id' | 'name'>;
}
