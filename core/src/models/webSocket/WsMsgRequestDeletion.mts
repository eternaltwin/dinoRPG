import { WsMessageAction } from './WsMessageAction.mjs';

export interface WsMsgRequestDeletion {
    action: WsMessageAction.DELETE,
    msgId: number;
}
