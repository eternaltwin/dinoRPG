import { AssDinozStatus } from '../models/index.js';

const addStatusToDinoz = (
	dinozId: number,
	statusId: number
): Promise<AssDinozStatus> => {
	return AssDinozStatus.create({
		dinozId: dinozId,
		statusId: statusId
	});
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

export { addStatusToDinoz, removeStatusToDinoz };
