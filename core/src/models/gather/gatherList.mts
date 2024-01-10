import { Action } from '../dinoz/ActionList.mjs';
import { Skill, skillList } from '../dinoz/SkillList.mjs';
import { GatherType } from '../enums/GatherType.mjs';
import { ConditionEnum, Operator } from '../enums/Parser.mjs';
import { PlaceEnum } from '../enums/PlaceEnum.mjs';
import { ingredientList } from '../ingredient/ingredientList.mjs';
import { itemList } from '../item/ItemList.mjs';
import { GatherData } from './gatherData.mjs';

export const gatherList: Record<GatherType, GatherData> = {
	[GatherType.FISH]: {
		action: Action.FISH,
		type: GatherType.FISH,
		special: false,
		size: 7,
		minimumClick: 2,
		condition: {
			[ConditionEnum.SKILL]: skillList[Skill.APPRENTI_PECHEUR].id
		},
		apparence: 'FISH',
		items: [
			{
				type: 'ingredient',
				ingredientId: ingredientList.MEROU_LUJIDANE.ingredientId,
				startQuantity: 18
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.POISSON_VENGEUR.ingredientId,
				startQuantity: 5,
				condition: {
					[ConditionEnum.SKILL]: skillList[Skill.PECHEUR_CONFIRME].id
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.AN_GUILI_GUILILLE.ingredientId,
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: skillList[Skill.MAITRE_PECHEUR].id },
						{ [ConditionEnum.PLACE_IS]: PlaceEnum.PORT_DE_PRECHE }
					]
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.GLOBULOS.ingredientId, //4
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: skillList[Skill.MAITRE_PECHEUR].id },
						{ [ConditionEnum.PLACE_IS]: PlaceEnum.CHUTES_MUTANTES }
					]
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.SUPER_POISSON.ingredientId, //5
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: skillList[Skill.MAITRE_PECHEUR].id },
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
			[ConditionEnum.SKILL]: skillList[Skill.CUEILLETTE].id
		},
		apparence: 'CUEILLE',
		items: [
			{
				type: 'ingredient',
				ingredientId: ingredientList.FEUILLES_DE_PELINAE.ingredientId,
				startQuantity: 28
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.BOLET_PHALISK_BLANC.ingredientId,
				startQuantity: 11,
				condition: {
					[ConditionEnum.SKILL]: skillList[Skill.OEIL_DE_LYNX].id
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.ORCHIDEE_FANTASQUE.ingredientId,
				startQuantity: 3,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: skillList[Skill.OEIL_DE_LYNX].id },
						{ [ConditionEnum.PLACE_IS]: PlaceEnum.FORGES_DU_GTC }
					]
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.RACINE_DE_FIGONICIA.ingredientId,
				startQuantity: 3,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: skillList[Skill.OEIL_DE_LYNX].id },
						{ [ConditionEnum.PLACE_IS]: PlaceEnum.CHEMIN_GLAUQUE }
					]
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.SADIQUAE_MORDICUS.ingredientId,
				startQuantity: 3,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: skillList[Skill.OEIL_DE_LYNX].id },
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
			[ConditionEnum.SKILL]: skillList[Skill.CUEILLETTE].id
		},
		apparence: 'CUEILLE',
		items: [
			{
				type: 'ingredient',
				ingredientId: ingredientList.FEUILLES_DE_PELINAE.ingredientId,
				startQuantity: 20
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.BOLET_PHALISK_BLANC.ingredientId,
				startQuantity: 5,
				condition: {
					[ConditionEnum.SKILL]: skillList[Skill.OEIL_DE_LYNX].id
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.ORCHIDEE_FANTASQUE.ingredientId,
				startQuantity: 1,
				condition: {
					[Operator.AND]: [{ [ConditionEnum.SKILL]: skillList[Skill.OEIL_DE_LYNX].id }, { [ConditionEnum.RANDOM]: 4 }]
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.RACINE_DE_FIGONICIA.ingredientId,
				startQuantity: 1,
				condition: {
					[Operator.AND]: [{ [ConditionEnum.SKILL]: skillList[Skill.OEIL_DE_LYNX].id }, { [ConditionEnum.RANDOM]: 4 }]
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.SADIQUAE_MORDICUS.ingredientId,
				startQuantity: 1,
				condition: {
					[Operator.AND]: [{ [ConditionEnum.SKILL]: skillList[Skill.OEIL_DE_LYNX].id }, { [ConditionEnum.RANDOM]: 4 }]
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.FLAUREOLE.ingredientId,
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: skillList[Skill.OEIL_DE_LYNX].id },
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
			[ConditionEnum.SKILL]: skillList[Skill.CUEILLETTE].id
		},
		apparence: 'CUEILLE',
		items: [
			{
				type: 'ingredient',
				ingredientId: ingredientList.FEUILLES_DE_PELINAE.ingredientId,
				startQuantity: 5
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.BOLET_PHALISK_BLANC.ingredientId,
				startQuantity: 5,
				condition: {
					[ConditionEnum.SKILL]: skillList[Skill.OEIL_DE_LYNX].id
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.ORCHIDEE_FANTASQUE.ingredientId,
				startQuantity: 2,
				condition: {
					[ConditionEnum.SKILL]: skillList[Skill.OEIL_DE_LYNX].id
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.SPORE_ETHERAL.ingredientId,
				startQuantity: 5,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: skillList[Skill.OEIL_DE_LYNX].id },
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
			[ConditionEnum.SKILL]: skillList[Skill.CUEILLETTE].id
		},
		apparence: 'CUEILLE',
		items: [
			{
				type: 'ingredient',
				ingredientId: ingredientList.FEUILLES_DE_PELINAE.ingredientId,
				startQuantity: 8
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.BOLET_PHALISK_BLANC.ingredientId,
				startQuantity: 3
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.ORCHIDEE_FANTASQUE.ingredientId,
				startQuantity: 2,
				condition: {
					[ConditionEnum.SKILL]: skillList[Skill.OEIL_DE_LYNX].id
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.SADIQUAE_MORDICUS.ingredientId,
				startQuantity: 2,
				condition: {
					[ConditionEnum.SKILL]: skillList[Skill.OEIL_DE_LYNX].id
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.POUSSE_SOMBRE.ingredientId,
				startQuantity: 1,
				condition: {
					[ConditionEnum.SKILL]: skillList[Skill.OEIL_DE_LYNX].id //TODO: lieu du monde sombre
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
			[ConditionEnum.SKILL]: skillList[Skill.PARATONNERRE].id
		},
		apparence: 'ENERGY',
		items: [
			{
				type: 'ingredient',
				ingredientId: ingredientList.ENERGIE_FOUDRE.ingredientId,
				startQuantity: 6
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.ENERGIE_AIR.ingredientId,
				startQuantity: 3,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: skillList[Skill.FISSION_ELEMENTAIRE].id },
						{ [ConditionEnum.PLACE_IS]: PlaceEnum.FORCEBRUT }
					]
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.ENERGIE_FEU.ingredientId,
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: skillList[Skill.FISSION_ELEMENTAIRE].id },
						{ [ConditionEnum.PLACE_IS]: PlaceEnum.PENTES_DE_BASALTE }
					]
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.ENERGIE_BOIS.ingredientId,
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: skillList[Skill.FISSION_ELEMENTAIRE].id },
						{ [ConditionEnum.PLACE_IS]: PlaceEnum.PORTE_DE_SYLVENOIRE }
					]
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.ENERGIE_EAU.ingredientId,
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: skillList[Skill.FISSION_ELEMENTAIRE].id },
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
			[ConditionEnum.SKILL]: skillList[Skill.PARATONNERRE].id
		},
		apparence: 'ENERGY',
		items: [
			{
				type: 'ingredient',
				ingredientId: ingredientList.ENERGIE_FOUDRE.ingredientId,
				startQuantity: 1
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.ENERGIE_AIR.ingredientId,
				startQuantity: 3
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.ENERGIE_FEU.ingredientId,
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: skillList[Skill.FISSION_ELEMENTAIRE].id },
						{ [ConditionEnum.RANDOM]: 6 }
					]
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.ENERGIE_BOIS.ingredientId,
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: skillList[Skill.FISSION_ELEMENTAIRE].id },
						{ [ConditionEnum.RANDOM]: 6 }
					]
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.ENERGIE_EAU.ingredientId,
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: skillList[Skill.FISSION_ELEMENTAIRE].id },
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
			[ConditionEnum.SKILL]: skillList[Skill.CHASSEUR_DE_GOUPIGNON].id
		},
		apparence: 'HUNT',
		items: [
			{
				type: 'ingredient',
				ingredientId: ingredientList.TOUFFE_DE_FOURRURE.ingredientId,
				startQuantity: 7
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.GRIFFES_ACEREES.ingredientId,
				startQuantity: 4,
				condition: {
					[ConditionEnum.SKILL]: skillList[Skill.CHASSEUR_DE_GEANT].id
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.CORNE_EN_CHOCOLAT.ingredientId,
				startQuantity: 1,
				condition: {
					[ConditionEnum.SKILL]: skillList[Skill.CHASSEUR_DE_DRAGON].id
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.OEIL_VISQUEUX.ingredientId,
				startQuantity: 1,
				condition: {
					[ConditionEnum.SKILL]: skillList[Skill.CHASSEUR_DE_DRAGON].id
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.LANGUE_MONSTRUEUSE.ingredientId,
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: skillList[Skill.CHASSEUR_DE_DRAGON].id },
						{ [ConditionEnum.RANDOM]: 3 },
						{ [Operator.NOT]: { [ConditionEnum.PLACE_IS]: PlaceEnum.LAC_CELESTE } }
					]
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.LANGUE_MONSTRUEUSE.ingredientId,
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: skillList[Skill.CHASSEUR_DE_DRAGON].id },
						{ [ConditionEnum.RANDOM]: 3 },
						{ [ConditionEnum.PLACE_IS]: PlaceEnum.LAC_CELESTE }
					]
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.DENT_DE_DOROGON.ingredientId,
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: skillList[Skill.CHASSEUR_DE_DRAGON].id },
						{ [ConditionEnum.RANDOM]: 3 },
						{ [ConditionEnum.PLACE_IS]: PlaceEnum.LAC_CELESTE }
					]
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.ROCHE_RADIO_ACTIVE.ingredientId,
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: skillList[Skill.CHASSEUR_DE_GEANT].id },
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
			[ConditionEnum.SKILL]: skillList[Skill.FOUILLE].id
		},
		apparence: 'SEEK',
		items: [
			{
				type: 'ingredient',
				ingredientId: ingredientList.SILEX_TAILLE.ingredientId,
				startQuantity: 3
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.FRAGMENT_DE_TEXTE_ANCIEN.ingredientId,
				startQuantity: 1,
				condition: {
					[ConditionEnum.SKILL]: skillList[Skill.DETECTIVE].id
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.VIEIL_ANNEAU_PRECIEUX.ingredientId,
				startQuantity: 2,
				condition: {
					[Operator.AND]: [{ [ConditionEnum.SKILL]: skillList[Skill.ARCHEOLOGUE].id }, { [ConditionEnum.RANDOM]: 5 }]
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.CALICE_CISELE.ingredientId,
				startQuantity: 2,
				condition: {
					[Operator.AND]: [{ [ConditionEnum.SKILL]: skillList[Skill.ARCHEOLOGUE].id }, { [ConditionEnum.RANDOM]: 5 }]
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.COLLIER_KARAT.ingredientId,
				startQuantity: 2,
				condition: {
					[Operator.AND]: [{ [ConditionEnum.SKILL]: skillList[Skill.ARCHEOLOGUE].id }, { [ConditionEnum.RANDOM]: 5 }]
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.BROCHE_EN_PARFAIT_ETAT.ingredientId,
				startQuantity: 1,
				condition: {
					[Operator.AND]: [{ [ConditionEnum.SKILL]: skillList[Skill.ARCHEOLOGUE].id }, { [ConditionEnum.RANDOM]: 15 }]
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.SUPERBE_COURONNE_ROYALE.ingredientId,
				startQuantity: 1,
				condition: {
					[Operator.AND]: [{ [ConditionEnum.SKILL]: skillList[Skill.ARCHEOLOGUE].id }, { [ConditionEnum.RANDOM]: 15 }]
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.BRAS_MECANIQUE.ingredientId,
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: skillList[Skill.ARCHEOLOGUE].id },
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
				{ [ConditionEnum.POSSESS_OBJECT]: itemList.CANDLE_CARD.itemId },
				{ [ConditionEnum.PLACE_IS]: PlaceEnum.PORT_DE_PRECHE }
			]
		},
		cost: {
			name: itemList.CANDLE_CARD.name,
			itemId: itemList.CANDLE_CARD.itemId,
			quantity: 1,
			maxQuantity: itemList.CANDLE_CARD.maxQuantity,
			canBeEquipped: itemList.CANDLE_CARD.canBeEquipped,
			canBeUsedNow: itemList.CANDLE_CARD.canBeUsedNow,
			itemType: itemList.CANDLE_CARD.itemType,
			isRare: itemList.CANDLE_CARD.isRare,
			price: itemList.CANDLE_CARD.price
		},
		apparence: 'ANNIV',
		items: [
			{
				type: 'ingredient',
				ingredientId: ingredientList.MEROU_LUJIDANE.ingredientId,
				startQuantity: 16
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.POISSON_VENGEUR.ingredientId,
				startQuantity: 5
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.AN_GUILI_GUILILLE.ingredientId,
				startQuantity: 5
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.GLOBULOS.ingredientId,
				startQuantity: 5
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.SUPER_POISSON.ingredientId,
				startQuantity: 4
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.SPORE_ETHERAL.ingredientId,
				startQuantity: 5
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.ROCHE_RADIO_ACTIVE.ingredientId,
				startQuantity: 2
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.GRAINE_DE_DEVOREUSE.ingredientId,
				startQuantity: 1
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.SILEX_TAILLE.ingredientId,
				startQuantity: 10
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.FRAGMENT_DE_TEXTE_ANCIEN.ingredientId,
				startQuantity: 3
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.COLLIER_KARAT.ingredientId,
				startQuantity: 1
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.ENERGIE_FOUDRE.ingredientId,
				startQuantity: 3
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.ENERGIE_AIR.ingredientId,
				startQuantity: 4
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.ENERGIE_EAU.ingredientId,
				startQuantity: 2
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.ENERGIE_FEU.ingredientId,
				startQuantity: 4
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.ENERGIE_BOIS.ingredientId,
				startQuantity: 2
			},
			{
				type: 'item',
				ingredientId: itemList.GOLD1000.itemId,
				startQuantity: 10
			},
			{
				type: 'item',
				ingredientId: itemList.GOLD2000.itemId,
				startQuantity: 8
			},
			{
				type: 'item',
				ingredientId: itemList.GOLD3000.itemId,
				startQuantity: 5
			},
			{
				type: 'item',
				ingredientId: itemList.GOLD20000.itemId,
				startQuantity: 2
			},
			{
				type: 'item',
				ingredientId: itemList.TICTAC_TICKET.itemId,
				startQuantity: 1
			},
			{
				type: 'item',
				ingredientId: itemList.SMOG_EGG_ANNIVERSARY.itemId,
				startQuantity: 2
			}
		]
	},
	[GatherType.XMAS]: {
		action: Action.DIG,
		special: true,
		type: GatherType.XMAS,
		size: 10,
		minimumClick: 3,
		// Unachievable condition to prevent the gather from being displayed
		condition: { [ConditionEnum.MINLEVEL]: 999 },
		apparence: 'XMAS',
		items: [],
		cost: {
			...itemList.CHRISTMAS_TICKET,
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
			...itemList.TICTAC_TICKET,
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
			...itemList.TICTAC_TICKET,
			quantity: 1
		}
	},
	[GatherType.PARTY]: {
		action: Action.DIG,
		special: true,
		type: GatherType.PARTY,
		size: 10,
		minimumClick: 3,
		// Unachievable condition to prevent the gather from being displayed
		condition: { [ConditionEnum.MINLEVEL]: 999 },
		apparence: 'PARTY',
		items: [],
		cost: {
			...itemList.TICTAC_TICKET,
			quantity: 1
		}
	}
};
