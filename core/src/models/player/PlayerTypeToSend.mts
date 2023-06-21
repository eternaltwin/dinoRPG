import { Player } from './Player.mjs';

export interface PlayerTypeToSend extends Player {
	status: Array<number>;
	createdDate: Date;
}
