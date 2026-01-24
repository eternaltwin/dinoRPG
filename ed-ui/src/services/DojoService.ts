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
import { DinozDojoFiche } from '@drpg/core/models/dinoz/DinozFiche';

export const DojoService = {
	async getMyDojo(): Promise<{ dojo: DojoBasic; rank: number; tournament: TournamentState | null }> {
		const res = await http().get(`/dojo/`);
		return res.data;
	},
	async fightMyFriend(
		left: number[],
		right: number[],
		rightId: string
	): Promise<{ fight: DojoFightResume; stats: FullFightStats }> {
		const res = await http().put(`/dojo/fight`, {
			left: left,
			right: right,
			rightId: rightId
		});
		return res.data;
	},
	async getSharedFight(archive: string): Promise<DojoFightResume> {
		const res = await http().get(`/dojo/share/${archive}`);
		return res.data;
	},
	async getMyHistory(page: number): Promise<{ archive: { id: string; fighters: FighterRecap[] }[]; quantity: number }> {
		const res = await http().get(`/dojo/history/${page}`);
		return res.data;
	},
	async getMyTeam(): Promise<myTeam> {
		const res = await http().get(`/dojo/team`);
		return res.data;
	},
	async createMyTeam(team: number[]): Promise<myTeam> {
		const res = await http().put(`/dojo/team`, {
			team: team
		});
		return res.data;
	},
	async fightChallenge(
		myDinoz: number,
		opponent: number
	): Promise<{ fight: DojoFightResume; stats: FullFightStats; challengeWon: boolean; victory: boolean }> {
		const res = await http().put(`/dojo/challenge`, {
			myDinoz,
			opponent
		});
		return res.data;
	},
	async skipOpponent(opponent: number): Promise<boolean> {
		const res = await http().put(`/dojo/challenge/skip`, {
			opponent
		});
		return res.data;
	},
	async getTournamentInfo(): Promise<{ id: string; teamRace: string; teamSize: number; levelLimit: number }> {
		const res = await http().get(`/dojo/tournament/`);
		return res.data;
	},
	async createTournamentTeam(team: number[]): Promise<void> {
		const res = await http().put(`/dojo/tournament/`, {
			team: team
		});
		return res.data;
	},
	async deleteTournamentTeam(): Promise<void> {
		const res = await http().delete(`/dojo/tournament/team`);
		return res.data;
	},
	async getTournamentTeam(): Promise<DinozDojoFiche[]> {
		const res = await http().get(`/dojo/tournament/team`);
		return res.data;
	},
	async getTournamentFights(id: string, phase: TournamentPhase, pool: number): Promise<PublicTournament[]> {
		const res = await http().get(`/dojo/tournament/${phase}/${id}/${pool}`);
		return res.data;
	},
	async viewAllFightFromPool(id: string, phase: TournamentPhase, pool: number): Promise<PublicTournament[]> {
		const res = await http().patch(`/dojo/tournament/${phase}/${id}/${pool}`);
		return res.data;
	},
	async getTournamentHistory(page: number): Promise<{ count: number; history: TournamentHistory[] }> {
		const res = await http().get(`/dojo/tournaments/${page}`);
		return res.data;
	}
};
