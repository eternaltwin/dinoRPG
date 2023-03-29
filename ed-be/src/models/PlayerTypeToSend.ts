import { Player } from '../entity/index.js';

export interface PlayerTypeToSend extends Omit<Player, 'rewards' | 'status'> {
  rewards: Array<number>;
  status: Array<number>;
}
