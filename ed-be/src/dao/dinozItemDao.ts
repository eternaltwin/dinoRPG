import { AppDataSource } from '../data-source.js';
import { DinozItem } from '../entity/index.js';
import { DeleteResult } from 'typeorm';

const dinozItemRepository = AppDataSource.getRepository(DinozItem);

export function addItemToDinoz(item: DinozItem): Promise<DinozItem> {
	return dinozItemRepository.save(item);
}

export function removeItemToDinoz(id: number): Promise<DeleteResult> {
	return dinozItemRepository.createQueryBuilder().delete().from(DinozItem).where('id = :mId', { mId: id }).execute();
}
