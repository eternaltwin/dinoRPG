<template>
	<TitleHeader :title="$t('pageTitle.forum')" :header="$t('pageTitle.forum')" />

	<div v-if="reauthorize" class="notice">
		<p>{{ $t('forum.error.reauthorize') }}</p>
	</div>

	<template v-else>
		<DZButton v-if="canWrite && !creating" class="new" @click="creating = true">
			{{ $t('forum.newThread.open') }}
		</DZButton>
		<ForumNewMessage v-if="creating" :grammar="grammar" @created="openThread" @cancel="creating = false" />

		<p v-if="!creating && threads.length === 0" class="empty">{{ $t('forum.empty') }}</p>

		<div v-for="day in threads" :key="day.date.toDateString()">
			<div class="date">{{ formatDate(day.date) }}</div>
			<div v-for="thread in day.threads" :key="thread.id" class="thread">
				<div class="icon">
					<img v-if="thread.is_pinned" :src="getImgURL('icons', 'thread')" :alt="$t('forum.pinned')" />
				</div>
				<RouterLink class="title" :to="`/forum/${thread.id}/1`">
					{{ thread.title }}
					<span v-if="thread.is_locked" class="locked" :title="$t('forum.locked')">🔒</span>
				</RouterLink>
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
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ForumService } from '../services/ForumService.js';
import { ForumErrorCode, handleForumError } from '../utils/index.js';
import { getImgURL } from '../mixin/mixin.js';
import { DatedThread, ForumGrammar, ForumType } from '@drpg/core/models/forum/Forum';
import { localStore } from '../store/index.js';
import TitleHeader from '../components/utils/TitleHeader.vue';
import DZButton from '../components/common/DZButton.vue';
import ForumNewMessage from '../components/forum/ForumNewMessage.vue';
import { formatDate } from '../utils/formatDateTime';

export default defineComponent({
	name: 'ForumPage',
	components: { TitleHeader, DZButton, ForumNewMessage },
	data() {
		return {
			section: undefined as undefined | ForumType,
			threads: [] as DatedThread[],
			totalPages: 1,
			currentPage: 1,
			creating: false,
			/** Set when the stored Eternaltwin token is gone: nothing loads until the player signs in again. */
			reauthorize: false,
			localStore: localStore()
		};
	},
	computed: {
		/**
		 * The Marktwin the server will accept from this player here.
		 *
		 * Served, never guessed: an editor that offers markup the server strips loses it silently
		 * on save.
		 */
		grammar(): ForumGrammar | undefined {
			return this.section?.self?.grammar;
		},
		/**
		 * Whether to offer opening a thread.
		 *
		 * `ForumSectionSelf` carries no `can_create_thread`, so this is as far as the server lets us
		 * see: it answered with a `self` block, meaning it recognised the player. A refusal — muted
		 * player, token without `forum:write` — only shows up on send, and is reported then rather
		 * than hidden behind a missing button.
		 */
		canWrite(): boolean {
			return this.section?.self !== undefined;
		}
	},
	methods: {
		getImgURL,
		formatDate(date: Date) {
			return formatDate(date.toISOString());
		},
		openThread(threadId: string) {
			this.creating = false;
			this.$router.push({ name: 'ForumThread', params: { threadId, page: 1 } });
		},
		async refresh() {
			try {
				const section = await ForumService.getPageThreads(this.currentPage);
				this.section = section;
				this.reauthorize = false;
				this.threads = this.groupByDay(section);
				// The page size is the instance's, and it comes back with the listing.
				this.totalPages = Math.max(1, Math.ceil(section.threads.count / section.threads.limit));
			} catch (e) {
				this.threads = [];
				this.reauthorize = handleForumError(e, this.$t, this.$toast) === ForumErrorCode.Reauthorize;
			}
		},
		groupByDay(section: ForumType): DatedThread[] {
			const days: DatedThread[] = [];

			for (const thread of section.threads.items) {
				const date = new Date(thread.ctime);
				const day = days.find(a => a.date.toLocaleDateString() === date.toLocaleDateString());
				if (day) {
					day.threads.push(thread);
				} else {
					days.push({ date, threads: [thread] });
				}
			}

			return days;
		},
		async previousPage() {
			if (this.currentPage > 1) {
				this.currentPage--;
				await this.refresh();
			}
		},
		async nextPage() {
			if (this.currentPage < this.totalPages) {
				this.currentPage++;
				await this.refresh();
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
.notice,
.empty {
	background-color: #cb7c49;
	color: #ffee92;
	padding: 8px;
	margin: 4px 0;
	font-size: 13px;
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
		width: 16px;
		img {
			width: 16px;
			height: auto;
		}
	}
	.title {
		width: 100%;
		text-decoration: none;
	}
	.locked {
		margin-left: 4px;
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
