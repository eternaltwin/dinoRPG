import { AssDinozStatus } from '../models/index.js';

const addStatusToDinoz = (dinozId: number, statusId: number): void => {
	AssDinozStatus.create({
		dinozId: dinozId,
		statusId: statusId
	});
};

const removeStatusToDinoz = (dinozId: number, statusId: number): void => {
	AssDinozStatus.destroy({
		where: {
			dinozId: dinozId,
			statusId: statusId
		}
	});
};

export { addStatusToDinoz, removeStatusToDinoz };
