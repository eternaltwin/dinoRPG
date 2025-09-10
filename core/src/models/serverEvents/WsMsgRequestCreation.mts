import { WsMessageAction } from './WsMessageAction.mjs';

export interface WsMsgRequestCreation {
	action: WsMessageAction.CREATE;
	message: string;
}
