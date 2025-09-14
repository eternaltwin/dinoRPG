export interface DisplayedNews {
	id: number;
	createdDate: Date;
	title: string;
	type: string;
	subtype?: string | null;
	text: string;
	hide: boolean;
	likes: number;
	likedByMe: boolean;
}
