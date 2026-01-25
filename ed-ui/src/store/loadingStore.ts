import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref } from 'vue';

export const useLoadingStore = defineStore('loading', () => {
	const count: Ref<number> = ref(0);

	const isOn: ComputedRef<boolean> = computed((): boolean => count.value > 0);

	const isOff: ComputedRef<boolean> = computed((): boolean => count.value === 0);

	const setLoaderOn = (): void => {
		count.value++;
	};

	const setLoaderOff = (): void => {
		count.value = Math.max(0, count.value - 1);
	};

	return {
		count, // Optionnel, mais utile pour débugger
		isOn,
		isOff,
		setLoaderOn,
		setLoaderOff
	};
});
