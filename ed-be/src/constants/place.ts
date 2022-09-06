import { Place } from '../models/index.js';
import { statusList } from './status.js';

export const placeList: Record<string, Place> = {
	// Useful for the few things accessible from any where like the flying shop
	ANYWHERE: {
		placeId: 0,
		name: 'anywhere',
		borderPlace: []
	},
	PORT_DE_PRECHE: {
		placeId: 1,
		name: 'port',
		borderPlace: [7, 10, 11, 13]
	},
	PLACE_DU_MARCHE: {
		placeId: 2,
		name: 'market',
		borderPlace: [4]
	},
	PAPY_JOE: {
		placeId: 3,
		name: 'papy',
		borderPlace: [4, 6, 7]
	},
	FORCEBRUT: {
		placeId: 4,
		name: 'forcebrut',
		borderPlace: [2, 3, 7]
	},
	DINOVILLE: {
		placeId: 5,
		name: 'dnv',
		borderPlace: [6, 7, 12]
	},
	UNIVERSITE: {
		placeId: 6,
		name: 'universite',
		borderPlace: [3, 5, 8]
	},
	FOUTAINE_DE_JOUVENCE: {
		placeId: 7,
		name: 'fountj',
		borderPlace: [1, 3, 4, 5]
	},
	COLLINES_ESCARPEES: {
		placeId: 8,
		name: 'colesc',
		borderPlace: [6, 9]
	},
	GO_TO_GRAND_TOUT_CHAUD: {
		placeId: 9,
		name: 'gogtc',
		borderPlace: [8],
		alias: 43,
		conditions: statusList.CLIMBING_GEAR
	},
	GO_TO_ATLANTEINES_ISLAND: {
		placeId: 10,
		name: 'goiles',
		borderPlace: [1],
		alias: 31,
		conditions: statusList.BUOY
	},
	CIMETIERE: {
		placeId: 11,
		name: 'skull',
		borderPlace: [1],
		conditions: statusList.SKULLY_MEMORY
	},
	GO_TO_DINOPLAZA: {
		placeId: 12,
		name: 'goplaz',
		borderPlace: [5],
		alias: 35,
		conditions: statusList.DINOPLAZA
	},
	GO_TO_MONSTER_ISLAND: {
		placeId: 13,
		name: 'gomisl',
		conditions: statusList.JOVEBOZE,
		borderPlace: [1],
		alias: 92
	},
	AUREE_DE_LA_FORET: {
		placeId: 14,
		name: 'auree',
		borderPlace: [15, 23]
	},
	CHEMIN_GLAUQUE: {
		placeId: 15,
		name: 'chemin',
		borderPlace: [14, 16, 17]
	},
	COLLINES_HANTEES: {
		placeId: 16,
		name: 'collin',
		borderPlace: [15, 17]
	},
	FLEUVE_JUMIN: {
		placeId: 17,
		name: 'fleuve',
		borderPlace: [15, 16, 18, 19]
	},
	CAMP_KORGON: {
		placeId: 18,
		name: 'camp',
		borderPlace: [17, 22],
		conditions: statusList.FLIPPERS
	},
	JUNGLE_SAUVAGE: {
		placeId: 19,
		name: 'jungle',
		borderPlace: [17, 20],
		conditions: statusList.FLIPPERS
	},
	PORTE_DE_SYLVENOIRE: {
		placeId: 20,
		name: 'garde',
		borderPlace: [19, 21]
	},
	GO_TO_STEPPES: {
		placeId: 21,
		name: 'gostep',
		borderPlace: [20],
		conditions: statusList.SYLVENOIRE_KEY,
		alias: 55
	},
	GO_TO_GORGES_PROFONDES: {
		placeId: 22,
		name: 'goorg',
		borderPlace: [18],
		alias: 49
	},
	GO_TO_CHUTES: {
		placeId: 23,
		name: 'gochut',
		borderPlace: [14],
		alias: 25
	},
	GO_TO_FOREST: {
		placeId: 24,
		name: 'gogrum',
		borderPlace: [25],
		conditions: statusList.NENUPHAR_LEAF,
		alias: 14
	},
	CHUTES_MUTANTES: {
		placeId: 25,
		name: 'chutes',
		borderPlace: [24, 26, 27, 29]
	},
	GO_TO_DOME_SOULAFLOTTE: {
		placeId: 26,
		name: 'rasca',
		borderPlace: [25],
		alias: 28,
		conditions: statusList.RASCAPHANDRE_DECOY
	},
	BAO_BOB: {
		placeId: 27,
		name: 'baobob',
		borderPlace: [25]
	},
	DOME_SOULAFLOTTE: {
		placeId: 28,
		name: 'dome',
		borderPlace: [25],
		conditions: statusList.RASCAPHANDRE_DECOY
	},
	MARAIS_COLLANT: {
		placeId: 29,
		name: 'marais',
		borderPlace: [25, 30, 31, 33]
	},
	MINES_DE_CORAIL: {
		placeId: 30,
		name: 'corail',
		borderPlace: [29, 31]
	},
	ILE_WAIKIKI: {
		placeId: 31,
		name: 'ilewkk',
		borderPlace: [29, 30, 32]
	},
	GO_TO_PORT_DE_PRECHE: {
		placeId: 32,
		name: 'goport',
		borderPlace: [31],
		alias: 1
	},
	ATELIER_BROC: {
		placeId: 33,
		name: 'chbroc',
		borderPlace: [29]
	},
	GO_TO_DINOVILLE: {
		placeId: 34,
		name: 'godnv',
		borderPlace: [35],
		alias: 5
	},
	DINOPLAZA: {
		placeId: 35,
		name: 'dplaza',
		borderPlace: [36, 37, 38, 34]
	},
	VILLA: {
		placeId: 36,
		name: 'villa',
		borderPlace: [35, 37]
	},
	CINEMA_PARADINO: {
		placeId: 37,
		name: 'dcine',
		borderPlace: [36, 35, 38, 40]
	},
	CLINIQUE: {
		placeId: 38,
		name: 'clinik',
		borderPlace: [35, 37]
	},
	CHATEAU_DE_DINOVILLE: {
		placeId: 39,
		name: 'chato',
		borderPlace: [40]
	},
	POSTE_DE_GARDE: {
		placeId: 40,
		name: 'poste',
		borderPlace: [39, 41, 37]
	},
	GO_TO_VOIE_TEMPLE_CELESTE: {
		placeId: 41,
		name: 'portal',
		borderPlace: [40]
	},
	GO_TO_COLLINES_ESCARPEES: {
		placeId: 42,
		name: 'gocol',
		borderPlace: [43],
		alias: 8
	},
	PENTES_DE_BASALTE: {
		placeId: 43,
		name: 'bslt',
		borderPlace: [42, 44]
	},
	FORGES_DU_GTC: {
		placeId: 44,
		name: 'forges',
		borderPlace: [43, 45, 46, 47]
	},
	RUINES_ASHPOUK: {
		placeId: 45,
		name: 'rashpk',
		borderPlace: [44]
	},
	FOSSELAVE: {
		placeId: 46,
		name: 'fosslv',
		borderPlace: [44, 48]
	},
	REPAIRE_DU_VENERABLE: {
		placeId: 47,
		name: 'vener',
		borderPlace: [44, 52]
	},
	TUNNEL_SOUS_LA_BRANCHE: {
		placeId: 48,
		name: 'tunel',
		borderPlace: [46, 50]
	},
	GORGES_PROFONDES: {
		placeId: 49,
		name: 'gorges',
		borderPlace: [48, 51]
	},
	GO_TO_TUNNEL: {
		placeId: 50,
		name: 'stunel',
		borderPlace: [48],
		conditions: statusList.LANTERN,
		alias: 49
	},
	GO_TO_CAMP_KORGON: {
		placeId: 51,
		name: 'gocamp',
		borderPlace: [50],
		alias: 18
	},
	GO_TO_KARINBAO_TOWER: {
		placeId: 52,
		name: 'tourbt',
		borderPlace: [47, 53]
	},
	GO_TO_CELESTIAL_ISLAND: {
		placeId: 53,
		name: 'toursk',
		borderPlace: [52],
		alias: 81
	},
	GO_TO_SYLVENOIRE_DOOR: {
		placeId: 54,
		name: 'gosylv',
		borderPlace: [55],
		alias: 20
	},
	FRONTIERE_CREPITANTE: {
		placeId: 55,
		name: 'senter',
		borderPlace: [54, 56, 57]
	},
	CROISEE_DES_NOMADES: {
		placeId: 56,
		name: 'scross',
		borderPlace: [58, 55, 61]
	},
	AVANT_POSTE_ROCKY: {
		placeId: 57,
		name: 'svillg',
		borderPlace: [55, 58]
	},
	CITADELLE_DU_ROI: {
		placeId: 58,
		name: 'sking',
		borderPlace: [56, 57, 59, 62]
	},
	PYLONES_DE_MAGNETITES: {
		placeId: 59,
		name: 'spylon',
		borderPlace: [58, 60, 63]
	},
	SYPHON_SIFFLEUR: {
		placeId: 60,
		name: 'slake',
		borderPlace: [59, 61, 64, 65, 101]
	},
	SENTIER_DE_TOUTEMBA: {
		placeId: 61,
		name: 'scanyo',
		borderPlace: [56, 60]
	},
	DEVOREUSE_DE_L_EST: {
		placeId: 62,
		name: 'stowr1',
		borderPlace: [58]
	},
	DEVOREUSE_DU_NORD: {
		placeId: 63,
		name: 'stowr2',
		borderPlace: [59]
	},
	DEVOREUSE_DE_L_OUEST: {
		placeId: 64,
		name: 'stowr3',
		borderPlace: [60]
	},
	TAUDIS_DES_ZAXA: {
		placeId: 65,
		name: 'sband1',
		borderPlace: [60, 66, 67]
	},
	CAMP_DES_EMMEMMA: {
		placeId: 66,
		name: 'sband2',
		borderPlace: [65, 67, 70]
	},
	CAMPEMENT_DES_MATTMUT: {
		placeId: 67,
		name: 'sband3',
		borderPlace: [65, 66, 68]
	},
	REPAIRE_DE_LA_TEAM_W: {
		placeId: 68,
		name: 'scampw',
		borderPlace: [67]
	},
	CONFINS_DES_STEPPES: {
		placeId: 69,
		name: 'scaush',
		borderPlace: [66, 70, 71]
	},
	PORTES_DE_CAUSHEMESH: {
		placeId: 70,
		name: 'sport',
		borderPlace: [66, 69]
	},
	APPROCHER_SYPHON: {
		placeId: 71,
		name: 'sinto1',
		borderPlace: [69],
		alias: 60
	},
	TETE_DE_L_ILE: {
		placeId: 72,
		name: 'iroche',
		borderPlace: [73]
	},
	PONT: {
		placeId: 73,
		name: 'ipont',
		borderPlace: [72, 74]
	},
	PORTE_DE_NIVEAU_SUPERIEUR: {
		placeId: 74,
		name: 'iporte',
		borderPlace: [73, 77, 83, 75, 88]
	},
	CITE_ARBORIS: {
		placeId: 75,
		name: 'icite',
		borderPlace: [74, 76, 81, 89]
	},
	LAC_CELESTE: {
		placeId: 76,
		name: 'ilacro',
		borderPlace: [75, 88, 90]
	},
	PLAINES_ENNEIGEES: {
		placeId: 77,
		name: 'iplain',
		borderPlace: [74, 78]
	},
	BOIS_GIVRES: {
		placeId: 78,
		name: 'isnow2',
		borderPlace: [77, 79]
	},
	MONT_SACRE_D_EVEROUEST: {
		placeId: 79,
		name: 'imont',
		borderPlace: [78, 80]
	},
	SOMMET_DU_MONT_SACRE: {
		placeId: 80,
		name: 'ihaut',
		borderPlace: [79]
	},
	CHEMIN_OBSERVATOIRE: {
		placeId: 81,
		name: 'voie',
		borderPlace: [75, 82, 91] //Redescente tout chaud
	},
	OBSERVATOIRE: {
		placeId: 82,
		name: 'observ',
		borderPlace: [81]
	},
	QUARTIER_LUXURIANT: {
		placeId: 83,
		name: 'ville1',
		borderPlace: [74, 84, 87]
	},
	QUARTIER_EXUBERANT: {
		placeId: 84,
		name: 'ville2',
		borderPlace: [83, 85]
	},
	CHEMIN_VERS_PALAIS: {
		placeId: 85,
		name: 'sommet',
		borderPlace: [84, 86, 87]
	},
	PALAIS_DE_L_ARCHIDOROGON: {
		placeId: 86,
		name: 'palais',
		borderPlace: [85]
	},
	EGOUTS_DU_PALAIS: {
		placeId: 87,
		name: 'egout',
		borderPlace: [83, 85]
	},
	CHUTES_DE_NIRVANA: {
		placeId: 88,
		name: 'ilac',
		borderPlace: [74, 76]
	},
	PRIRANESE: {
		placeId: 89,
		name: 'prison',
		borderPlace: [75, 90]
	},
	AILE_OUEST_DU_DRAGON: {
		placeId: 90,
		name: 'ilac2',
		borderPlace: [89, 76]
	},
	TOURUP: {
		placeId: 91,
		name: 'tourup',
		borderPlace: [89, 76, 81],
		alias: 52
	},
	PORT_MONSTRUEUX: {
		placeId: 92,
		name: 'mport',
		borderPlace: [98, 96, 93]
	},
	AVANT_POSTE_FRUTOX: {
		placeId: 93,
		name: 'mfoutp',
		borderPlace: [92, 96, 95, 94]
	},
	PALAIS_DU_GROTOX: {
		placeId: 94,
		name: 'mfpalc',
		borderPlace: [93, 95]
	},
	FORET_KAZE_KAMI: {
		placeId: 95,
		name: 'mforst',
		borderPlace: [93, 94, 99]
	},
	AVANT_POSTE_VEGETOX: {
		placeId: 96,
		name: 'mvoutp',
		borderPlace: [92, 93, 97]
	},
	PALAIX_D_ANTRAXOV: {
		placeId: 97,
		name: 'mvpalc',
		borderPlace: [96, 100]
	},
	GO_TO_PORT_DE_PRECHE_THROUGHT_MONSTER_ISLAND: {
		placeId: 98,
		name: 'bkport',
		borderPlace: [92],
		alias: 1
	},
	RUINES_DE_CUSCOUZ: {
		placeId: 99,
		name: 'mcuzco',
		borderPlace: [95, 100]
	},
	CAMP_D_ELIT: {
		placeId: 100,
		name: 'mcelit',
		borderPlace: [97, 99]
	},
	APPROCHER_SYPHON2: {
		placeId: 101,
		name: 'sinto2',
		borderPlace: [60],
		alias: 69
	}
};
