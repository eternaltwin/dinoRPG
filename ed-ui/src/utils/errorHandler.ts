import router from '@/router';

export const errorHandler = {
	handle(err: unknown): void {
		console.error(err);
		router.push({ name: 'Accueil' });
	}
};
