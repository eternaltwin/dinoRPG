import { Image } from '@drpg/core/models/news/Image'

export interface AllNews {
	title: string;
	image: Image;
	frenchTitle: string;
	englishTitle: string;
	spanishTitle: string;
	germanTitle: string;
	frenchText: string;
	englishText: string;
	spanishText: string;
	germanText: string;
}
