import { Player, Ranking } from '@drpg/prisma';
import { StatTracking } from '../models/enums/statTracking.mjs';

export type RankingGetResponse = (Pick<Ranking, 'points' | 'average' | 'dinozCount' | 'completion' | 'dojo'> & {
	player: Pick<Player, 'id' | 'name'> & { worth: number };
})[];

export type GetStatRankingsResponse = {
	playerId: string;
	playerName: string;
	stat: StatTracking;
	quantity: number;
}[];
