import { PantheonMotif } from '../enums/PantheonMotif.mjs';

export type PantheonDisplay =
	| {
			motif: PantheonMotif.RACE;
			id: number;
			playerId: string;
			dinoz: {
				id: number;
				name: string;
				raceId: number;
				display: string;
			};
			indicator: number;
			date: Date;
			player: {
				id: number;
				name: string;
			};
	  }
	| {
			motif: PantheonMotif.EPIC;
			id: number;
			playerId: string;
			player: {
				id: number;
				name: string;
			};
			indicator: number;
			date: Date;
	  };
