import { Locales } from './locales';

import en from './locales/en.json';
import fr from './locales/fr.json';

export const messages = {
	[Locales.EN]: en,
	[Locales.FR]: fr
};

export const defaultLocale = Locales.FR;
