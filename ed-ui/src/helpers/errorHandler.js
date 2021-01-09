import router from '@/router';

export const errorHandler = {

	handle: (err) => {
		// Unauthorized error, redirect user
		if (err.message.includes('401')) {
			router.push({ name: 'Accueil' });
		} else if (err.message.includes('500')) {
			// TODO : send event to open popin error
			console.log('An unexpected error occured');
		}
	}

};