export const NewsTypes = ['Update', 'Information', 'War', 'Championship', 'Tid', 'Event', 'Story'] as const;

export const NewsSubtypes = [
	'Christmas',
	'Newyear',
	'Halloween',
	'Easter',
	'Summer',
	'Valentine',
	'Start',
	'End'
] as const;

export const NewsTypeToSubtypes: Record<string, string[]> = {
	Update: [],
	Information: [],
	War: ['Start', 'End'],
	Championship: ['Start', 'End'],
	Tid: ['Start', 'End'],
	Event: ['Christmas', 'Newyear', 'Halloween', 'Easter', 'Summer', 'Valentine'],
	Story: []
};
