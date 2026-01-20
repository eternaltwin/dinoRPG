import { ClanMember, Player } from '@drpg/prisma';

export type UpdateClanMemberRequestParams = {
	clanId: string;
	id: string;
};
export type UpdateClanMemberRequestBody = {
	clanMember: Pick<ClanMember, 'id' | 'nickname' | 'rights'>;
};

export type GetClanMemberResponse =
	| (Pick<ClanMember, 'id' | 'nickname' | 'rights'> & {
			player: Pick<Player, 'id' | 'name'>;
	  })
	| null;
