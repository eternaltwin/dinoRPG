import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref } from 'vue';

export const useMenuStore = defineStore('menu', () => {
	const dinozMenu: Ref<boolean> = ref(false);
	const twinoMenu: Ref<boolean> = ref(false);

	const isDinozMenuOpened: ComputedRef<boolean> = computed((): boolean => dinozMenu.value);
	const isTwinoMenuOpened: ComputedRef<boolean> = computed((): boolean => twinoMenu.value);

	const setDinozMenuOpened = (isOpened: boolean): void => {
		dinozMenu.value = isOpened;
	};

	const setTwinoMenuOpened = (isOpened: boolean): void => {
		twinoMenu.value = isOpened;
	};

	return {
		isDinozMenuOpened,
		isTwinoMenuOpened,
		setDinozMenuOpened,
		setTwinoMenuOpened
	};
});
