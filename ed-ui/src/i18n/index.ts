import en from './locales/en.json';
import fr from './locales/fr.json';
interface LangInfos {
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
	[LocalesEnum.FR]: fr
};

export const Locales: { [index: string]: LangInfos } = {
	[LocalesEnum.FR]: {
		caption: 'Français',
		icon: require(`@/assets/design/lang_fr.png`),
		short: 'fr'
	},
	[LocalesEnum.EN]: {
		caption: 'English',
		icon: require(`@/assets/design/lang_en.png`),
		short: 'en'
	},
	[LocalesEnum.ES]: {
		caption: 'Spanish',
		icon: require(`@/assets/design/lang_es.png`),
		short: 'es'
	},
	[LocalesEnum.DE]: {
		caption: 'German',
		icon: require(`@/assets/design/lang_de.png`),
		short: 'de'
	}
};

export const defaultLocale = LocalesEnum.FR;
