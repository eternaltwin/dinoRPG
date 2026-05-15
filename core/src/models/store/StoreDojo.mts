import { DojoBasic } from '../dojo/dojoBasic.mjs';
import { TournamentState } from '../dojo/tournament.mjs';
import { Challenge } from '../dojo/challenge.mjs';
import { DojoChallengeHistory, TournamentTeam } from '@drpg/prisma';
import { DinozDojoFiche } from '../dinoz/DinozFiche.mjs';

export interface StoreDojo {
	dojoId?: string;
	activeChallenge?: Challenge;
	reputation: number;
	DojoChallengeHistory?: Pick<DojoChallengeHistory, 'victory' | 'achieved'>[];
	TournamentTeam?: Pick<TournamentTeam, 'teamCount'> | null;
	currentTournament: TournamentState | null;
	rank: number;
	worth: number;
	tournamentInfo?: { id: string; teamRace: number[]; teamSize: number; levelLimit: number };
	myTeam: DinozDojoFiche[];
}
