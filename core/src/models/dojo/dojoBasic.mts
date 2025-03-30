import { Dinoz, DojoChallengeHistory, DojoOpponents, DojoTeam, TournamentTeam } from '@drpg/prisma';
import { Challenge } from './challenge.mjs';

export interface DojoBasic {
	id: string;
	playerId: number;
	activeChallenge: Challenge;
	reputation: number;
	DojoChallengeHistory: Pick<DojoChallengeHistory, 'victory' | 'achieved'>[];
	TournamentTeam: Pick<TournamentTeam, 'teamCount'> | null;
}

export interface myTeam {
	team: (Pick<DojoTeam, 'fighted'> & { dinoz: Pick<Dinoz, 'id' | 'name' | 'level' | 'display'> })[];
	DojoOpponents: (Pick<DojoOpponents, 'fighted' | 'achieved'> & {
		dinoz: Pick<Dinoz, 'id' | 'name' | 'level' | 'display'>;
	})[];
	activeChallenge: Challenge | null;
	dailyReset: number;
}
