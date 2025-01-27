<template>
	<TitleHeader :title="$t('pageTitle.forum')" :header="title" />
	<div class="wrapper" v-if="messages.length > 0">
		<div v-for="message in messages" :key="message.id" class="container">
			<div class="sender">
				<DZUser :user="{ id: message.author.user.id, name: message.author.user.display_name.current.value }" />
				<div class="date">{{ formatDate(message.ctime) }}</div>
			</div>
			<div class="message" v-html="message.revisions.last.content.html" />
		</div>
	</div>
	<tr class="pagination-controls">
		<button @click="previousPage" :disabled="currentPage === 1">
			<img class="left" src="/src/assets/button/button-back-arrow.webp" />
		</button>
		<span>{{ currentPage }} / {{ totalPages }}</span>
		<button @click="nextPage" :disabled="currentPage === totalPages">
			<img class="right" src="/src/assets/button/button-back-arrow.webp" />
		</button>
	</tr>
	<DZButton @click="goBack()">{{ $t('myAccount.options.retour') }}</DZButton>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ForumService } from '../../services/ForumService.js';
import { errorHandler } from '../../utils/index.js';
import { forumPost, posts } from '@drpg/core/models/forum/Forum';
import DZUser from '../common/DZUser.vue';
import { localStore } from '../../store/index.js';
import TitleHeader from '../utils/TitleHeader.vue';
import DZButton from '../common/DZButton.vue';

export default defineComponent({
	name: 'ForumThread',
	components: { DZButton, TitleHeader, DZUser },
	data() {
		return {
			thread: undefined as undefined | posts,
			totalPages: 1,
			currentPage: 1,
			title: undefined as undefined | string,
			messages: [] as forumPost[],
			localStore: localStore()
		};
	},
	methods: {
		goBack() {
			this.$router.push({ name: 'Forum' });
		},
		formatDate(dateString: string) {
			const date = new Date(dateString);
			const lang = this.localStore.getLanguage ?? 'fr';

			// Formatter pour la date (jour, mois, année)
			const dateFormatter = new Intl.DateTimeFormat(lang, { day: '2-digit', month: 'short', year: 'numeric' });
			const formattedDate = dateFormatter.format(date);

			// Formatter pour l'heure (heure, minute, seconde)
			const timeFormatter = new Intl.DateTimeFormat(lang, {
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
				hour12: false
			});
			const formattedTime = timeFormatter.format(date);

			// Combinaison date + heure
			return `${formattedDate}, ${formattedTime}`;
		},
		async readThread() {
			const id = this.$route.params.threadId as string;
			const page = +this.$route.params.page;
			try {
				const response = await ForumService.getThread(id, page);
				this.thread = response.thread;
				this.title = response.title;
				if (response.thread.items) {
					this.messages = response.thread.items;
				}
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		async previousPage() {
			if (this.currentPage > 1) {
				try {
					this.currentPage--;
					await this.readThread();
				} catch (error) {
					errorHandler.handle(error, this.$toast);
					return;
				}
			}
		},
		async nextPage() {
			if (this.currentPage < this.totalPages) {
				try {
					this.currentPage++;
					await this.readThread();
				} catch (error) {
					errorHandler.handle(error, this.$toast);
					return;
				}
			}
		}
	},
	async mounted() {
		await this.readThread();
	}
});
</script>

<style scoped lang="scss">
.wrapper {
	display: flex;
	flex-direction: column;
	gap: 5px;
	overflow-y: auto;
}
.container {
	display: flex;
	flex-direction: column;
	background-color: rgb(203 124 73);
	border-color: rgb(112 67 40);
	border-style: solid;
	color: #ffee92;
	border-width: 2px;
	.sender {
		display: flex;
		background-color: rgb(174 97 57);
		align-items: center;
		gap: 0.75rem;
		padding: 4px;
		justify-content: space-between;
		.date {
			font-size: 1rem;
			line-height: 1.75rem;
		}
	}
	.message {
		padding: 5px;
		font-feature-settings: normal;
		font-size: 16px;
		font-variation-settings: normal;
	}
}
.pagination-controls {
	margin-top: 10px;
	display: flex;
	justify-content: center;
	align-items: center;
	button {
		background-color: transparent;
		margin: 0 10px;
		padding: 5px 10px;
		border: none;
		cursor: pointer;
		&:disabled {
			cursor: not-allowed;
		}
		.left,
		.right {
			height: auto;
			width: 10px;
		}
		.right {
			transform: rotate(180deg);
		}
	}
}
</style>
