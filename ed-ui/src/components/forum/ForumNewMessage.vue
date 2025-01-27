<template>
	<div class="creationMode">
		<div class="title">
			<p>{{ $t('messagerie.newMsg') }}</p>
		</div>
		<div class="messageTitle">
			<label for="title">{{ $t('messagerie.newMsgTitle') }}</label>
			<input type="text" id="title" v-model="titleThread" :placeholder="$t('messagerie.title')" />
		</div>
		<div class="message">
			<label for="message">{{ $t('messagerie.newMsgMessage') }}</label>
			<textarea id="message" v-model="messageThread" :placeholder="$t('messagerie.message')" />
		</div>
	</div>
	<DZButton @click="send()">Send</DZButton>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DZButton from '../common/DZButton.vue';
import { ForumService } from '../../services/ForumService.js';
import { errorHandler } from '../../utils/index.js';

export default defineComponent({
	name: 'ForumNewMessage',
	components: { DZButton },
	data() {
		return {
			titleThread: undefined as undefined | string,
			messageThread: undefined as undefined | string
		};
	},
	methods: {
		async send() {
			if (!this.titleThread || !this.messageThread) return;
			try {
				await ForumService.createThread(this.titleThread, this.messageThread);
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		}
	}
});
</script>

<style scoped lang="scss">
.creationMode {
	display: flex;
	flex-direction: column;
	gap: 15px;
	background-color: #cb7c49;
	padding: 4px;
	color: #ffee92;
	.title {
		display: flex;
		background-color: rgb(174 97 57);
		align-items: center;
		gap: 0.75rem;
		padding: 4px;
		box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
	}
	.messageTitle {
		display: flex;
		label {
			width: 25%;
		}
		input {
			background-color: #b05733;
			outline: 1px solid transparent;
			color: #ffee92;
			font-weight: 400;
			font-size: 16px;
			outline-offset: 2px;
			width: auto;
			border: none;
			padding-left: 4px;
			&:focus {
				transition: outline-color 0.5s;
				outline-color: #efdba8;
			}
		}
	}
	.search {
		display: flex;
		label {
			width: 25%;
		}
	}
	.participants {
		display: flex;
		justify-content: center;
		width: 100%;
		gap: 3px;
	}
	.message {
		display: flex;
		flex-direction: column;
		gap: 10px;
		label {
			width: 25%;
		}
		textarea {
			background-color: #b05733;
			outline: 1px solid transparent;
			color: #ffee92;
			font-weight: 400;
			font-size: 16px;
			outline-offset: 2px;
			width: 100%;
			border: none;
			padding-left: 4px;
			&:focus {
				transition: outline-color 0.5s;
				outline-color: #efdba8;
			}
		}
	}
	.send {
		display: flex;
		justify-content: end;
	}
}
</style>
