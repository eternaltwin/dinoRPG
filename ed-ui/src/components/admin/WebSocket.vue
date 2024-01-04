<template>
	<button @click="getWsTicket()">Test connection</button>
	<button @click="sendMessage()">Send message</button>
	<input type="text" placeholder="Message to send" v-model="message" @keyup.enter="sendMessage()" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { DinozService } from '../../services/index.js';
import { WebSocketService } from '../../services/WebSocketService.js';
import { WsChannel } from '@drpg/core/models/webSocket/WsChannel';

export default defineComponent({
	data() {
		return {
			webSocket: {} as WebSocket,
			message: '' as string
		};
	},
	methods: {
		async getWsTicket(): Promise<void> {
			const ticket = await WebSocketService.getWsTicket(WsChannel.CLAN_FORUM);
			this.webSocket = new WebSocket(`ws://localhost:8081?ticket=${ticket}`);
		},
		sendMessage(): void {
			this.webSocket.send(this.message);
		},
		async getDinozData(): Promise<void> {
			const dinozData = await DinozService.getDinozFiche(4);
			console.log(dinozData);
		}
	}
});
</script>
