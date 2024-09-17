import { Player } from '../player/Player.mjs';
import { DinozFiche } from '../dinoz/DinozFiche.mjs';
import { ModerationReasonFront } from '../enums/ModerationReasonFront.mjs';

export type ModerationType = {
	id: number;
	sorted: boolean;
	reason: ModerationReasonFront;
	comment: string;
	reporter: Pick<Player, 'id' | 'name'>;
	target: Pick<Player, 'id' | 'name' | 'customText'>;
	dinoz?: Pick<DinozFiche, 'id' | 'name'>;
};
