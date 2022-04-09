import { http } from '@/utils';
import { CommonData, PlayerInfo, PlayerRanking } from '@/models';

export const PlayerService = {
	getCommonData(): Promise<CommonData> {
		return http()
			.get('/player/commondata')
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getPlayersRanking(sort: string, page: number): Promise<Array<PlayerRanking>> {
		return http()
			.get(`/ranking/${sort}/${page}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getPlayerData(id: number): Promise<PlayerInfo> {
		return http()
			.get(`/player/${id}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	requestImport(server: string): Promise<void> {
		return http()
			.put(`/player/import`, {
				server: server
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	setCustomText(message: string): Promise<void> {
		return http()
			.put(`/player/customText`, {
				message: message
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	searchPlayers(name: string): Promise<Array<PlayerSearch>> {
		return http()
			.get(`/player/search/${name}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
interface PlayerSearch {
	name: string;
	playerId: number;
}
