import { AppDataSource } from '../data-source.js';
import { Secret } from '../entity/secret.js';

const secretRepository = AppDataSource.getRepository(Secret);

export function getAllSecretsRequest(): Promise<Array<Secret>> {
	return secretRepository.createQueryBuilder('secret').getMany();
}

export function addNewSecret(secret: Secret): Promise<Secret> {
	return secretRepository.save(secret);
}
