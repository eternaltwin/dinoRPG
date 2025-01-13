import { Clan } from '@drpg/core/models/clan/clan';
import { ClanJoinRequest } from '@drpg/core/models/clan/clanJoinRequest';
import { ClanMember } from '@drpg/core/models/clan/clanMember';
import { http } from '../utils/index.js';
import { ShopDTO } from '@drpg/core/models/shop/shopDTO';

export const ClanService = {
	getClansRanking(page: number): Promise<Array<Clan>> {
		return http()
			.get(`/clan/ranking/${page}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getClansList(page: number): Promise<Array<Clan>> {
		return http()
			.get(`/clan/all/${page}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	searchClansByName(name: string, page: number): Promise<Array<Clan>> {
		return http()
			.get(`/clan/search/${name}/${page}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getClan(id: number): Promise<Clan> {
		return http()
			.get(`/clan/${id}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getClanMembersList(id: number): Promise<Array<ClanMember>> {
		return http()
			.get(`/clan/${id}/members`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	createClan(name: string, description: string): Promise<Clan> {
		return http()
			.post(`/clan`, { name: name, description: description })
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	deleteClan(id: number): Promise<Clan> {
		return http()
			.delete(`/clan/${id}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	updateClanBanner(id: number, data: FormData) {
		return http()
			.put(`/clan/` + id + `/edit/banner`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getClanBanner(id: number): Promise<Buffer> {
		return http()
			.get(`/clan/${id}/banner`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	joinClan(id: number) {
		return http()
			.post(`/clan/${id}/join`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getJoinRequestslist(id: number): Promise<Array<ClanJoinRequest>> {
		return http()
			.get(`/clan/${id}/requests`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getSelfJoinRequest(): Promise<ClanJoinRequest> {
		return http()
			.get(`/clan/request/self`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	acceptJoinClanRequest(id: number) {
		return http()
			.post(`/clan/request/${id}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	denyJoinClanRequest(id: number) {
		return http()
			.delete(`/clan/request/${id}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getClanMember(clanId: number, memberId: number) {
		return http()
			.get(`/clan/${clanId}/member/${memberId}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	updateClanMember(clanId: number, clanMember: ClanMember) {
		return http()
			.put(`/clan/${clanId}/member`, { clanMember: clanMember })
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	excludeClanMember(clanId: number, memberId: number) {
		return http()
			.delete(`/clan/${clanId}/member/${memberId}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	leaveClanSelf() {
		return http()
			.delete(`/clan/member/self`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getClanPages(clanId: number) {
		return http()
			.get(`/clan/${clanId}/pages`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getClanPage(id: number) {
		return http()
			.get(`/clan/page/${id}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	createClanPage(name: string, content: string, isPublic: boolean, clanId: number) {
		return http()
			.post(`/clan/page`, { name: name, content: content, isPublic: isPublic, clanId: clanId })
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	updateClanPage(pageId: number, name: string, content: string, isPublic: boolean, clanId: number) {
		return http()
			.put(`/clan/${clanId}/page/${pageId}`, { name: name, content: content, isPublic: isPublic })
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	deleteClanPage(pageId: number, clanId: number) {
		return http()
			.delete(`/clan/${clanId}/page/${pageId}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getClanMessages(clanId: number, page: number) {
		return http()
			.get(`/clan/${clanId}/messages/${page}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getClanHistory(id: number, page: number) {
		return http()
			.get(`/clan/${id}/history/${page}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getPlayerHasRight(clanId: number, right: string) {
		return http()
			.get(`/clan/${clanId}/hasRight/${right}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getClanMessagesCount(id: number) {
		return http()
			.get(`/clan/${id}/messagesCount`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getClanHistoryCount(clanId: number) {
		return http()
			.get(`/clan/${clanId}/historyCount`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	giveIngredient(clanId: number, ingredients: ShopDTO[]) {
		return http()
			.put(`/clan/${clanId}/give`, { ingredients: ingredients })
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getClanTreasure(clanId: number): Promise<ShopDTO[]> {
		return http()
			.get(`/clan/${clanId}/treasure`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
