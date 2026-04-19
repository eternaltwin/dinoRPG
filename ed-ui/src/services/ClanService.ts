import { AttackStatus, Castle, ClanForSearch, ClanLite, PlayerClanJoinRequest } from '@drpg/core/models/clan/clan';
import { JoinClanResponse, JoinRequestListResponse } from '@drpg/core/models/clan/clanJoinRequest';
import { ClanMember } from '@drpg/core/models/clan/clanMember';
import { ShopDTO } from '@drpg/core/models/shop/shopDTO';
import { http } from '../utils/index.js';
import { LocalesEnum } from '../i18n';
import { ClanRankingType } from '@drpg/core/models/rankings/clanRanking';
import { GetClanMemberResponse, UpdateClanMemberRequestBody } from '@drpg/core/returnTypes/Clan';

export const ClanService = {
	async getClansRanking(page: number, type: ClanRankingType): Promise<Array<ClanLite>> {
		const res = await http().get(`/clan/ranking/${type}/${page}`);
		return res.data;
	},
	async getClansList(page: number): Promise<ClanLite[]> {
		const res = await http().get(`/clan/all/${page}`);
		return res.data;
	},
	async searchClansByName(name: string, page: number): Promise<ClanLite[]> {
		const res = await http().get(`/clan/search/${name}/${page}`);
		return res.data;
	},
	async searchClans(name: string): Promise<ClanForSearch[]> {
		const res = await http().get(`/clan/search/${name}`);
		return res.data;
	},
	async getClan(id: number): Promise<ClanLite> {
		const res = await http().get(`/clan/${id}`);
		return res.data;
	},
	async getClanMembersList(id: number): Promise<Array<ClanMember>> {
		const res = await http().get(`/clan/${id}/members`);
		return res.data;
	},
	async createClan(name: string, description: string, languages: LocalesEnum[]): Promise<ClanLite> {
		const res = await http().post(`/clan`, { name, description, languages });
		return res.data;
	},
	async deleteClan(id: number): Promise<ClanLite> {
		const res = await http().delete(`/clan/${id}`);
		return res.data;
	},
	async updateClanBanner(id: number, data: FormData) {
		const res = await http().put(`/clan/` + id + `/edit/banner`, data);
		return res.data;
	},
	async updateClanLangs(id: number, languages: LocalesEnum[]): Promise<LocalesEnum[]> {
		const res = await http().put(`/clan/${id}/edit/langs`, { languages });
		return res.data;
	},
	async joinClan(id: number): Promise<JoinClanResponse> {
		const res = await http().post(`/clan/${id}/join`);
		return res.data;
	},
	async getJoinRequestslist(id: number): Promise<JoinRequestListResponse> {
		const res = await http().get(`/clan/${id}/requests`);
		return res.data;
	},
	async getSelfJoinRequest(): Promise<PlayerClanJoinRequest | null> {
		const res = await http().get(`/clan/request/self`);
		return res.data;
	},
	async acceptJoinClanRequest(id: number): Promise<ClanMember> {
		const res = await http().post(`/clan/request/${id}`);
		return res.data;
	},
	async denyJoinClanRequest(id: number) {
		const res = await http().delete(`/clan/request/${id}`);
		return res.data;
	},
	async getClanMember(clanId: number, memberId: number): Promise<GetClanMemberResponse> {
		const res = await http().get(`/clan/${clanId}/member/${memberId}`);
		return res.data;
	},
	async updateClanMember(clanId: number, clanMember: UpdateClanMemberRequestBody['clanMember']) {
		const res = await http().put(`/clan/${clanId}/member`, { clanMember: clanMember });
		return res.data;
	},
	async excludeClanMember(clanId: number, memberId: number) {
		const res = await http().delete(`/clan/${clanId}/member/${memberId}`);
		return res.data;
	},
	async leaveClanSelf() {
		const res = await http().delete(`/clan/member/self`);
		return res.data;
	},
	async getClanPages(clanId: number) {
		const res = await http().get(`/clan/${clanId}/pages`);
		return res.data;
	},
	async getClanPage(id: number) {
		const res = await http().get(`/clan/page/${id}`);
		return res.data;
	},
	async createClanPage(name: string, content: string, isPublic: boolean, clanId: number) {
		const res = await http().post(`/clan/page`, { name: name, content: content, isPublic: isPublic, clanId: clanId });
		return res.data;
	},
	async updateClanPage(pageId: number, name: string, content: string, isPublic: boolean, clanId: number) {
		const res = await http().put(`/clan/${clanId}/page/${pageId}`, {
			name: name,
			content: content,
			isPublic: isPublic
		});
		return res.data;
	},
	async deleteClanPage(pageId: number, clanId: number) {
		const res = await http().delete(`/clan/${clanId}/page/${pageId}`);
		return res.data;
	},
	async getClanMessages(clanId: number, page: number) {
		const res = await http().get(`/clan/${clanId}/messages/${page}`);
		return res.data;
	},
	async getClanHistory(id: number, page: number) {
		const res = await http().get(`/clan/${id}/history/${page}`);
		return res.data;
	},
	async getPlayerHasRight(clanId: number, right: string) {
		const res = await http().get(`/clan/${clanId}/hasRight/${right}`);
		return res.data;
	},
	async getClanMessagesCount(id: number) {
		const res = await http().get(`/clan/${id}/messagesCount`);
		return res.data;
	},
	async getClanHistoryCount(clanId: number) {
		const res = await http().get(`/clan/${clanId}/historyCount`);
		return res.data;
	},
	async giveIngredient(clanId: number, ingredients: ShopDTO[]) {
		const res = await http().put(`/clan/${clanId}/give`, { ingredients: ingredients });
		return res.data;
	},
	async getClanTreasure(clanId: number): Promise<ShopDTO[]> {
		const res = await http().get(`/clan/${clanId}/treasure`);
		return res.data;
	},
	async buildCastle(): Promise<void> {
		const res = await http().put(`/clan/war/castle`);
		return res.data;
	},
	async warStatus(clanId: number): Promise<AttackStatus[]> {
		const res = await http().get(`/clan/war/${clanId}`);
		return res.data;
	},
	async declareWar(clanId: number): Promise<void> {
		const res = await http().post(`/clan/war/${clanId}`);
		return res.data;
	},
	async forfeitWar(warId: number): Promise<void> {
		const res = await http().delete(`/clan/war/${warId}`);
		return res.data;
	},
	async addDefenser(dinozId: number): Promise<void> {
		const res = await http().put(`/clan/war/dinoz/${dinozId}`);
		return res.data;
	},
	async castleStatus(): Promise<Castle> {
		const res = await http().get(`/clan/war/castle`);
		return res.data;
	},
	async removeDefender(dinozId: number): Promise<Castle> {
		const res = await http().delete(`/clan/war/dinoz/${dinozId}`);
		return res.data;
	},
	async reorderDefender(order: number[]): Promise<number[]> {
		const res = await http().patch(`/clan/war/dinoz`, { dinozIds: order });
		return res.data;
	}
};
