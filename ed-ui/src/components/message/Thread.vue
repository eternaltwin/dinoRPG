<template>
	<div class="thread-header">
		<DZButton @click="answerMode = true">Répondre</DZButton>
	</div>
	<div class="answerMode" v-if="answerMode">
		<Ckeditor :editor="editor" v-model="answer" />
		<DZButton @click="sendMessage()">Envoyer</DZButton>
	</div>
	<div v-if="currentThread.pinnedMessage">
		<Message :message="currentThread.pinnedMessage" />
	</div>

	<div v-for="message in currentThread.messages" :key="message.id" class="pm-message">
		<Message :message="message" />
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import DZButton from '../common/DZButton.vue';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { FullThread } from '@drpg/core/models/messagerie/threadsBasic';
import { localStore } from '../../store/index.js';
import Message from './Message.vue';
import { MessagerieService } from '../../services/MessagerieService.js';
import { errorHandler } from '../../utils/index.js';

export default defineComponent({
	name: 'Thread',
	props: {
		currentThread: { type: Object as PropType<FullThread>, required: true }
	},
	data() {
		return {
			editor: ClassicEditor,
			answerMode: false as boolean,
			localStore: localStore(),
			answer: undefined as undefined | string
		};
	},
	components: { Message, DZButton },
	methods: {
		formatDate(dateString: string) {
			const date = new Date(dateString);
			const lang = this.localStore.getLanguage;
			const formatter = new Intl.DateTimeFormat(lang ?? 'fr', { month: 'long' });
			const day = String(date.getDate()).padStart(2, '0'); // Ajoute un '0' si nécessaire
			const month = formatter.format(date);
			const year = date.getFullYear();
			return `${day} ${month} ${year}`;
		},
		async sendMessage() {
			if (!this.answer) return;
			try {
				await MessagerieService.answerThread(this.currentThread.id, this.answer);
			} catch (e) {
				errorHandler.handle(e, this.$t);
			}
		}
	}
});
</script>

<style scoped lang="scss"></style>
