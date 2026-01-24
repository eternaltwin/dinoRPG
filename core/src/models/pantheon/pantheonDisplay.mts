import { Dinoz, Pantheon, Player } from '@drpg/prisma';
import { PantheonMotif } from '@drpg/prisma/enums';

export type PantheonDisplay =
	| (Pick<Pantheon, 'id' | 'playerId' | 'indicator' | 'date'> & {
			motif: PantheonMotif.race;
			dinoz: Pick<Dinoz, 'id' | 'name' | 'raceId' | 'display'>;
			player: Pick<Player, 'id' | 'name'>;
	  })
	| (Pick<Pantheon, 'id' | 'playerId' | 'indicator' | 'date'> & {
			motif: PantheonMotif.epic;
			player: Pick<Player, 'id' | 'name'>;
	  });
