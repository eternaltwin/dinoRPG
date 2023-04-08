import { http } from '../utils/index.js';
import { PlayerTypeToSend } from '@drpg/core/dist/models/player/PlayerTypeToSend.mjs';
import { DinozFiche } from '@drpg/core/dist/models/dinoz/DinozFiche.mjs';

export const AdminService = {
	getDashBoard(): Promise<boolean> {
		return http()
			.get(`/admin/dashboard`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	givePlayerMoney(id: number, gold: number, operation: string): Promise<number> {
		return http()
			.put(`/admin/gold/${id}`, {
				gold: gold,
				operation: operation
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	givePlayerEpicRewards(id: number, epicRewardList: Array<string>, operation: string): Promise<number> {
		return http()
			.put(`/admin/epic/${id}`, {
				epicRewardId: epicRewardList,
				operation: operation
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getplayerInformation(id: number): Promise<PlayerTypeToSend> {
		return http()
			.get(`/admin/playerinfo/${id}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	updatePlayer(
		id: number,
		customText?: string,
		hasImported?: boolean,
		quetzuBought?: number,
		leader?: boolean | null,
		engineer?: boolean | null,
		cooker?: boolean | null,
		shopKeeper?: boolean | null,
		merchant?: boolean | null,
		priest?: boolean | null,
		teacher?: boolean | null
	): Promise<void> {
		return http()
			.put(`/admin/player/${id}`, {
				customText: customText,
				hasImported: hasImported,
				quetzuBought: quetzuBought,
				leader: leader,
				engineer: engineer,
				cooker: cooker,
				shopKeeper: shopKeeper,
				merchant: merchant,
				priest: priest,
				teacher: teacher
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	listAllDinozFromPlayer(id: number): Promise<Array<DinozFiche>> {
		return http()
			.get(`/admin/playerdinoz/${id}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	updateDinoz(
		id: number,
		name?: string,
		isFrozen?: boolean,
		isSacrificed?: boolean,
		level?: number,
		placeId?: number,
		canChangeName?: boolean,
		life?: number,
		maxLife?: number,
		experience?: number,
		status?: Array<string>,
		statusOperation?: string,
		skill?: Array<string>,
		skillOperation?: string
	): Promise<void> {
		return http()
			.put(`/admin/dinoz/${id}`, {
				name: name,
				isFrozen: isFrozen,
				isSacrificed: isSacrificed,
				level: level,
				placeId: placeId,
				canChangeName: canChangeName,
				life: life,
				maxLife: maxLife,
				experience: experience,
				status: status,
				statusOperation: statusOperation,
				skill: skill,
				skillOperation: skillOperation
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
