import { formatText } from '../utils/formatText.js';
import { ConfirmOptions } from './confirmPlugin';

const pad = (n: number) => (n < 10 ? `0${n}` : n);

export function getImgURL(path: string, imgName: string, pixel?: boolean, animated?: boolean): string {
	// Pour gérer aussi les emotes animées pour le rich text editor
	const ext = animated ? 'gif' : pixel ? 'png' : 'webp';
	return new URL(`/src/assets/${path}/${imgName}.${ext}`, import.meta.url).toString();
}

export const mixin = {
	methods: {
		formatDate(date: string | Date): string {
			const dateObj = typeof date === 'string' ? new Date(date) : date;
			const month = pad(dateObj.getMonth() + 1);
			const day = pad(dateObj.getDate());
			const hours = pad(dateObj.getHours());
			const minutes = pad(dateObj.getMinutes());
			const seconds = pad(dateObj.getSeconds());
			return `${day}/${month} ${hours}:${minutes}:${seconds}`;
		},
		formatContent(value: string): string {
			return !value ? '' : formatText(value.toString());
		},
		getImgURL,
		getSWFUrl(path: string, imgName: string): string {
			return new URL(`/src/assets/${path}/${imgName}.swf`, import.meta.url).toString();
		},
		$confirm(options: ConfirmOptions): Promise<boolean> {
			if (this.$globalConfirm) {
				return this.$globalConfirm(options);
			}

			console.error(
				'Le service de confirmation ($globalConfirm) est introuvable. Assurez-vous que ConfirmPlugin est installé dans main.ts.'
			);
			return Promise.resolve(false);
		}
	}
};
