import { http } from '../utils/index.js';
import { FightReplay, FightResult } from '@drpg/core/models/fight/FightResult';
import { FightArchivePage, FightFavorites } from '@drpg/core/models/fight/FightArchiveList';

export const FightService = {
	async processFight(dinozId: number): Promise<FightResult> {
		const res = await http().put(`/fight`, {
			dinozId: dinozId
		});
		return res.data;
	},
	async getReplay(archiveId: string): Promise<FightReplay> {
		const res = await http().get(`/fight/${archiveId}`);
		return res.data;
	},
	async getMyArchives(page: number): Promise<FightArchivePage> {
		const res = await http().get(`/fight/archives/mine/${page}`);
		return res.data;
	},
	async getFavorites(): Promise<FightFavorites> {
		const res = await http().get(`/fight/archives/favorites`);
		return res.data;
	},
	async isFavorite(archiveId: string): Promise<{ favorite: boolean; pvp: boolean }> {
		const res = await http().get(`/fight/${archiveId}/favorite`);
		return res.data;
	},
	async setFavorite(archiveId: string, favorite: boolean): Promise<{ favorite: boolean; count: number; max: number }> {
		const res = await http().put(`/fight/${archiveId}/favorite`, { favorite });
		return res.data;
	}
};
