export interface TournamentMatch {
	id: string;
	round: number;
	phase: TournamentPhase;
	matchNumber?: number;
	poolNumber?: number;
	scheduledFor: Date;
	winner: string;
}

export interface TournamentSchedule {
	qualificationStart: Date;
	qualificationEnd: Date;
	poolsStart: Date;
	finalsStart: Date;
}

export interface TournamentState {
	id: string;
	phase: TournamentPhase;
	round: number;
	nextScheduledMatch?: Date;
	schedule: TournamentSchedule;
	cashPrice: number;
	levelLimit: number;
}

export type MetaData = {
	phase: TournamentPhase;
	round: number;
	poolNumber: number;
	matchNumber: number;
	scheduledFor: string;
	team1Id: string;
	team2Id: string;
};

export type PublicMetada = {
	phase: TournamentPhase;
	round: number;
	poolNumber: number;
	matchNumber: number;
	scheduledFor: Date;
	team1Id: string;
	team2Id: string;
};

export interface PublicTournament {
	id: string;
	tournamentTeamLeft: TeamLeader;
	tournamentTeamRight: TeamLeader;
	metadata: PublicMetada;
	result: boolean;
}

export interface TournamentHistory {
	id: string;
	date: string;
}

export type TournamentTeam = {
	fight: string;
	won: boolean;
	dinoz: TeamLeader;
};

export type TeamLeader = {
	id: number;
	display: string;
	name: string;
};

export type DisplayedLeader = {
	id: number;
	display: string;
	name: string;
	fight: string;
	won: boolean;
	round: number;
	pool: number;
	matchNumber: number;
};

export enum TournamentPhase {
	QUALIFICATION = 'qualification',
	POOLS = 'pools',
	FINALS = 'finals'
}
