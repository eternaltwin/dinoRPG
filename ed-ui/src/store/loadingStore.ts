import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref } from 'vue';

export const useLoadingStore = defineStore('loading', () => {
	const isLoading: Ref<boolean> = ref(false);

	const isOn: ComputedRef<boolean> = computed((): boolean => isLoading.value);
	const isOff: ComputedRef<boolean> = computed((): boolean => !isLoading.value);

	const setLoaderOn = (): void => {
		isLoading.value = true;
	};

	const setLoaderOff = (): void => {
		isLoading.value = false;
	};

	return {
		isOn,
		isOff,
		setLoaderOn,
		setLoaderOff
	};
});
