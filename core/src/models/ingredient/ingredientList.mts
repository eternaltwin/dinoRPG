import { IngredientFiche } from '../ingredient/IngredientFiche.mjs';

export enum Ingredient {
	MEROU_LUJIDANE = 1,
	POISSON_VENGEUR = 2,
	AN_GUILI_GUILILLE = 3,
	GLOBULOS = 4,
	SUPER_POISSON = 5,
	TOUFFE_DE_FOURRURE = 6,
	ROCHE_RADIO_ACTIVE = 7,
	GRIFFES_ACEREES = 8,
	CORNE_EN_CHOCOLAT = 9,
	OEIL_VISQUEUX = 10,
	LANGUE_MONSTRUEUSE = 11,
	ENERGIE_FOUDRE = 12,
	ENERGIE_AIR = 13,
	ENERGIE_EAU = 14,
	ENERGIE_FEU = 15,
	ENERGIE_BOIS = 16,
	SILEX_TAILLE = 17,
	FRAGMENT_DE_TEXTE_ANCIEN = 18,
	VIEIL_ANNEAU_PRECIEUX = 19,
	CALICE_CISELE = 20,
	COLLIER_KARAT = 21,
	BROCHE_EN_PARFAIT_ETAT = 22,
	SUPERBE_COURONNE_ROYALE = 23,
	FEUILLES_DE_PELINAE = 24,
	BOLET_PHALISK_BLANC = 25,
	ORCHIDEE_FANTASQUE = 26,
	RACINE_DE_FIGONICIA = 27,
	SADIQUAE_MORDICUS = 28,
	FLAUREOLE = 29,
	SPORE_ETHERAL = 30,
	POUSSE_SOMBRE = 31,
	GRAINE_DE_DEVOREUSE = 32,
	DENT_DE_DOROGON = 33,
	BRAS_MECANIQUE = 34
}

export const IngredientNames = [
	'MEROU_LUJIDANE',
	'POISSON_VENGEUR',
	'AN_GUILI_GUILILLE',
	'GLOBULOS',
	'SUPER_POISSON',
	'TOUFFE_DE_FOURRURE',
	'ROCHE_RADIO_ACTIVE',
	'GRIFFES_ACEREES',
	'CORNE_EN_CHOCOLAT',
	'OEIL_VISQUEUX',
	'LANGUE_MONSTRUEUSE',
	'ENERGIE_FOUDRE',
	'ENERGIE_AIR',
	'ENERGIE_EAU',
	'ENERGIE_FEU',
	'ENERGIE_BOIS',
	'SILEX_TAILLE',
	'FRAGMENT_DE_TEXTE_ANCIEN',
	'VIEIL_ANNEAU_PRECIEUX',
	'CALICE_CISELE',
	'COLLIER_KARAT',
	'BROCHE_EN_PARFAIT_ETAT',
	'SUPERBE_COURONNE_ROYALE',
	'FEUILLES_DE_PELINAE',
	'BOLET_PHALISK_BLANC',
	'ORCHIDEE_FANTASQUE',
	'RACINE_DE_FIGONICIA',
	'SADIQUAE_MORDICUS',
	'FLAUREOLE',
	'SPORE_ETHERAL',
	'POUSSE_SOMBRE',
	'GRAINE_DE_DEVOREUSE',
	'DENT_DE_DOROGON',
	'BRAS_MECANIQUE'
] as const;

export type IngredientName = (typeof IngredientNames)[number];

