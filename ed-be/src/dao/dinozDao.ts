import {
	AssDinozItem,
	Dinoz,
	Item,
	Place,
	Player,
	AssDinozSkill,
	Skill,
	Status
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
			'level'
		],
		include: [
			{
				model: Player,
				attributes: ['playerId'],
				required: false
			},
			{
				model: Place,
				attributes: ['name'],
				required: false
			},
			{
				model: Status,
				attributes: ['name'],
				through: {
					attributes: []
				},
				required: false
			},
			{
				model: AssDinozItem,
				attributes: ['id'],
				required: false,
				include: [
					{
						model: Item,
						attributes: ['itemId'],
						required: false
					}
				]
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
				model: Skill,
				attributes: ['skillId'],
				through: {
					attributes: ['state']
				}
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
				model: Skill,
				attributes: ['skillId'],
				through: {
					attributes: []
				}
			},
			{
				model: Status,
				attributes: ['statusId'],
				through: {
					attributes: []
				}
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

const setSkillSetRequest = (
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

export {
	createDinozRequest,
	getDinozFicheRequest,
	getCanDinozChangeName,
	setDinozNameRequest,
	getDinozSkillRequest,
	getDinozSkillAndStatusRequest,
	setSkillSetRequest
};
