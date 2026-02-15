import { defineStore } from 'pinia';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { StoreDinoz } from '@drpg/core/models/store/StoreDinoz';
import { Skill } from '@drpg/core/models/dinoz/SkillList';
import { computed, ComputedRef, ref, Ref } from 'vue';

export const useDinozStore = defineStore('dinozStore', () => {
	const dinozList: Ref<DinozFiche[]> = ref([]);
	const currentDinozId: Ref<number | undefined> = ref();

	const getCurrentDinoz: ComputedRef<DinozFiche> = computed((): DinozFiche => {
		const dinoz: DinozFiche | undefined = dinozList.value.find(
			(dinoz: DinozFiche) => dinoz.id === currentDinozId.value
		);
		if (!dinoz) throw Error("Dinoz doesn't exist in store.");
		return dinoz;
	});

	const setCurrentDinozId = (dinozId: number): void => {
		currentDinozId.value = dinozId;
	};

	return {
		dinozList,
		currentDinozId,
		getCurrentDinoz,
		setCurrentDinozId
	};
});

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
			const dinoz = state.dinozList.find((dinoz: DinozFiche) => dinoz.id === state.currentDinozId);
			if (!dinoz) throw Error("Dinoz doesn't exist in store.");
			return dinoz;
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
		setDinozSkillState(dinozId: number, skill: Skill, state: boolean): void {
			const dinozToUpdate = this.dinozList.find(dinozs => dinozs.id === dinozId);
			if (!dinozToUpdate) throw Error("Dinoz doesn't exist in store.");
			const skillToUpdate = dinozToUpdate.skills.find(s => s.skillId === skill);
			if (!skillToUpdate) throw Error('Dinoz have skill in store.');
			skillToUpdate.state = state;
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
