import { GatherData } from '@drpg/core/models/gather/gatherData';
import { ConditionEnum, ConditionOperatorEnum } from '@drpg/core/models/enums/Parser';
import { ingredientList } from './ingredient.js';
import { skillList } from './skill.js';
import { placeList } from './place.js';
import { GatherType } from '@drpg/core/models/enums/GatherType';
import { itemList } from './item.js';

export const gather: Record<string, GatherData> = {
	FISH: {
		action: 'fish',
		type: GatherType.FISH,
		special: false,
		size: 7,
		minimumClick: 2,
		condition: {
			conditionType: ConditionEnum.SKILL,
			value: skillList.APPRENTI_PECHEUR.skillId
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
					conditionType: ConditionEnum.SKILL,
					value: skillList.PECHEUR_CONFIRME.skillId
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.AN_GUILI_GUILILLE.ingredientId,
				startQuantity: 1,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.MAITRE_PECHEUR.skillId,
					operator: ConditionOperatorEnum.AND,
					nextCondition: {
						conditionType: ConditionEnum.PLACE_IS,
						value: placeList.PORT_DE_PRECHE.name
					}
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.GLOBULOS.ingredientId, //4
				startQuantity: 1,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.MAITRE_PECHEUR.skillId,
					operator: ConditionOperatorEnum.AND,
					nextCondition: {
						conditionType: ConditionEnum.PLACE_IS,
						value: placeList.CHUTES_MUTANTES.name
					}
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.SUPER_POISSON.ingredientId, //5
				startQuantity: 1,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.MAITRE_PECHEUR.skillId,
					operator: ConditionOperatorEnum.AND,
					nextCondition: {
						conditionType: ConditionEnum.PLACE_IS,
						value: placeList.FLEUVE_JUMIN.name
					}
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
			conditionType: ConditionEnum.SKILL,
			value: skillList.CUEILLETTE.skillId
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
					conditionType: ConditionEnum.SKILL,
					value: skillList.OEIL_DE_LYNX.skillId
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.ORCHIDEE_FANTASQUE.ingredientId,
				startQuantity: 3,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.OEIL_DE_LYNX.skillId,
					operator: ConditionOperatorEnum.AND,
					nextCondition: {
						conditionType: ConditionEnum.PLACE_IS,
						value: placeList.FORGES_DU_GTC.name
					}
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.RACINE_DE_FIGONICIA.ingredientId,
				startQuantity: 3,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.OEIL_DE_LYNX.skillId,
					operator: ConditionOperatorEnum.AND,
					nextCondition: {
						conditionType: ConditionEnum.PLACE_IS,
						value: placeList.CHEMIN_GLAUQUE.name
					}
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.SADIQUAE_MORDICUS.ingredientId,
				startQuantity: 3,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.OEIL_DE_LYNX.skillId,
					operator: ConditionOperatorEnum.AND,
					nextCondition: {
						conditionType: ConditionEnum.PLACE_IS,
						value: placeList.MARAIS_COLLANT.name
					}
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
			conditionType: ConditionEnum.SKILL,
			value: skillList.CUEILLETTE.skillId
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
					conditionType: ConditionEnum.SKILL,
					value: skillList.OEIL_DE_LYNX.skillId
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.ORCHIDEE_FANTASQUE.ingredientId,
				startQuantity: 1,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.OEIL_DE_LYNX.skillId,
					operator: ConditionOperatorEnum.AND,
					nextCondition: {
						conditionType: ConditionEnum.RANDOM,
						value: 4
					}
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.RACINE_DE_FIGONICIA.ingredientId,
				startQuantity: 1,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.OEIL_DE_LYNX.skillId,
					operator: ConditionOperatorEnum.AND,
					nextCondition: {
						conditionType: ConditionEnum.RANDOM,
						value: 4
					}
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.SADIQUAE_MORDICUS.ingredientId,
				startQuantity: 1,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.OEIL_DE_LYNX.skillId,
					operator: ConditionOperatorEnum.AND,
					nextCondition: {
						conditionType: ConditionEnum.RANDOM,
						value: 4
					}
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.FLAUREOLE.ingredientId,
				startQuantity: 1,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.OEIL_DE_LYNX.skillId,
					operator: ConditionOperatorEnum.AND,
					nextCondition: {
						conditionType: ConditionEnum.PLACE_IS,
						value: placeList.BOIS_GIVRES.name
					}
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
			conditionType: ConditionEnum.SKILL,
			value: skillList.CUEILLETTE.skillId
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
					conditionType: ConditionEnum.SKILL,
					value: skillList.OEIL_DE_LYNX.skillId
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.ORCHIDEE_FANTASQUE.ingredientId,
				startQuantity: 2,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.OEIL_DE_LYNX.skillId
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.SPORE_ETHERAL.ingredientId,
				startQuantity: 5,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.OEIL_DE_LYNX.skillId,
					operator: ConditionOperatorEnum.AND,
					nextCondition: {
						conditionType: ConditionEnum.RANDOM, //TODO: lieu de caushemesh
						value: 4
					}
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
			conditionType: ConditionEnum.SKILL,
			value: skillList.CUEILLETTE.skillId
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
					conditionType: ConditionEnum.SKILL,
					value: skillList.OEIL_DE_LYNX.skillId
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.SADIQUAE_MORDICUS.ingredientId,
				startQuantity: 2,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.OEIL_DE_LYNX.skillId
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.POUSSE_SOMBRE.ingredientId,
				startQuantity: 1,
				condition: {
					conditionType: ConditionEnum.SKILL, //TODO: lieu du monde sombre
					value: skillList.OEIL_DE_LYNX.skillId
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
			conditionType: ConditionEnum.SKILL,
			value: skillList.PARATONNERRE.skillId
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
					conditionType: ConditionEnum.SKILL,
					value: skillList.FISSION_ELEMENTAIRE.skillId,
					operator: ConditionOperatorEnum.AND,
					nextCondition: {
						conditionType: ConditionEnum.PLACE_IS,
						value: placeList.FORCEBRUT.name
					}
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.ENERGIE_FEU.ingredientId,
				startQuantity: 1,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.FISSION_ELEMENTAIRE.skillId,
					operator: ConditionOperatorEnum.AND,
					nextCondition: {
						conditionType: ConditionEnum.PLACE_IS,
						value: placeList.PENTES_DE_BASALTE.name
					}
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.ENERGIE_BOIS.ingredientId,
				startQuantity: 1,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.FISSION_ELEMENTAIRE.skillId,
					operator: ConditionOperatorEnum.AND,
					nextCondition: {
						conditionType: ConditionEnum.PLACE_IS,
						value: placeList.PORTE_DE_SYLVENOIRE.name
					}
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.ENERGIE_EAU.ingredientId,
				startQuantity: 1,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.FISSION_ELEMENTAIRE.skillId,
					operator: ConditionOperatorEnum.AND,
					nextCondition: {
						conditionType: ConditionEnum.PLACE_IS,
						value: placeList.DOME_SOULAFLOTTE.name
					}
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
			conditionType: ConditionEnum.SKILL,
			value: skillList.PARATONNERRE.skillId
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
					conditionType: ConditionEnum.SKILL,
					value: skillList.FISSION_ELEMENTAIRE.skillId,
					operator: ConditionOperatorEnum.AND,
					nextCondition: {
						conditionType: ConditionEnum.RANDOM,
						value: 6
					}
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.ENERGIE_BOIS.ingredientId,
				startQuantity: 1,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.FISSION_ELEMENTAIRE.skillId,
					operator: ConditionOperatorEnum.AND,
					nextCondition: {
						conditionType: ConditionEnum.RANDOM,
						value: 6
					}
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.ENERGIE_EAU.ingredientId,
				startQuantity: 1,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.FISSION_ELEMENTAIRE.skillId,
					operator: ConditionOperatorEnum.AND,
					nextCondition: {
						conditionType: ConditionEnum.RANDOM,
						value: 6
					}
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
			conditionType: ConditionEnum.SKILL,
			value: skillList.CHASSEUR_DE_GOUPIGNON.skillId
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
					conditionType: ConditionEnum.SKILL,
					value: skillList.CHASSEUR_DE_GEANT.skillId
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.CORNE_EN_CHOCOLAT.ingredientId,
				startQuantity: 1,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.CHASSEUR_DE_DRAGON.skillId
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.OEIL_VISQUEUX.ingredientId,
				startQuantity: 1,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.CHASSEUR_DE_DRAGON.skillId
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.LANGUE_MONSTRUEUSE.ingredientId,
				startQuantity: 1,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.CHASSEUR_DE_DRAGON.skillId,
					operator: ConditionOperatorEnum.AND,
					nextCondition: {
						conditionType: ConditionEnum.RANDOM,
						value: 3,
						operator: ConditionOperatorEnum.AND,
						nextCondition: {
							conditionType: ConditionEnum.PLACE_IS,
							value: placeList.LAC_CELESTE.name,
							reverse: true
						}
					}
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.LANGUE_MONSTRUEUSE.ingredientId,
				startQuantity: 1,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.CHASSEUR_DE_DRAGON.skillId,
					operator: ConditionOperatorEnum.AND,
					nextCondition: {
						conditionType: ConditionEnum.RANDOM,
						value: 3,
						operator: ConditionOperatorEnum.AND,
						nextCondition: {
							conditionType: ConditionEnum.PLACE_IS,
							value: placeList.LAC_CELESTE.name
						}
					}
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.DENT_DE_DOROGON.ingredientId,
				startQuantity: 1,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.CHASSEUR_DE_DRAGON.skillId,
					operator: ConditionOperatorEnum.AND,
					nextCondition: {
						conditionType: ConditionEnum.RANDOM,
						value: 3,
						operator: ConditionOperatorEnum.AND,
						nextCondition: {
							conditionType: ConditionEnum.PLACE_IS,
							value: placeList.LAC_CELESTE.name
						}
					}
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.ROCHE_RADIO_ACTIVE.ingredientId,
				startQuantity: 1,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.CHASSEUR_DE_GEANT.skillId,
					operator: ConditionOperatorEnum.AND,
					nextCondition: {
						conditionType: ConditionEnum.PLACE_IS, //TODO: lieu caushemesh
						value: placeList.NOWHERE.name
					}
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
			conditionType: ConditionEnum.SKILL,
			value: skillList.FOUILLE.skillId
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
					conditionType: ConditionEnum.SKILL,
					value: skillList.DETECTIVE.skillId
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.VIEIL_ANNEAU_PRECIEUX.ingredientId,
				startQuantity: 2,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.ARCHEOLOGUE.skillId,
					operator: ConditionOperatorEnum.AND,
					nextCondition: {
						conditionType: ConditionEnum.RANDOM,
						value: 5
					}
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.CALICE_CISELE.ingredientId,
				startQuantity: 2,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.ARCHEOLOGUE.skillId,
					operator: ConditionOperatorEnum.AND,
					nextCondition: {
						conditionType: ConditionEnum.RANDOM,
						value: 5
					}
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.COLLIER_KARAT.ingredientId,
				startQuantity: 2,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.ARCHEOLOGUE.skillId,
					operator: ConditionOperatorEnum.AND,
					nextCondition: {
						conditionType: ConditionEnum.RANDOM,
						value: 5
					}
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.BROCHE_EN_PARFAIT_ETAT.ingredientId,
				startQuantity: 1,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.ARCHEOLOGUE.skillId,
					operator: ConditionOperatorEnum.AND,
					nextCondition: {
						conditionType: ConditionEnum.RANDOM,
						value: 15
					}
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.SUPERBE_COURONNE_ROYALE.ingredientId,
				startQuantity: 1,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.ARCHEOLOGUE.skillId,
					operator: ConditionOperatorEnum.AND,
					nextCondition: {
						conditionType: ConditionEnum.RANDOM,
						value: 15
					}
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.BRAS_MECANIQUE.ingredientId,
				startQuantity: 1,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.ARCHEOLOGUE.skillId,
					operator: ConditionOperatorEnum.AND,
					nextCondition: {
						conditionType: ConditionEnum.RANDOM,
						value: 10,
						operator: ConditionOperatorEnum.AND,
						nextCondition: {
							conditionType: ConditionEnum.PLACE_IS,
							value: placeList.TETE_DE_L_ILE.name
						}
					}
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
			conditionType: ConditionEnum.POSSESS_OBJECT,
			value: itemList.CANDLE_CARD.itemId,
			operator: ConditionOperatorEnum.AND,
			nextCondition: {
				conditionType: ConditionEnum.PLACE_IS,
				value: placeList.PORT_DE_PRECHE.name
			}
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
