import {
	AssDinozItem,
	Dinoz,
	Item,
	Place,
	Player,
	Status,
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
		],
		include: [
			{
				model: Player,
				attributes: ['playerId'],
				required: false,
			},
			{
				model: Place,
				attributes: ['name'],
				required: false,
			},
			{
				model: Status,
				attributes: ['name'],
				through: {
					attributes: [],
				},
				required: false,
			},
			{
				model: AssDinozItem,
				attributes: ['id'],
				required: false,
				include: [
					{
						model: Item,
						attributes: ['itemId'],
						required: false,
					},
				],
			},
		],
		where: { dinozId: dinozId },
	});
};

const getCanDinozChangeName = (dinozId: number): Promise<Dinoz | null> => {
	return Dinoz.findOne({
		attributes: ['canChangeName'],
		include: [
			{
				model: Player,
				attributes: ['playerId'],
				required: false,
			},
		],
		where: { dinozId: dinozId },
	});
};

const setDinozNameRequest = (dinoz: Dinoz): Promise<[number, Array<Dinoz>]> => {
	return Dinoz.update(
		{
			name: dinoz.name,
			canChangeName: false,
		},
		{
			where: { dinozId: dinoz.dinozId },
		}
	);
};

export {
	createDinozRequest,
	getDinozFicheRequest,
	getCanDinozChangeName,
	setDinozNameRequest,
};
