import router from '@/router';

export const errorHandler = {
	handle(err: Error): void {
		console.error(err);
		router.push({ name: 'Accueil' });
	}
};
