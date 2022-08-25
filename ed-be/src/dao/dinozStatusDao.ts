import { AppDataSource } from '../data-source.js';
import { DinozStatus } from '../entity/index.js';
import { DeleteResult } from 'typeorm';

const statusRepository = AppDataSource.getRepository(DinozStatus);

//TODO
const addStatusToDinoz = (dinozId: number, statusId: number): Promise<DinozStatus> => {
	return statusRepository.save({
		dinozId: dinozId,
		statusId: statusId
	});
};

//TODO
const addMultipleStatusToDinoz = (status: Array<DinozStatus>): Promise<Array<DinozStatus>> => {
	return statusRepository.save(status);
};

const removeStatusToDinoz = (dinozId: number, statusId: number): Promise<DeleteResult> => {
	return statusRepository
		.createQueryBuilder()
		.delete()
		.from(DinozStatus)
		.where('statusId = :sId AND dinoz.id = :dId', { sId: statusId, dId: dinozId })
		.execute();
};

export { addStatusToDinoz, addMultipleStatusToDinoz, removeStatusToDinoz };
