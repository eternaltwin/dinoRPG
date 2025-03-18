import { http } from '../utils/index.js';
import { FBParticipation, PublicEvent, PublicFBTournament } from '@drpg/core/models/dojo/ForceBrute';
import { DinozSkillOwnAndUnlockable } from '@drpg/core/models/dinoz/DinozSkillOwnAndUnlockable';
import { PublicTournament, TournamentPhase } from '@drpg/core/models/dojo/tournament';

export const FBService = {
	getCurrentTournament(id: string): Promise<PublicFBTournament | undefined> {
		return http()
			.get(`/events/tournament/current/${id}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getTournamentParticipation(id: string): Promise<FBParticipation[]> {
		return http()
			.get(`/events/tournament/${id}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	createTournamentDinoz(name: string, id: string) {
		return http()
			.post(`/events/tournament/participation`, {
				name: name,
				tournamentId: id
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	levelUp(dinozId: number, tryNumber: number, event: string): Promise<DinozSkillOwnAndUnlockable> {
		return http()
			.get(`/events/${event}/${dinozId}/${tryNumber}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	learnSkill(dinozId: number, skillIdList: Array<number>, tryNumber: number, event: string): Promise<string> {
		return http()
			.post(`/events/${event}/learnskill/${dinozId}`, {
				skillIdList: skillIdList,
				tryNumber: tryNumber
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getCurrentEvent(): Promise<PublicEvent[]> {
		return http()
			.get(`/events/list`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getTournamentFights(id: string, phase: TournamentPhase, pool: number): Promise<PublicTournament[]> {
		return http()
			.get(`/events/tournament/${phase}/${id}/${pool}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	viewAllFightFromPool(id: string, phase: TournamentPhase, pool: number): Promise<PublicTournament[]> {
		return http()
			.patch(`/events/tournament/${phase}/${id}/${pool}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
