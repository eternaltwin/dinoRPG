<template>
	<div id="threadPannel">
		<div class="title">
			<img :src="getImgURL('icons', 'small_browse_next')" />
			<p>{{ $t('messagerie.conversation') }}</p>
		</div>
		<div class="buttons">
			<div class="clickable" @click="refresh()">
				<img :src="getImgURL('icons', 'refresh')" />
				<p>{{ $t('messagerie.actualizeThread') }}</p>
			</div>
			<div @click="answerMsg()" class="clickable">
				<img :src="getImgURL('icons', 'edit')" />
				<p>{{ $t('messagerie.responseConv') }}</p>
			</div>
			<!--			<div
				class="clickable"
			>
				<img :src="getImgURL('icons', 'pin')" />
				<span>{{ $t('messagerie.pinnedConv') }}</span>
			</div>
			<div
				class="clickable"
			>
				<img :src="getImgURL('icons', 'small_delete')" />
				<span>{{ $t('messagerie.deletedConv') }}</span>
			</div>-->
			<div class="clickable" @click="showParticipants = !showParticipants">
				<img :src="getImgURL('icons', 'player')" />
				<p>{{ $t('messagerie.participantsConv') }}</p>
			</div>
			<!--			<div
				class="clickable"
			>
				<img :src="getImgURL('icons', 'small_lock')" />
				<span>{{ $t('messagerie.blockSender') }}</span>
			</div>-->
		</div>
		<div id="participants" v-if="showParticipants && myThread">
			<DZUser v-for="user in myThread.participants" :user="user.player" :key="user.player.id" />
		</div>
	</div>
	<div v-if="answerMode" class="answer">
		<Ckeditor :editor="editor" v-model="answer" />
		<DZButton @click="sendMessage()">{{ $t('messagerie.newMsgSend') }}</DZButton>
	</div>
	<div v-if="myThread && myThread.pinnedMessage">
		<Message :message="myThread.pinnedMessage" />
	</div>
	<div id="conversation" v-if="myThread" @scroll="onScroll">
		<Message v-for="message in myThread.messages" :key="message.id" :message="message" />
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DZButton from '../common/DZButton.vue';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { FullThread } from '@drpg/core/models/messagerie/threadsBasic';
import { localStore } from '../../store/index.js';
import Message from './Message.vue';
import { MessagerieService } from '../../services/MessagerieService.js';
import { errorHandler } from '../../utils/index.js';
import DZUser from '../common/DZUser.vue';

export default defineComponent({
	name: 'Thread',
	props: {
		threadId: { type: String, required: true }
	},
	data() {
		return {
			editor: ClassicEditor,
			answerMode: false as boolean,
			localStore: localStore(),
			answer: undefined as undefined | string,
			myThread: undefined as undefined | FullThread,
			currentThreadPage: 1,
			showParticipants: false as boolean
		};
	},
	components: { DZUser, Message, DZButton },
	methods: {
		async answerMsg() {
			this.answerMode = true;
		},
		async refresh() {
			try {
				this.myThread = undefined;
				this.myThread = await MessagerieService.getThread(this.threadId);
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
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
			if (!this.answer || !this.myThread) return;
			try {
				const updatedThread = await MessagerieService.answerThread(this.myThread.id, this.answer);
				this.myThread.messages = updatedThread.messages;
				this.answer = '';
				this.myThread = await MessagerieService.getThread(this.threadId);
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		onScroll(e) {
			const { scrollTop, offsetHeight, scrollHeight } = e.target;
			if (
				this.myThread &&
				scrollTop + offsetHeight >= scrollHeight &&
				this.myThread.messages.length - 10 * this.currentThreadPage >= 0
			) {
				this.currentThreadPage++;
				console.log(this.currentThreadPage);
			}
		}
	},
	watch: {
		async threadId() {
			this.myThread = undefined;
			this.myThread = await MessagerieService.getThread(this.threadId);
		},
		async currentThreadPage() {
			if (this.myThread && this.currentThreadPage > 1) {
				const olderMessages = await MessagerieService.loadMessages(this.myThread.id, this.currentThreadPage);
				this.myThread.messages.push(...olderMessages.messages);
			}
		}
	},
	async mounted() {
		console.log('mounted');
		try {
			this.myThread = await MessagerieService.getThread(this.threadId);
		} catch (e) {
			errorHandler.handle(e, this.$toast);
		}
	},
	unmounted() {
		console.log('unmount');
	}
});
</script>

<style scoped lang="scss">
#threadPannel {
	display: flex;
	flex-direction: column;
	background-color: rgb(203 124 73);
	border-color: rgb(112 67 40);
	font-style: italic;
	border-style: solid;
	border-width: 2px;
	//mb-[10px] ml-[-12px] mt-[-18px] flex h-auto w-full flex-col border-2 border-[#704328] bg-[#cb7c49] p-[5px] italic
	.title {
		display: flex;
		background-color: rgb(174 97 57);
		align-items: center;
		gap: 0.75rem;
		padding: 4px;
		max-width: calc(100% - 8px);
	}
	.buttons {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-around;
		padding: 4px;
		gap: 5px;
		.clickable {
			display: flex;
			box-shadow: rgba(0, 0, 0, 0.3) 0px 0px 3px;
			text-align: center;
			gap: 0.5rem;
			align-items: center;
			cursor: pointer;
			padding: 6px;
			&:hover {
				background-color: rgb(174 97 57);
			}
		}
	}
	#participants {
		display: flex;
		justify-content: space-around;
		//flex justify-around
	}
}
.answer {
	//mb-[10px] ml-[-12px] flex h-auto w-full flex-col gap-2 border-2 border-[#704328] bg-[#cb7c49] p-[5px]
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 0.5rem;
	background-color: #cb7c49;
	border-color: #704328;
	border-style: solid;
	border-width: 2px;
}
#conversation {
	display: flex;
	flex-direction: column;
	gap: 5px;
	overflow-y: auto;
	//max-height: 90%;
	//height: ;
}
</style>
