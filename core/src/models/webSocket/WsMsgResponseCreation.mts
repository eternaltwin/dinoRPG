import { CreateClanMessage } from '../clan/CreateClanMessage.mjs';
import { WsMessageAction } from './WsMessageAction.mjs';

export interface WsMsgResponseCreation {
    action: WsMessageAction.CREATE,
    payload: CreateClanMessage
}