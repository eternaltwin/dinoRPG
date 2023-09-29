import { AppDataSource } from '../data-source.js';
import { Concentration } from '../entity/index.js';

const concentrationRepository = AppDataSource.getRepository(Concentration);

export async function setConcentration(concentration: Partial<Concentration>) {
	return concentrationRepository.save(concentration);
}

export async function getConcentration(concentrationId: number) {
	return concentrationRepository
		.createQueryBuilder('concentration')
		.leftJoinAndSelect('concentration.dinoz', 'dinoz')
		.where('concentration.id = :cId', { cId: concentrationId })
		.getOne();
}

export async function removeConcentration(concentrationId: number) {
	return concentrationRepository
		.createQueryBuilder()
		.delete()
		.from(Concentration)
		.where('id = :id', { id: concentrationId })
		.execute();
}
