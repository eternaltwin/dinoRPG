import { Player } from '../../entity';

export interface PlayerTypeToSend extends Omit<Player, 'rewards' | 'status'> {
	rewards: Array<number>;
	status: Array<number>;
}
