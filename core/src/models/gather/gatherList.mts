import { Action } from '../dinoz/ActionList.mjs';
import { Skill, skillList } from '../dinoz/SkillList.mjs';
import { GatherType } from '../enums/GatherType.mjs';
import { ConditionEnum, Operator } from '../enums/Parser.mjs';
import { PlaceEnum } from '../enums/PlaceEnum.mjs';
import { Ingredient } from '../ingredient/ingredientList.mjs';
import { Item, itemList } from '../item/ItemList.mjs';
import { GatherData } from './gatherData.mjs';

// For a given gathering type, each item entry is mapped to a unique ID.
// Editing existing IDs must be thoroughly reviewed to limit impacts on players.
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
		items: {
			[1]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.MEROU_LUJIDANE],
				startQuantity: 18
			},
			[2]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.POISSON_VENGEUR],
				startQuantity: 5,
				condition: {
					[ConditionEnum.SKILL]: Skill.PECHEUR_CONFIRME
				}
			},
			[3]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.AN_GUILI_GUILILLE],
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: Skill.MAITRE_PECHEUR },
						{ [ConditionEnum.PLACE_IS]: PlaceEnum.PORT_DE_PRECHE }
					]
				}
			},
			[4]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.GLOBULOS],
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: Skill.MAITRE_PECHEUR },
						{ [ConditionEnum.PLACE_IS]: PlaceEnum.CHUTES_MUTANTES }
					]
				}
			},
			[5]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.SUPER_POISSON],
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: Skill.MAITRE_PECHEUR },
						{ [ConditionEnum.PLACE_IS]: PlaceEnum.FLEUVE_JUMIN }
					]
				}
			}
		}
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
		items: {
			[1]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.FEUILLES_DE_PELINAE],
				startQuantity: 28
			},
			[2]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.BOLET_PHALISK_BLANC],
				startQuantity: 11,
				condition: {
					[ConditionEnum.SKILL]: Skill.OEIL_DE_LYNX
				}
			},
			[3]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.ORCHIDEE_FANTASQUE],
				startQuantity: 3,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: Skill.OEIL_DE_LYNX },
						{ [ConditionEnum.PLACE_IS]: PlaceEnum.FORGES_DU_GTC }
					]
				}
			},
			[4]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.RACINE_DE_FIGONICIA],
				startQuantity: 3,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: Skill.OEIL_DE_LYNX },
						{ [ConditionEnum.PLACE_IS]: PlaceEnum.CHEMIN_GLAUQUE }
					]
				}
			},
			[5]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.SADIQUAE_MORDICUS],
				startQuantity: 3,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: Skill.OEIL_DE_LYNX },
						{ [ConditionEnum.PLACE_IS]: PlaceEnum.MARAIS_COLLANT }
					]
				}
			}
		}
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
		items: {
			[1]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.FEUILLES_DE_PELINAE],
				startQuantity: 20
			},
			[2]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.BOLET_PHALISK_BLANC],
				startQuantity: 5,
				condition: {
					[ConditionEnum.SKILL]: Skill.OEIL_DE_LYNX
				}
			},
			[3]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.ORCHIDEE_FANTASQUE],
				startQuantity: 1,
				condition: {
					[Operator.AND]: [{ [ConditionEnum.SKILL]: Skill.OEIL_DE_LYNX }, { [ConditionEnum.RANDOM]: 4 }]
				}
			},
			[4]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.RACINE_DE_FIGONICIA],
				startQuantity: 1,
				condition: {
					[Operator.AND]: [{ [ConditionEnum.SKILL]: Skill.OEIL_DE_LYNX }, { [ConditionEnum.RANDOM]: 4 }]
				}
			},
			[5]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.SADIQUAE_MORDICUS],
				startQuantity: 1,
				condition: {
					[Operator.AND]: [{ [ConditionEnum.SKILL]: Skill.OEIL_DE_LYNX }, { [ConditionEnum.RANDOM]: 4 }]
				}
			},
			[6]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.FLAUREOLE],
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: Skill.OEIL_DE_LYNX },
						{ [ConditionEnum.PLACE_IS]: PlaceEnum.BOIS_GIVRES }
					]
				}
			}
		}
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
		items: {
			[1]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.FEUILLES_DE_PELINAE],
				startQuantity: 5
			},
			[2]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.BOLET_PHALISK_BLANC],
				startQuantity: 5,
				condition: {
					[ConditionEnum.SKILL]: Skill.OEIL_DE_LYNX
				}
			},
			[3]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.ORCHIDEE_FANTASQUE],
				startQuantity: 2,
				condition: {
					[ConditionEnum.SKILL]: Skill.OEIL_DE_LYNX
				}
			},
			[4]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.SPORE_ETHERAL],
				startQuantity: 5,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: Skill.OEIL_DE_LYNX },
						{ [ConditionEnum.RANDOM]: 4 } //TODO: lieu de caushemesh
					]
				}
			}
		}
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
		items: {
			[1]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.FEUILLES_DE_PELINAE],
				startQuantity: 8
			},
			[2]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.BOLET_PHALISK_BLANC],
				startQuantity: 3
			},
			[3]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.ORCHIDEE_FANTASQUE, Ingredient.SADIQUAE_MORDICUS],
				startQuantity: 2,
				condition: {
					[ConditionEnum.SKILL]: Skill.OEIL_DE_LYNX
				}
			},
			[4]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.POUSSE_SOMBRE],
				startQuantity: 1,
				condition: {
					[ConditionEnum.SKILL]: Skill.OEIL_DE_LYNX
				}
			}
		}
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
		items: {
			[1]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.ENERGIE_FOUDRE],
				startQuantity: 6
			},
			[2]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.ENERGIE_AIR],
				startQuantity: 3,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: Skill.FISSION_ELEMENTAIRE },
						{ [ConditionEnum.PLACE_IS]: PlaceEnum.FORCEBRUT }
					]
				}
			},
			[3]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.ENERGIE_FEU],
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: Skill.FISSION_ELEMENTAIRE },
						{ [ConditionEnum.PLACE_IS]: PlaceEnum.PENTES_DE_BASALTE }
					]
				}
			},
			[4]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.ENERGIE_BOIS],
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: Skill.FISSION_ELEMENTAIRE },
						{ [ConditionEnum.PLACE_IS]: PlaceEnum.PORTE_DE_SYLVENOIRE }
					]
				}
			},
			[5]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.ENERGIE_EAU],
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: Skill.FISSION_ELEMENTAIRE },
						{ [ConditionEnum.PLACE_IS]: PlaceEnum.DOME_SOULAFLOTTE }
					]
				}
			}
		}
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
		items: {
			[1]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.ENERGIE_FOUDRE],
				startQuantity: 1
			},
			[2]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.ENERGIE_AIR],
				startQuantity: 3
			},
			[3]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.ENERGIE_FEU],
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: Skill.FISSION_ELEMENTAIRE },
						{ [ConditionEnum.RANDOM]: 6 }
					]
				}
			},
			[4]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.ENERGIE_BOIS],
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: Skill.FISSION_ELEMENTAIRE },
						{ [ConditionEnum.RANDOM]: 6 }
					]
				}
			},
			[5]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.ENERGIE_EAU],
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: Skill.FISSION_ELEMENTAIRE },
						{ [ConditionEnum.RANDOM]: 6 }
					]
				}
			}
		}
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
		items: {
			[1]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.TOUFFE_DE_FOURRURE],
				startQuantity: 7
			},
			[2]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.GRIFFES_ACEREES],
				startQuantity: 4,
				condition: {
					[ConditionEnum.SKILL]: Skill.CHASSEUR_DE_GEANT
				}
			},
			[3]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.CORNE_EN_CHOCOLAT, Ingredient.OEIL_VISQUEUX],
				startQuantity: 1,
				condition: {
					[ConditionEnum.SKILL]: Skill.CHASSEUR_DE_DRAGON
				}
			},
			[4]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.LANGUE_MONSTRUEUSE],
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: Skill.CHASSEUR_DE_DRAGON },
						{ [ConditionEnum.RANDOM]: 3 },
						{ [Operator.NOT]: { [ConditionEnum.PLACE_IS]: PlaceEnum.LAC_CELESTE } }
					]
				}
			},
			[5]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.LANGUE_MONSTRUEUSE, Ingredient.DENT_DE_DOROGON],
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: Skill.CHASSEUR_DE_DRAGON },
						{ [ConditionEnum.RANDOM]: 3 },
						{ [ConditionEnum.PLACE_IS]: PlaceEnum.LAC_CELESTE }
					]
				}
			},
			[6]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.ROCHE_RADIO_ACTIVE],
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: Skill.CHASSEUR_DE_GEANT },
						{ [ConditionEnum.PLACE_IS]: PlaceEnum.NOWHERE } //TODO: lieu caushemesh
					]
				}
			}
		}
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
		items: {
			[1]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.SILEX_TAILLE],
				startQuantity: 3
			},
			[2]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.FRAGMENT_DE_TEXTE_ANCIEN],
				startQuantity: 1,
				condition: {
					[ConditionEnum.SKILL]: Skill.DETECTIVE
				}
			},
			[3]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.VIEIL_ANNEAU_PRECIEUX, Ingredient.CALICE_CISELE, Ingredient.COLLIER_KARAT],
				startQuantity: 2,
				condition: {
					[Operator.AND]: [{ [ConditionEnum.SKILL]: Skill.ARCHEOLOGUE }, { [ConditionEnum.RANDOM]: 5 }]
				}
			},
			[4]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.BROCHE_EN_PARFAIT_ETAT, Ingredient.SUPERBE_COURONNE_ROYALE],
				startQuantity: 1,
				condition: {
					[Operator.AND]: [{ [ConditionEnum.SKILL]: Skill.ARCHEOLOGUE }, { [ConditionEnum.RANDOM]: 15 }]
				}
			},
			[5]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.BRAS_MECANIQUE],
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: Skill.ARCHEOLOGUE },
						{ [ConditionEnum.RANDOM]: 10 },
						{ [ConditionEnum.PLACE_IS]: PlaceEnum.TETE_DE_L_ILE }
					]
				}
			}
		}
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
		items: {
			[1]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.MEROU_LUJIDANE],
				startQuantity: 16
			},
			[2]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.POISSON_VENGEUR],
				startQuantity: 5
			},
			[3]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.AN_GUILI_GUILILLE],
				startQuantity: 5
			},
			[4]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.GLOBULOS],
				startQuantity: 5
			},
			[5]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.SUPER_POISSON],
				startQuantity: 4
			},
			[6]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.SPORE_ETHERAL],
				startQuantity: 5
			},
			[7]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.ROCHE_RADIO_ACTIVE],
				startQuantity: 2
			},
			[8]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.GRAINE_DE_DEVOREUSE],
				startQuantity: 1
			},
			[9]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.SILEX_TAILLE],
				startQuantity: 10
			},
			[10]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.FRAGMENT_DE_TEXTE_ANCIEN],
				startQuantity: 3
			},
			[11]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.COLLIER_KARAT],
				startQuantity: 1
			},
			[12]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.ENERGIE_FOUDRE],
				startQuantity: 3
			},
			[13]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.ENERGIE_AIR],
				startQuantity: 4
			},
			[14]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.ENERGIE_EAU],
				startQuantity: 2
			},
			[15]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.ENERGIE_FEU],
				startQuantity: 4
			},
			[16]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.ENERGIE_BOIS],
				startQuantity: 2
			},
			[17]: {
				type: 'item',
				ingredientOrItemId: [itemList[Item.GOLD1000].itemId],
				startQuantity: 10
			},
			[18]: {
				type: 'item',
				ingredientOrItemId: [itemList[Item.GOLD2000].itemId],
				startQuantity: 8
			},
			[19]: {
				type: 'item',
				ingredientOrItemId: [itemList[Item.GOLD3000].itemId],
				startQuantity: 5
			},
			[20]: {
				type: 'item',
				ingredientOrItemId: [itemList[Item.GOLD20000].itemId],
				startQuantity: 2
			},
			[21]: {
				type: 'item',
				ingredientOrItemId: [Item.TICTAC_TICKET],
				startQuantity: 1
			},
			[22]: {
				type: 'item',
				ingredientOrItemId: [Item.SMOG_EGG_ANNIVERSARY],
				startQuantity: 2
			}
		}
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
		items: {
			[1]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.SILEX_TAILLE],
				startQuantity: 8
			},
			[2]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.FRAGMENT_DE_TEXTE_ANCIEN],
				startQuantity: 4
			},
			[3]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.CALICE_CISELE],
				startQuantity: 1
			},
			[4]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.COLLIER_KARAT],
				startQuantity: 1
			},
			[5]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.TOUFFE_DE_FOURRURE],
				startQuantity: 13
			},
			[6]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.FEUILLES_DE_PELINAE],
				startQuantity: 11
			},
			[7]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.BOLET_PHALISK_BLANC],
				startQuantity: 8
			},
			[8]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.RACINE_DE_FIGONICIA],
				startQuantity: 1
			},
			[9]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.FLAUREOLE],
				startQuantity: 1
			},
			[10]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.SPORE_ETHERAL],
				startQuantity: 1
			},
			[11]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.MEROU_LUJIDANE],
				startQuantity: 11
			},
			[12]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.POISSON_VENGEUR],
				startQuantity: 5
			},
			[13]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.GRIFFES_ACEREES],
				startQuantity: 5
			},
			[14]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.ENERGIE_EAU],
				startQuantity: 3
			},
			[15]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.ENERGIE_FEU],
				startQuantity: 2
			},
			[16]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.ENERGIE_BOIS],
				startQuantity: 4
			},
			[17]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.ENERGIE_AIR],
				startQuantity: 5
			},
			[18]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.ENERGIE_FOUDRE],
				startQuantity: 5
			},
			[19]: {
				type: 'ingredient',
				ingredientOrItemId: [Ingredient.GRAINE_DE_DEVOREUSE],
				startQuantity: 3
			},
			[20]: {
				type: 'item',
				ingredientOrItemId: [itemList[Item.GOLD3000].itemId],
				startQuantity: 6
			},
			[21]: {
				type: 'item',
				ingredientOrItemId: [Item.CHRISTMAS_EGG],
				startQuantity: 1
			},
			[22]: {
				type: 'item',
				ingredientOrItemId: [Item.SMOG_EGG_CHRISTMAS_BLUE],
				startQuantity: 1
			}
		},
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
		items: {
			[1]: {
				type: 'item',
				ingredientOrItemId: [itemList[Item.GOLD2500].itemId],
				startQuantity: 12
			},
			[2]: {
				type: 'item',
				ingredientOrItemId: [itemList[Item.GOLD5000].itemId],
				startQuantity: 8
			},
			[3]: {
				type: 'item',
				ingredientOrItemId: [itemList[Item.GOLD10000].itemId],
				startQuantity: 4
			},
			[4]: {
				type: 'item',
				ingredientOrItemId: [itemList[Item.GOLD20000].itemId],
				startQuantity: 2
			},
			[5]: {
				type: 'item',
				ingredientOrItemId: [Item.BOX_HANDLER],
				startQuantity: 10
			}
		},
		cost: {
			...itemList[Item.DAILY_TICKET],
			quantity: 1
		}
	}
};
