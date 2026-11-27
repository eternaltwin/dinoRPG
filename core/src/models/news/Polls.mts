export interface CreatePollOption {
	optionText: string;
	orderIndex?: number;
}

export interface CreatePollData {
	newsId: number;
	options: CreatePollOption[];
	isActive?: boolean;
}

export interface PollPublic {
	id: number;
	isActive: boolean;
	createdDate: Date;
	options: {
		id: number;
		optionText: string;
		/** Translated labels (Record<Lang, string>), optionText is the fallback */
		labels?: Record<string, string> | null;
	}[];
	votes: { playerId: string; pollOptionId: number }[];
	endDate: string;
}

export interface CreatePollResult {
	success: boolean;
	poll?: PollPublic;
	error?: string;
}
