import { Action } from '../dinoz/ActionList.mjs';
import { Skill, skillList } from '../dinoz/SkillList.mjs';
import { GatherType } from '../enums/GatherType.mjs';
import { ConditionEnum, Operator } from '../enums/Parser.mjs';
import { PlaceEnum } from '../enums/PlaceEnum.mjs';
import { Ingredient } from '../ingredient/ingredientList.mjs';
import { Item, itemList } from '../item/ItemList.mjs';
import { GatherData } from './gatherData.mjs';

export const gatherList: Record<GatherType, GatherData> = {
	[GatherType.FISH]: {
		action: Action.FISH,
		type: GatherType.FISH,
		special: false,
		size: 7,
		minimumClick: 2,
		condition: {
			[ConditionEnum.SKILL]: Skill.APPRENTI_PECHEUR
		},
		apparence: 'FISH',
		items: [
			{
				type: 'ingredient',
				ingredientId: [Ingredient.MEROU_LUJIDANE],
				startQuantity: 18
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.POISSON_VENGEUR],
				startQuantity: 5,
				condition: {
					[ConditionEnum.SKILL]: Skill.PECHEUR_CONFIRME
				}
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.AN_GUILI_GUILILLE],
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: Skill.MAITRE_PECHEUR },
						{ [ConditionEnum.PLACE_IS]: PlaceEnum.PORT_DE_PRECHE }
					]
				}
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.GLOBULOS],
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: Skill.MAITRE_PECHEUR },
						{ [ConditionEnum.PLACE_IS]: PlaceEnum.CHUTES_MUTANTES }
					]
				}
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.SUPER_POISSON],
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: Skill.MAITRE_PECHEUR },
						{ [ConditionEnum.PLACE_IS]: PlaceEnum.FLEUVE_JUMIN }
					]
				}
			}
		]
	},
	[GatherType.CUEILLE1]: {
		action: Action.CUEILLE,
		type: GatherType.CUEILLE1,
		special: false,
		size: 8,
		minimumClick: 3,
		condition: {
			[ConditionEnum.SKILL]: Skill.CUEILLETTE
		},
		apparence: 'CUEILLE',
		items: [
			{
				type: 'ingredient',
				ingredientId: [Ingredient.FEUILLES_DE_PELINAE],
				startQuantity: 28
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.BOLET_PHALISK_BLANC],
				startQuantity: 11,
				condition: {
					[ConditionEnum.SKILL]: Skill.OEIL_DE_LYNX
				}
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.ORCHIDEE_FANTASQUE],
				startQuantity: 3,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: Skill.OEIL_DE_LYNX },
						{ [ConditionEnum.PLACE_IS]: PlaceEnum.FORGES_DU_GTC }
					]
				}
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.RACINE_DE_FIGONICIA],
				startQuantity: 3,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: Skill.OEIL_DE_LYNX },
						{ [ConditionEnum.PLACE_IS]: PlaceEnum.CHEMIN_GLAUQUE }
					]
				}
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.SADIQUAE_MORDICUS],
				startQuantity: 3,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: Skill.OEIL_DE_LYNX },
						{ [ConditionEnum.PLACE_IS]: PlaceEnum.MARAIS_COLLANT }
					]
				}
			}
		]
	},
	[GatherType.CUEILLE2]: {
		action: Action.CUEILLE,
		type: GatherType.CUEILLE2,
		special: false,
		size: 8,
		minimumClick: 3,
		condition: {
			[ConditionEnum.SKILL]: Skill.CUEILLETTE
		},
		apparence: 'CUEILLE',
		items: [
			{
				type: 'ingredient',
				ingredientId: [Ingredient.FEUILLES_DE_PELINAE],
				startQuantity: 20
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.BOLET_PHALISK_BLANC],
				startQuantity: 5,
				condition: {
					[ConditionEnum.SKILL]: Skill.OEIL_DE_LYNX
				}
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.ORCHIDEE_FANTASQUE],
				startQuantity: 1,
				condition: {
					[Operator.AND]: [{ [ConditionEnum.SKILL]: Skill.OEIL_DE_LYNX }, { [ConditionEnum.RANDOM]: 4 }]
				}
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.RACINE_DE_FIGONICIA],
				startQuantity: 1,
				condition: {
					[Operator.AND]: [{ [ConditionEnum.SKILL]: Skill.OEIL_DE_LYNX }, { [ConditionEnum.RANDOM]: 4 }]
				}
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.SADIQUAE_MORDICUS],
				startQuantity: 1,
				condition: {
					[Operator.AND]: [{ [ConditionEnum.SKILL]: Skill.OEIL_DE_LYNX }, { [ConditionEnum.RANDOM]: 4 }]
				}
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.FLAUREOLE],
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: Skill.OEIL_DE_LYNX },
						{ [ConditionEnum.PLACE_IS]: PlaceEnum.BOIS_GIVRES }
					]
				}
			}
		]
	},
	[GatherType.CUEILLE3]: {
		action: Action.CUEILLE,
		type: GatherType.CUEILLE3,
		special: false,
		size: 8,
		minimumClick: 3,
		condition: {
			[ConditionEnum.SKILL]: Skill.CUEILLETTE
		},
		apparence: 'CUEILLE',
		items: [
			{
				type: 'ingredient',
				ingredientId: [Ingredient.FEUILLES_DE_PELINAE],
				startQuantity: 5
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.BOLET_PHALISK_BLANC],
				startQuantity: 5,
				condition: {
					[ConditionEnum.SKILL]: Skill.OEIL_DE_LYNX
				}
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.ORCHIDEE_FANTASQUE],
				startQuantity: 2,
				condition: {
					[ConditionEnum.SKILL]: Skill.OEIL_DE_LYNX
				}
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.SPORE_ETHERAL],
				startQuantity: 5,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: Skill.OEIL_DE_LYNX },
						{ [ConditionEnum.RANDOM]: 4 } //TODO: lieu de caushemesh
					]
				}
			}
		]
	},
	[GatherType.CUEILLE4]: {
		action: Action.CUEILLE,
		type: GatherType.CUEILLE4,
		special: false,
		size: 8,
		minimumClick: 3,
		condition: {
			[ConditionEnum.SKILL]: Skill.CUEILLETTE
		},
		apparence: 'CUEILLE',
		items: [
			{
				type: 'ingredient',
				ingredientId: [Ingredient.FEUILLES_DE_PELINAE],
				startQuantity: 8
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.BOLET_PHALISK_BLANC],
				startQuantity: 3
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.ORCHIDEE_FANTASQUE, Ingredient.SADIQUAE_MORDICUS],
				startQuantity: 2,
				condition: {
					[ConditionEnum.SKILL]: Skill.OEIL_DE_LYNX
				}
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.POUSSE_SOMBRE],
				startQuantity: 1,
				condition: {
					[ConditionEnum.SKILL]: Skill.OEIL_DE_LYNX
				}
			}
		]
	},
	[GatherType.ENERGY1]: {
		action: Action.ENERGY,
		type: GatherType.ENERGY1,
		special: false,
		size: 6,
		minimumClick: 1,
		condition: {
			[ConditionEnum.SKILL]: Skill.PARATONNERRE
		},
		apparence: 'ENERGY',
		items: [
			{
				type: 'ingredient',
				ingredientId: [Ingredient.ENERGIE_FOUDRE],
				startQuantity: 6
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.ENERGIE_AIR],
				startQuantity: 3,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: Skill.FISSION_ELEMENTAIRE },
						{ [ConditionEnum.PLACE_IS]: PlaceEnum.FORCEBRUT }
					]
				}
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.ENERGIE_FEU],
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: Skill.FISSION_ELEMENTAIRE },
						{ [ConditionEnum.PLACE_IS]: PlaceEnum.PENTES_DE_BASALTE }
					]
				}
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.ENERGIE_BOIS],
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: Skill.FISSION_ELEMENTAIRE },
						{ [ConditionEnum.PLACE_IS]: PlaceEnum.PORTE_DE_SYLVENOIRE }
					]
				}
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.ENERGIE_EAU],
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: Skill.FISSION_ELEMENTAIRE },
						{ [ConditionEnum.PLACE_IS]: PlaceEnum.DOME_SOULAFLOTTE }
					]
				}
			}
		]
	},
	[GatherType.ENERGY2]: {
		action: Action.ENERGY,
		type: GatherType.ENERGY2,
		special: false,
		size: 6,
		minimumClick: 1,
		condition: {
			[ConditionEnum.SKILL]: Skill.PARATONNERRE
		},
		apparence: 'ENERGY',
		items: [
			{
				type: 'ingredient',
				ingredientId: [Ingredient.ENERGIE_FOUDRE],
				startQuantity: 1
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.ENERGIE_AIR],
				startQuantity: 3
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.ENERGIE_FEU],
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: Skill.FISSION_ELEMENTAIRE },
						{ [ConditionEnum.RANDOM]: 6 }
					]
				}
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.ENERGIE_BOIS],
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: Skill.FISSION_ELEMENTAIRE },
						{ [ConditionEnum.RANDOM]: 6 }
					]
				}
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.ENERGIE_EAU],
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: Skill.FISSION_ELEMENTAIRE },
						{ [ConditionEnum.RANDOM]: 6 }
					]
				}
			}
		]
	},
	[GatherType.HUNT]: {
		action: Action.HUNT,
		type: GatherType.HUNT,
		special: false,
		size: 6,
		minimumClick: 1,
		condition: {
			[ConditionEnum.SKILL]: Skill.CHASSEUR_DE_GOUPIGNON
		},
		apparence: 'HUNT',
		items: [
			{
				type: 'ingredient',
				ingredientId: [Ingredient.TOUFFE_DE_FOURRURE],
				startQuantity: 7
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.GRIFFES_ACEREES],
				startQuantity: 4,
				condition: {
					[ConditionEnum.SKILL]: Skill.CHASSEUR_DE_GEANT
				}
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.CORNE_EN_CHOCOLAT, Ingredient.OEIL_VISQUEUX],
				startQuantity: 1,
				condition: {
					[ConditionEnum.SKILL]: Skill.CHASSEUR_DE_DRAGON
				}
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.LANGUE_MONSTRUEUSE],
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: Skill.CHASSEUR_DE_DRAGON },
						{ [ConditionEnum.RANDOM]: 3 },
						{ [Operator.NOT]: { [ConditionEnum.PLACE_IS]: PlaceEnum.LAC_CELESTE } }
					]
				}
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.LANGUE_MONSTRUEUSE, Ingredient.DENT_DE_DOROGON],
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: Skill.CHASSEUR_DE_DRAGON },
						{ [ConditionEnum.RANDOM]: 3 },
						{ [ConditionEnum.PLACE_IS]: PlaceEnum.LAC_CELESTE }
					]
				}
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.ROCHE_RADIO_ACTIVE],
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: Skill.CHASSEUR_DE_GEANT },
						{ [ConditionEnum.PLACE_IS]: PlaceEnum.NOWHERE } //TODO: lieu caushemesh
					]
				}
			}
		]
	},
	[GatherType.SEEK]: {
		action: Action.SEEK,
		type: GatherType.SEEK,
		special: false,
		size: 10,
		minimumClick: 1,
		condition: {
			[ConditionEnum.SKILL]: Skill.FOUILLE
		},
		apparence: 'SEEK',
		items: [
			{
				type: 'ingredient',
				ingredientId: [Ingredient.SILEX_TAILLE],
				startQuantity: 3
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.FRAGMENT_DE_TEXTE_ANCIEN],
				startQuantity: 1,
				condition: {
					[ConditionEnum.SKILL]: Skill.DETECTIVE
				}
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.VIEIL_ANNEAU_PRECIEUX, Ingredient.CALICE_CISELE, Ingredient.COLLIER_KARAT],
				startQuantity: 2,
				condition: {
					[Operator.AND]: [{ [ConditionEnum.SKILL]: Skill.ARCHEOLOGUE }, { [ConditionEnum.RANDOM]: 5 }]
				}
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.BROCHE_EN_PARFAIT_ETAT, Ingredient.SUPERBE_COURONNE_ROYALE],
				startQuantity: 1,
				condition: {
					[Operator.AND]: [{ [ConditionEnum.SKILL]: Skill.ARCHEOLOGUE }, { [ConditionEnum.RANDOM]: 15 }]
				}
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.BRAS_MECANIQUE],
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: Skill.ARCHEOLOGUE },
						{ [ConditionEnum.RANDOM]: 10 },
						{ [ConditionEnum.PLACE_IS]: PlaceEnum.TETE_DE_L_ILE }
					]
				}
			}
		]
	},
	[GatherType.ANNIV]: {
		action: Action.ANNIV,
		type: GatherType.ANNIV,
		special: true,
		size: 10,
		minimumClick: 3,
		condition: {
			[Operator.AND]: [
				{ [ConditionEnum.POSSESS_OBJECT]: Item.CANDLE_CARD },
				{ [ConditionEnum.PLACE_IS]: PlaceEnum.PORT_DE_PRECHE }
			]
		},
		cost: {
			...itemList[Item.CANDLE_CARD],
			quantity: 1
		},
		apparence: 'ANNIV',
		items: [
			{
				type: 'ingredient',
				ingredientId: [Ingredient.MEROU_LUJIDANE],
				startQuantity: 16
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.POISSON_VENGEUR],
				startQuantity: 5
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.AN_GUILI_GUILILLE],
				startQuantity: 5
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.GLOBULOS],
				startQuantity: 5
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.SUPER_POISSON],
				startQuantity: 4
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.SPORE_ETHERAL],
				startQuantity: 5
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.ROCHE_RADIO_ACTIVE],
				startQuantity: 2
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.GRAINE_DE_DEVOREUSE],
				startQuantity: 1
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.SILEX_TAILLE],
				startQuantity: 10
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.FRAGMENT_DE_TEXTE_ANCIEN],
				startQuantity: 3
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.COLLIER_KARAT],
				startQuantity: 1
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.ENERGIE_FOUDRE],
				startQuantity: 3
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.ENERGIE_AIR],
				startQuantity: 4
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.ENERGIE_EAU],
				startQuantity: 2
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.ENERGIE_FEU],
				startQuantity: 4
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.ENERGIE_BOIS],
				startQuantity: 2
			},
			{
				type: 'item',
				ingredientId: [itemList[Item.GOLD1000].itemId],
				startQuantity: 10
			},
			{
				type: 'item',
				ingredientId: [itemList[Item.GOLD2000].itemId],
				startQuantity: 8
			},
			{
				type: 'item',
				ingredientId: [itemList[Item.GOLD3000].itemId],
				startQuantity: 5
			},
			{
				type: 'item',
				ingredientId: [itemList[Item.GOLD20000].itemId],
				startQuantity: 2
			},
			{
				type: 'item',
				ingredientId: [Item.TICTAC_TICKET],
				startQuantity: 1
			},
			{
				type: 'item',
				ingredientId: [Item.SMOG_EGG_ANNIVERSARY],
				startQuantity: 2
			}
		]
	},
	[GatherType.XMAS]: {
		action: Action.XMAS,
		special: true,
		type: GatherType.XMAS,
		size: 10,
		minimumClick: 3,
		condition: {
			[Operator.AND]: [
				{ [ConditionEnum.POSSESS_OBJECT]: Item.CHRISTMAS_TICKET },
				{ [ConditionEnum.PLACE_IS]: PlaceEnum.DINOVILLE }
			]
		},
		apparence: 'XMAS',
		items: [
			{
				type: 'ingredient',
				ingredientId: [Ingredient.SILEX_TAILLE],
				startQuantity: 8
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.FRAGMENT_DE_TEXTE_ANCIEN],
				startQuantity: 4
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.CALICE_CISELE],
				startQuantity: 1
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.COLLIER_KARAT],
				startQuantity: 1
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.TOUFFE_DE_FOURRURE],
				startQuantity: 13
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.FEUILLES_DE_PELINAE],
				startQuantity: 11
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.BOLET_PHALISK_BLANC],
				startQuantity: 8
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.RACINE_DE_FIGONICIA],
				startQuantity: 1
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.FLAUREOLE],
				startQuantity: 1
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.SPORE_ETHERAL],
				startQuantity: 1
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.MEROU_LUJIDANE],
				startQuantity: 11
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.POISSON_VENGEUR],
				startQuantity: 5
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.GRIFFES_ACEREES],
				startQuantity: 5
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.ENERGIE_EAU],
				startQuantity: 3
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.ENERGIE_FEU],
				startQuantity: 2
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.ENERGIE_BOIS],
				startQuantity: 4
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.ENERGIE_AIR],
				startQuantity: 5
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.ENERGIE_FOUDRE],
				startQuantity: 5
			},
			{
				type: 'ingredient',
				ingredientId: [Ingredient.GRAINE_DE_DEVOREUSE],
				startQuantity: 3
			},
			{
				type: 'item',
				ingredientId: [itemList[Item.GOLD3000].itemId],
				startQuantity: 6
			},
			{
				type: 'item',
				ingredientId: [Item.CHRISTMAS_EGG],
				startQuantity: 1
			},
			{
				type: 'item',
				ingredientId: [Item.SMOG_EGG_CHRISTMAS_BLUE],
				startQuantity: 1
			}
		],
		cost: {
			...itemList[Item.CHRISTMAS_TICKET],
			quantity: 1
		}
	},
	[GatherType.TICTAC]: {
		action: Action.DIG,
		special: true,
		type: GatherType.TICTAC,
		size: 10,
		minimumClick: 3,
		// Unachievable condition to prevent the gather from being displayed
		condition: { [ConditionEnum.MINLEVEL]: 999 },
		apparence: 'TICTAC',
		items: [],
		cost: {
			...itemList[Item.TICTAC_TICKET],
			quantity: 1
		}
	},
	[GatherType.LABO]: {
		action: Action.DIG,
		special: true,
		type: GatherType.LABO,
		size: 10,
		minimumClick: 3,
		// Unachievable condition to prevent the gather from being displayed
		condition: { [ConditionEnum.MINLEVEL]: 999 },
		apparence: 'LABO',
		items: [],
		cost: {
			...itemList[Item.TICTAC_TICKET],
			quantity: 1
		}
	},
	[GatherType.PARTY]: {
		action: Action.DIG,
		special: true,
		type: GatherType.LABO,
		size: 10,
		minimumClick: 3,
		// Unachievable condition to prevent the gather from being displayed
		condition: { [ConditionEnum.MINLEVEL]: 999 },
		apparence: 'LABO',
		items: [],
		cost: {
			...itemList[Item.TICTAC_TICKET],
			quantity: 1
		}
	},
	// Daily ticket grid
	[GatherType.DAILY]: {
		action: Action.DAILY,
		special: true,
		type: GatherType.DAILY,
		size: 6,
		minimumClick: 1,
		condition: {
			[Operator.AND]: [
				{ [ConditionEnum.POSSESS_OBJECT]: Item.DAILY_TICKET },
				{ [ConditionEnum.PLACE_IS]: PlaceEnum.UNIVERSITE }
			]
		},
		apparence: 'DAILY',
		items: [
			{
				type: 'item',
				ingredientId: [itemList[Item.GOLD2500].itemId],
				startQuantity: 12
			},
			{
				type: 'item',
				ingredientId: [itemList[Item.GOLD5000].itemId],
				startQuantity: 8
			},
			{
				type: 'item',
				ingredientId: [itemList[Item.GOLD10000].itemId],
				startQuantity: 4
			},
			{
				type: 'item',
				ingredientId: [itemList[Item.GOLD20000].itemId],
				startQuantity: 2
			},
			{
				type: 'item',
				ingredientId: [Item.BOX_HANDLER],
				startQuantity: 10
			}
		],
		cost: {
			...itemList[Item.DAILY_TICKET],
			quantity: 1
		}
	}
};
