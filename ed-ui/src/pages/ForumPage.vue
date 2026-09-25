<template>
	<TitleHeader :title="$t('pageTitle.forum')" :header="$t('pageTitle.forum')" />

	<div v-if="reauthorize" class="notice">
		<p>{{ $t('forum.error.reauthorize') }}</p>
	</div>

	<template v-else-if="section">
		<nav class="breadcrumb">
			<template v-if="section.parent">
				<RouterLink :to="{ name: 'ForumSection', params: { sectionId: section.parent.id } }">
					{{ section.parent.display_name }}
				</RouterLink>
				›
			</template>
			<span>{{ section.display_name }}</span>
		</nav>

		<div v-if="children.length > 0" class="sections">
			<RouterLink
				v-for="child in children"
				:key="child.id"
				class="section"
				:class="{ unread: (child.self?.unread_threads ?? 0) > 0 }"
				:to="{ name: 'ForumSection', params: { sectionId: child.id } }"
			>
				<span class="title">{{ child.display_name }}</span>
				<span v-if="(child.self?.unread_threads ?? 0) > 0" class="unread-count" :title="$t('forum.unread')">
					{{ child.self?.unread_threads }}
				</span>
				<span class="quantity" :title="$t('forum.threadCount')">{{ child.threads.count }}</span>
			</RouterLink>
		</div>

		<DZButton v-if="canWrite && !creating" class="new" @click="creating = true">
			{{ $t('forum.newThread.open') }}
		</DZButton>
		<ForumNewMessage
			v-if="creating"
			:section-id="section.id"
			:grammar="grammar"
			@created="openThread"
			@cancel="creating = false"
		/>

		<p v-if="!creating && threads.length === 0 && children.length === 0" class="empty">{{ $t('forum.empty') }}</p>

		<template v-if="threads.length > 0">
			<div v-for="day in threads" :key="day.date.toDateString()">
				<div class="date">{{ formatDate(day.date) }}</div>
				<div v-for="thread in day.threads" :key="thread.id" class="thread" :class="{ unread: thread.self?.is_unread }">
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
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ForumService } from '../services/ForumService.js';
import { ForumErrorCode, handleForumError } from '../utils/index.js';
import { getImgURL } from '../mixin/mixin.js';
import { DatedThread, ForumGrammar, ForumSectionSummary, ForumType } from '@drpg/core/models/forum/Forum';
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
		/** The section in the route; `undefined` for the DinoRPG root section. */
		sectionId(): string | undefined {
			return (this.$route.params.sectionId as string | undefined) || undefined;
		},
		/** Absent on instances that predate nested sections. */
		children(): ForumSectionSummary[] {
			return this.section?.children ?? [];
		},
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
		 * Computed by the server: the DinoRPG root section only groups sub-sections and takes no
		 * thread of its own, and a muted player or a token without `forum:write` land here too.
		 */
		canWrite(): boolean {
			return this.section?.self?.can_create_thread === true;
		}
	},
	watch: {
		// Moving between sections keeps this component mounted: only the route parameter changes.
		async sectionId() {
			this.currentPage = 1;
			this.creating = false;
			await this.refresh();
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
				const section = await ForumService.getSection(this.sectionId, this.currentPage);
				this.section = section;
				this.reauthorize = false;
				this.threads = this.groupByDay(section);
				// The page size is the instance's, and it comes back with the listing.
				this.totalPages = Math.max(1, Math.ceil(section.threads.count / section.threads.limit));
			} catch (e) {
				this.section = undefined;
				this.threads = [];
				this.reauthorize = handleForumError(e, this.$t, this.$toast) === ForumErrorCode.Reauthorize;
			}
		},
		groupByDay(section: ForumType): DatedThread[] {
			const days: DatedThread[] = [];

			for (const thread of section.threads.items) {
				// Threads come ordered by their latest post, so that is the day they belong to.
				const date = new Date(thread.last_post?.ctime ?? thread.ctime);
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
.breadcrumb {
	display: flex;
	flex-wrap: wrap;
	gap: 4px;
	align-items: center;
	padding: 4px;
	font-size: 13px;
	font-weight: bold;
	color: #8e3e26;
}
.sections {
	display: flex;
	flex-direction: column;
	gap: 2px;
	margin-bottom: 8px;
	.section {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 6px 4px;
		background-color: #ae6139;
		color: #ffee92;
		font-size: 14px;
		font-weight: bold;
		text-decoration: none;
		.title {
			width: 100%;
		}
		.unread-count {
			flex-shrink: 0;
			padding: 0 6px;
			border-radius: 8px;
			background-color: #ffee92;
			color: #8e3e26;
			font-size: 11px;
		}
		.quantity {
			flex-shrink: 0;
			min-width: 3.5em;
			text-align: center;
			font-size: 12px;
		}
		&:hover {
			box-shadow: inset 0px 0px 3px rgba(0, 0, 0, 0.5);
		}
	}
}
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
	&.unread .title {
		text-decoration: underline;
	}
	// How many posts the thread holds, as a badge rather than a loose number: the row is read at a
	// glance, and a fixed width keeps the counts lined up down the listing.
	.quantity {
		flex-shrink: 0;
		display: inline-flex;
		justify-content: center;
		align-items: center;
		min-width: 3.5em;
		padding: 1px 8px;
		border: 1px solid rgba(142, 62, 38, 0.35);
		border-radius: 4px;
		color: #8e3e26;
		font-size: 12px;
		letter-spacing: 0.04em;
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
