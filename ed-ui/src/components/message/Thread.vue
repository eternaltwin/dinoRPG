<template>
	<div
		class="mb-[10px] ml-[-12px] mt-[-18px] flex h-auto w-full flex-col border-2 border-[#704328] bg-[#cb7c49] p-[5px] italic"
	>
		<div class="flex items-center gap-3 bg-[#ae6139] p-[4px]">
			<img :src="getImgURL('icons', 'small_browse_next')" />
			<p>{{ $t('messagerie.conversation') }}</p>
		</div>
		<div class="flex flex-wrap p-[4px] md:flex-nowrap">
			<div
				class="m-[3px] flex max-w-[230px] cursor-pointer items-center gap-2 p-[6px] text-center hover:bg-[#ae6139]"
				style="box-shadow: 0 0 3px rgba(0, 0, 0, 0.3)"
			>
				<img :src="getImgURL('icons', 'refresh')" />
				<p>{{ $t('messagerie.actualizeThread') }}</p>
			</div>
			<div
				@click="answerMsg()"
				class="m-[3px] flex max-w-[105px] cursor-pointer items-center gap-2 p-[6px] text-center hover:bg-[#ae6139]"
				style="box-shadow: 0 0 3px rgba(0, 0, 0, 0.3)"
			>
				<img :src="getImgURL('icons', 'edit')" />
				<span>{{ $t('messagerie.responseConv') }}</span>
			</div>
			<div
				class="m-[3px] flex max-w-[105px] cursor-pointer items-center gap-2 p-[6px] text-center hover:bg-[#ae6139]"
				style="box-shadow: 0 0 3px rgba(0, 0, 0, 0.3)"
			>
				<img :src="getImgURL('icons', 'pin')" />
				<span>{{ $t('messagerie.pinnedConv') }}</span>
			</div>
			<div
				class="m-[3px] flex max-w-[105px] cursor-pointer items-center gap-2 p-[6px] text-center hover:bg-[#ae6139]"
				style="box-shadow: 0 0 3px rgba(0, 0, 0, 0.3)"
			>
				<img :src="getImgURL('icons', 'small_delete')" />
				<span>{{ $t('messagerie.deletedConv') }}</span>
			</div>
			<div
				class="m-[3px] flex max-w-[120px] cursor-pointer items-center gap-2 p-[6px] text-center hover:bg-[#ae6139]"
				style="box-shadow: 0 0 3px rgba(0, 0, 0, 0.3)"
			>
				<img :src="getImgURL('icons', 'player')" />
				<span>{{ $t('messagerie.participantsConv') }}</span>
			</div>
			<div
				class="m-[3px] flex max-w-[180px] cursor-pointer items-center gap-2 p-[6px] text-center hover:bg-[#ae6139]"
				style="box-shadow: 0 0 3px rgba(0, 0, 0, 0.3)"
			>
				<img :src="getImgURL('icons', 'small_lock')" />
				<span>{{ $t('messagerie.blockSender') }}</span>
			</div>
		</div>
	</div>
	<div
		v-if="answerMode"
		class="mb-[10px] ml-[-12px] flex h-auto w-full flex-col gap-2 border-2 border-[#704328] bg-[#cb7c49] p-[5px]"
	>
		<Ckeditor :editor="editor" v-model="answer" />
		<div class="flex justify-end pl-[5px]">
			<DZButton @click="sendMessage()">{{ $t('messagerie.newMsgSend') }}</DZButton>
		</div>
	</div>
	<div v-if="currentThread.pinnedMessage">
		<Message :message="currentThread.pinnedMessage" />
	</div>
	<div v-for="message in currentThread.messages" :key="message.id">
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
		async answerMsg() {
			this.answerMode = true;
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
