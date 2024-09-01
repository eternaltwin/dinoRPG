import { WsMsgResponseCreation } from './WsMsgResponseCreation.mjs';
import { WsMsgResponseDeletion } from './WsMsgResponseDeletion.mjs';

export type WsMsgResponse = WsMsgResponseCreation | WsMsgResponseDeletion;