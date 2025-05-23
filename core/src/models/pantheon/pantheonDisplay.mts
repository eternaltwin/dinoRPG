import { Dinoz, Pantheon, Player } from '@drpg/prisma';

export type PantheonDisplay =
	| (Pick<Pantheon, 'id' | 'playerId' | 'indicator' | 'date'> & {
			motif: "race";
			dinoz: Pick<Dinoz, 'id' | 'name' | 'raceId' | 'display'>;
			player: Pick<Player, 'id' | 'name'>;
		})
	| (Pick<Pantheon, 'id' | 'playerId' | 'indicator' | 'date'> & {
			motif: "epic";
			player: Pick<Player, 'id' | 'name'>;
		});
