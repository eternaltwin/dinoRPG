import {
	Clan,
	ClanCastle,
	ClanCastleRepair,
	ClanJoinRequest,
	ClanMember,
	ClanWarRanking,
	Dinoz,
	Player
} from '@drpg/prisma';

export type ClanLite = Pick<Clan, 'id' | 'name' | 'treasureValue' | 'creationDate' | 'leaderId' | 'langs'> & {
	members: Pick<ClanMember, 'id'>[];
	leader: Pick<Player, 'id' | 'name'>;
	totalScore?: number;
	bannerUrl?: string;
	isCastleBuilt?: boolean;
	castle?: ClanCastle;
	clanWarRanking?: Pick<ClanWarRanking, 'reputation'>[];
	ingredients?: treasureIngredient[];
};

export type ClanForSearch = Pick<Clan, 'id' | 'name'>;

export type PlayerClanJoinRequest = Pick<ClanJoinRequest, 'id' | 'date'> & {
	player: Pick<Player, 'id' | 'name'>;
	clan: Pick<Clan, 'id' | 'name' | 'leaderId'> & {
		members: Pick<ClanMember, 'playerId' | 'rights'>[];
	};
};

export interface AttackStatus {
	id: number;
	endsAt: string;
	points: number;
	defender: {
		id: number;
		name: string;
	};
	attacker: {
		id: number;
		name: string;
	};
}

export interface Castle {
	maxLife: number;
	currentLife: number;
	defenseOrder: number[];
	defender: Defender[];
	repairs: ClanCastleRepair[];
}

export type Defender = Pick<Dinoz, 'id' | 'name' | 'life' | 'maxLife' | 'display' | 'level'>;

export type treasureIngredient = {
	ingredientId: number;
	quantity: number;
};
