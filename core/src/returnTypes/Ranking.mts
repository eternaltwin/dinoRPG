import { Player, Ranking } from '@drpg/prisma';

export type RankingGetResponse = (Pick<Ranking, 'points' | 'average' | 'dinozCount'> & {
	player: Pick<Player, 'id' | 'name'> | null;
})[];
