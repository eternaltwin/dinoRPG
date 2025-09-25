import { Image } from './Image.mjs';

export enum NewsType {
	Update = 'update',
	INFORMATION = 'information',
	WAR = 'war',
	WAR_MANA = 'war_mana',
	CHAMPIONSHIP = 'championship',
	TID_START = 'tid_start',
	TID_END = 'tid_end',
	EVENT_CHRISTMAS = 'event_christmas',
	STORY = 'story',
	ANNOUNCE = 'announce'
}

export interface DetailedNews {
	id: number;
	title: string;
	createdDate: Date;
	updatedDate: Date;
	type: NewsType;
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
