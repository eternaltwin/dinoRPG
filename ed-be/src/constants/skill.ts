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

export const skillList = [
	{
		skillId: 11101,
		name: 'GriffesEnflammees',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 11102,
		name: 'Colere',
		type: SkillType.E,
		energy: Energy.WEAK,
		element: [ElementType.FIRE],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 11103,
		name: 'Force',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 11104,
		name: 'Brasero',
		type: SkillType.E,
		energy: Energy.NORMAL,
		element: [ElementType.FIRE],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 11201,
		name: 'SouffleArdent',
		type: SkillType.A,
		energy: Energy.WEAK,
		element: [ElementType.FIRE],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 11202,
		name: 'Charge',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 11203,
		name: 'SangChaud',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 11204,
		name: 'Furie',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 11205,
		name: 'ChasseurDeGoupignon',
		type: SkillType.C,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 11206,
		name: 'ArtsMartiaux',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE, ElementType.FIRE],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 11207,
		name: 'Detonation',
		type: SkillType.E,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 11208,
		name: 'PropulsionDivine',
		type: SkillType.P,
		energy: Energy.WEAK,
		element: [ElementType.FIRE],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 11301,
		name: 'Vigilance',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 11302,
		name: 'CoeurArdent',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 11303,
		name: 'CouleeDeLave',
		type: SkillType.A,
		energy: Energy.NORMAL,
		element: [ElementType.FIRE],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 11304,
		name: 'Sieste',
		type: SkillType.A,
		energy: Energy.WEAK,
		element: [ElementType.FIRE, ElementType.FIRE],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 11305,
		name: 'Kamikaze',
		type: SkillType.A,
		energy: Energy.WEAK,
		element: [ElementType.FIRE, ElementType.FIRE],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 11306,
		name: 'ChasseurDeGeant',
		type: SkillType.C,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 11307,
		name: 'BouleDeFeu',
		type: SkillType.A,
		energy: Energy.WEAK,
		element: [ElementType.FIRE],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 11308,
		name: 'Waikikido',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE, ElementType.FIRE],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 11309,
		name: 'AuraIncandescente',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE, ElementType.FIRE],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 11310,
		name: 'Vengeance',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE, ElementType.FIRE],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 11311,
		name: 'Combustion',
		type: SkillType.E,
		energy: Energy.WEAK,
		element: [ElementType.FIRE, ElementType.FIRE],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 11312,
		name: 'PaumeChalumeau',
		type: SkillType.A,
		energy: Energy.WEAK,
		element: [ElementType.FIRE, ElementType.FIRE],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 11313,
		name: 'CoeurDuPhenix',
		type: SkillType.P,
		energy: Energy.VHIGH,
		element: [ElementType.FIRE],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 11314,
		name: 'Bouddha',
		type: SkillType.I,
		energy: Energy.VHIGH,
		element: [ElementType.FIRE],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 11315,
		name: 'GriffesInfernales',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 11401,
		name: 'ChasseurDeDragon',
		type: SkillType.C,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 11402,
		name: 'Belier',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 11403,
		name: 'Torche',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 11404,
		name: 'SelfControl',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 11405,
		name: 'Sprint',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 11406,
		name: 'Vendetta',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 11407,
		name: 'Meteores',
		type: SkillType.A,
		energy: Energy.HIGH,
		element: [ElementType.FIRE],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 11408,
		name: 'ChefDeGuerre',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 11409,
		name: 'ArmureDeBasalte',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 11410,
		name: 'MaitreElementaire',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 11411,
		name: 'Salamandre',
		type: SkillType.I,
		energy: Energy.VHIGH,
		element: [ElementType.FIRE],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 11412,
		name: 'Vulcain',
		type: SkillType.I,
		energy: Energy.VHIGH,
		element: [ElementType.FIRE],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 11413,
		name: 'ArmureDIfrit',
		type: SkillType.I,
		energy: Energy.VHIGH,
		element: [ElementType.FIRE],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 11501,
		name: 'Brave',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 12101,
		name: 'ProteinesDinozienne',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 12201,
		name: 'Extenuation',
		type: SkillType.A,
		energy: Energy.WEAK,
		element: [ElementType.FIRE],
		activable: true,
		tree: SkillTree.ETHER
	},
	{
		skillId: 12202,
		name: 'Rouge',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 12301,
		name: 'CatapaceDeMagma',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 12302,
		name: 'CriDeGuerre',
		type: SkillType.E,
		energy: Energy.HIGH,
		element: [ElementType.FIRE],
		activable: true,
		tree: SkillTree.ETHER
	},
	{
		skillId: 12401,
		name: 'FievreBrulante',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 12402,
		name: 'BenedictionDArtemis',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 12403,
		name: 'Joker',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 12404,
		name: 'ArmureDeFeu',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 12501,
		name: 'PaysDeCendre',
		type: SkillType.E,
		energy: Energy.HIGH,
		element: [ElementType.FIRE],
		activable: true,
		tree: SkillTree.ETHER
	},
	{
		skillId: 12502,
		name: 'ReceptacleRocheux',
		type: SkillType.A,
		energy: Energy.HIGH,
		element: [ElementType.FIRE],
		activable: true,
		tree: SkillTree.ETHER
	},
	{
		skillId: 12503,
		name: 'PlumesDePhoenix',
		type: SkillType.E,
		energy: Energy.WEAK,
		element: [ElementType.FIRE],
		activable: true,
		tree: SkillTree.ETHER
	},
	{
		skillId: 12504,
		name: 'AcclamationFraternelle',
		type: SkillType.E,
		energy: Energy.NORMAL,
		element: [ElementType.FIRE],
		activable: true,
		tree: SkillTree.ETHER
	},
	{
		skillId: 12505,
		name: 'PoingDeFeu',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.FIRE],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 21101,
		name: 'Carapace',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 21102,
		name: 'Sauvagerie',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 21103,
		name: 'Endurance',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 21104,
		name: 'LanceurDeGland',
		type: SkillType.A,
		energy: Energy.NORMAL,
		element: [ElementType.WOOD],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 21201,
		name: 'Vignes',
		type: SkillType.E,
		energy: Energy.WEAK,
		element: [ElementType.WOOD],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 21202,
		name: 'RenfortsKorgon',
		type: SkillType.E,
		energy: Energy.NORMAL,
		element: [ElementType.WOOD],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 21203,
		name: 'Sympathique',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 21204,
		name: 'Tenacite',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 21205,
		name: 'Fouille',
		type: SkillType.C,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 21206,
		name: 'Croissance',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 21207,
		name: 'Gratteur',
		type: SkillType.C,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 21301,
		name: 'EtatPrimal',
		type: SkillType.E,
		energy: Energy.WEAK,
		element: [ElementType.WOOD],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 21302,
		name: 'Detective',
		type: SkillType.C,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 21303,
		name: 'Cocon',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 21304,
		name: 'InstinctSauvage',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WOOD, ElementType.WOOD],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 21305,
		name: 'LargeMachoire',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WOOD, ElementType.WOOD],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 21306,
		name: 'Acrobate',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WOOD, ElementType.WOOD],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 21307,
		name: 'PrintempsPrecoce',
		type: SkillType.E,
		energy: Energy.WEAK,
		element: [ElementType.WOOD],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 21308,
		name: 'Charisme',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 21309,
		name: 'ResistanceALaMagie',
		type: SkillType.E,
		energy: Energy.WEAK,
		element: [ElementType.WOOD],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 21310,
		name: 'Planificateur',
		type: SkillType.C,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 21311,
		name: 'HeritageFaroe',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 21312,
		name: 'ExpertEnFouille',
		type: SkillType.C,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 21313,
		name: 'GrosseBeigne',
		type: SkillType.E,
		energy: Energy.HIGH,
		element: [ElementType.WOOD],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 21401,
		name: 'EspritGorilloz',
		type: SkillType.E,
		energy: Energy.HIGH,
		element: [ElementType.WOOD],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 21402,
		name: 'Leader',
		type: SkillType.U,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 21403,
		name: 'Ingenieur',
		type: SkillType.U,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 21404,
		name: 'Geant',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 21405,
		name: 'GardeForestier',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 21406,
		name: 'Archeologue',
		type: SkillType.C,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 21407,
		name: 'BenedictionDesFees',
		type: SkillType.I,
		energy: Energy.VHIGH,
		element: [ElementType.WOOD],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 21407,
		name: 'Choc',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 21408,
		name: 'LoupGarou',
		type: SkillType.I,
		energy: Energy.VHIGH,
		element: [ElementType.WOOD],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 21501,
		name: 'Colosse',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 22101,
		name: 'OxygenationMusculaire',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 22102,
		name: 'Vert',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 22201,
		name: 'SourceDeVie',
		type: SkillType.S,
		energy: Energy.WEAK,
		element: [ElementType.WOOD],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 22202,
		name: 'VideEnergetique',
		type: SkillType.S,
		energy: Energy.WEAK,
		element: [ElementType.WOOD],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 22203,
		name: 'BouclierDinoz',
		type: SkillType.E,
		energy: Energy.WEAK,
		element: [ElementType.WOOD],
		activable: true,
		tree: SkillTree.ETHER
	},
	{
		skillId: 22204,
		name: 'AcideLactique',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 22301,
		name: 'LancerDeRoche',
		type: SkillType.A,
		energy: Energy.HIGH,
		element: [ElementType.WOOD],
		activable: true,
		tree: SkillTree.ETHER
	},
	{
		skillId: 22302,
		name: 'Courbatures',
		type: SkillType.E,
		energy: Energy.WEAK,
		element: [ElementType.WOOD],
		activable: true,
		tree: SkillTree.ETHER
	},
	{
		skillId: 22303,
		name: 'ForceControl',
		type: SkillType.E,
		energy: Energy.WEAK,
		element: [ElementType.WOOD],
		activable: true,
		tree: SkillTree.ETHER
	},
	{
		skillId: 22304,
		name: 'PeauDeFer',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 22401,
		name: 'Champollion',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 22402,
		name: 'CourantDeVie',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 22403,
		name: 'Berserk',
		type: SkillType.E,
		energy: Energy.WEAK,
		element: [ElementType.WOOD],
		activable: true,
		tree: SkillTree.ETHER
	},
	{
		skillId: 22404,
		name: 'RiviereDeVie',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 22501,
		name: 'MurDeBoue',
		type: SkillType.A,
		energy: Energy.HIGH,
		element: [ElementType.WOOD],
		activable: true,
		tree: SkillTree.ETHER
	},
	{
		skillId: 22502,
		name: 'PeauDacier',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WOOD],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 22503,
		name: 'Sharignan',
		type: SkillType.E,
		energy: Energy.HIGH,
		element: [ElementType.WOOD],
		activable: true,
		tree: SkillTree.ETHER
	},
	{
		skillId: 22504,
		name: 'Amazonie',
		type: SkillType.E,
		energy: Energy.HIGH,
		element: [ElementType.WOOD],
		activable: true,
		tree: SkillTree.ETHER
	},
	{
		skillId: 22505,
		name: 'ReceptacleAqueux',
		type: SkillType.A,
		energy: Energy.VHIGH,
		element: [ElementType.WOOD],
		activable: true,
		tree: SkillTree.ETHER
	},
	{
		skillId: 31101,
		name: 'CanonAEau',
		type: SkillType.A,
		energy: Energy.WEAK,
		element: [ElementType.WATER],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 31102,
		name: 'Perception',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 31103,
		name: 'Mutation',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 31104,
		name: 'Vitalite',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 31201,
		name: 'Gel',
		type: SkillType.A,
		energy: Energy.WEAK,
		element: [ElementType.WATER],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 31201,
		name: 'MoignonsLiquides',
		type: SkillType.A,
		energy: Energy.VHIGH,
		element: [ElementType.WATER],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 31202,
		name: 'DoucheEcossaise',
		type: SkillType.A,
		energy: Energy.WEAK,
		element: [ElementType.WATER],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 31203,
		name: 'CoupsSournois',
		type: SkillType.A,
		energy: Energy.WEAK,
		element: [ElementType.WATER],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 31204,
		name: 'ApprentiPecheur',
		type: SkillType.C,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 31205,
		name: 'PocheVentrale',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 31206,
		name: 'KarateSousMarin',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 31207,
		name: 'EcaillesLuminescentes',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 31301,
		name: 'ZeroAbsolu',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 31302,
		name: 'Petrification',
		type: SkillType.A,
		energy: Energy.WEAK,
		element: [ElementType.WATER],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 31303,
		name: 'Acupuncture',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 31304,
		name: 'Sapeur',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 31305,
		name: 'CoupFatal',
		type: SkillType.A,
		energy: Energy.WEAK,
		element: [ElementType.WATER, ElementType.WATER],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 31306,
		name: 'EntrainementSousMarin',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WATER, ElementType.WATER],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 31307,
		name: 'PecheurConfirme',
		type: SkillType.C,
		energy: Energy.NONE,
		element: [ElementType.WATER, ElementType.WATER],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 31308,
		name: 'Marecage',
		type: SkillType.E,
		energy: Energy.WEAK,
		element: [ElementType.WATER],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 31309,
		name: 'Sumo',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WATER, ElementType.WATER],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 31310,
		name: 'SansPitie',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 31311,
		name: 'CloneAqueux',
		type: SkillType.E,
		energy: Energy.HIGH,
		element: [ElementType.WATER],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 31312,
		name: 'GriffesEmpoisonnes',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 31313,
		name: 'Deluge',
		type: SkillType.A,
		energy: Energy.VHIGH,
		element: [ElementType.WATER],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 31314,
		name: 'PeauDeSerpent',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 31401,
		name: 'RayonKaarSher',
		type: SkillType.A,
		energy: Energy.HIGH,
		element: [ElementType.WATER],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 31402,
		name: 'Magasinier',
		type: SkillType.U,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 31403,
		name: 'EntrainementSousMarinAvance',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 31404,
		name: 'MaitrePecheur',
		type: SkillType.C,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 31405,
		name: 'Cuisinier',
		type: SkillType.U,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 31406,
		name: 'SangAcide',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 31407,
		name: 'Bulle',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 31408,
		name: 'Infatiguable',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 31409,
		name: 'Ondine',
		type: SkillType.I,
		energy: Energy.VHIGH,
		element: [ElementType.WATER],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 31501,
		name: 'MaitreNageur',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 31502,
		name: 'Leviathan',
		type: SkillType.I,
		energy: Energy.VHIGH,
		element: [ElementType.WATER],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 32101,
		name: 'EauDivine',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 32201,
		name: 'RadiationsGamma',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 32202,
		name: 'Bleu',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 32301,
		name: 'MueAcqueuse',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 32302,
		name: 'CarapaceBlindee',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 32303,
		name: 'DieteChromatique',
		type: SkillType.E,
		energy: Energy.HIGH,
		element: [ElementType.WATER],
		activable: true,
		tree: SkillTree.ETHER
	},
	{
		skillId: 32401,
		name: 'EffluveAphrodisiaque',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 32402,
		name: 'Nemo',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 32403,
		name: 'Cleptomane',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 32404,
		name: 'Abysse',
		type: SkillType.A,
		energy: Energy.HIGH,
		element: [ElementType.WATER],
		activable: true,
		tree: SkillTree.ETHER
	},
	{
		skillId: 32405,
		name: 'BanniDesDieux',
		type: SkillType.E,
		energy: Energy.WEAK,
		element: [ElementType.WATER],
		activable: true,
		tree: SkillTree.ETHER
	},
	{
		skillId: 32501,
		name: 'TourbillonMagique',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 32502,
		name: 'Hyperventilation',
		type: SkillType.A,
		energy: Energy.VHIGH,
		element: [ElementType.WATER],
		activable: true,
		tree: SkillTree.ETHER
	},
	{
		skillId: 32503,
		name: 'TherapieDeGroupe',
		type: SkillType.E,
		energy: Energy.VHIGH,
		element: [ElementType.WATER],
		activable: true,
		tree: SkillTree.ETHER
	},
	{
		skillId: 32504,
		name: 'ReceptacleTesla',
		type: SkillType.A,
		energy: Energy.HIGH,
		element: [ElementType.WATER],
		activable: true,
		tree: SkillTree.ETHER
	},
	{
		skillId: 32505,
		name: 'VitaliteMarine',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.WATER],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 41101,
		name: 'Intelligence',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 41102,
		name: 'Focus',
		type: SkillType.E,
		energy: Energy.WEAK,
		element: [ElementType.LIGHT],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 41103,
		name: 'Celerite',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 41104,
		name: 'Reflex',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 41201,
		name: 'Concentration',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 41202,
		name: 'AttaqueEclair',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 41203,
		name: 'Paratonnerre',
		type: SkillType.C,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 41204,
		name: 'CoupDouble',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 41205,
		name: 'Regenerescence',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 41206,
		name: 'PremierSoins',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 41207,
		name: 'EclairSinueux',
		type: SkillType.A,
		energy: Energy.VHIGH,
		element: [ElementType.LIGHT],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 41301,
		name: 'Foudre',
		type: SkillType.A,
		energy: Energy.NORMAL,
		element: [ElementType.LIGHT],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 41302,
		name: 'FissionElementaire',
		type: SkillType.C,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 41303,
		name: 'VoieDeKaos',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 41304,
		name: 'PlanDeCarriere',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.LIGHT, ElementType.LIGHT],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 41305,
		name: 'Adrenaline',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT, ElementType.LIGHT],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 41306,
		name: 'VoieDeGaia',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT, ElementType.LIGHT],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 41307,
		name: 'Medecine',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.LIGHT, ElementType.LIGHT],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 41308,
		name: 'DanseFoudroyante',
		type: SkillType.A,
		energy: Energy.HIGH,
		element: [ElementType.LIGHT],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 41309,
		name: 'Embuche',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT, ElementType.LIGHT],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 41310,
		name: 'PureeSalvatrice',
		type: SkillType.E,
		energy: Energy.HIGH,
		element: [ElementType.LIGHT],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 41311,
		name: 'AuraHermetique',
		type: SkillType.E,
		energy: Energy.WEAK,
		element: [ElementType.LIGHT],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 41312,
		name: 'CrocsDiamant',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 41313,
		name: 'Survie',
		type: SkillType.S,
		energy: Energy.VHIGH,
		element: [ElementType.LIGHT],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 41401,
		name: 'AubeFeuillue',
		type: SkillType.A,
		energy: Energy.VHIGH,
		element: [ElementType.LIGHT],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 41402,
		name: 'Brancardier',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 41403,
		name: 'Benediction',
		type: SkillType.E,
		energy: Energy.WEAK,
		element: [ElementType.LIGHT],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 41404,
		name: 'CrepusculeFlambloyant',
		type: SkillType.A,
		energy: Energy.HIGH,
		element: [ElementType.LIGHT],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 41405,
		name: 'Marchand',
		type: SkillType.U,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 41406,
		name: 'Reincarnation',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 41408,
		name: 'Surcharge',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 41409,
		name: 'Electrolyse',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 41410,
		name: 'Golem',
		type: SkillType.I,
		energy: Energy.VHIGH,
		element: [ElementType.LIGHT],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 41411,
		name: 'Raijin',
		type: SkillType.I,
		energy: Energy.VHIGH,
		element: [ElementType.LIGHT],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 41412,
		name: 'Quetzacoatl',
		type: SkillType.I,
		energy: Energy.VHIGH,
		element: [ElementType.LIGHT],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 41413,
		name: 'RoiDesSinges',
		type: SkillType.I,
		energy: Energy.VHIGH,
		element: [ElementType.LIGHT],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 41501,
		name: 'ArchangeCorrosif',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 41502,
		name: 'ArchangeGenesif',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 41503,
		name: 'Pretre',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 42101,
		name: 'SoutienMoral',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 42201,
		name: 'StimulationCardiaque',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 42202,
		name: 'Jaune',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 42301,
		name: 'MorsureDuSoleil',
		type: SkillType.E,
		energy: Energy.NORMAL,
		element: [ElementType.LIGHT],
		activable: true,
		tree: SkillTree.ETHER
	},
	{
		skillId: 42303,
		name: 'CrampeChronique',
		type: SkillType.E,
		energy: Energy.WEAK,
		element: [ElementType.LIGHT],
		activable: true,
		tree: SkillTree.ETHER
	},
	{
		skillId: 42401,
		name: 'BatterieSupplementaire',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 42402,
		name: 'Einstein',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 42403,
		name: 'BarriereElectrifiee',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 42404,
		name: 'Oracle',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 42501,
		name: 'ReceptacleAerien',
		type: SkillType.A,
		energy: Energy.HIGH,
		element: [ElementType.LIGHT],
		activable: true,
		tree: SkillTree.ETHER
	},
	{
		skillId: 42502,
		name: 'FeuDeStElme',
		type: SkillType.A,
		energy: Energy.HIGH,
		element: [ElementType.LIGHT],
		activable: true,
		tree: SkillTree.ETHER
	},
	{
		skillId: 42503,
		name: 'ForceDeZeus',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 42504,
		name: 'RemanenceHertzienne',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.LIGHT],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 51101,
		name: 'Agilite',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 51102,
		name: 'Strategie',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 51103,
		name: 'Mistral',
		type: SkillType.A,
		energy: Energy.WEAK,
		element: [ElementType.AIR],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 51104,
		name: 'Aiguillon',
		type: SkillType.E,
		energy: Energy.HIGH,
		element: [ElementType.AIR],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 51104,
		name: 'Envol',
		type: SkillType.A,
		energy: Energy.WEAK,
		element: [ElementType.AIR],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 51201,
		name: 'Esquive',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 51202,
		name: 'Saut',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 51203,
		name: 'Analyse',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 51204,
		name: 'Cueillette',
		type: SkillType.C,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 51205,
		name: 'TaiChi',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.AIR, ElementType.AIR],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 51206,
		name: 'Tornade',
		type: SkillType.A,
		energy: Energy.NORMAL,
		element: [ElementType.AIR],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 51207,
		name: 'AuraPuante',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 51301,
		name: 'DisqueVacuum',
		type: SkillType.A,
		energy: Energy.HIGH,
		element: [ElementType.AIR],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 51302,
		name: 'Elasticite',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 51303,
		name: 'AttaquePlongeante',
		type: SkillType.A,
		energy: Energy.WEAK,
		element: [ElementType.AIR],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 51304,
		name: 'Furtivite',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 51305,
		name: 'Specialiste',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.AIR, ElementType.AIR],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 51306,
		name: 'TalonDAchille',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.AIR, ElementType.AIR],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 51307,
		name: 'NuageToxique',
		type: SkillType.A,
		energy: Energy.HIGH,
		element: [ElementType.AIR],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 51308,
		name: 'OeilDeLynx',
		type: SkillType.C,
		energy: Energy.NONE,
		element: [ElementType.AIR, ElementType.AIR],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 51309,
		name: 'Eveil',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.AIR, ElementType.AIR],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 51310,
		name: 'PaumeEjectable',
		type: SkillType.A,
		energy: Energy.WEAK,
		element: [ElementType.AIR],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 51311,
		name: 'VentVif',
		type: SkillType.E,
		energy: Energy.NORMAL,
		element: [ElementType.AIR],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 51312,
		name: 'FormeVaporeuse',
		type: SkillType.S,
		energy: Energy.NORMAL,
		element: [ElementType.AIR],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 51313,
		name: 'Hypnose',
		type: SkillType.A,
		energy: Energy.VHIGH,
		element: [ElementType.AIR],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 51314,
		name: 'Secousse',
		type: SkillType.A,
		energy: Energy.WEAK,
		element: [ElementType.AIR],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 51401,
		name: 'TrouNoir',
		type: SkillType.A,
		energy: Energy.VHIGH,
		element: [ElementType.AIR],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 51402,
		name: 'MaitreLevitateur',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 51403,
		name: 'HalineFetive',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 51404,
		name: 'MeditationSolitaire',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 51405,
		name: 'Professeur',
		type: SkillType.U,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 51406,
		name: 'SouffleDeVie',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 51407,
		name: 'TotemAncestralAeroporte',
		type: SkillType.I,
		energy: Energy.VHIGH,
		element: [ElementType.AIR],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 51408,
		name: 'Fujin',
		type: SkillType.I,
		energy: Energy.VHIGH,
		element: [ElementType.AIR],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 51501,
		name: 'MeditationTranchante',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 51502,
		name: 'Djinn',
		type: SkillType.I,
		energy: Energy.VHIGH,
		element: [ElementType.AIR],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 51503,
		name: 'Hades',
		type: SkillType.I,
		energy: Energy.VHIGH,
		element: [ElementType.AIR],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 51601,
		name: 'FormeEtherale',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 52101,
		name: 'MaitriseCorporelle',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 52201,
		name: 'Blanc',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 52202,
		name: 'Anaerobie',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 52301,
		name: 'DoubleFace',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 52302,
		name: 'Flagellation',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 52303,
		name: 'SouffleDange',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 52304,
		name: 'Ouragan',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 52401,
		name: 'Ouranos',
		type: SkillType.A,
		energy: Energy.HIGH,
		element: [ElementType.AIR],
		activable: true,
		tree: SkillTree.ETHER
	},
	{
		skillId: 52402,
		name: 'Twinoid500mg',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 52403,
		name: 'LonDuhaut',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 52404,
		name: 'SurplisDhades',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 52405,
		name: 'ReceptacleThermique',
		type: SkillType.A,
		energy: Energy.HIGH,
		element: [ElementType.AIR],
		activable: true,
		tree: SkillTree.ETHER
	},
	{
		skillId: 52501,
		name: 'QiGong',
		type: SkillType.E,
		energy: Energy.VHIGH,
		element: [ElementType.AIR],
		activable: true,
		tree: SkillTree.ETHER
	},
	{
		skillId: 52502,
		name: 'Sylphides',
		type: SkillType.A,
		energy: Energy.VHIGH,
		element: [ElementType.AIR],
		activable: true,
		tree: SkillTree.ETHER
	},
	{
		skillId: 52503,
		name: 'Messie',
		type: SkillType.U,
		energy: Energy.NONE,
		element: [ElementType.AIR],
		activable: false,
		tree: SkillTree.ETHER
	},
	{
		skillId: 52504,
		name: 'Mutinerie',
		type: SkillType.E,
		energy: Energy.HIGH,
		element: [ElementType.AIR],
		activable: true,
		tree: SkillTree.ETHER
	},
	{
		skillId: 52505,
		name: 'MainsCollantes',
		type: SkillType.E,
		energy: Energy.WEAK,
		element: [ElementType.AIR],
		activable: true,
		tree: SkillTree.ETHER
	},
	{
		skillId: 61119,
		name: 'CompetenceDouble',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.VOID],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 61120,
		name: 'LimiteBrisee',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.VOID],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 61121,
		name: 'Invocateur',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.VOID],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 61101,
		name: 'FrenesieCollective',
		type: SkillType.E,
		energy: Energy.WEAK,
		element: [ElementType.VOID],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 61102,
		name: 'Coque',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.VOID],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 61103,
		name: 'ChargeCornue',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.VOID],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 61104,
		name: 'Rock',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.VOID],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 61105,
		name: 'Pietinement',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.VOID],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 61106,
		name: 'Cuirasse',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.VOID],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 61107,
		name: 'Insaisissable',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.VOID],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 61108,
		name: 'DeplacementInstantane',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.VOID],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 61109,
		name: 'Napomagicien',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.VOID],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 61111,
		name: 'GrosCostaud',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.VOID],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 61112,
		name: 'OrigineCaushemeshenne',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.VOID],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 61113,
		name: 'Ecrasement',
		type: SkillType.A,
		energy: Energy.WEAK,
		element: [ElementType.VOID],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 61114,
		name: 'ForceDeLumiere',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.VOID],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 61115,
		name: 'ChargePigmou',
		type: SkillType.A,
		energy: Energy.WEAK,
		element: [ElementType.VOID],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 61116,
		name: 'ForceDesTenebres',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.VOID],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 61117,
		name: 'Bigmagnon',
		type: SkillType.S,
		energy: Energy.NONE,
		element: [ElementType.VOID],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 61118,
		name: 'DurACuire',
		type: SkillType.P,
		energy: Energy.NONE,
		element: [ElementType.VOID],
		activable: false,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 41504,
		name: 'Hercolubus',
		type: SkillType.I,
		energy: Energy.VHIGH,
		element: [ElementType.LIGHT, ElementType.AIR],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 41505, //Edit since this
		name: 'ReineDeLaRuche',
		type: SkillType.I,
		energy: Energy.VHIGH,
		element: [ElementType.LIGHT],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 51506,
		name: 'BigMama',
		type: SkillType.I,
		energy: Energy.VHIGH,
		element: [ElementType.LIGHT],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 41507,
		name: 'Yggdrasil',
		type: SkillType.I,
		energy: Energy.VHIGH,
		element: [ElementType.LIGHT],
		activable: true,
		tree: SkillTree.VANILLA
	},
	{
		skillId: 41508,
		name: 'BaleineBlanche',
		type: SkillType.I,
		energy: Energy.VHIGH,
		element: [ElementType.LIGHT],
		activable: true,
		tree: SkillTree.VANILLA
	}
] as Array<DinozSkill>;
