import { http } from '../utils/index.js';
import { PlayerTypeToSend } from '@drpg/core/models/player/PlayerTypeToSend';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { SecretData } from '@drpg/core/models/admin/SecretData';
import { UnavailableReasonFront } from '@drpg/core/models/dinoz/UnavailableReasonFront';
import { ModerationType } from '@drpg/core/models/admin/ModerationType';
import { BannedPlayerType } from '@drpg/core/models/admin/BannedPlayerType';
import { FightProcessResult } from '@drpg/core/models/fight/FightResult';

export const AdminService = {
	getDashBoard(): Promise<boolean> {
		return http()
			.get(`/admin/dashboard`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	givePlayerMoney(id: string, gold: number, operation: string): Promise<number> {
		return http()
			.put(`/admin/gold/${id}`, {
				gold: gold,
				operation: operation
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	givePlayerEpicRewards(id: string, epicRewardList: Array<string>, operation: string): Promise<number> {
		return http()
			.put(`/admin/epic/${id}`, {
				epicRewardId: epicRewardList,
				operation: operation
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	modifyPlayerItems(id: string, itemId: number, quantity: number, operation: string): Promise<void> {
		return http()
			.put(`/admin/${id}/items`, {
				operation: operation,
				items: [{ id: itemId, quantity: quantity }]
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	modifyPlayerIngredients(id: string, ingredientId: number, quantity: number, operation: string): Promise<void> {
		return http()
			.put(`/admin/${id}/ingredients`, {
				operation: operation,
				ingredients: [{ id: ingredientId, quantity: quantity }]
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	updateQuest(id: string, questId: number, progression: number, operation: string): Promise<void> {
		return http()
			.put(`/admin/${id}/quests`, {
				operation: operation,
				quests: [{ questId: questId, progression: progression }]
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getplayerInformation(id: string): Promise<PlayerTypeToSend> {
		return http()
			.get(`/admin/playerinfo/${id}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	updatePlayer(
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
		return http()
			.put(`/admin/player/${id}`, {
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
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	listAllDinozFromPlayer(id: string): Promise<Array<DinozFiche>> {
		return http()
			.get(`/admin/playerdinoz/${id}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	updateDinoz(
		id: number,
		name?: string,
		unavailableReason?: UnavailableReasonFront,
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
	): Promise<void> {
		return http()
			.put(`/admin/dinoz/${id}`, {
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
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getAllSecret(): Promise<Array<SecretData>> {
		return http()
			.get('/admin/secret/all')
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	pushSecret(key: string, value: string): Promise<Array<SecretData>> {
		return http()
			.put('/admin/secret/add', {
				key: key,
				value: value
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getAllModeration(page: number): Promise<Array<ModerationType>> {
		return http()
			.get(`/admin/moderation/${page}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	takeAction(reportId: number, action: string): Promise<void> {
		return http()
			.put(`/admin/moderation/${reportId}`, {
				action: action
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getBannedPlayers(page: number): Promise<Array<BannedPlayerType>> {
		return http()
			.get(`/admin/ban/${page}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	banPlayer(playerId: string, reason: string, action: string, comment: string, dinozId?: number) {
		return http()
			.post(`/admin/ban/${playerId}`, {
				reason: reason,
				action: action,
				comment: comment,
				dinozId: dinozId
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	updateBan(playerId: string, action?: string, reason?: string, comment?: string, dinozId?: number): Promise<void> {
		return http()
			.put(`/admin/updateBan/${playerId}`, {
				action: action,
				reason: reason,
				comment: comment,
				dinozId: dinozId
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	cancelBan(playerId: string): Promise<void> {
		return http()
			.put(`/admin/cancelBan/${playerId}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	resetGame(): Promise<void> {
		return http()
			.delete(`/admin/truncateGame`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	debugFight(dinoz1: number, dinoz2: number, seed: string, type: string): Promise<FightProcessResult> {
		return http()
			.get(`/admin/${dinoz1}/${dinoz2}/${seed}/${type}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
