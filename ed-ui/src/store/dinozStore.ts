import { defineStore } from 'pinia';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { Skill } from '@drpg/core/models/dinoz/SkillList';
import { computed, ComputedRef, ref, Ref } from 'vue';
import { orderDinozList } from '@drpg/core/utils/DinozUtils';

export const useDinozStore = defineStore('useDinozStore', () => {
	const dinozList: Ref<DinozFiche[]> = ref([]);
	const currentDinozId: Ref<number | undefined> = ref();

	const getCurrentDinoz: ComputedRef<DinozFiche> = computed((): DinozFiche => {
		const dinoz: DinozFiche | undefined = dinozList.value.find(
			(dinoz: DinozFiche) => dinoz.id === currentDinozId.value
		);
		if (!dinoz) {
			return dinozList.value[0];
		}
		return dinoz;
	});

	const getCurrentDinozId: ComputedRef<number | undefined> = computed((): number | undefined => {
		return currentDinozId.value;
	});

	const getDinozList: ComputedRef<DinozFiche[]> = computed((): DinozFiche[] => {
		return orderDinozList(dinozList.value);
	});

	const getDinoz = (dinozId: number): DinozFiche => {
		const dinoz = dinozList.value.find((dinoz: DinozFiche) => dinoz.id === dinozId);
		if (!dinoz) throw Error("Dinoz doesn't exist in store.");
		return dinoz;
	};

	const setDinozList = (dinozs: Array<DinozFiche>): void => {
		dinozList.value = dinozs;
	};

	const setDinoz = (dinoz: DinozFiche): void => {
		const dinozToUpdate = dinozList.value.findIndex(dinozs => dinozs.id === dinoz.id);
		dinozList.value.splice(dinozToUpdate, 1, dinoz);
	};

	const setCurrentDinozId = (dinozId: number): void => {
		currentDinozId.value = dinozId;
	};

	const setDinozSkillState = (dinozId: number, skill: Skill, state: boolean): void => {
		const dinozToUpdate = dinozList.value.find(dinozs => dinozs.id === dinozId);
		if (!dinozToUpdate) throw Error("Dinoz doesn't exist in store.");
		const skillToUpdate = dinozToUpdate.skills.find(s => s.skillId === skill);
		if (!skillToUpdate) throw Error('Dinoz have skill in store.');
		skillToUpdate.state = state;
	};

	const setNpc = (dinozId: number, speech: string, name: string): void => {
		const dinozToUpdate = dinozList.value.find(dinozs => dinozs.id === dinozId);
		if (!dinozToUpdate) throw Error("Dinoz doesn't exist in store.");
		dinozToUpdate.npcAwait = {
			npcSpeech: speech,
			npcName: name
		};
	};

	const clearNpc = (dinozId: number): void => {
		const dinozToUpdate = dinozList.value.find(dinozs => dinozs.id === dinozId);
		if (!dinozToUpdate) throw Error("Dinoz doesn't exist in store.");
		dinozToUpdate.npcAwait = undefined;
	};

	const setItems = (dinozId: number, items: Array<number>): void => {
		const dinozToUpdate = dinozList.value.find(dinozs => dinozs.id === dinozId);
		if (!dinozToUpdate) throw Error("Dinoz doesn't exist in store.");
		dinozToUpdate.items = items;
	};

	return {
		dinozList,
		currentDinozId,
		getCurrentDinoz,
		getCurrentDinozId,
		getDinozList,
		getDinoz,
		setDinozList,
		setDinoz,
		setCurrentDinozId,
		setDinozSkillState,
		setNpc,
		clearNpc,
		setItems
	};
});
