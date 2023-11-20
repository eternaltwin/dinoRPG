export interface twinoResponseAPI {
	access_token: string;
	expires_in: number;
	token_type: string;
}

export interface DinoRPGProfile {
	id: number;
	name: string;
	twinId: number;
	dinos: dinoAPI[];
	objects: objectAPI[];
	collections: collectionAPI[];
	money: number;
	scenarios: scenarioAPI[];
}
export interface objectAPI {
	id: number;
	uid: number; //User
	count: number; //Quantité
	oid: string; //Identifiant de l'objet
	desc: string;
	name: string;
	icon: string;
	locked: boolean;
	max: number;
	family: String;
}

export interface dinoAPI {
	id: number; //id du Dino
	name: string; //nom du Dino
	display: { gfx: string; chk: number }; //code d'affichage du dino et sa clé
	life: number; //vie actuelle du Dino
	maxLife: number; //vie maximale du Dino
	level: number; //niveau du Dino
	pos: { id: number; zone: number; name: String }; //position du Dino sur la carte
	canAct: boolean; //si le Dino peut faire une action de combat/déplacement
	canGather: boolean; //si le dino peut faire une action de fouille
	xp: number; //valeur d'XP actuelle
	elements: { air: number; fire: number; water: number; thunder: number; wood: number }; //tableau des elements du Dino
	status: null | { desc: string; id: string; sid: number; timer: boolean }; //id de status du Dino
	effects: EffectAPI[]; //tableau des effets appliqués au Dino
}

export interface collectionAPI {
	oid: string;
	uid: number; //id du joueur
	name: string;
	desc: string;
}

export interface scenarioAPI {
	id: string;
	progress: number;
}

export interface EffectAPI {
	did: number; //Id du Dino
	eid: string; //Identifiant de l'effet
	name: string;
	desc: string;
	icon: string;
	hidden: boolean;
}

export interface Site {
	site: { name: string; id: number };
	user: { id: number };
	link: string;
	npoints: number | null;
	points: number;
	stats: Stats[];
	achievements: Achievement[];
}
export interface Achievement {
	id: string; // siteId_statId_index
	name: string;
	stat: string;
	score: number; // required stat score to obtain this achievement
	points: number;
	npoints: number;
	description: string;
	data: { type: string; title?: string; url?: string; prefix?: boolean; suffix?: boolean };
	date: string;
	index: number;
}
export interface Stats {
	name: string;
	rare: number;
	description: string;
	score: number;
	id: string;
	social: boolean;
}
export interface TwinoUser {
	id: number;
	name: string;
	sites: Site[];
}
