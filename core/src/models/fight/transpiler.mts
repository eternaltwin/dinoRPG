export enum DinoAction {
	ADD,
	ANNOUNCE,
	OBJECT,
	LOST,
	STATUS,
	NOSTATUS,
	REGEN,
	DAMAGES,
	SKILL,
	DEAD,
	GOTO,
	RETURN,
	PAUSE,
	FINISH,
	ADDCASTLE,
	TIMELIMIT,
	ATTACKCASTLE,
	DISPLAY,
	TEXT,
	TALK,
	ESCAPE,
	MOVETO,
	FLIP,
	SPAWNTOY,
	DESTROYTOY,
	WAIT,
	LOG,
	NOTIFY,
	ENERGY,
	MAXENERGY,
	EMOTE,
	SHAKE
}

export enum FinishState {
	STAND,
	RUN,
	ESCAPE,
	GUARD
}

export enum EntranceEffect {
	STAND,
	JUMP,
	RUN,
	GROW,
	FALL,
	GROUND,
	ANIM
}

export enum EmoteList {
	Surprise,
	Question,
	Angry
}

export enum EmoteBehaviour {
	Float,
	Bounce,
	Grow
}

export enum AuraType {
	Spiral,
	Line,
	Burst,
	Detonate,
	Light
}

export enum SkillType {
	Fire,
	Wood,
	Water,
	Lightning,
	Air
}

export enum DamagesEffect {
	Normal,
	Back,
	Counter,
	Drop,
	Eject,
	FlyCancel,
	IntangCancel,
	IntangBreak,
	Missed
}

export type transpiled =
	| {
			action: DinoAction.ADD;
			fighter: {
				props: [];
				dino: boolean;
				life: number | undefined;
				maxLife: number | undefined;
				name: string;
				side: boolean;
				scale: number;
				fid: number;
				gfx: string | undefined;
				entrance: EntranceEffect;
			};
	  }
	| {
			action: DinoAction.DEAD;
			fid: number;
	  }
	| {
			action: DinoAction.DAMAGES;
			fid: number;
			tid: number;
			damages: number;
			lifeFx?: {
				fx: number;
			};
			effect?: DamagesEffect;
	  }
	| {
			action: DinoAction.RETURN;
			fid: number;
	  }
	| {
			action: DinoAction.GOTO;
			fid: number;
			tid: number;
	  }
	| {
			action: DinoAction.ANNOUNCE;
			fid: number;
			message: string;
	  }
	| {
			action: DinoAction.SKILL;
			skill: number;
			details: {
				fid: number;
				targets?: {
					id: number;
					life?: number;
				}[];
				color?: string;
				type?: SkillType | AuraType;
				fx?: string;
			};
	  }
	| {
			action: DinoAction.ENERGY;
			fighters: {
				fid: number;
				energy: number;
			}[];
	  }
	| {
			action: DinoAction.MAXENERGY;
			fighters: {
				fid: number;
				maxEnergy: number;
			}[];
	  }
	| {
			action: DinoAction.STATUS;
			fid: number;
			status: number;
	  }
	| {
			action: DinoAction.REGEN;
			fid: number;
			amount: number;
	  }
	| {
			action: DinoAction.NOSTATUS;
			fid: number;
			status: number;
	  }
	| {
			action: DinoAction.LOST;
			fid: number;
			amount: number;
			lifeFx: {
				fx: number;
			};
	  }
	| {
			action: DinoAction.FINISH;
			left: FinishState;
			right: FinishState;
	  }
	| {
			action: DinoAction.EMOTE;
			fids: number[];
			emote: EmoteList;
			behaviour: EmoteBehaviour;
	  }
	| {
			action: DinoAction.SHAKE;
			force?: number;
			frict?: number;
			speed?: number;
	  }
	| {
			action: DinoAction.FLIP;
			fid: number;
	  }
	| {
			action: DinoAction.WAIT;
			time: number;
	  };
