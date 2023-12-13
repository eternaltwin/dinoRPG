import { Dinoz, Log, Player } from '@drpg/prisma';

export type LogListResponse = (Log & {
	player: Pick<Player, 'id' | 'name'>;
	dinoz: Pick<Dinoz, 'id' | 'name'> | null;
})[];
