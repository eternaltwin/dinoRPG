import { Image } from '@drpg/core/models/news/Image'

export interface News {
	title: string;
	image: Image;
	text: string;
	hide: boolean;
}
