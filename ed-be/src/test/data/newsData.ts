import { News } from '../../models/';

export const postedNews = {
	title: 'title',
	frenchTitle: 'req.body.frenchTitle',
	englishTitle: 'req.body.englishTitle',
	spanishTitle: 'req.body.spanishTitle',
	germanTitle: 'req.body.germanTitle',
	frenchText: 'req.body.frenchText',
	englishText: 'req.body.englishText',
	spanishText: 'req.body.spanishText',
	germanText: 'req.body.germanText'
} as Partial<News>;

export const editedNews = {
	frenchTitle: 'req.body.frenchTitle',
	englishTitle: 'req.body.englishTitle',
	spanishTitle: 'req.body.spanishTitle',
	germanTitle: 'req.body.germanTitle',
	frenchText: 'req.body.frenchText',
	englishText: 'req.body.englishText',
	spanishText: 'req.body.spanishText',
	germanText: 'req.body.germanText'
} as Partial<News>;

export const batchOfNews = [
	{
		title: 'title',
		frenchTitle: 'req.body.frenchTitle',
		englishTitle: 'req.body.englishTitle',
		spanishTitle: 'req.body.spanishTitle',
		germanTitle: 'req.body.germanTitle',
		frenchText: 'req.body.frenchText',
		englishText: 'req.body.englishText',
		spanishText: 'req.body.spanishText',
		germanText: 'req.body.germanText'
	},
	{
		title: 'title',
		frenchTitle: 'req.body.frenchTitle',
		englishTitle: 'req.body.englishTitle',
		spanishTitle: 'req.body.spanishTitle',
		germanTitle: 'req.body.germanTitle',
		frenchText: 'req.body.frenchText',
		englishText: 'req.body.englishText',
		spanishText: 'req.body.spanishText',
		germanText: 'req.body.germanText'
	}
];
