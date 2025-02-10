import { Player, Ranking } from '@drpg/prisma';

export type RankingGetResponse = (Pick<Ranking, 'points' | 'average' | 'dinozCount' | 'completion' | 'dojo'> & {
	player: Pick<Player, 'id' | 'name'> & { worth: number };
})[];
