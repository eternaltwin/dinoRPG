import { PlayerOptions } from '../player/PlayerOptions.mjs';

export interface StorePlayer {
	money: number;
	playerId?: number;
	playerName: string;
	playerOptions: PlayerOptions;
	admin: boolean;
	priest: boolean;
}
