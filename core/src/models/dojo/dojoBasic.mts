import { DojoTeam, DojoOpponents, Dinoz, DojoChallengeHistory } from '@drpg/prisma';

export interface DojoBasic {
	id: string;
	playerId: number;
	activeChallenge: number;
	reputation: number;
	DojoChallengeHistory: Pick<DojoChallengeHistory, 'victory' | 'achieved'>[];
}

export interface myTeam {
	team: (Pick<DojoTeam, 'fighted'> & { dinoz: Pick<Dinoz, 'id' | 'name' | 'level' | 'display'> })[];
	DojoOpponents: (Pick<DojoOpponents, 'fighted' | 'achieved'> & {
		dinoz: Pick<Dinoz, 'id' | 'name' | 'level' | 'display'>;
	})[];
	activeChallenge: string | null
}
