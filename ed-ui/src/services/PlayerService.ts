import { http } from '../utils/index.js';
import { PlayerCommonData } from '@drpg/core/models/player/PlayerCommonData';
import { PlayerInfo } from '@drpg/core/models/player/PlayerInfo';
import { DinozFicheLite } from '@drpg/core/models/dinoz/DinozFicheLite';
import { ImportResponse } from '@drpg/core/models/import/ImportResponse';
import { TwinoStat } from '@drpg/core/models/import/twinoStat';
import { SiteAchiev } from '@drpg/core/models/import/siteAchiev';
import { SiteStat } from '@drpg/core/models/import/siteStat';
import { RankingGetResponse } from '@drpg/core/returnTypes/Ranking';
import { Lang, Player } from '@drpg/prisma';

export const PlayerService = {
	async getLoggedInData(): Promise<PlayerCommonData> {
		const res = await http().get('/player/commondata');
		return res.data;
	},
	async getPlayersRanking(sort: string, page: number): Promise<RankingGetResponse> {
		const res = await http().get(`/ranking/${sort}/${page}`);
		return res.data;
	},
	async getPlayerData(id: string): Promise<PlayerInfo> {
		const res = await http().get(`/player/${id}`);
		return res.data;
	},
	async requestImport(server: string): Promise<void> {
		const res = await http().put(`/player/import`, {
			server: server
		});
		return res.data;
	},
	async requestImportAPI(code: string, server: string, cookie: string): Promise<ImportResponse> {
		const res = await http().put(`/player/importAPI`, {
			code: code,
			server: server,
			cookie: cookie
		});
		return res.data;
	},
	async setCustomText(message: string): Promise<void> {
		const res = await http().put(`/player/customText`, {
			message: message
		});
		return res.data;
	},
	async searchPlayers(name: string): Promise<Array<PlayerSearch>> {
		const res = await http().get(`/player/search/${name}`);
		return res.data;
	},
	async getPlayerMoney(): Promise<string> {
		const res = await http().get(`/player/getmoney`);
		return res.data;
	},
	async getDinozList(): Promise<Array<DinozFicheLite>> {
		const res = await http().get(`/player/dinozList`);
		return res.data;
	},
	async requestImportTwinoid(code: string): Promise<void> {
		const res = await http().put(`/player/importTwinoid`, {
			code: code
		});
		return res.data;
	},
	async getTwinoGeneralStat(playerId: string): Promise<Array<TwinoStat>> {
		const res = await http().get(`/player/twinoStats/${playerId}`);
		return res.data;
	},
	async getTwinoSpecificStat(playerId: string, type: 'stat', site: number): Promise<Array<SiteStat>> {
		const res = await http().get(`/player/twinoStats/${playerId}/${type}/${site}`);
		return res.data;
	},
	async getTwinoSpecificAchiev(playerId: string, type: 'achiev', site: number): Promise<Array<SiteAchiev>> {
		const res = await http().get(`/player/twinoStats/${playerId}/${type}/${site}`);
		return res.data;
	},
	async getPosition(playerId: string): Promise<{ position: number }> {
		const res = await http().get(`/ranking/${playerId}/get/position`);
		return res.data;
	},
	async getLBRewards(): Promise<{ quantity: number }> {
		const res = await http().get(`/player/labrute`);
		return res.data;
	},
	async getCanCreateClan(): Promise<boolean> {
		const res = await http().get(`/player/canCreateClan`);
		return res.data;
	},
	async getPlayerMenuInfos(playerId: string): Promise<Pick<Player, 'id' | 'name' | 'customText'>> {
		const res = await http().get(`/player/smallMenu/${playerId}`);
		return res.data;
	},
	async resetAccount(): Promise<void> {
		const res = await http().delete(`/player`);
		return res.data;
	},
	async updatePlayerLanguage(language: Lang): Promise<void> {
		const res = await http().put('/player/language', {
			language: language
		});
		return res.data;
	},
	async updateSetting(
		setting: 'skipLevel' | 'skipFight' | 'archivedSiteId' | 'shareArchivedData',
		value: boolean | number
	): Promise<void> {
		const res = await http().patch(`/player/settings/${setting}`, {
			setting: value
		});
		return res.data;
	}
};
interface PlayerSearch {
	name: string;
	id: string;
}
