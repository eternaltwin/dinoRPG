/* eslint-disable */
declare module '*.vue' {
	import type { DefineComponent } from 'vue';
	const component: DefineComponent<{}, {}, any>;
	export default component;
}

import type { ComponentCustomProperties } from 'vue';

declare module 'vue' {
	interface ComponentCustomProperties {
		formatDate(date: string | Date): string;
		formatContent(value: string): string;
		getImgURL(path: string, imgName: string, pixel?: boolean): string;
		getSWFUrl(path: string, imgName: string): string;
		$t: (key: string, options?: Record<string, unknown>) => string;
		$globalConfirm: (options: ConfirmOptions) => Promise<boolean>;
	}
}
