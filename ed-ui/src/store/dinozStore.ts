import { defineStore } from 'pinia';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { StoreDinoz } from '@drpg/core/models/store/StoreDinoz';

export const dinozStore = defineStore('dinozStore', {
	state: (): StoreDinoz => ({
		dinozList: [],
		currentDinozId: undefined
	}),
	getters: {
		getDinozList: (state: StoreDinoz) => state.dinozList,
		getDinoz: (state: StoreDinoz) => {
			return (dinozId: number) => state.dinozList.find((dinoz: DinozFiche) => dinoz.id === dinozId);
		},
		getCurrentDinoz: (state: StoreDinoz) => {
			return state.dinozList.find((dinoz: DinozFiche) => dinoz.id === state.currentDinozId);
		},
		getCurrentDinozInventory: (state: StoreDinoz) => {
			const dinoz = state.dinozList.find((dinoz: DinozFiche) => dinoz.id === state.currentDinozId);
			if (!dinoz) throw Error("Dinoz doesn't exist in store.");
			const items: Array<number> = new Array(dinoz.maxItems);
			dinoz.items.forEach((item, index) => (items[index] = item));
			return items;
		},
		getNpc: (state: StoreDinoz) => {
			return (dinozId: number) => state.dinozList.find((dinoz: DinozFiche) => dinoz.id === dinozId)?.npcAwait;
		},
		getCurrentDinozId: (state: StoreDinoz) => state.currentDinozId
	},
	actions: {
		setDinozList(dinozList: Array<DinozFiche>): void {
			this.dinozList = dinozList;
		},
		setDinoz(dinoz: DinozFiche): void {
			const dinozToUpdate = this.dinozList.findIndex(dinozs => dinozs.id === dinoz.id);
			this.dinozList.splice(dinozToUpdate, 1, dinoz);
		},
		setNpc(dinozId: number, speech: string, name: string): void {
			const dinozToUpdate = this.dinozList.find(dinozs => dinozs.id === dinozId);
			if (!dinozToUpdate) throw Error("Dinoz doesn't exist in store.");
			dinozToUpdate.npcAwait = {
				npcSpeech: speech,
				npcName: name
			};
		},
		clearNpc(dinozId: number): void {
			const dinozToUpdate = this.dinozList.find(dinozs => dinozs.id === dinozId);
			if (!dinozToUpdate) throw Error("Dinoz doesn't exist in store.");
			dinozToUpdate.npcAwait = undefined;
		},
		setCurrentDinozId(dinozId: number): void {
			this.currentDinozId = dinozId;
		},
		setItems(dinozId: number, items: Array<number>): void {
			const dinozToUpdate = this.dinozList.find(dinozs => dinozs.id === dinozId);
			if (!dinozToUpdate) throw Error("Dinoz doesn't exist in store.");
			dinozToUpdate.items = items;
		}
	},
	persist: {
		storage: window.sessionStorage
	}
});
