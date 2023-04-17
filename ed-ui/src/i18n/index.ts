import en from './locales/en.json';
import fr from './locales/fr.json';
import es from './locales/es.json';
import de from './locales/de.json';

export interface LangInfos {
	caption: string;
	icon: string;
	short: string;
}

export enum LocalesEnum {
	EN = 'en',
	FR = 'fr',
	DE = 'de',
	ES = 'es'
}

export const messages = {
	[LocalesEnum.EN]: en,
	[LocalesEnum.FR]: fr,
	[LocalesEnum.ES]: es,
	[LocalesEnum.DE]: de
};

export const Locales: Record<string, LangInfos> = {
	[LocalesEnum.FR]: {
		caption: 'Français',
		icon: '/src/assets/design/lang_fr.webp',
		short: 'fr'
	},
	[LocalesEnum.EN]: {
		caption: 'English',
		icon: '/src/assets/design/lang_en.webp',
		short: 'en'
	},
	[LocalesEnum.ES]: {
		caption: 'Spanish',
		icon: '/src/assets/design/lang_es.webp',
		short: 'es'
	},
	[LocalesEnum.DE]: {
		caption: 'German',
		icon: '/src/assets/design/lang_de.webp',
		short: 'de'
	}
};

export const defaultLocale = LocalesEnum.FR;