export const ingredientList: Readonly<Record<IngredientName, IngredientFiche>> = {
	MEROU_LUJIDANE: {
		name: 'merou_lujidane',
		ingredientId: 1,
		price: 100,
		maxQuantity: 50
	},
	POISSON_VENGEUR: {
		name: 'poisson_vengeur',
		ingredientId: 2,
		price: 300,
		maxQuantity: 20
	},
	AN_GUILI_GUILILLE: {
		name: 'an_guili_guilille',
		ingredientId: 3,
		price: 1500,
		maxQuantity: 5
	},
	GLOBULOS: {
		name: 'globulos',
		ingredientId: 4,
		price: 1500,
		maxQuantity: 5
	},
	SUPER_POISSON: {
		name: 'super_poisson',
		ingredientId: 5,
		price: 1500,
		maxQuantity: 5
	},
	TOUFFE_DE_FOURRURE: {
		name: 'touffe_de_fourrure',
		ingredientId: 6,
		price: 350,
		maxQuantity: 50
	},
	ROCHE_RADIO_ACTIVE: {
		name: 'roche_radio_active',
		ingredientId: 7,
		price: 500,
		maxQuantity: 20
	},
	GRIFFES_ACEREES: {
		name: 'griffes_acerees',
		ingredientId: 8,
		price: 750,
		maxQuantity: 20
	},
	CORNE_EN_CHOCOLAT: {
		name: 'corne_en_chocolat',
		ingredientId: 9,
		price: 1000,
		maxQuantity: 5
	},
	OEIL_VISQUEUX: {
		name: 'oeil_visqueux',
		ingredientId: 10,
		price: 1300,
		maxQuantity: 5
	},
	LANGUE_MONSTRUEUSE: {
		name: 'langue_monstrueuse',
		ingredientId: 11,
		price: 10000,
		maxQuantity: 5
	},
	ENERGIE_FOUDRE: {
		name: 'energie_foudre',
		ingredientId: 12,
		price: 300,
		maxQuantity: 50
	},
	ENERGIE_AIR: {
		name: 'energie_air',
		ingredientId: 13,
		price: 1000,
		maxQuantity: 20
	},
	ENERGIE_EAU: {
		name: 'energie_eau',
		ingredientId: 14,
		price: 4000,
		maxQuantity: 5
	},
	ENERGIE_FEU: {
		name: 'energie_feu',
		ingredientId: 15,
		price: 4000,
		maxQuantity: 5
	},
	ENERGIE_BOIS: {
		name: 'energie_bois',
		ingredientId: 16,
		price: 4000,
		maxQuantity: 5
	},
	SILEX_TAILLE: {
		name: 'silex_taille',
		ingredientId: 17,
		price: 150,
		maxQuantity: 50
	},
	FRAGMENT_DE_TEXTE_ANCIEN: {
		name: 'fragment_de_texte_ancien',
		ingredientId: 18,
		price: 1000,
		maxQuantity: 20
	},
	VIEIL_ANNEAU_PRECIEUX: {
		name: 'vieil_anneau_precieux',
		ingredientId: 19,
		price: 8000,
		maxQuantity: 5
	},
	CALICE_CISELE: {
		name: 'calice_cisele',
		ingredientId: 20,
		price: 8000,
		maxQuantity: 5
	},
	COLLIER_KARAT: {
		name: 'collier_karat',
		ingredientId: 21,
		price: 8000,
		maxQuantity: 5
	},
	BROCHE_EN_PARFAIT_ETAT: {
		name: 'broche_en_parfait_etat',
		ingredientId: 22,
		price: 30000,
		maxQuantity: 5
	},
	SUPERBE_COURONNE_ROYALE: {
		name: 'superbe_couronne_royale',
		ingredientId: 23,
		price: 40000,
		maxQuantity: 5
	},
	FEUILLES_DE_PELINAE: {
		name: 'feuilles_de_pelinae',
		ingredientId: 24,
		price: 75,
		maxQuantity: 50
	},
	BOLET_PHALISK_BLANC: {
		name: 'bolet_phalisk_blanc',
		ingredientId: 25,
		price: 130,
		maxQuantity: 20
	},
	ORCHIDEE_FANTASQUE: {
		name: 'orchidee_fantasque',
		ingredientId: 26,
		price: 230,
		maxQuantity: 5
	},
	RACINE_DE_FIGONICIA: {
		name: 'racine_de_figonicia',
		ingredientId: 27,
		price: 230,
		maxQuantity: 5
	},
	SADIQUAE_MORDICUS: {
		name: 'sadiquae_mordicus',
		ingredientId: 28,
		price: 230,
		maxQuantity: 5
	},
	FLAUREOLE: {
		name: 'flaureole',
		ingredientId: 29,
		price: 500,
		maxQuantity: 5
	},
	SPORE_ETHERAL: {
		name: 'spore_etheral',
		ingredientId: 30,
		price: 150,
		maxQuantity: 20
	},
	POUSSE_SOMBRE: {
		name: 'pousse_sombre',
		ingredientId: 31,
		price: 300,
		maxQuantity: 20
	},
	GRAINE_DE_DEVOREUSE: {
		name: 'graine_de_devoreuse',
		ingredientId: 32,
		price: 15000,
		maxQuantity: 100
	},
	DENT_DE_DOROGON: {
		name: 'dent_de_dorogon',
		ingredientId: 33,
		price: 12000,
		maxQuantity: 5
	},
	BRAS_MECANIQUE: {
		name: 'bras_mecanique',
		ingredientId: 34,
		price: 23000,
		maxQuantity: 5
	}
};
