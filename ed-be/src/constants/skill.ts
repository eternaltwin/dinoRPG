import {
	DinozSkill,
	ElementType,
	Energy,
	SkillTree,
	SkillType
} from '../models/index.js';

// skillId are counted like this : ABCDE
// A = Element (from fire to void)
// B = Tree (Vanilla or Ether)
// C = Column of the skill
// DE = Number of the skill in this column

export const skillList: { [name: string]: DinozSkill } = {
	// Fire Skills
	GRIFFES_ENFLAMMEES: {
		skillId: 11101,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	COLERE: {
		skillId: 11102,
		type: SkillType.E,
		energy: Energy.WEAK,
		element: [ElementType.FIRE],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	FORCE: {
		skillId: 11103,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	BRASERO: {
		skillId: 11104,
		type: SkillType.E,
		energy: Energy.NORMAL,
		element: [ElementType.FIRE],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	SOUFFLE_ARDENT: {
		skillId: 11201,
		type: SkillType.A,
		energy: Energy.WEAK,
		element: [ElementType.FIRE],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	CHARGE: {
		skillId: 11202,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	SANG_CHAUD: {
		skillId: 11203,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	FURIE: {
		skillId: 11204,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	CHASSEUR_DE_GOUPIGNON: {
		skillId: 11205,
		type: SkillType.C,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	ARTS_MARTIAUX: {
		skillId: 11206,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE, ElementType.FIRE],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	DETONATION: {
		skillId: 11207,
		type: SkillType.E,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	PROPULSION_DIVINE: {
		skillId: 11208,
		type: SkillType.P,
		energy: Energy.WEAK,
		element: [ElementType.FIRE],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	VIGILANCE: {
		skillId: 11301,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	COEUR_ARDENT: {
		skillId: 11302,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	COULEE_DE_LAVE: {
		skillId: 11303,
		type: SkillType.A,
		energy: Energy.NORMAL,
		element: [ElementType.FIRE],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	SIESTE: {
		skillId: 11304,
		type: SkillType.A,
		energy: Energy.WEAK,
		element: [ElementType.FIRE, ElementType.FIRE],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	KAMIKAZE: {
		skillId: 11305,
		type: SkillType.A,
		energy: Energy.WEAK,
		element: [ElementType.FIRE, ElementType.FIRE],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	CHASSEUR_DE_GEANT: {
		skillId: 11306,
		type: SkillType.C,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	BOULE_DE_FEU: {
		skillId: 11307,
		type: SkillType.A,
		energy: Energy.WEAK,
		element: [ElementType.FIRE],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	WAIKIKIDO: {
		skillId: 11308,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE, ElementType.FIRE],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	AURA_INCANDESCENTE: {
		skillId: 11309,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE, ElementType.FIRE],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	VENGEANCE: {
		skillId: 11310,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE, ElementType.FIRE],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	COMBUSTION: {
		skillId: 11311,
		type: SkillType.E,
		energy: Energy.WEAK,
		element: [ElementType.FIRE, ElementType.FIRE],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	PAUME_CHALUMEAU: {
		skillId: 11312,
		type: SkillType.A,
		energy: Energy.WEAK,
		element: [ElementType.FIRE, ElementType.FIRE],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	COEUR_DU_PHOENIX: {
		skillId: 11313,
		type: SkillType.P,
		energy: Energy.VHIGH,
		element: [ElementType.FIRE],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	BOUDDHA: {
		skillId: 11314,
		type: SkillType.I,
		energy: Energy.VHIGH,
		element: [ElementType.FIRE],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	GRIFFES_INFERNALES: {
		skillId: 11315,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	CHASSEUR_DE_DRAGON: {
		skillId: 11401,
		type: SkillType.C,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	BELIER: {
		skillId: 11402,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	TORCHE: {
		skillId: 11403,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	SELF_CONTROL: {
		skillId: 11404,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	SPRINT: {
		skillId: 11405,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	VENDETTA: {
		skillId: 11406,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	METEORES: {
		skillId: 11407,
		type: SkillType.A,
		energy: Energy.HIGH,
		element: [ElementType.FIRE],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	CHEF_DE_GUERRE: {
		skillId: 11408,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	ARMURE_DE_BASALTE: {
		skillId: 11409,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	MAITRE_ELEMENTAIRE: {
		skillId: 11410,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	SALAMANDRE: {
		skillId: 11411,
		type: SkillType.I,
		energy: Energy.VHIGH,
		element: [ElementType.FIRE],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	VULCAIN: {
		skillId: 11412,
		type: SkillType.I,
		energy: Energy.VHIGH,
		element: [ElementType.FIRE],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	ARMURE_DIFRIT: {
		skillId: 11413,
		type: SkillType.I,
		energy: Energy.VHIGH,
		element: [ElementType.FIRE],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	BRAVE: {
		skillId: 11501,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	PROTEINES_DINOZIENNES: {
		skillId: 12101,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activatable: false,
		tree: SkillTree.ETHER
	},
	EXTENUATION: {
		skillId: 12201,
		type: SkillType.A,
		energy: Energy.WEAK,
		element: [ElementType.FIRE],
		activatable: true,
		tree: SkillTree.ETHER
	},
	ROUGE: {
		skillId: 12202,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activatable: false,
		tree: SkillTree.ETHER
	},
	CARAPACE_DE_MAGMA: {
		skillId: 12301,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activatable: false,
		tree: SkillTree.ETHER
	},
	CRI_DE_GUERRE: {
		skillId: 12302,
		type: SkillType.E,
		energy: Energy.HIGH,
		element: [ElementType.FIRE],
		activatable: true,
		tree: SkillTree.ETHER
	},
	FIEVRE_BRULANTE: {
		skillId: 12401,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activatable: false,
		tree: SkillTree.ETHER
	},
	BENEDICTION_DARTEMIS: {
		skillId: 12402,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activatable: false,
		tree: SkillTree.ETHER
	},
	JOKER: {
		skillId: 12403,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activatable: false,
		tree: SkillTree.ETHER
	},
	ARMURE_DE_FEU: {
		skillId: 12404,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activatable: false,
		tree: SkillTree.ETHER
	},
	PAYS_DE_CENDRE: {
		skillId: 12501,
		type: SkillType.E,
		energy: Energy.HIGH,
		element: [ElementType.FIRE],
		activatable: true,
		tree: SkillTree.ETHER
	},
	RECEPTACLE_ROCHEUX: {
		skillId: 12502,
		type: SkillType.A,
		energy: Energy.HIGH,
		element: [ElementType.FIRE],
		activatable: true,
		tree: SkillTree.ETHER
	},
	PLUMES_DE_PHOENIX: {
		skillId: 12503,
		type: SkillType.E,
		energy: Energy.WEAK,
		element: [ElementType.FIRE],
		activatable: true,
		tree: SkillTree.ETHER
	},
	ACCLAMATION_FRATERNELLE: {
		skillId: 12504,
		type: SkillType.E,
		energy: Energy.NORMAL,
		element: [ElementType.FIRE],
		activatable: true,
		tree: SkillTree.ETHER
	},
	POING_DE_FEU: {
		skillId: 12505,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activatable: false,
		tree: SkillTree.ETHER
	},
	// WOOD Skills
	CARAPACE: {
		skillId: 21101,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	SAUVAGERIE: {
		skillId: 21102,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	ENDURANCE: {
		skillId: 21103,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	LANCEUR_DE_GLAND: {
		skillId: 21104,
		type: SkillType.A,
		energy: Energy.NORMAL,
		element: [ElementType.WOOD],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	VIGNES: {
		skillId: 21201,
		type: SkillType.E,
		energy: Energy.WEAK,
		element: [ElementType.WOOD],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	RENFORTS_KORGON: {
		skillId: 21202,
		type: SkillType.E,
		energy: Energy.NORMAL,
		element: [ElementType.WOOD],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	SYMPATIQUE: {
		skillId: 21203,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	TENACITE: {
		skillId: 21204,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	FOUILLE: {
		skillId: 21205,
		type: SkillType.C,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	CROISSANCE: {
		skillId: 21206,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	GRATTEUR: {
		skillId: 21207,
		type: SkillType.C,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	ETAT_PRIMAL: {
		skillId: 21301,
		type: SkillType.E,
		energy: Energy.WEAK,
		element: [ElementType.WOOD],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	DETECTIVE: {
		skillId: 21302,
		type: SkillType.C,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	COCON: {
		skillId: 21303,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	INSTINCT_SAUVAGE: {
		skillId: 21304,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WOOD, ElementType.WOOD],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	LARGE_MACHOIRE: {
		skillId: 21305,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WOOD, ElementType.WOOD],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	ACROBATE: {
		skillId: 21306,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WOOD, ElementType.WOOD],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	PRINTEMPS_PRECOCE: {
		skillId: 21307,
		type: SkillType.E,
		energy: Energy.WEAK,
		element: [ElementType.WOOD],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	CHARISME: {
		skillId: 21308,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	RESISTANCE_A_LA_MAGIE: {
		skillId: 21309,
		type: SkillType.E,
		energy: Energy.WEAK,
		element: [ElementType.WOOD],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	PLANIFICATEUR: {
		skillId: 21310,
		type: SkillType.C,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	HERITAGE_FAROE: {
		skillId: 21311,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	EXPERT_EN_FOUILLE: {
		skillId: 21312,
		type: SkillType.C,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	GROSSE_BEIGNE: {
		skillId: 21313,
		type: SkillType.E,
		energy: Energy.HIGH,
		element: [ElementType.WOOD],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	ESPRIT_GORILLOZ: {
		skillId: 21401,
		type: SkillType.E,
		energy: Energy.HIGH,
		element: [ElementType.WOOD],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	LEADER: {
		skillId: 21402,
		type: SkillType.U,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	INGENIEUR: {
		skillId: 21403,
		type: SkillType.U,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	GEANT: {
		skillId: 21404,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	GARDE_FORESTIER: {
		skillId: 21405,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	ARCHEOLOGUE: {
		skillId: 21406,
		type: SkillType.C,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	BENEDICTION_DES_FEES: {
		skillId: 21407,
		type: SkillType.I,
		energy: Energy.VHIGH,
		element: [ElementType.WOOD],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	CHOC: {
		skillId: 21408,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	LOUP_GAROU: {
		skillId: 21409,
		type: SkillType.I,
		energy: Energy.VHIGH,
		element: [ElementType.WOOD],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	COLOSSE: {
		skillId: 21501,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	OXYGENATION_MUSCULAIRE: {
		skillId: 22101,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activatable: false,
		tree: SkillTree.ETHER
	},
	VERT: {
		skillId: 22102,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activatable: false,
		tree: SkillTree.ETHER
	},
	SOURCE_DE_VIE: {
		skillId: 22201,
		type: SkillType.S,
		energy: Energy.WEAK,
		element: [ElementType.WOOD],
		activatable: false,
		tree: SkillTree.ETHER
	},
	VIDE_ENERGETIQUE: {
		skillId: 22202,
		type: SkillType.S,
		energy: Energy.WEAK,
		element: [ElementType.WOOD],
		activatable: false,
		tree: SkillTree.ETHER
	},
	BOUCLIER_DINOZ: {
		skillId: 22203,
		type: SkillType.E,
		energy: Energy.WEAK,
		element: [ElementType.WOOD],
		activatable: true,
		tree: SkillTree.ETHER
	},
	ACIDE_LACTIQUE: {
		skillId: 22204,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activatable: false,
		tree: SkillTree.ETHER
	},
	LANCER_DE_ROCHE: {
		skillId: 22301,
		type: SkillType.A,
		energy: Energy.HIGH,
		element: [ElementType.WOOD],
		activatable: true,
		tree: SkillTree.ETHER
	},
	COURBATURES: {
		skillId: 22302,
		type: SkillType.E,
		energy: Energy.WEAK,
		element: [ElementType.WOOD],
		activatable: true,
		tree: SkillTree.ETHER
	},
	FORCE_CONTROL: {
		skillId: 22303,
		type: SkillType.E,
		energy: Energy.WEAK,
		element: [ElementType.WOOD],
		activatable: true,
		tree: SkillTree.ETHER
	},
	PEAU_DE_FER: {
		skillId: 22304,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activatable: false,
		tree: SkillTree.ETHER
	},
	CHAMPOLLION: {
		skillId: 22401,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activatable: false,
		tree: SkillTree.ETHER
	},
	COURANT_DE_VIE: {
		skillId: 22402,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activatable: false,
		tree: SkillTree.ETHER
	},
	BERSERK: {
		skillId: 22403,
		type: SkillType.E,
		energy: Energy.WEAK,
		element: [ElementType.WOOD],
		activatable: true,
		tree: SkillTree.ETHER
	},
	RIVIERE_DE_VIE: {
		skillId: 22404,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activatable: false,
		tree: SkillTree.ETHER
	},
	MUR_DE_BOUE: {
		skillId: 22501,
		type: SkillType.A,
		energy: Energy.HIGH,
		element: [ElementType.WOOD],
		activatable: true,
		tree: SkillTree.ETHER
	},
	PEAU_DACIER: {
		skillId: 22502,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activatable: false,
		tree: SkillTree.ETHER
	},
	SHARIGNAN: {
		skillId: 22503,
		type: SkillType.E,
		energy: Energy.HIGH,
		element: [ElementType.WOOD],
		activatable: true,
		tree: SkillTree.ETHER
	},
	AMAZONIE: {
		skillId: 22504,
		type: SkillType.E,
		energy: Energy.HIGH,
		element: [ElementType.WOOD],
		activatable: true,
		tree: SkillTree.ETHER
	},
	RECEPTACLE_AQUEUX: {
		skillId: 22505,
		type: SkillType.A,
		energy: Energy.VHIGH,
		element: [ElementType.WOOD],
		activatable: true,
		tree: SkillTree.ETHER
	},
	// Water Skills
	CANON_A_EAU: {
		skillId: 31101,
		type: SkillType.A,
		energy: Energy.WEAK,
		element: [ElementType.WATER],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	PERCEPTION: {
		skillId: 31102,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	MUTATION: {
		skillId: 31103,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	VITALITE: {
		skillId: 31104,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	GEL: {
		skillId: 31201,
		type: SkillType.A,
		energy: Energy.WEAK,
		element: [ElementType.WATER],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	DOUCHE_ECOSSAISE: {
		skillId: 31202,
		type: SkillType.A,
		energy: Energy.WEAK,
		element: [ElementType.WATER],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	COUP_SOURNOIS: {
		skillId: 31203,
		type: SkillType.A,
		energy: Energy.WEAK,
		element: [ElementType.WATER],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	APPRENTI_PECHEUR: {
		skillId: 31204,
		type: SkillType.C,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	POCHE_VENTRALE: {
		skillId: 31205,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	KARATE_SOUS_MARIN: {
		skillId: 31206,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	ECAILLES_LUMINESCENTES: {
		skillId: 31207,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	MOIGNONS_LIQUIDES: {
		skillId: 31208,
		type: SkillType.A,
		energy: Energy.VHIGH,
		element: [ElementType.WATER],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	ZERO_ABSOLU: {
		skillId: 31301,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	PETRIFICATION: {
		skillId: 31302,
		type: SkillType.A,
		energy: Energy.WEAK,
		element: [ElementType.WATER],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	ACUPUNCTURE: {
		skillId: 31303,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	SAPEUR: {
		skillId: 31304,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	COUP_FATAL: {
		skillId: 31305,
		type: SkillType.A,
		energy: Energy.WEAK,
		element: [ElementType.WATER, ElementType.WATER],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	ENTRAINEMENT_SOUS_MARIN: {
		skillId: 31306,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WATER, ElementType.WATER],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	PECHEUR_CONFIRME: {
		skillId: 31307,
		type: SkillType.C,
		energy: Energy.NONE,
		element: [ElementType.WATER, ElementType.WATER],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	MARECAGE: {
		skillId: 31308,
		type: SkillType.E,
		energy: Energy.WEAK,
		element: [ElementType.WATER],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	SUMO: {
		skillId: 31309,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WATER, ElementType.WATER],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	SANS_PITIE: {
		skillId: 31310,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	CLONE_AQUEUX: {
		skillId: 31311,
		type: SkillType.E,
		energy: Energy.HIGH,
		element: [ElementType.WATER],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	GRIFFES_EMPOISONNEES: {
		skillId: 31312,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	DELUGE: {
		skillId: 31313,
		type: SkillType.A,
		energy: Energy.VHIGH,
		element: [ElementType.WATER],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	PEAU_DE_SERPENT: {
		skillId: 31314,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	RAYON_KAAR_SHER: {
		skillId: 31401,
		type: SkillType.A,
		energy: Energy.HIGH,
		element: [ElementType.WATER],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	MAGASINIER: {
		skillId: 31402,
		type: SkillType.U,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	ENTRAINEMENT_SOUS_MARIN_AVANCE: {
		skillId: 31403,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	MAITRE_PECHEUR: {
		skillId: 31404,
		type: SkillType.C,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	CUISINIER: {
		skillId: 31405,
		type: SkillType.U,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	SANG_ACIDE: {
		skillId: 31406,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	BULLE: {
		skillId: 31407,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	INFATIGUABLE: {
		skillId: 31408,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	ONDINE: {
		skillId: 31409,
		type: SkillType.I,
		energy: Energy.VHIGH,
		element: [ElementType.WATER],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	MAITRE_NAGEUR: {
		skillId: 31501,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	LEVIATHAN: {
		skillId: 31502,
		type: SkillType.I,
		energy: Energy.VHIGH,
		element: [ElementType.WATER],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	EAU_DIVINE: {
		skillId: 32101,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activatable: false,
		tree: SkillTree.ETHER
	},
	RADIATIONS_GAMMA: {
		skillId: 32201,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activatable: false,
		tree: SkillTree.ETHER
	},
	BLEU: {
		skillId: 32202,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activatable: false,
		tree: SkillTree.ETHER
	},
	MUE_ACQUEUSE: {
		skillId: 32301,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activatable: false,
		tree: SkillTree.ETHER
	},
	CARAPACE_BLINDEE: {
		skillId: 32302,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activatable: false,
		tree: SkillTree.ETHER
	},
	DIETE_CHROMATIQUE: {
		skillId: 32303,
		type: SkillType.E,
		energy: Energy.HIGH,
		element: [ElementType.WATER],
		activatable: true,
		tree: SkillTree.ETHER
	},
	EFFLUVE_APHRODISIAQUE: {
		skillId: 32401,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activatable: false,
		tree: SkillTree.ETHER
	},
	NEMO: {
		skillId: 32402,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activatable: false,
		tree: SkillTree.ETHER
	},
	CLEPTOMANE: {
		skillId: 32403,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activatable: false,
		tree: SkillTree.ETHER
	},
	ABYSSE: {
		skillId: 32404,
		type: SkillType.A,
		energy: Energy.HIGH,
		element: [ElementType.WATER],
		activatable: true,
		tree: SkillTree.ETHER
	},
	BANNI_DES_DIEUX: {
		skillId: 32405,
		type: SkillType.E,
		energy: Energy.WEAK,
		element: [ElementType.WATER],
		activatable: true,
		tree: SkillTree.ETHER
	},
	TOURBILLON_MAGIQUE: {
		skillId: 32501,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activatable: false,
		tree: SkillTree.ETHER
	},
	HYPERVENTILATION: {
		skillId: 32502,
		type: SkillType.A,
		energy: Energy.VHIGH,
		element: [ElementType.WATER],
		activatable: true,
		tree: SkillTree.ETHER
	},
	THERAPIE_DE_GROUPE: {
		skillId: 32503,
		type: SkillType.E,
		energy: Energy.VHIGH,
		element: [ElementType.WATER],
		activatable: true,
		tree: SkillTree.ETHER
	},
	RECEPTACLE_TESLA: {
		skillId: 32504,
		type: SkillType.A,
		energy: Energy.HIGH,
		element: [ElementType.WATER],
		activatable: true,
		tree: SkillTree.ETHER
	},
	VITALITE_MARINE: {
		skillId: 32505,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activatable: false,
		tree: SkillTree.ETHER
	},
	// Lightning Skills
	INTELLIGENCE: {
		skillId: 41101,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	FOCUS: {
		skillId: 41102,
		type: SkillType.E,
		energy: Energy.WEAK,
		element: [ElementType.LIGHT],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	CELERITE: {
		skillId: 41103,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	REFLEX: {
		skillId: 41104,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	CONCENTRATION: {
		skillId: 41201,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	ATTAQUE_ECLAIR: {
		skillId: 41202,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	PARATONNERRE: {
		skillId: 41203,
		type: SkillType.C,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	COUP_DOUBLE: {
		skillId: 41204,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	REGENERESCENCE: {
		skillId: 41205,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	PREMIERS_SOINS: {
		skillId: 41206,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	ECLAIR_SINUEUX: {
		skillId: 41207,
		type: SkillType.A,
		energy: Energy.VHIGH,
		element: [ElementType.LIGHT],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	FOUDRE: {
		skillId: 41301,
		type: SkillType.A,
		energy: Energy.NORMAL,
		element: [ElementType.LIGHT],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	FISSION_ELEMENTAIRE: {
		skillId: 41302,
		type: SkillType.C,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	VOIE_DE_KAOS: {
		skillId: 41303,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	PLAN_DE_CARRIERE: {
		skillId: 41304,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.LIGHT, ElementType.LIGHT],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	ADRENALINE: {
		skillId: 41305,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT, ElementType.LIGHT],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	VOIE_DE_GAIA: {
		skillId: 41306,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT, ElementType.LIGHT],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	MEDECINE: {
		skillId: 41307,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.LIGHT, ElementType.LIGHT],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	DANSE_FOUDROYANTE: {
		skillId: 41308,
		type: SkillType.A,
		energy: Energy.HIGH,
		element: [ElementType.LIGHT],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	EMBUCHE: {
		skillId: 41309,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT, ElementType.LIGHT],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	PUREE_SALVATRICE: {
		skillId: 41310,
		type: SkillType.E,
		energy: Energy.HIGH,
		element: [ElementType.LIGHT],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	AURA_HERMETIQUE: {
		skillId: 41311,
		type: SkillType.E,
		energy: Energy.WEAK,
		element: [ElementType.LIGHT],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	CROCS_DIAMANT: {
		skillId: 41312,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	SURVIE: {
		skillId: 41313,
		type: SkillType.S,
		energy: Energy.VHIGH,
		element: [ElementType.LIGHT],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	AUBE_FEUILLUE: {
		skillId: 41401,
		type: SkillType.A,
		energy: Energy.VHIGH,
		element: [ElementType.LIGHT],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	BRANCARDIER: {
		skillId: 41402,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	BENEDICTION: {
		skillId: 41403,
		type: SkillType.E,
		energy: Energy.WEAK,
		element: [ElementType.LIGHT],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	CREPUSCULE_FLAMBLOYANT: {
		skillId: 41404,
		type: SkillType.A,
		energy: Energy.HIGH,
		element: [ElementType.LIGHT],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	MARCHAND: {
		skillId: 41405,
		type: SkillType.U,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	REINCARNATION: {
		skillId: 41406,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	SURCHARGE: {
		skillId: 41408,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	ELECTROLYSE: {
		skillId: 41409,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	GOLEM: {
		skillId: 41410,
		type: SkillType.I,
		energy: Energy.VHIGH,
		element: [ElementType.LIGHT],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	RAIJIN: {
		skillId: 41411,
		type: SkillType.I,
		energy: Energy.VHIGH,
		element: [ElementType.LIGHT],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	QUETZACOATL: {
		skillId: 41412,
		type: SkillType.I,
		energy: Energy.VHIGH,
		element: [ElementType.LIGHT],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	ROI_DES_SINGES: {
		skillId: 41413,
		type: SkillType.I,
		energy: Energy.VHIGH,
		element: [ElementType.LIGHT],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	ARCHANGE_CORROSIF: {
		skillId: 41501,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	ARCHANGE_GENESIF: {
		skillId: 41502,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	PRETRE: {
		skillId: 41503,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	SOUTIEN_MORAL: {
		skillId: 42101,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activatable: false,
		tree: SkillTree.ETHER
	},
	STIMUALTION_CARDIAQUE: {
		skillId: 42201,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activatable: false,
		tree: SkillTree.ETHER
	},
	JAUNE: {
		skillId: 42202,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activatable: false,
		tree: SkillTree.ETHER
	},
	MORSURE_DU_SOLEIL: {
		skillId: 42301,
		type: SkillType.E,
		energy: Energy.NORMAL,
		element: [ElementType.LIGHT],
		activatable: true,
		tree: SkillTree.ETHER
	},
	CRAMPE_CHRONIQUE: {
		skillId: 42303,
		type: SkillType.E,
		energy: Energy.WEAK,
		element: [ElementType.LIGHT],
		activatable: true,
		tree: SkillTree.ETHER
	},
	BATTERIE_SUPPLEMENTAIRE: {
		skillId: 42401,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activatable: false,
		tree: SkillTree.ETHER
	},
	EINSTEIN: {
		skillId: 42402,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activatable: false,
		tree: SkillTree.ETHER
	},
	BARRIERE_ELECTRIFIEE: {
		skillId: 42403,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activatable: false,
		tree: SkillTree.ETHER
	},
	ORACLE: {
		skillId: 42404,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activatable: false,
		tree: SkillTree.ETHER
	},
	RECEPTACLE_AERIEN: {
		skillId: 42501,
		type: SkillType.A,
		energy: Energy.HIGH,
		element: [ElementType.LIGHT],
		activatable: true,
		tree: SkillTree.ETHER
	},
	FEU_DE_ST_ELME: {
		skillId: 42502,
		type: SkillType.A,
		energy: Energy.HIGH,
		element: [ElementType.LIGHT],
		activatable: true,
		tree: SkillTree.ETHER
	},
	FORCE_DE_ZEUS: {
		skillId: 42503,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activatable: false,
		tree: SkillTree.ETHER
	},
	REMANENCE_HERTZIENNE: {
		skillId: 42504,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activatable: false,
		tree: SkillTree.ETHER
	},
	// Air Skills
	AGILITE: {
		skillId: 51101,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	STRATEGIE: {
		skillId: 51102,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	MISTRAL: {
		skillId: 51103,
		type: SkillType.A,
		energy: Energy.WEAK,
		element: [ElementType.AIR],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	AIGUILLON: {
		skillId: 51104,
		type: SkillType.E,
		energy: Energy.HIGH,
		element: [ElementType.AIR],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	ENVOL: {
		skillId: 51105,
		type: SkillType.A,
		energy: Energy.WEAK,
		element: [ElementType.AIR],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	ESQUIVE: {
		skillId: 51201,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	SAUT: {
		skillId: 51202,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	ANALYSE: {
		skillId: 51203,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	CUEILLETTE: {
		skillId: 51204,
		type: SkillType.C,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	TAICHI: {
		skillId: 51205,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.AIR, ElementType.AIR],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	TORNADE: {
		skillId: 51206,
		type: SkillType.A,
		energy: Energy.NORMAL,
		element: [ElementType.AIR],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	AURA_PUANTE: {
		skillId: 51207,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	DISQUE_VACUUM: {
		skillId: 51301,
		type: SkillType.A,
		energy: Energy.HIGH,
		element: [ElementType.AIR],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	ELASTICITE: {
		skillId: 51302,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	ATTAQUE_PLONGEANTE: {
		skillId: 51303,
		type: SkillType.A,
		energy: Energy.WEAK,
		element: [ElementType.AIR],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	FURTIVITE: {
		skillId: 51304,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	SPECIALISTE: {
		skillId: 51305,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.AIR, ElementType.AIR],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	TALON_DACHILLE: {
		skillId: 51306,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.AIR, ElementType.AIR],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	NUAGE_TOXIQUE: {
		skillId: 51307,
		type: SkillType.A,
		energy: Energy.HIGH,
		element: [ElementType.AIR],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	OEIL_DE_LYNX: {
		skillId: 51308,
		type: SkillType.C,
		energy: Energy.NONE,
		element: [ElementType.AIR, ElementType.AIR],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	EVEIL: {
		skillId: 51309,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.AIR, ElementType.AIR],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	PAUME_EJECTABLE: {
		skillId: 51310,
		type: SkillType.A,
		energy: Energy.WEAK,
		element: [ElementType.AIR],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	VENT_VIF: {
		skillId: 51311,
		type: SkillType.E,
		energy: Energy.NORMAL,
		element: [ElementType.AIR],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	FORME_VAPOREUSE: {
		skillId: 51312,
		type: SkillType.S,
		energy: Energy.NORMAL,
		element: [ElementType.AIR],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	HYPNOSE: {
		skillId: 51313,
		type: SkillType.A,
		energy: Energy.VHIGH,
		element: [ElementType.AIR],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	SECOUSSE: {
		skillId: 51314,
		type: SkillType.A,
		energy: Energy.WEAK,
		element: [ElementType.AIR],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	TROU_NOIR: {
		skillId: 51401,
		type: SkillType.A,
		energy: Energy.VHIGH,
		element: [ElementType.AIR],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	MAITRE_LEVITATEUR: {
		skillId: 51402,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	HALEINE_FETIVE: {
		skillId: 51403,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	MEDITATION_SOLITAIRE: {
		skillId: 51404,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	PROFESSEUR: {
		skillId: 51405,
		type: SkillType.U,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	SOUFFLE_DE_VIE: {
		skillId: 51406,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	TOTEM_ANCESTRAL_AEROPORTE: {
		skillId: 51407,
		type: SkillType.I,
		energy: Energy.VHIGH,
		element: [ElementType.AIR],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	FUJIN: {
		skillId: 51408,
		type: SkillType.I,
		energy: Energy.VHIGH,
		element: [ElementType.AIR],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	MEDITATION_TRANCHANTE: {
		skillId: 51501,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	DJINN: {
		skillId: 51502,
		type: SkillType.I,
		energy: Energy.VHIGH,
		element: [ElementType.AIR],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	HADES: {
		skillId: 51503,
		type: SkillType.I,
		energy: Energy.VHIGH,
		element: [ElementType.AIR],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	FORME_ETHERALE: {
		skillId: 51601,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	MAITRISE_CORPORELLE: {
		skillId: 52101,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activatable: false,
		tree: SkillTree.ETHER
	},
	BLANC: {
		skillId: 52201,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activatable: false,
		tree: SkillTree.ETHER
	},
	ANAEROBIE: {
		skillId: 52202,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activatable: false,
		tree: SkillTree.ETHER
	},
	DOUBLE_FACE: {
		skillId: 52301,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activatable: false,
		tree: SkillTree.ETHER
	},
	FLAGELLATION: {
		skillId: 52302,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activatable: false,
		tree: SkillTree.ETHER
	},
	SOUFFLE_DANGE: {
		skillId: 52303,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activatable: false,
		tree: SkillTree.ETHER
	},
	OURAGAN: {
		skillId: 52304,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activatable: false,
		tree: SkillTree.ETHER
	},
	OURANOS: {
		skillId: 52401,
		type: SkillType.A,
		energy: Energy.HIGH,
		element: [ElementType.AIR],
		activatable: true,
		tree: SkillTree.ETHER
	},
	TWINOID_500MG: {
		skillId: 52402,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activatable: false,
		tree: SkillTree.ETHER
	},
	LONDUHAUT: {
		skillId: 52403,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activatable: false,
		tree: SkillTree.ETHER
	},
	SURPLIS_DHADES: {
		skillId: 52404,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activatable: false,
		tree: SkillTree.ETHER
	},
	RECEPTABLE_THERMIQUE: {
		skillId: 52405,
		type: SkillType.A,
		energy: Energy.HIGH,
		element: [ElementType.AIR],
		activatable: true,
		tree: SkillTree.ETHER
	},
	QI_GONG: {
		skillId: 52501,
		type: SkillType.E,
		energy: Energy.VHIGH,
		element: [ElementType.AIR],
		activatable: true,
		tree: SkillTree.ETHER
	},
	SYLPHIDES: {
		skillId: 52502,
		type: SkillType.A,
		energy: Energy.VHIGH,
		element: [ElementType.AIR],
		activatable: true,
		tree: SkillTree.ETHER
	},
	MESSIE: {
		skillId: 52503,
		type: SkillType.U,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activatable: false,
		tree: SkillTree.ETHER
	},
	MUTINERIE: {
		skillId: 52504,
		type: SkillType.E,
		energy: Energy.HIGH,
		element: [ElementType.AIR],
		activatable: true,
		tree: SkillTree.ETHER
	},
	MAINS_COLLANTES: {
		skillId: 52505,
		type: SkillType.E,
		energy: Energy.WEAK,
		element: [ElementType.AIR],
		activatable: true,
		tree: SkillTree.ETHER
	},
	// Void Skills
	COMPETENCE_DOUBLE: {
		skillId: 61119,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.VOID],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	LIMITE_BRISEE: {
		skillId: 61120,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.VOID],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	INVOCATEUR: {
		skillId: 61121,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.VOID],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	FRENESIE_COLLECTIVE: {
		skillId: 61101,
		type: SkillType.E,
		energy: Energy.WEAK,
		element: [ElementType.VOID],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	COQUE: {
		skillId: 61102,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.VOID],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	CHARGE_CORNUE: {
		skillId: 61103,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.VOID],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	ROCK: {
		skillId: 61104,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.VOID],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	PIETINEMENT: {
		skillId: 61105,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.VOID],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	CUIRASSE: {
		skillId: 61106,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.VOID],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	INSAISISSABLE: {
		skillId: 61107,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.VOID],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	DEPLACEMENT_INSTANTANE: {
		skillId: 61108,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.VOID],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	NAPOMAGICIEN: {
		skillId: 61109,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.VOID],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	GROS_COSTAUD: {
		skillId: 61111,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.VOID],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	ORIGINE_CAUSHEMESHENNE: {
		skillId: 61112,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.VOID],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	ECRASEMENT: {
		skillId: 61113,
		type: SkillType.A,
		energy: Energy.WEAK,
		element: [ElementType.VOID],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	FORCE_DE_LUMIERE: {
		skillId: 61114,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.VOID],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	CHARGE_PIGMOU: {
		skillId: 61115,
		type: SkillType.A,
		energy: Energy.WEAK,
		element: [ElementType.VOID],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	FORCE_DES_TENEBRES: {
		skillId: 61116,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.VOID],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	BIGMAGNON: {
		skillId: 61117,
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.VOID],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	DUR_A_CUIRE: {
		skillId: 61118,
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.VOID],
		activatable: false,
		tree: SkillTree.VANILLA
	},
	// Other Skills (?)
	HERCOLUBUS: {
		skillId: 41504,
		type: SkillType.I,
		energy: Energy.VHIGH,
		element: [ElementType.LIGHT, ElementType.AIR],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	REINE_DE_LA_RUCHE: {
		skillId: 41505, //Edit since this
		type: SkillType.I,
		energy: Energy.VHIGH,
		element: [ElementType.LIGHT],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	BIG_MAMA: {
		skillId: 51506,
		type: SkillType.I,
		energy: Energy.VHIGH,
		element: [ElementType.LIGHT],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	YGGDRASIL: {
		skillId: 41507,
		type: SkillType.I,
		energy: Energy.VHIGH,
		element: [ElementType.LIGHT],
		activatable: true,
		tree: SkillTree.VANILLA
	},
	BALEINE_BLANCHE: {
		skillId: 41508,
		type: SkillType.I,
		energy: Energy.VHIGH,
		element: [ElementType.LIGHT],
		activatable: true,
		tree: SkillTree.VANILLA
	}
};
