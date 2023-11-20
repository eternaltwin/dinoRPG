import { Player } from './Player.mjs';

export interface PlayerTypeToSend extends Player {
	status: number[];
	createdDate: Date;
}
