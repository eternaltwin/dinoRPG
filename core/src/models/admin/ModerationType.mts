import { DinozFiche } from '../dinoz/DinozFiche.mjs';
import { Player, ModerationReason, ModerationAction, Clan } from '@drpg/prisma';

export type ModerationType = {
	id: number;
	sorted: ModerationAction;
	reason: ModerationReason;
	comment: string;
	reporter: Pick<Player, 'id' | 'name'>;
	target: Pick<Player, 'id' | 'name' | 'customText'>;
	dinoz?: Pick<DinozFiche, 'id' | 'name'>;
	targetClan?: Pick<Clan, 'id' | 'name'>;
};

export type ModerationAdminType = {
	id: number;
	targetId: string;
	reporterId: string;
	comment: string;
	reason: ModerationReason;
	sorted?: ModerationAction;
	dinozId?: number;
	banDate?: Date;
	banEndDate?: Date;
};
