import { http } from '../utils/index.js';
import { PlayerCommonData } from '@drpg/core/models/player/PlayerCommonData';
import { PlayerRanking } from '@drpg/core/models/player/PlayerRanking';
import { PlayerInfo } from '@drpg/core/models/player/PlayerInfo';
import { DinozFicheLite } from '@drpg/core/models/dinoz/DinozFicheLite';
import { ImportResponse } from '@drpg/core/models/import/ImportResponse';
import { TwinoStat } from '@drpg/core/models/import/twinoStat';
import { SiteAchiev } from '@drpg/core/models/import/siteAchiev';
import { SiteStat } from '@drpg/core/models/import/siteStat';

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
	requestImportAPI(code: string, server: string, cookie: string): Promise<ImportResponse> {
		return http()
			.put(`/player/importAPI`, {
				code: code,
				server: server,
				cookie: cookie
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
	},
	requestImportTwinoid(code: string): Promise<void> {
		return http()
			.put(`/player/importTwinoid`, {
				code: code
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getTwinoGeneralStat(playerId: number): Promise<Array<TwinoStat>> {
		return http()
			.get(`/player/twinoStats/${playerId}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getTwinoSpecificItem(playerId: number, type: 'stat' | 'achiev', site: number): Promise<Array<SiteAchiev | SiteStat>> {
		return http()
			.get(`/player/twinoStats/${playerId}/${type}/${site}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
interface PlayerSearch {
	name: string;
	id: number;
}
