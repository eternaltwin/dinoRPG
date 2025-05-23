import { Dinoz, Pantheon, Player } from '@drpg/prisma';

export enum PantheonMotif {
	EPIC = 'epic',
	RACE = 'race'
}

export type PantheonDisplay =
	| (Pick<Pantheon, 'id' | 'playerId' | 'indicator' | 'date'> & {
			motif: PantheonMotif.RACE;
			dinoz: Pick<Dinoz, 'id' | 'name' | 'raceId' | 'display'>;
			player: Pick<Player, 'id' | 'name'>;
		})
	| (Pick<Pantheon, 'id' | 'playerId' | 'indicator' | 'date'> & {
			motif: PantheonMotif.EPIC;
			player: Pick<Player, 'id' | 'name'>;
		});
