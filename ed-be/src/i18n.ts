import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import { Lang } from '@drpg/prisma';
import { LOGGER } from './context.js';

i18next
	.use(Backend)
	.init({
		lng: 'fr',
		backend: {
			/* translation file path */
			loadPath: 'i18n/{{lng}}.json'
		},
		fallbackLng: 'fr',
		supportedLngs: Object.values(Lang),
		preload: Object.values(Lang),
		debug: false,
		returnNull: false
	})
	.catch(err => {
		LOGGER.error(`Error loading language ${err}`);
	});

export default i18next;
