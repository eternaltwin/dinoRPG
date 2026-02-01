import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref } from 'vue';

export const useMenuStore = defineStore('menu', () => {
	const dinozMenu: Ref<boolean> = ref(false);

	const isDinozMenuOpened: ComputedRef<boolean> = computed((): boolean => dinozMenu.value);

	const setDinozMenuOpened = (isOpened: boolean): void => {
		dinozMenu.value = isOpened;
	};

	return {
		isDinozMenuOpened,
		setDinozMenuOpened
	};
});
