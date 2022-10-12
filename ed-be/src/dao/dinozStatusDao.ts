import { AppDataSource } from '../data-source.js';
import { Dinoz, DinozStatus } from '../entity/index.js';
import { DeleteResult, UpdateResult } from 'typeorm';

const statusRepository = AppDataSource.getRepository(DinozStatus);

//TODO
const addStatusToDinoz = (dinoz: Dinoz, statusId: number): Promise<DinozStatus> => {
	return statusRepository.save({
		dinoz: dinoz,
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
