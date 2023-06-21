import { Image } from './Image.mjs';

export interface DisplayedNews {
	title: string;
	image: Image;
	text: string;
	hide: boolean;
}
