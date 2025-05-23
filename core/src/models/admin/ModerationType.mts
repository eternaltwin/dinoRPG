import { DinozFiche } from '../dinoz/DinozFiche.mjs';
import { ModerationReasonFront } from '../enums/ModerationReasonFront.mjs';
import { ModerationActionFront } from '../enums/ModerationActionFront.mjs';
import { Player } from '@drpg/prisma';

export type ModerationType = {
	id: number;
	sorted: ModerationActionFront;
	reason: ModerationReasonFront;
	comment: string;
	reporter: Pick<Player, 'id' | 'name'>;
	target: Pick<Player, 'id' | 'name' | 'customText'>;
	dinoz?: Pick<DinozFiche, 'id' | 'name'>;
};

export type ModerationAdminType = {
	id: number;
	targetId: string;
	reporterId: string;
	comment: string;
	reason: ModerationReasonFront;
	sorted?: ModerationActionFront;
	dinozId?: number;
	banDate?: Date;
	banEndDate?: Date;
};
