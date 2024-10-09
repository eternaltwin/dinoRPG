import { PantheonMotif } from '../enums/PantheonMotif.mjs';

export type PantheonDisplay =
	| {
			motif: PantheonMotif.RACE;
			id: number;
			playerId: number;
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
			playerId: number;
			player: {
				id: number;
				name: string;
			};
			indicator: number;
			date: Date;
	  };
