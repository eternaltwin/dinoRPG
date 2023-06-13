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
		clicks: 2,
		condition: {
			conditionType: ConditionEnum.SKILL,
			value: skillList.APPRENTI_PECHEUR.skillId
		},
		apparence: 'FISH',
		items: [
			{
				type: 'ingredient',
				ingredientId: ingredientList.MEROU_LUJIDANE.ingredientId,
				count: 18
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.POISSON_VENGEUR.ingredientId,
				count: 5,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.PECHEUR_CONFIRME.skillId
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.AN_GUILI_GUILILLE.ingredientId,
				count: 1,
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
				count: 1,
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
				count: 1,
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
		clicks: 3,
		condition: {
			conditionType: ConditionEnum.SKILL,
			value: skillList.CUEILLETTE.skillId
		},
		apparence: 'CUEILLE',
		items: [
			{
				type: 'ingredient',
				ingredientId: ingredientList.FEUILLES_DE_PELINAE.ingredientId,
				count: 28
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.BOLET_PHALISK_BLANC.ingredientId,
				count: 11,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.OEIL_DE_LYNX.skillId
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.ORCHIDEE_FANTASQUE.ingredientId,
				count: 3,
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
				count: 3,
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
				count: 3,
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
		clicks: 3,
		condition: {
			conditionType: ConditionEnum.SKILL,
			value: skillList.CUEILLETTE.skillId
		},
		apparence: 'CUEILLE',
		items: [
			{
				type: 'ingredient',
				ingredientId: ingredientList.FEUILLES_DE_PELINAE.ingredientId,
				count: 20
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.BOLET_PHALISK_BLANC.ingredientId,
				count: 5,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.OEIL_DE_LYNX.skillId
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.ORCHIDEE_FANTASQUE.ingredientId,
				count: 1,
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
				count: 1,
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
				count: 1,
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
				count: 1,
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
		clicks: 3,
		condition: {
			conditionType: ConditionEnum.SKILL,
			value: skillList.CUEILLETTE.skillId
		},
		apparence: 'CUEILLE',
		items: [
			{
				type: 'ingredient',
				ingredientId: ingredientList.FEUILLES_DE_PELINAE.ingredientId,
				count: 5
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.BOLET_PHALISK_BLANC.ingredientId,
				count: 5,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.OEIL_DE_LYNX.skillId
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.ORCHIDEE_FANTASQUE.ingredientId,
				count: 2,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.OEIL_DE_LYNX.skillId
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.SPORE_ETHERAL.ingredientId,
				count: 5,
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
		clicks: 3,
		condition: {
			conditionType: ConditionEnum.SKILL,
			value: skillList.CUEILLETTE.skillId
		},
		apparence: 'CUEILLE',
		items: [
			{
				type: 'ingredient',
				ingredientId: ingredientList.FEUILLES_DE_PELINAE.ingredientId,
				count: 8
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.BOLET_PHALISK_BLANC.ingredientId,
				count: 3
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.ORCHIDEE_FANTASQUE.ingredientId,
				count: 2,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.OEIL_DE_LYNX.skillId
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.SADIQUAE_MORDICUS.ingredientId,
				count: 2,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.OEIL_DE_LYNX.skillId
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.POUSSE_SOMBRE.ingredientId,
				count: 1,
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
		clicks: 1,
		condition: {
			conditionType: ConditionEnum.SKILL,
			value: skillList.PARATONNERRE.skillId
		},
		apparence: 'ENERGY',
		items: [
			{
				type: 'ingredient',
				ingredientId: ingredientList.ENERGIE_FOUDRE.ingredientId,
				count: 6
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.ENERGIE_AIR.ingredientId,
				count: 3,
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
				count: 1,
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
				count: 1,
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
				count: 1,
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
		clicks: 1,
		condition: {
			conditionType: ConditionEnum.SKILL,
			value: skillList.PARATONNERRE.skillId
		},
		apparence: 'ENERGY',
		items: [
			{
				type: 'ingredient',
				ingredientId: ingredientList.ENERGIE_FOUDRE.ingredientId,
				count: 1
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.ENERGIE_AIR.ingredientId,
				count: 3
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.ENERGIE_FEU.ingredientId,
				count: 1,
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
				count: 1,
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
				count: 1,
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
		clicks: 1,
		condition: {
			conditionType: ConditionEnum.SKILL,
			value: skillList.CHASSEUR_DE_GOUPIGNON.skillId
		},
		apparence: 'HUNT',
		items: [
			{
				type: 'ingredient',
				ingredientId: ingredientList.TOUFFE_DE_FOURRURE.ingredientId,
				count: 7
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.GRIFFES_ACEREES.ingredientId,
				count: 4,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.CHASSEUR_DE_GEANT.skillId
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.CORNE_EN_CHOCOLAT.ingredientId,
				count: 1,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.CHASSEUR_DE_DRAGON.skillId
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.OEIL_VISQUEUX.ingredientId,
				count: 1,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.CHASSEUR_DE_DRAGON.skillId
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.LANGUE_MONSTRUEUSE.ingredientId,
				count: 1,
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
				count: 1,
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
				count: 1,
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
				count: 1,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.CHASSEUR_DE_GEANT.skillId,
					operator: ConditionOperatorEnum.AND,
					nextCondition: {
						conditionType: ConditionEnum.RANDOM, //TODO: lieu caushemesh
						value: 6
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
		clicks: 1,
		condition: {
			conditionType: ConditionEnum.SKILL,
			value: skillList.FOUILLE.skillId
		},
		apparence: 'SEEK',
		items: [
			{
				type: 'ingredient',
				ingredientId: ingredientList.SILEX_TAILLE.ingredientId,
				count: 3
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.FRAGMENT_DE_TEXTE_ANCIEN.ingredientId,
				count: 1,
				condition: {
					conditionType: ConditionEnum.SKILL,
					value: skillList.DETECTIVE.skillId
				}
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.VIEIL_ANNEAU_PRECIEUX.ingredientId,
				count: 2,
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
				count: 2,
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
				count: 2,
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
				count: 1,
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
				count: 1,
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
				count: 1,
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
		clicks: 3,
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
				count: 16
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.POISSON_VENGEUR.ingredientId,
				count: 5
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.AN_GUILI_GUILILLE.ingredientId,
				count: 5
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.GLOBULOS.ingredientId,
				count: 5
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.SUPER_POISSON.ingredientId,
				count: 4
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.SPORE_ETHERAL.ingredientId,
				count: 5
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.ROCHE_RADIO_ACTIVE.ingredientId,
				count: 2
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.GRAINE_DE_DEVOREUSE.ingredientId,
				count: 1
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.SILEX_TAILLE.ingredientId,
				count: 10
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.FRAGMENT_DE_TEXTE_ANCIEN.ingredientId,
				count: 3
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.COLLIER_KARAT.ingredientId,
				count: 1
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.ENERGIE_FOUDRE.ingredientId,
				count: 3
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.ENERGIE_AIR.ingredientId,
				count: 4
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.ENERGIE_EAU.ingredientId,
				count: 2
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.ENERGIE_FEU.ingredientId,
				count: 4
			},
			{
				type: 'ingredient',
				ingredientId: ingredientList.ENERGIE_BOIS.ingredientId,
				count: 2
			},
			{
				type: 'item',
				ingredientId: itemList.GOLD1000.itemId,
				count: 10
			},
			{
				type: 'item',
				ingredientId: itemList.GOLD2000.itemId,
				count: 8
			},
			{
				type: 'item',
				ingredientId: itemList.GOLD3000.itemId,
				count: 5
			},
			{
				type: 'item',
				ingredientId: itemList.GOLD20000.itemId,
				count: 2
			},
			{
				type: 'item',
				ingredientId: itemList.TICTAC_TICKET.itemId,
				count: 1
			},
			{
				type: 'item',
				ingredientId: itemList.SMOG_EGG_ANNIVERSARY.itemId,
				count: 2
			}
		]
	}
};
