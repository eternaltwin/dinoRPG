import {
	AssDinozItem,
	AssDinozSkill,
	AssDinozStatus,
	Dinoz,
	Place,
	Player
} from '../models/index.js';

const createDinozRequest = (newDinoz: Dinoz): Promise<Dinoz> => {
	return Dinoz.create(newDinoz);
};

const getDinozFicheRequest = (dinozId: number): Promise<Dinoz | null> => {
	return Dinoz.findOne({
		attributes: [
			'dinozId',
			'display',
			'life',
			'maxLife',
			'experience',
			'nbrUpFire',
			'nbrUpWood',
			'nbrUpWater',
			'nbrUpLight',
			'nbrUpAir',
			'name',
			'level',
			'placeId',
			'playerId'
		],
		include: [
			{
				model: AssDinozStatus,
				attributes: ['statusId'],
				required: false
			},
			{
				model: AssDinozItem,
				attributes: ['itemId'],
				required: false
			}
		],
		where: { dinozId: dinozId }
	});
};

const getDinozSkillRequest = (dinozId: number): Promise<Dinoz | null> => {
	return Dinoz.findOne({
		attributes: ['playerId'],
		include: [
			{
				model: AssDinozSkill,
				attributes: ['skillId', 'state']
			}
		],
		where: { dinozId: dinozId }
	});
};

const getDinozSkillAndStatusRequest = (
	dinozId: number
): Promise<Dinoz | null> => {
	return Dinoz.findOne({
		attributes: ['playerId'],
		include: [
			{
				model: AssDinozSkill,
				attributes: ['skillId']
			},
			{
				model: AssDinozStatus,
				attributes: ['statusId']
			}
		],
		where: { dinozId: dinozId }
	});
};

const getCanDinozChangeName = (dinozId: number): Promise<Dinoz | null> => {
	return Dinoz.findOne({
		attributes: ['canChangeName'],
		include: [
			{
				model: Player,
				attributes: ['playerId'],
				required: false
			}
		],
		where: { dinozId: dinozId }
	});
};

const setDinozNameRequest = (dinoz: Dinoz): Promise<[number, Array<Dinoz>]> => {
	return Dinoz.update(
		{
			name: dinoz.name,
			canChangeName: false
		},
		{
			where: { dinozId: dinoz.dinozId }
		}
	);
};

const setSkillStateRequest = (
	dinozId: number,
	skillId: number,
	state: boolean
): Promise<[number, Array<AssDinozSkill>]> => {
	return AssDinozSkill.update(
		{
			state: state
		},
		{
			where: { dinozId: dinozId, skillId: skillId }
		}
	);
};

const getDinozPlaceRequest = (dinozId: number): Promise<Dinoz | null> => {
	return Dinoz.findOne({
		attributes: ['dinozId', 'placeId', 'playerId'],
		where: { dinozId: dinozId }
	});
};

const setDinozPlaceRequest = (
	dinozId: number,
	placeRand: number
): Promise<[number, Array<Place>]> => {
	return Dinoz.update(
		{
			placeId: placeRand
		},
		{
			where: { dinozId: dinozId }
		}
	);
};

const getDinozTotalCount = (): Promise<number> => {
	return Dinoz.count();
};

export {
	createDinozRequest,
	getDinozFicheRequest,
	getCanDinozChangeName,
	setDinozNameRequest,
	getDinozSkillRequest,
	getDinozSkillAndStatusRequest,
	setSkillStateRequest,
	getDinozPlaceRequest,
	setDinozPlaceRequest,
	getDinozTotalCount
};
