import { http } from '../utils/index.js';
import { PlayerTypeToSend } from '@drpg/core/models/player/PlayerTypeToSend';
import { DinozAdminFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { SecretData } from '@drpg/core/models/admin/SecretData';
import { UnavailableReason } from '@drpg/prisma/enums';
import { ModerationType } from '@drpg/core/models/admin/ModerationType';
import { BannedPlayerType } from '@drpg/core/models/admin/BannedPlayerType';
import { FightProcessResult } from '@drpg/core/models/fight/FightResult';
import { Jobs } from '@drpg/core/models/admin/jobs';
import { IPList, suspectedPlayer } from '@drpg/core/models/admin/IPList';

export const AdminService = {
	async getDashBoard(): Promise<boolean> {
		const res = await http().get(`/admin/dashboard`);
		return res.data;
	},
	async givePlayerMoney(id: string, gold: number, operation: string): Promise<number> {
		const res = await http().put(`/admin/gold/${id}`, {
			gold: gold,
			operation: operation
		});
		return res.data;
	},
	async givePlayerEpicRewards(id: string, epicRewardList: Array<string>, operation: string): Promise<number> {
		const res = await http().put(`/admin/epic/${id}`, {
			epicRewardId: epicRewardList,
			operation: operation
		});
		return res.data;
	},
	async modifyPlayerItems(id: string, itemId: number, quantity: number, operation: string): Promise<void> {
		const res = await http().put(`/admin/${id}/items`, {
			operation: operation,
			items: [{ id: itemId, quantity: quantity }]
		});
		return res.data;
	},
	async modifyPlayerIngredients(id: string, ingredientId: number, quantity: number, operation: string): Promise<void> {
		const res = await http().put(`/admin/${id}/ingredients`, {
			operation: operation,
			ingredients: [{ id: ingredientId, quantity: quantity }]
		});
		return res.data;
	},
	async updateQuest(id: string, questId: number, progression: number, operation: string): Promise<void> {
		const res = await http().put(`/admin/${id}/quests`, {
			operation: operation,
			quests: [{ questId: questId, progression: progression }]
		});
		return res.data;
	},
	async getplayerInformation(id: string): Promise<PlayerTypeToSend> {
		const res = await http().get(`/admin/playerinfo/${id}`);
		return res.data;
	},
	async updatePlayer(
		id: string,
		customText?: string,
		quetzuBought?: number,
		dailyGridRewards?: number,
		leader?: boolean | null,
		engineer?: boolean | null,
		cooker?: boolean | null,
		shopKeeper?: boolean | null,
		merchant?: boolean | null,
		priest?: boolean | null,
		teacher?: boolean | null,
		messie?: boolean | null,
		matelasseur?: boolean | null,
		role?: 'admin' | 'player' | 'beta' | null
	): Promise<void> {
		const res = await http().put(`/admin/player/${id}`, {
			customText: customText,
			quetzuBought: quetzuBought,
			dailyGridRewards: dailyGridRewards,
			leader: leader,
			engineer: engineer,
			cooker: cooker,
			shopKeeper: shopKeeper,
			merchant: merchant,
			priest: priest,
			teacher: teacher,
			messie: messie,
			matelasseur: matelasseur,
			role: role
		});
		return res.data;
	},
	async listAllDinozFromPlayer(id: string): Promise<Array<DinozAdminFiche>> {
		const res = await http().get(`/admin/playerdinoz/${id}`);
		return res.data;
	},
	async listOneDinozFromPlayer(id: number): Promise<DinozAdminFiche> {
		const res = await http().get(`/admin/dinoz/${id}`);
		return res.data;
	},
	async updateDinoz(
		id: number,
		name?: string,
		unavailableReason?: UnavailableReason,
		unavailableReasonOperation?: string,
		level?: number,
		placeId?: number,
		canChangeName?: boolean,
		life?: number,
		maxLife?: number,
		experience?: number,
		nbrUpFire?: number,
		nbrUpWood?: number,
		nbrUpWater?: number,
		nbrUpLightning?: number,
		nbrUpAir?: number,
		status?: Array<string>,
		statusOperation?: string,
		skills?: Array<string>,
		skillOperation?: string,
		unlockableSkills?: Array<string>,
		unlockableSkillOperation?: string
	) {
		const res = await http().put(`/admin/dinoz/${id}`, {
			name: name,
			unavailableReason: unavailableReason,
			unavailableReasonOperation: unavailableReasonOperation,
			level: level,
			placeId: placeId,
			canChangeName: canChangeName,
			life: life,
			maxLife: maxLife,
			experience: experience,
			nbrUpFire: nbrUpFire,
			nbrUpWood: nbrUpWood,
			nbrUpWater: nbrUpWater,
			nbrUpLightning: nbrUpLightning,
			nbrUpAir: nbrUpAir,
			status: status,
			statusOperation: statusOperation,
			skills: skills,
			skillOperation: skillOperation,
			unlockableSkills: unlockableSkills,
			unlockableSkillOperation: unlockableSkillOperation
		});
		return res.data;
	},
	async getAllSecret(): Promise<Array<SecretData>> {
		const res = await http().get('/admin/secret/all');
		return res.data;
	},
	async pushSecret(key: string, value: string): Promise<Array<SecretData>> {
		const res = await http().put('/admin/secret/add', {
			key: key,
			value: value
		});
		return res.data;
	},
	async getAllModeration(page: number): Promise<Array<ModerationType>> {
		const res = await http().get(`/admin/moderation/${page}`);
		return res.data;
	},
	async takeAction(reportId: number, action: string): Promise<void> {
		const res = await http().put(`/admin/moderation/${reportId}`, {
			action: action
		});
		return res.data;
	},
	async getBannedPlayers(page: number): Promise<Array<BannedPlayerType>> {
		const res = await http().get(`/admin/ban/${page}`);
		return res.data;
	},
	async banPlayer(playerId: string, reason: string, action: string, comment: string, dinozId?: number) {
		const res = await http().post(`/admin/ban/${playerId}`, {
			reason: reason,
			action: action,
			comment: comment,
			dinozId: dinozId
		});
		return res.data;
	},
	async updateBan(
		playerId: string,
		action?: string,
		reason?: string,
		comment?: string,
		dinozId?: number
	): Promise<void> {
		const res = await http().put(`/admin/updateBan/${playerId}`, {
			action: action,
			reason: reason,
			comment: comment,
			dinozId: dinozId
		});
		return res.data;
	},
	async cancelBan(playerId: string): Promise<void> {
		const res = await http().put(`/admin/cancelBan/${playerId}`);
		return res.data;
	},
	async resetGame(): Promise<void> {
		const res = await http().delete(`/admin/truncateGame`);
		return res.data;
	},
	async debugFight(dinoz1: number, dinoz2: number, seed: string, type: string): Promise<FightProcessResult> {
		const res = await http().get(`/admin/${dinoz1}/${dinoz2}/${seed}/${type}`);
		return res.data;
	},
	async getScheduledJobs(): Promise<Jobs[]> {
		const res = await http().get(`/admin/jobs`);
		return res.data;
	},
	async getMultiIPs(page: number): Promise<IPList[]> {
		const res = await http().get(`/admin/accounts/page/${page}`);
		return res.data;
	},
	async listPlayerBehindIp(ip: string): Promise<suspectedPlayer[]> {
		const res = await http().get(`/admin/accounts/ip/${ip}`);
		return res.data;
	},
	async massBan(list: string[]) {
		const res = await http().put(`/admin/massban`, {
			list: list
		});
		return res.data;
	},
	async searchClans(name: string) {
		const res = await http().get(`/admin/clans/search/${name}`);
		return res.data;
	},
	async getClanDetails(id: number) {
		const res = await http().get(`/admin/clans/${id}`);
		return res.data;
	},
	async updateClanName(id: number, name: string) {
		const res = await http().patch(`/admin/clans/${id}/name`, { name });
		return res.data;
	},
	async updateClanLangs(id: number, langs: string[]) {
		const res = await http().patch(`/admin/clans/${id}/langs`, { langs });
		return res.data;
	},
	async removeClanBanner(id: number) {
		const res = await http().delete(`/admin/clans/${id}/banner`);
		return res.data;
	},
	async updateClanPage(pageId: number, data: { name: string; content: string }) {
		const res = await http().put(`/admin/clans/pages/${pageId}`, data);
		return res.data;
	},
	async deleteClanPage(pageId: number) {
		const res = await http().delete(`/admin/clans/pages/${pageId}`);
		return res.data;
	},
	async setClanLeader(id: number, newLeaderId: string) {
		const res = await http().patch(`/admin/clans/${id}/leader`, { newLeaderId });
		return res.data;
	},
	async kickClanMemberAdmin(playerId: string) {
		return await http().delete(`/admin/clans/member/${playerId}`);
	},
	async deleteClan(id: number) {
		const res = await http().delete(`/admin/clans/${id}`);
		return res.data;
	},
	async updateClanTreasureGold(id: number, amount: number, operation: 'add' | 'remove') {
		const res = await http().patch(`/admin/clans/${id}/treasure/gold`, { amount, operation });
		return res.data;
	},
	async updateClanTreasureIngredients(id: number, ingredientId: number, quantity: number, operation: 'add' | 'remove') {
		const res = await http().patch(`/admin/clans/${id}/treasure/ingredients`, { ingredientId, quantity, operation });
		return res.data;
	},
	async runJob(name: string) {
		const res = await http().patch(`/admin/jobs/${name}`);
		return res.data;
	}
};
