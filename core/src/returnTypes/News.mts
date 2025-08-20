import { News } from '@drpg/prisma';

export type NewsGetResponse = NewsWithLiked[];

export interface NewsWithLiked extends Omit<News, 'image' | 'updatedDate'> {
	likes: number;
	likedByMe: boolean;
}
