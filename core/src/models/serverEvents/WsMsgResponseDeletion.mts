import { WsMessageAction } from './WsMessageAction.mjs';

export interface WsMsgResponseDeletion {
	action: WsMessageAction.DELETE;
	msgId: number;
}
