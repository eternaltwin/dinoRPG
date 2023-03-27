import { formatText } from '../utils/formatText';

export const mixin = {
	methods: {
		formatContent(value: string): string {
			return !value ? '' : formatText(value.toString());
		},
		getImgURL(path: string, imgName: string): URL {
			return new URL(`/src/assets/${path}/${imgName}.webp`, import.meta.url);
		},
		getSWFUrl(path: string, imgName: string): URL {
			return new URL(`/src/assets/${path}/${imgName}.swf`, import.meta.url);
		}
	}
};
