import { defineStore } from 'pinia';
import { computed, ComputedRef, ref, Ref } from 'vue';
import { useMedia } from '../composables/monitorSize';

export const useMenuStore = defineStore('menu', () => {
	const dinozMenu: Ref<boolean> = ref(false);
	const twinoMenu: Ref<boolean> = ref(false);

	const isDinozMenuOpened: ComputedRef<boolean> = computed((): boolean => dinozMenu.value);
	const isTwinoMenuOpened: ComputedRef<boolean> = computed((): boolean => twinoMenu.value);

	const setDinozMenuOpened = (isOpened: boolean): void => {
		if (useMedia().isMobile.value && isOpened && isTwinoMenuOpened) {
			setTwinoMenuOpened(false);
		}

		dinozMenu.value = isOpened;
	};

	const setTwinoMenuOpened = (isOpened: boolean): void => {
		if (useMedia().isMobile.value && isOpened && isDinozMenuOpened) {
			setDinozMenuOpened(false);
		}

		twinoMenu.value = isOpened;
	};

	return {
		isDinozMenuOpened,
		isTwinoMenuOpened,
		setDinozMenuOpened,
		setTwinoMenuOpened
	};
});
