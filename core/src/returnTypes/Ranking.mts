import { Player, Ranking } from '@drpg/prisma';

export type RankingGetResponse = (Pick<Ranking, 'points' | 'average' | 'dinozCount' | 'completion'> & {
	player: Pick<Player, 'id' | 'name'> | null;
})[];
