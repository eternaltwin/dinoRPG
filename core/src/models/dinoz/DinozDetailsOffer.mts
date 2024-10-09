export interface DinozDetailsOffer {
	id: number;
	name: string;
	level: number;
	status: { statusId: number }[];
	skills: { skillId: number }[];
}
