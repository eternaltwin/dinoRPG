<template>
	<TitleHeader :title="$t('pageTitle.forum')" :header="$t('pageTitle.forum')" />

	<div class="forum">
		<div v-if="reauthorize" class="notice">
			<p>{{ $t('forum.error.reauthorize') }}</p>
		</div>

		<template v-else-if="section">
			<ul class="bar">
				<li class="path">
					<em>
						<template v-if="section.parent">
							<RouterLink :to="{ name: 'ForumSection', params: { sectionId: section.parent.id } }">
								{{ section.parent.displayName }}
							</RouterLink>
							›
						</template>
						{{ section.displayName }}
					</em>
				</li>
				<li v-if="canWrite && !creating" class="new">
					<a @click="creating = true">{{ $t('forum.newThread.open') }}</a>
				</li>
			</ul>

			<div v-if="children.length > 0" class="themes">
				<ul>
					<li
						v-for="child in children"
						:key="child.id"
						:class="{ unread: child.self.unreadThreads > 0 }"
						@click="openSection(child.id)"
					>
						<RouterLink :to="{ name: 'ForumSection', params: { sectionId: child.id } }" @click.stop>
							{{ child.displayName }}
						</RouterLink>
						<em>
							{{ $t('forum.threadCount') }} : {{ child.threads.count }}
							<span v-if="child.self.unreadThreads > 0" class="unread-count" :title="$t('forum.unread')">
								{{ child.self.unreadThreads }}
							</span>
						</em>
					</li>
				</ul>
			</div>

			<ForumNewMessage
				v-if="creating"
				:section-id="section.id"
				:grammar="grammar"
				@created="openThread"
				@cancel="creating = false"
			/>

			<p v-if="!creating && threads.length === 0 && children.length === 0" class="empty">{{ $t('forum.empty') }}</p>

			<template v-if="threads.length > 0">
				<table class="threads">
					<thead>
						<tr>
							<th class="title">{{ $t('forum.columns.subject') }}</th>
							<th class="posts">{{ $t('forum.columns.posts') }}</th>
							<th class="lastMsg">{{ $t('forum.columns.lastPost') }}</th>
						</tr>
					</thead>
					<tbody v-for="day in threads" :key="day.date.toDateString()">
						<tr>
							<th colspan="3" class="dateSep">{{ formatDate(day.date) }}</th>
						</tr>
						<tr
							v-for="thread in day.threads"
							:key="thread.id"
							:class="{ sticky: thread.isPinned, unread: thread.self.isUnread }"
							@click="openThread(thread.id)"
						>
							<td class="title">
								<img v-if="thread.isPinned" :src="getImgURL('icons', 'thread')" :alt="$t('forum.pinned')" />
								<RouterLink :to="`/forum/${thread.id}/1`" @click.stop>{{ thread.title }}</RouterLink>
								<img
									v-if="thread.isLocked"
									class="locked"
									:src="getImgURL('icons', 'small_lock')"
									:alt="$t('forum.locked')"
									:title="$t('forum.locked')"
								/>
							</td>
							<td class="posts">{{ thread.posts.count }}</td>
							<td class="lastMsg">
								<template v-if="thread.lastPost">
									<span class="user">{{ authorName(thread.lastPost.author) }}</span>
									{{ formatTime(thread.lastPost.ctime) }}
								</template>
							</td>
						</tr>
					</tbody>
				</table>

				<div class="pagination-controls">
					<button @click="previousPage" :disabled="currentPage === 1">
						<img class="left" src="/src/assets/button/button-back-arrow.webp" />
					</button>
					<span>{{ currentPage }} / {{ totalPages }}</span>
					<button @click="nextPage" :disabled="currentPage === totalPages">
						<img class="right" src="/src/assets/button/button-back-arrow.webp" />
					</button>
				</div>
			</template>
		</template>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ForumService } from '../services/ForumService.js';
