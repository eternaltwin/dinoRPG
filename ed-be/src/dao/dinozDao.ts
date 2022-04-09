import {
	AssDinozItem,
	AssDinozSkill,
	AssDinozStatus,
	Dinoz,
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
			'playerId',
			'isFrozen',
			'isSacrificed'
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

const setDinozNameRequest = (
	dinoz: Dinoz,
	canChangeName: boolean
): Promise<[number, Array<Dinoz>]> => {
	return Dinoz.update(
		{
			name: dinoz.name,
			canChangeName: canChangeName
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
		include: [
			{
				model: AssDinozStatus,
				attributes: ['statusId']
			}
		],
		where: { dinozId: dinozId }
	});
};

const setDinozPlaceRequest = (
	dinozId: number,
	placeId: number
): Promise<[number, Array<Dinoz>]> => {
	return Dinoz.update(
		{
			placeId: placeId
		},
		{
			where: { dinozId: dinozId }
		}
	);
};

const getDinozTotalCount = (): Promise<number> => {
	return Dinoz.count();
};

const getAllDinozFromAccount = (playerId: number): Promise<Array<Dinoz>> => {
	return Dinoz.findAll({
		attributes: [
			'dinozId',
			'following',
			'name',
			'isFrozen',
			'isSacrificed',
			'level',
			'missionId',
			'placeId',
			'canChangeName',
			'life',
			'maxLife',
			'experience'
		],
		include: [
			{
				model: AssDinozStatus,
				attributes: ['statusId']
			},
			{
				model: AssDinozSkill,
				attributes: ['skillId', 'state']
			}
		],
		where: { playerId: playerId }
	});
};

const freezeDinoz = (
	dinozId: number,
	isFrozen: boolean
): Promise<[number, Array<Dinoz>]> => {
	return Dinoz.update(
		{
			isFrozen: isFrozen
		},
		{
			where: { dinozId: dinozId }
		}
	);
};

const sacrificeDinoz = (
	dinozId: number,
	isSacrificed: boolean
): Promise<[number, Array<Dinoz>]> => {
	return Dinoz.update(
		{
			isSacrificed: isSacrificed
		},
		{
			where: { dinozId: dinozId }
		}
	);
};

const setDinozLevel = (
	dinozId: number,
	level: number
): Promise<[number, Array<Dinoz>]> => {
	return Dinoz.update(
		{
			level: level
		},
		{
			where: { dinozId: dinozId }
		}
	);
};

const setDinozMission = (dinoz: Dinoz): Promise<[number, Array<Dinoz>]> => {
	return Dinoz.update(
		{
			missionId: dinoz.missionId
		},
		{
			where: { dinozId: dinoz.dinozId }
		}
	);
};

const setDinozCanChangeName = (
	dinozId: number,
	canChangeName: boolean
): Promise<[number, Array<Dinoz>]> => {
	return Dinoz.update(
		{
			canChangeName: canChangeName
		},
		{
			where: { dinozId: dinozId }
		}
	);
};

const setDinozLife = (
	dinozId: number,
	life: number
): Promise<[number, Array<Dinoz>]> => {
	return Dinoz.update(
		{
			life: life
		},
		{
			where: { dinozId: dinozId }
		}
	);
};
const setDinozMaxLife = (
	dinozId: number,
	maxLife: number
): Promise<[number, Array<Dinoz>]> => {
	return Dinoz.update(
		{
			maxLife: maxLife
		},
		{
			where: { dinozId: dinozId }
		}
	);
};

const setDinozExperience = (
	dinozId: number,
	experience: number
): Promise<[number, Array<Dinoz>]> => {
	return Dinoz.update(
		{
			experience: experience
		},
		{
			where: { dinozId: dinozId }
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
	setSkillStateRequest,
	getDinozPlaceRequest,
	setDinozPlaceRequest,
	getDinozTotalCount,
	getAllDinozFromAccount,
	freezeDinoz,
	sacrificeDinoz,
	setDinozLevel,
	setDinozMission,
	setDinozCanChangeName,
	setDinozLife,
	setDinozMaxLife,
	setDinozExperience
};
