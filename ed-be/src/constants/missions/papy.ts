import { Mission } from '../../models/index.js';
import { placeList } from '../place.js';

export const MPAPY: Array<Mission> = [
	{
		missionId: 1,
		missionName: 'fish',
		rewards: ['xp(20)'],
		steps: [
			{
				stepId: 0,
				place: placeList.PORT_DE_PRECHE.name,
				requirement: 'talkTo(fishVendor)',
				displayedAction: 'fishVendor',
				displayedText: 'fishVendor'
			},
			{
				stepId: 1,
				place: placeList.DINOVILLE.name,
				requirement: 'talkTo(mmeseyche)',
				displayedAction: 'mmeseyche',
				displayedText: 'mmeSeyche'
			},
			{
				stepId: 2,
				place: placeList.PAPY_JOE.name,
				requirement: 'validate(papy)',
				displayedAction: 'PAPY_JOE',
				displayedText: 'PAPY_JOE'
			}
		]
	},
	{
		missionId: 2,
		missionName: 'dog',
		rewards: ['xp(15)', 'item(POTION_ANGEL,1)'],
		steps: [
			{
				stepId: 0,
				place: placeList.COLLINES_ESCARPEES.name,
				requirement: 'talkTo(mmeducraft1)',
				displayedAction: 'mmeducraft1',
				displayedText: 'mmeducraft1'
			},
			{
				stepId: 1,
				place: placeList.PORT_DE_PRECHE.name,
				hidePlace: true,
				requirement: 'talkTo(nioufniouf)',
				displayedAction: 'nioufniouf',
				displayedText: 'nioufniouf'
			},
			{
				stepId: 2,
				place: placeList.COLLINES_ESCARPEES.name,
				requirement: 'talkTo(mmeducraft2)',
				displayedAction: 'mmeducraft2',
				displayedText: 'mmeducraft2'
			},
			{
				stepId: 3,
				place: placeList.PAPY_JOE.name,
				requirement: 'validate(papy)',
				displayedAction: 'PAPY_JOE'
			}
		]
	},
	{
		missionId: 3,
		missionName: 'kilgou',
		condition: 'mission(kilwlf)', //set to fish to unlock
		rewards: ['xp(30)', 'gold(500)'],
		steps: []
	},
	{
		missionId: 4,
		missionName: 'kilwlf',
		condition: 'mission(kilgou)',
		rewards: ['xp(30)', 'gold(2000)'],
		steps: []
	},
	{
		missionId: 5,
		missionName: 'fflow',
		condition: 'mission(kilwlf)', //set to fish to unlock
		rewards: ['xp(20)'],
		steps: []
	},
	{
		missionId: 6,
		missionName: 'kbook',
		condition: 'mission(fflow)',
		rewards: ['xp(20)'],
		steps: []
	},
	{
		missionId: 7,
		missionName: 'msg',
		condition: 'mission(kbook)',
		rewards: ['xp(20)', 'epic(msg)'],
		steps: []
	},
	{
		missionId: 8,
		missionName: 'lettre',
		condition: 'mission(msg)',
		rewards: ['xp(20)'],
		steps: []
	},
	{
		missionId: 9,
		missionName: 'kilglu',
		condition: 'mission(kilwlf)',
		rewards: ['xp(30)', 'gold(500)'],
		steps: []
	},
	{
		missionId: 10,
		missionName: 'kilgnt',
		condition: 'mission(kilglu)',
		rewards: ['xp(100)', 'gold(5000)'],
		steps: []
	},
	{
		missionId: 11,
		missionName: 'kilcoq',
		condition: 'mission(kilgnt)',
		rewards: ['xp(200)', 'gold(8000)'],
		steps: []
	}
];
