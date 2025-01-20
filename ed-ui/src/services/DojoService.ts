import { http } from '../utils/index.js';
import { DojoBasic, myTeam } from '@drpg/core/models/dojo/dojoBasic';
import { DojoFightResume } from '@drpg/core/models/dojo/dojoFightResume';
import { FighterRecap, FullFightStats } from '@drpg/core/models/fight/FightResult';
import { Challenge } from '@drpg/core/models/dojo/challenge';

export const DojoService = {
	getMyDojo(): Promise<DojoBasic> {
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
	getMyChallenge(): Promise<Challenge> {
		return http()
			.get(`/dojo/challenge`)
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
	): Promise<{ fight: DojoFightResume; stats: FullFightStats; challengeWon: boolean }> {
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
	}
};
