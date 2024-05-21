import { News } from '@drpg/prisma';

export type NewsGetResponse = Omit<News, 'image' | 'updatedDate'>[];
