<template>
	<TitleHeader :title="$t('pageTitle.forum')" :header="$t('pageTitle.forum')" />
	<!--	<DZButton class="new" @click="newThread()">Nouveau Sujet</DZButton>-->
	<div v-for="day in threads" :key="day.date.getDate()">
		<div class="date">{{ formatDate(day.date) }}</div>
		<div v-for="thread in day.threads" :key="thread.id" class="thread">
			<div class="icon"></div>
			<RouterLink class="title" :to="`/forum/${thread.id}/1`">{{ thread.title }}</RouterLink>
			<div class="quantity">{{ thread.posts.count }}</div>
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
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ForumService } from '../services/ForumService.js';
import { errorHandler } from '../utils/index.js';
import { DatedThread, Thread } from '@drpg/core/models/forum/Forum';
import { localStore } from '../store/index.js';
import TitleHeader from '../components/utils/TitleHeader.vue';

export default defineComponent({
	name: 'ForumPage',
	components: { TitleHeader },
	data() {
		return {
			threads: [] as DatedThread[],
			totalPages: 0,
			currentPage: 1,
			localStore: localStore()
		};
	},
	methods: {
		formatDate(dateString: string) {
			const date = new Date(dateString);
			const lang = this.localStore.getLanguage;
			const dateFormatter = new Intl.DateTimeFormat(lang ?? 'fr', {
				day: '2-digit',
				month: 'long',
				year: 'numeric'
			});
			const formattedDate = dateFormatter.format(date);
			/*const timeFormatter = new Intl.DateTimeFormat(lang ?? 'fr', {
				hour: '2-digit',
				minute: '2-digit',
				hour12: false
			});
			const formattedTime = timeFormatter.format(date);*/
			return `${formattedDate}`;
		},
		lastPoster(thread: Thread) {
			return thread.posts;
		},
		newThread() {
			this.$router.push({ name: 'ForumNewMessage' });
		},
		async refresh() {
			try {
				const threads = await ForumService.getPageThreads(this.currentPage);
				threads.items.forEach(t => {
					const date = new Date(t.ctime).toLocaleDateString();
					if (!this.threads.map(a => a.date.toLocaleDateString()).includes(date)) {
						this.threads.push({ date: new Date(t.ctime), threads: [t] });
					} else {
						const index = this.threads.findIndex(a => a.date.toLocaleDateString() === date);
						this.threads[index].threads.push(t);
					}
				});
				this.totalPages = Math.round(threads.count / 20);
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		},
		async previousPage() {
			if (this.currentPage > 1) {
				try {
					this.currentPage--;
					this.threads = [];
					await this.refresh();
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
					this.threads = [];
					await this.refresh();
				} catch (error) {
					errorHandler.handle(error, this.$toast);
					return;
				}
			}
		}
	},
	async mounted() {
		await this.refresh();
	}
});
</script>

<style scoped lang="scss">
.new {
	margin: 2px;
	width: fit-content;
}
.date {
	display: flex;
	background-color: #ae6139;
	align-items: center;
	gap: 0.75rem;
	padding: 4px;
	justify-content: space-between;
	color: #ffee92;
}
.thread {
	display: flex;
	gap: 10px;
	background-color: #eab77e;
	cursor: pointer;
	font-size: 13px;
	font-weight: bold;
	//font-family: 'Century Gothic', 'Arial', 'Trebuchet MS', Verdana, sans-serif;
	vertical-align: middle;
	white-space: nowrap;
	font-variant-alternates: normal;
	font-variant-caps: normal;
	font-variant-east-asian: normal;
	font-variant-ligatures: normal;
	font-variant-numeric: normal;
	font-variant-position: normal;
	padding: 3px 2px;
	.icon {
		opacity: 0.7;
	}
	.title {
		width: 100%;
		text-decoration: none;
	}
	&:hover {
		box-shadow: inset 0px 0px 2px rgba(0, 0, 0, 0.4);
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
