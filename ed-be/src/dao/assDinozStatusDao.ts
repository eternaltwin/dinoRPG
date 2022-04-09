import { AssDinozStatus, DinozStatusEdit } from '../models/index.js';

const addStatusToDinoz = (
	dinozId: number,
	statusId: number
): Promise<AssDinozStatus> => {
	return AssDinozStatus.create({
		dinozId: dinozId,
		statusId: statusId
	});
};

const addMultipleStatusToDinoz = (
	status: Array<DinozStatusEdit>
): Promise<Array<AssDinozStatus>> => {
	return AssDinozStatus.bulkCreate(status);
};

const removeStatusToDinoz = (
	dinozId: number,
	statusId: number
): Promise<number> => {
	return AssDinozStatus.destroy({
		where: {
			dinozId: dinozId,
			statusId: statusId
		}
	});
};

export { addStatusToDinoz, addMultipleStatusToDinoz, removeStatusToDinoz };
