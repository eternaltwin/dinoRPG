import { http } from '../utils/index.js';
import { DojoBasic } from '@drpg/core/models/dojo/dojoBasic';
import { DojoFightResume } from '@drpg/core/models/dojo/dojoFightResume';
import { FighterRecap, FullFightStats } from '@drpg/core/models/fight/FightResult';

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
	}
};
