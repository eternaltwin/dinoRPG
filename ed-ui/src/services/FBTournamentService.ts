import { http } from '../utils/index.js';
import { FBOpponent, FBParticipation, PublicEvent, PublicFBTournament } from '@drpg/core/models/dojo/ForceBrute';
import { DinozSkillOwnAndUnlockable } from '@drpg/core/models/dinoz/DinozSkillOwnAndUnlockable';
import { PublicTournament, TournamentPhase } from '@drpg/core/models/dojo/tournament';
import { LearnSkillData } from '@drpg/core/returnTypes/Dinoz';
import { FBTournamentFightOpponentResponse } from '@drpg/core/returnTypes/Fight';

export const FBService = {
	async getCurrentTournament(id: string): Promise<PublicFBTournament | undefined> {
		const res = await http().get(`/events/tournament/current/${id}`);
		return res.data;
	},
	async getTournamentParticipation(id: string): Promise<FBParticipation[]> {
		const res = await http().get(`/events/tournament/${id}`);
		return res.data;
	},
	async createTournamentDinoz(name: string, id: string) {
		const res = await http().post(`/events/tournament/participation`, {
			name: name,
			tournamentId: id
		});
		return res.data;
	},
	async levelUp(dinozId: number, tryNumber: number, event: string): Promise<DinozSkillOwnAndUnlockable> {
		const res = await http().get(`/events/${event}/${dinozId}/${tryNumber}`);
		return res.data;
	},
	async learnSkill(
		dinozId: number,
		skillIdList: Array<number>,
		tryNumber: number,
		event: string
	): Promise<LearnSkillData> {
		const res = await http().post(`/events/${event}/learnskill/${dinozId}`, {
			skillIdList: skillIdList,
			tryNumber: tryNumber
		});
		return res.data;
	},
	async getCurrentEvent(): Promise<PublicEvent[]> {
		const res = await http().get(`/events/list`);
		return res.data;
	},
	async getTournamentFights(id: string, phase: TournamentPhase, pool: number): Promise<PublicTournament[]> {
		const res = await http().get(`/events/tournament/${phase}/${id}/${pool}`);
		return res.data;
	},
	async viewAllFightFromPool(id: string, phase: TournamentPhase, pool: number): Promise<PublicTournament[]> {
		const res = await http().patch(`/events/tournament/${phase}/${id}/${pool}`);
		return res.data;
	},
	async getOpponent(id: number): Promise<FBOpponent> {
		const res = await http().get(`/events/opponent/${id}`);
		return res.data;
	},
	async fightOpponent(id: number): Promise<FBTournamentFightOpponentResponse> {
		const res = await http().get(`/events/fight/${id}`);
		return res.data;
	}
};
