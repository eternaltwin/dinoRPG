<template>
	<button @click="openWebSocketConnection()">Test connection</button>
	<button @click="sendMessage()">Send message</button>
	<button @click="getDinozData()">Get dinoz data</button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { DinozService } from '../../services/index.js';

export default defineComponent({
	data() {
		return {
			webSocket: undefined
		};
	},
	methods: {
		openWebSocketConnection(): void {
			this.webSocket = new WebSocket('wss://localhost:8081');
		},
		sendMessage(): void {
			this.webSocket.send('test');
		},
		async getDinozData(): Promise<void> {
			const dinozData = await DinozService.getDinozFiche(1);
			console.log(dinozData);
		}
	}
});
</script>
