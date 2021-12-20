import { http } from '@/utils';
import { CommonData, PlayerInfo } from '@/models';

export const PlayerService = {
	getCommonData(): Promise<CommonData> {
		return http()
			.get('/player/commondata')
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getPlayerData(id: number): Promise<PlayerInfo> {
		return http()
			.get(`/player/${id}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
