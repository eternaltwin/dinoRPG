import { defineStore } from 'pinia';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { StoreDinoz } from '@drpg/core/models/store/StoreDinoz';

export const dinozStore = defineStore('dinozStore', {
	state: (): StoreDinoz => ({
		dinozList: [],
		dinozCount: undefined
	}),
	getters: {
		getDinozList: (state: StoreDinoz) => state.dinozList,
		getDinozCount: (state: StoreDinoz) => state.dinozCount,
		getDinoz: (state: StoreDinoz) => {
			return (dinozId: number) => state.dinozList?.find((dinoz: DinozFiche) => dinoz.id === dinozId);
		},
		getNpc: (state: StoreDinoz) => {
			return (dinozId: number) => state.dinozList?.find((dinoz: DinozFiche) => dinoz.id === dinozId)?.npcAwait;
		}
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
		setNpc(dinozId: number, speech: string, name: string): void {
			const dinozToUpdate = this.dinozList?.find(dinozs => dinozs.id === dinozId);
			if (!dinozToUpdate) throw Error("Dinoz doesn't exist in store.");
			dinozToUpdate.npcAwait = {
				npcSpeech: speech,
				npcName: name
			};
		},
		clearNpc(dinozId: number): void {
			const dinozToUpdate = this.dinozList?.find(dinozs => dinozs.id === dinozId);
			if (!dinozToUpdate) throw Error("Dinoz doesn't exist in store.");
			dinozToUpdate.npcAwait = undefined;
		}
	},
	persist: {
		storage: window.sessionStorage
	}
});
