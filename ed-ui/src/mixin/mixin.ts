import { formatText } from '../utils/formatText.js';
import { ConfirmOptions } from './confirmPlugin';
import { PlayerService } from '../services';
import { playerStore } from '../store';

const pad = (n: number) => (n < 10 ? `0${n}` : n);

export const refreshGold = async () => {
	const newMoney = await PlayerService.getPlayerMoney();
	playerStore().setMoney(+newMoney);
};

// Explicit recursive glob: Vite turns a templated `new URL(..., import.meta.url)` into a single-level
// glob (`/src/assets/*/*.webp`), so nested paths such as `map/map` would resolve to `undefined`.
const images = import.meta.glob<string>('/src/assets/**/*.{webp,png}', {
	eager: true,
	query: '?url',
	import: 'default'
});

export const getImgURL = (path: string, imgName: string, pixel?: boolean) => {
	return images[`/src/assets/${path}/${imgName}.${pixel ? 'png' : 'webp'}`] ?? '';
};

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
		getImgURL(path: string, imgName: string, pixel?: boolean): string {
			return getImgURL(path, imgName, pixel);
		},
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
		},
		$refreshGold() {
			return refreshGold();
		}
	}
};
