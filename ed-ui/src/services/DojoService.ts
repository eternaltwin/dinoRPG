import { http } from '../utils/index.js';
import { DojoBasic, myTeam } from '@drpg/core/models/dojo/dojoBasic';
import { DojoFightResume } from '@drpg/core/models/dojo/dojoFightResume';
import { FighterRecap, FullFightStats } from '@drpg/core/models/fight/FightResult';
import {
	PublicTournament,
	TournamentHistory,
	TournamentPhase,
	TournamentState
} from '@drpg/core/models/dojo/tournament';
import { DinozDojoFiche } from '@drpg/core/dist/models/dinoz/DinozFiche.mjs';

export const DojoService = {
	getMyDojo(): Promise<{ dojo: DojoBasic; rank: number; tournament: TournamentState }> {
		return http()
			.get(`/dojo/`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	fightMyFriend(
		left: number[],
		right: number[],
		rightId: string
	): Promise<{ fight: DojoFightResume; stats: FullFightStats }> {
		return http()
			.put(`/dojo/fight`, {
				left: left,
				right: right,
				rightId: rightId
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getSharedFight(archive: string): Promise<DojoFightResume> {
		return http()
			.get(`/dojo/share/${archive}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getMyHistory(page: number): Promise<{ archive: { id: string; fighters: FighterRecap[] }[]; quantity: number }> {
		return http()
			.get(`/dojo/history/${page}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getMyTeam(): Promise<myTeam> {
		return http()
			.get(`/dojo/team`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	createMyTeam(team: number[]): Promise<myTeam> {
		return http()
			.put(`/dojo/team`, {
				team: team
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	fightChallenge(
		myDinoz: number,
		opponent: number
	): Promise<{ fight: DojoFightResume; stats: FullFightStats; challengeWon: boolean; victory: boolean }> {
		return http()
			.put(`/dojo/challenge`, {
				myDinoz,
				opponent
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	skipOpponent(opponent: number): Promise<boolean> {
		return http()
			.put(`/dojo/challenge/skip`, {
				opponent
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getTournamentInfo(): Promise<{ id: string; teamRace: string; teamSize: number; levelLimit: number }> {
		return http()
			.get(`/dojo/tournament/`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	createTournamentTeam(team: number[]): Promise<void> {
		return http()
			.put(`/dojo/tournament/`, {
				team: team
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	deleteTournamentTeam(): Promise<void> {
		return http()
			.delete(`/dojo/tournament/team`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getTournamentTeam(): Promise<DinozDojoFiche[]> {
		return http()
			.get(`/dojo/tournament/team`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getTournamentFights(id: string, phase: TournamentPhase, pool: number): Promise<PublicTournament[]> {
		return http()
			.get(`/dojo/tournament/${phase}/${id}/${pool}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	viewAllFightFromPool(id: string, phase: TournamentPhase, pool: number): Promise<PublicTournament[]> {
		return http()
			.patch(`/dojo/tournament/${phase}/${id}/${pool}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getTournamentHistory(page: number): Promise<{ count: number; history: TournamentHistory[] }> {
		return http()
			.get(`/dojo/tournaments/${page}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
