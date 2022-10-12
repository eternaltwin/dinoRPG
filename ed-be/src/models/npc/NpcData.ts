export interface NpcData {
	stepName: string; //Correspond au <phase id="speech"> du code MT
	alias?: string;
	nextStep: Array<string>; //Correspond au <a id="speech"> du code MT
	initialStep?: boolean;
	condition?: string;
	action?: string;
	reward?: Array<string>;
}
