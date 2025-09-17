import { WsChannelData } from './WsChannelData.mjs';

export interface ChannelInfos {
	channelName: string;
	members: WsChannelData[];
}
