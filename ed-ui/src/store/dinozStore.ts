import { defineStore } from 'pinia';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { StoreDinoz } from '@drpg/core/models/store/StoreDinoz';
import { StoreStateSession } from '@drpg/core/models/store/StoreStateSession';

export const dinozStore = defineStore('dinozStore', {
	state: (): StoreDinoz => ({
		dinozList: [],
		dinozCount: undefined,
		npcSpeech: undefined,
		npcName: undefined
	}),
	getters: {
		getDinozList: (state: StoreDinoz) => state.dinozList,
		getDinozCount: (state: StoreDinoz) => state.dinozCount,
		getDinoz: (state: StoreDinoz) => {
			return (dinozId: number) => state.dinozList?.find((dinoz: DinozFiche) => dinoz.id === dinozId);
		},
		getNpcSpeech: (state: StoreStateSession) => state.npcSpeech,
		getNpcName: (state: StoreStateSession) => state.npcName
	},
	actions: {
		setDinozList(dinozList: Array<DinozFiche>): void {
			this.dinozList = dinozList;
		},
		setDinozCount(dinozCount: number): void {
			this.dinozCount = dinozCount;
		},
		setDinoz(dinoz: DinozFiche): void {
			const dinozToUpdate = this.dinozList!.findIndex(dinozs => dinozs.id === dinoz.id);
			this.dinozList!.splice(dinozToUpdate, 1, dinoz);
		},
		setNpc(speech: string, name: string): void {
			this.npcSpeech = speech;
			this.npcName = name;
		}
	},
	persist: {
		storage: window.sessionStorage
	}
});