import { ForumErrorCode, handleForumError } from '../utils/index.js';
import { getImgURL } from '../mixin/mixin.js';
import { ObjectType } from '@eternaltwin/core/core/object-type';
import type { ForumActor } from '@eternaltwin/core/forum/forum-actor';
import type { ForumGrammar } from '@eternaltwin/core/forum/forum-grammar';
import type { ForumSection } from '@eternaltwin/core/forum/forum-section';
import type { ForumSectionMeta } from '@eternaltwin/core/forum/forum-section-meta';
import type { ForumThreadMeta } from '@eternaltwin/core/forum/forum-thread-meta';
import { localStore } from '../store/index.js';
import TitleHeader from '../components/utils/TitleHeader.vue';
import ForumNewMessage from '../components/forum/ForumNewMessage.vue';
import { formatDate, formatTime } from '../utils/formatDateTime';

/** Threads whose latest post falls on the same day. */
interface DatedThread {
	date: Date;
	threads: ForumThreadMeta[];
}

export default defineComponent({
	name: 'ForumPage',
	components: { TitleHeader, ForumNewMessage },
	data() {
		return {
			section: undefined as undefined | ForumSection,
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
		children(): ForumSectionMeta[] {
			return this.section?.children ?? [];
		},
		/**
		 * The Marktwin the server will accept from this player here.
		 *
		 * Served, never guessed: an editor that offers markup the server strips loses it silently
		 * on save.
		 */
		grammar(): ForumGrammar | undefined {
			return this.section?.self.grammar;
		},
		/**
		 * Whether to offer opening a thread.
		 *
		 * Computed by the server: the DinoRPG root section only groups sub-sections and takes no
		 * thread of its own, and a muted player or a token without `forum:write` land here too.
		 */
		canWrite(): boolean {
			return this.section?.self.canCreateThread === true;
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
		formatTime(date: Date) {
			return formatTime(date.toISOString());
		},
		/** A role actor only names its user to those allowed to see it, and an OAuth client has no user. */
		authorName(actor: ForumActor): string {
			const user = actor.type === ObjectType.ClientForumActor ? undefined : actor.user;
			return user?.displayName.current.value ?? '';
		},
		openSection(sectionId: string) {
			this.$router.push({ name: 'ForumSection', params: { sectionId } });
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
		groupByDay(section: ForumSection): DatedThread[] {
			const days: DatedThread[] = [];

			for (const thread of section.threads.items) {
				// Threads come ordered by their latest post, so that is the day they belong to.
				const date = thread.lastPost?.ctime ?? thread.ctime;
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
// Transcribed from the original game's `.forum` rules (data.dinorpg.com/css/104/style.css).
.forum {
	font-size: 10pt;
}
.notice,
.empty {
	background-color: #cb7c49;
	color: #ffee92;
	padding: 8px;
	margin: 4px 0;
	font-size: 13px;
}
// The original painted this bar with `forum_bar.gif`: a flat brown strip in a light orange frame.
ul.bar {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 4px 10px;
	list-style: none;
	min-height: 33px;
	margin: 0 0 4px;
	padding: 2px 8px;
	border: 1px solid #f4b862;
	outline: 1px solid #c47a3c;
	background-color: #9b5631;
	li {
		em {
			color: #f3ca92;
			font-size: 10pt;
			font-style: italic;
			a {
				color: #ffee92;
				text-decoration: none;
				&:hover {
					color: white;
				}
			}
		}
		&.new {
			margin-left: auto;
		}
		&.new a {
			display: block;
			padding: 0 5px 1px 18px;
			color: #ffee92;
			font-size: 10pt;
			cursor: pointer;
			background-image: url('../assets/icons/small_mail.webp');
			background-position: 2px 3px;
			background-repeat: no-repeat;
			&:hover {
				color: white;
				background-color: #c84b35;
			}
		}
	}
}
.themes ul {
	list-style: none;
	margin: 10px 0;
	padding: 0;
	li {
		position: relative;
		padding: 5px 5px 10px 45px;
		margin-bottom: 5px;
		background-color: #bc683c;
		background-image: url('../assets/icons/act_talk.webp');
		background-position: 5px 10px;
		background-repeat: no-repeat;
		border-radius: 10px;
		cursor: pointer;
		&:hover {
			background-color: #d65536;
		}
		a {
			color: #fce3bc;
			font-size: 15pt;
			text-decoration: none;
			background-color: transparent;
		}
		em {
			display: flex;
			align-items: center;
			gap: 6px;
			margin-top: 2px;
			font-size: 10pt;
			line-height: 10pt;
			color: #ffee92;
		}
		.unread-count {
			padding: 1px 6px;
			border-radius: 8px;
			background-color: #ffee92;
			color: #8e3e26;
			font-size: 8pt;
			font-style: normal;
			font-weight: bold;
		}
	}
}
// The original `.table` look, as `ClansList` and `Missions` already reproduce it.
table.threads {
	width: 100%;
	margin-top: 10px;
	border: 2px solid #f3d6b1;
	background-color: #ecbd84;
	border-collapse: separate;
	border-spacing: 1px;
	th {
		padding: 0 4px 8px;
		height: 41px;
		vertical-align: bottom;
		color: #fffdba;
		text-transform: uppercase;
		text-shadow: 1px 1px 0px #356847;
		font-size: 9pt;
		font-weight: bold;
		text-align: left;
		white-space: nowrap;
		border: 1px solid #356847;
		background-color: #c64e36;
		background-image: url('../assets/background/table_header.webp');
		background-position: left bottom;
		&:first-letter {
			color: #ffeebb;
		}
		&.posts {
			text-align: center;
		}
		&.dateSep {
			height: 20px;
			padding-bottom: 0;
			font-size: 10pt;
			text-transform: none;
			vertical-align: middle;
			background-position: top left;
		}
	}
	td {
		padding: 1px 5px;
		color: #bc683c;
		font-weight: normal;
		background-color: #f3ca92;
		border: 1px solid #c88f44;
		background-image: url('../assets/background/table_cell_even.webp');
		background-position: -10px 0px;
		cursor: pointer;
		a {
			color: inherit;
			font-weight: inherit;
			text-decoration: none;
		}
		&:first-child {
			padding-left: 15px;
			background-position: 0px 0px;
		}
		&.title {
			overflow-wrap: anywhere;
			img {
				width: 12px;
				height: auto;
				margin-right: 4px;
				vertical-align: -10%;
				&.locked {
					margin: 0 0 0 4px;
				}
			}
		}
		&.posts {
			width: 50px;
			text-align: center;
			font-size: 9pt;
		}
		&.lastMsg {
			width: 120px;
			font-size: 8pt;
			white-space: nowrap;
			.user {
				font-size: 9pt;
				margin-right: 4px;
			}
		}
	}
	// A thread with posts the player has not read yet: the `treaded_false` rows of the original.
	tr.unread td {
		color: black;
		font-weight: bold;
		background-image: url('../assets/background/table_cell.webp');
	}
	tr.sticky td {
		font-variant: small-caps;
		color: #d9210d;
	}
	tbody tr:hover td {
		color: white;
		border-color: #9a4029;
		background-image: url('../assets/background/table_cell_hover.webp');
	}
}
@media (max-width: 500px) {
	table.threads .lastMsg {
		display: none;
	}
}
.pagination-controls {
	margin-top: 10px;
	display: flex;
	justify-content: center;
	align-items: center;
	color: #8e3e26;
	font-weight: bold;
	button {
		background-color: transparent;
		margin: 0 10px;
		padding: 5px 10px;
		border: none;
		cursor: pointer;
		&:disabled {
			cursor: not-allowed;
			opacity: 0.4;
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
