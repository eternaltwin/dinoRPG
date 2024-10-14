import { PlayerOptions } from '../player/PlayerOptions.mjs';

export interface StorePlayer {
	money: number;
	playerId?: number;
	playerName: string;
	playerOptions: PlayerOptions;
	clanId: number | undefined;
	admin: boolean;
	priest: boolean;
	shopkeeper: boolean;
}
