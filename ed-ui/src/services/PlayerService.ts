import { http } from '../utils/index.js';
import { PlayerCommonData } from '@drpg/core/models/player/PlayerCommonData';
import { PlayerRanking } from '@drpg/core/models/player/PlayerRanking';
import { PlayerInfo } from '@drpg/core/models/player/PlayerInfo';
import { DinozFicheLite } from '@drpg/core/models/dinoz/DinozFicheLite';

export const PlayerService = {
	getLoggedInData(): Promise<PlayerCommonData> {
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
	},
	getPlayerMoney(): Promise<string> {
		return http()
			.get(`/player/getmoney`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getDinozList(): Promise<Array<DinozFicheLite>> {
		return http()
			.get(`/player/dinozList`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
interface PlayerSearch {
	name: string;
	id: number;
}
