import { defineStore } from 'pinia';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { Skill } from '@drpg/core/models/dinoz/SkillList';
import { computed, ComputedRef, ref, Ref } from 'vue';
import { orderDinozList } from '@drpg/core/utils/DinozUtils';
import { DinozService } from '../services';

export const useDinozStore = defineStore('useDinozStore', () => {
	const dinozList: Ref<DinozFiche[]> = ref([]);
	const currentDinozId: Ref<number | undefined> = ref();

	const refreshDinozFiche = async (dinozId: number): Promise<DinozFiche> => {
		const dinozFiche = await DinozService.getDinozFiche(dinozId);
		const list = dinozList.value;
		const dinozIndex = list.findIndex(d => d.id === dinozId);

		if (dinozIndex === -1) {
			list.push(dinozFiche);
		} else {
			list.splice(dinozIndex, 1, {
				...list[dinozIndex],
				...dinozFiche
			});
		}

		if (dinozFiche.followers.length >= 1) {
			for (const follower of dinozFiche.followers) {
				const followerFiche = await DinozService.getDinozFiche(follower.id);
				const followerIndex = list.findIndex(d => d.id === followerFiche.id);
				list.splice(followerIndex, 1, {
					...list[followerIndex],
					...followerFiche
				});
			}
		}

		const storedFollowers = list.filter(d => d.leaderId === dinozId);
		storedFollowers.forEach(d => {
			if (!dinozFiche.followers.some(f => f.id === d.id)) {
				d.leaderId = null;
			}
		});

		dinozList.value = [...list];
		return dinozFiche;
	};

	// The returned value may be undefined if the player has no Dinoz (which happens when you start the game)
	const getCurrentDinoz: ComputedRef<DinozFiche | undefined> = computed((): DinozFiche | undefined => {
		const dinoz: DinozFiche | undefined = dinozList.value.find(
			(dinoz: DinozFiche) => dinoz.id === currentDinozId.value
		);
		if (!dinoz && dinozList.value.length > 0) {
			// Fallback to the first Dinoz of the list if possible
			return dinozList.value[0];
		}
		return dinoz;
	});

	// The returned value may be undefined if the player has no Dinoz (which happens when you start the game)
	const getCurrentDinozId: ComputedRef<number | undefined> = computed((): number | undefined => {
		if (currentDinozId.value === undefined && dinozList.value.length > 0) {
			// Fallback to the first Dinoz of the list if possible
			return dinozList.value[0].id;
		} else {
			return currentDinozId.value;
		}
	});

	const getDinozList: ComputedRef<DinozFiche[]> = computed((): DinozFiche[] => {
		return orderDinozList(dinozList.value);
	});

	// The returned value may be undefined if the player has no Dinoz (which happens when you start the game)
	const getDinoz = (dinozId: number): DinozFiche | undefined => {
		const dinoz = dinozList.value.find((dinoz: DinozFiche) => dinoz.id === dinozId);
		if (!dinoz && dinozList.value.length > 0) {
			return dinozList.value.find((dinoz: DinozFiche) => dinoz.id === currentDinozId.value) ?? dinozList.value[0];
		}
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

	const setDinozAttackTimer = (dinozId: number): void => {
		const dinozToUpdate = dinozList.value.find(dinozs => dinozs.id === dinozId);
		if (!dinozToUpdate) throw Error("Dinoz doesn't exist in store.");
		dinozToUpdate.lastAttack = new Date();
	};

	const getDinozAttackTimer = (dinozId: number | undefined): number | undefined => {
		if (!dinozId) return undefined;
		const dinozToUpdate = dinozList.value.find(dinozs => dinozs.id === dinozId);
		if (!dinozToUpdate) throw Error("Dinoz doesn't exist in store.");
		const now = new Date();
		const delta = (now.getTime() - (dinozToUpdate.lastAttack?.getTime() ?? 0)) / 1000;
		if (!dinozToUpdate.lastAttack) {
			return undefined;
		} else if (delta > 61) {
			resetDinozAttackTimer(dinozId);
			return undefined;
		}
		return Math.round(60 - delta);
	};

	const resetDinozAttackTimer = (dinozId: number): void => {
		const dinozToUpdate = dinozList.value.find(dinozs => dinozs.id === dinozId);
		if (!dinozToUpdate) throw Error(`Dinoz ${dinozId} doesn't exist in store.`);
		console.log('reset Dinoz');
		dinozToUpdate.lastAttack = undefined;
		refreshDinozFiche(dinozId);
	};

	return {
		dinozList,
		refreshDinozFiche,
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
		setItems,
		setDinozAttackTimer,
		getDinozAttackTimer,
		resetDinozAttackTimer
	};
});
