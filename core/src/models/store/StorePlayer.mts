import { PlayerOptions } from '../player/PlayerOptions.mjs';

export interface StorePlayer {
	money: number;
	playerId?: number;
	playerOptions: PlayerOptions;
}
