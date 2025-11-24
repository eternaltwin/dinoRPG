import { ClanMessage } from './clanMessage.mjs';

export type CreateClanMessage = Omit<ClanMessage, 'clanId' | 'authorId' | 'playerTracking'>;
