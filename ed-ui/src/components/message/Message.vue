<template>
	<div class="mb-[10px] ml-[-12px] flex h-auto w-full flex-col border-2 border-[#704328] bg-[#cb7c49] p-[5px] italic">
		<div class="mb-[10px] flex items-center justify-between bg-[#ae6139] p-[5px] px-[10px]">
			<DZUser :user="message.sender" />
			<div class="text-xl">{{ formatDate(message.createdAt.toString()) }}</div>
		</div>
		<div class="p-[5px]" v-html="message.content" />
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import DZUser from '../common/DZUser.vue';
import { Message } from '@drpg/core/models/messagerie/threadsBasic';
import { localStore } from '../../store/index.js';

export default defineComponent({
	name: 'Message',
	props: {
		message: { type: Object as PropType<Message>, required: true }
	},
	data() {
		return {
			localStore: localStore()
		};
	},
	components: { DZUser },
	methods: {
		formatDate(dateString: string) {
			const date = new Date(dateString);
			const lang = this.localStore.getLanguage;
			const formatter = new Intl.DateTimeFormat(lang ?? 'fr', { month: 'long' });
			const day = String(date.getDate()).padStart(2, '0'); // Ajoute un '0' si nécessaire
			const month = formatter.format(date);
			const year = date.getFullYear();
			return `${day} ${month} ${year}`;
		}
	}
});
</script>

<style scoped lang="scss"></style>
