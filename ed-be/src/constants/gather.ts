import { GatherData } from '@drpg/core/models/gather/gatherData';
import { ConditionEnum, Operator } from '@drpg/core/models/enums/Parser';
import { ingredientList } from './ingredient.js';
import { GatherType } from '@drpg/core/models/enums/GatherType';
import { placeList } from '@drpg/core/models/place/PlaceList';
import { itemList } from '@drpg/core/models/item/ItemList';
import { Skill, skillList } from '@drpg/core/models/dinoz/SkillList';

export const gather: Record<string, GatherData> = {
	FISH: {
		action: 'fish',
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
				},
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.AN_GUILI_GUILILLE.ingredientId,
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: skillList[Skill.MAITRE_PECHEUR].id },
						{ [ConditionEnum.PLACE_IS]: placeList.PORT_DE_PRECHE.name }
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
						{ [ConditionEnum.PLACE_IS]: placeList.CHUTES_MUTANTES.name }
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
						{ [ConditionEnum.PLACE_IS]: placeList.FLEUVE_JUMIN.name }
					]
				}
			}
		]
	},
	CUEILLE1: {
		action: 'cueille',
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
				},
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.ORCHIDEE_FANTASQUE.ingredientId,
				startQuantity: 3,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: skillList[Skill.OEIL_DE_LYNX].id },
						{ [ConditionEnum.PLACE_IS]: placeList.FORGES_DU_GTC.name }
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
						{ [ConditionEnum.PLACE_IS]: placeList.CHEMIN_GLAUQUE.name }
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
						{ [ConditionEnum.PLACE_IS]: placeList.MARAIS_COLLANT.name }
					]
				}
			}
		]
	},
	CUEILLE2: {
		action: 'cueille',
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
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: skillList[Skill.OEIL_DE_LYNX].id },
						{ [ConditionEnum.RANDOM]: 4 }
					]
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.RACINE_DE_FIGONICIA.ingredientId,
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: skillList[Skill.OEIL_DE_LYNX].id },
						{ [ConditionEnum.RANDOM]: 4 }
					]
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.SADIQUAE_MORDICUS.ingredientId,
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: skillList[Skill.OEIL_DE_LYNX].id },
						{ [ConditionEnum.RANDOM]: 4 }
					]
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.FLAUREOLE.ingredientId,
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: skillList[Skill.OEIL_DE_LYNX].id },
						{ [ConditionEnum.PLACE_IS]: placeList.BOIS_GIVRES.name }
					]
				}
			}
		]
	},
	CUEILLE3: {
		action: 'cueille',
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
	CUEILLE4: {
		action: 'cueille',
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
	ENERGY1: {
		action: 'energy',
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
						{ [ConditionEnum.PLACE_IS]: placeList.FORCEBRUT.name }
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
						{ [ConditionEnum.PLACE_IS]: placeList.PENTES_DE_BASALTE.name }
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
						{ [ConditionEnum.PLACE_IS]: placeList.PORTE_DE_SYLVENOIRE.name }
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
						{ [ConditionEnum.PLACE_IS]: placeList.DOME_SOULAFLOTTE.name }
					]
				}
			}
		]
	},
	ENERGY2: {
		action: 'energy',
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
	HUNT: {
		action: 'hunt',
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
						{ [Operator.NOT]: { [ConditionEnum.PLACE_IS]: placeList.LAC_CELESTE.name } }
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
						{ [ConditionEnum.PLACE_IS]: placeList.LAC_CELESTE.name }
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
						{ [ConditionEnum.PLACE_IS]: placeList.LAC_CELESTE.name }
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
						{ [ConditionEnum.PLACE_IS]: placeList.NOWHERE.name } //TODO: lieu caushemesh
					]
				}
			}
		]
	},
	SEEK: {
		action: 'seek',
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
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: skillList[Skill.ARCHEOLOGUE].id },
						{ [ConditionEnum.RANDOM]: 5 }
					]
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.CALICE_CISELE.ingredientId,
				startQuantity: 2,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: skillList[Skill.ARCHEOLOGUE].id },
						{ [ConditionEnum.RANDOM]: 5 }
					]
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.COLLIER_KARAT.ingredientId,
				startQuantity: 2,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: skillList[Skill.ARCHEOLOGUE].id },
						{ [ConditionEnum.RANDOM]: 5 }
					]
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.BROCHE_EN_PARFAIT_ETAT.ingredientId,
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: skillList[Skill.ARCHEOLOGUE].id },
						{ [ConditionEnum.RANDOM]: 15 }
					]
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.SUPERBE_COURONNE_ROYALE.ingredientId,
				startQuantity: 1,
				condition: {
					[Operator.AND]: [
						{ [ConditionEnum.SKILL]: skillList[Skill.ARCHEOLOGUE].id },
						{ [ConditionEnum.RANDOM]: 15 }
					]
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
						{ [ConditionEnum.PLACE_IS]: placeList.TETE_DE_L_ILE.name }
					]
				}
			}
		]
	},
	ANNIV: {
		action: 'anniv',
		type: GatherType.ANNIV,
		special: true,
		size: 10,
		minimumClick: 3,
		condition: {
			[Operator.AND]: [
				{ [ConditionEnum.POSSESS_OBJECT]: itemList.CANDLE_CARD.itemId },
				{ [ConditionEnum.PLACE_IS]: placeList.PORT_DE_PRECHE.name }
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
	}
};
