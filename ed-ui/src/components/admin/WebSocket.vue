<template>
	<button @click="getWsTicket()">Test connection</button>
	<button @click="sendMessage()">Send message</button>
	<input type="text" placeholder="Message to send" v-model="message" @keyup.enter="sendMessage()" /><br />
	{{ webSocket.readyState }}
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ServerEventsService } from '../../services/ServerEventsService';
import { WsChannel } from '@drpg/core/models/serverEvents/WsChannel';
import { ServerEventTicketDto } from '@drpg/core/models/serverEvents/ServerEventTicketDto';

export default defineComponent({
	data() {
		return {
			webSocket: {} as WebSocket,
			message: '' as string
		};
	},
	methods: {
		async getWsTicket(): Promise<void> {
			const ticket: ServerEventTicketDto = await ServerEventsService.getWsTicket(WsChannel.CLAN_FORUM);
			this.webSocket = await ServerEventsService.connectToWs(ticket);
		},
		sendMessage(): void {
			this.webSocket.send(this.message);
		}
	}
});
</script>

<style lang="scss" scoped>
input[type='text'],
input[type='number'],
select {
	padding: 5px;
	margin-top: 5px;
	margin-bottom: 10px;
	border: 1px solid #c88f44;
	background-color: #f3ca92;
	color: #710;
}
button {
	margin-top: 20px;
	background-color: #c64e36;
	color: #fffdba;
	border: 1px solid #c64e36;
	padding: 5px 20px;
	cursor: pointer;
	margin-right: 10px;
}
</style>
