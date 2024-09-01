import { WsMsgRequestDeletion } from './WsMsgRequestDeletion.mjs';
import { WsMsgRequestCreation } from './WsMsgRequestCreation.mjs';

export type WsMessageRequest = WsMsgRequestCreation | WsMsgRequestDeletion;