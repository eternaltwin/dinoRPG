import { Image } from './Image.mjs';

export interface AllNews {
	title: string;
	createdDate: Date;
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
