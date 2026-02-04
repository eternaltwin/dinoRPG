import { useWindowSize } from '@vueuse/core';
import { computed, ComputedRef } from 'vue';
import { MOBILE_WIDTH } from '../constants/media';

export const useMedia = () => {
	const { width } = useWindowSize();

	const isMobile: ComputedRef<boolean> = computed((): boolean => {
		return width.value <= MOBILE_WIDTH;
	});

	return {
		isMobile
	};
};
