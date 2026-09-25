<template>
	<TitleHeader :title="$t('pageTitle.forum')" :header="title" />

	<div v-if="reauthorize" class="notice">
		<p>{{ $t('forum.error.reauthorize') }}</p>
	</div>

	<template v-else>
		<div class="wrapper" v-if="messages.length > 0">
			<div v-for="message in messages" :key="message.id" class="container">
				<div class="sender">
					<DZUser :user="{ id: message.author.user.id, name: message.author.user.display_name.current.value }" />
					<div class="date">
						{{ formatDate(message.ctime) }}
						<span v-if="message.revisions.count > 1" class="edited">{{ $t('forum.edited') }}</span>
					</div>
				</div>

				<div class="message" v-if="editingPostId === message.id">
					<ForumEditor v-model="editContent" :grammar="grammar" :disabled="sending" />
					<div class="actions">
						<DZButton :off="sending" @click="saveEdit()">{{ $t('forum.edit.submit') }}</DZButton>
						<DZButton @click="cancelEdit()">{{ $t('forum.cancel') }}</DZButton>
					</div>
				</div>
				<template v-else>
					<div class="message" v-if="message.revisions.last.content" v-html="message.revisions.last.content.html" />
					<div class="message moderated" v-else>{{ $t('forum.moderated') }}</div>
					<div class="post-actions" v-if="message.self?.can_edit">
						<a @click="startEdit(message)">{{ $t('forum.edit.open') }}</a>
					</div>
				</template>
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

		<div class="reply" v-if="canPost">
			<p class="label">{{ $t('forum.reply.title') }}</p>
			<ForumEditor
				v-model="replyContent"
				:grammar="grammar"
				:disabled="sending"
				:placeholder="$t('forum.reply.placeholder')"
			/>
			<div class="actions">
				<DZButton :off="!canSendReply" @click="sendReply()">{{ $t('forum.reply.submit') }}</DZButton>
			</div>
		</div>
		<p class="notice" v-else-if="isLocked">{{ $t('forum.locked') }}</p>

		<DZButton @click="goBack()">{{ $t('button.return') }}</DZButton>
	</template>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ForumService } from '../../services/ForumService.js';
import { ForumErrorCode, handleForumError } from '../../utils/index.js';
import { ForumGrammar, Thread, forumPost } from '@drpg/core/models/forum/Forum';
import DZUser from '../common/DZUser.vue';
import { localStore } from '../../store/index.js';
import TitleHeader from '../utils/TitleHeader.vue';
import DZButton from '../common/DZButton.vue';
import ForumEditor from './ForumEditor.vue';
import { formatDateTime } from '../../utils/formatDateTime';

export default defineComponent({
	name: 'ForumThread',
	components: { DZButton, TitleHeader, DZUser, ForumEditor },
	data() {
		return {
			thread: undefined as undefined | Thread,
			totalPages: 1,
			currentPage: 1,
			title: undefined as undefined | string,
			messages: [] as forumPost[],
			replyContent: '',
			editingPostId: undefined as undefined | string,
			editContent: '',
			sending: false,
			reauthorize: false,
			localStore: localStore()
		};
	},
	computed: {
		threadId(): string {
			return this.$route.params.threadId as string;
		},
		/** Served by the server alongside the section; never derived from the player's roles. */
		grammar(): ForumGrammar | undefined {
			return this.thread?.section?.self?.grammar;
		},
		/**
		 * Whether to draw the reply box.
		 *
		 * The server computes this with the same predicate its write path enforces — a locked
		 * thread, a mute and a token without `forum:write` all land here — so a box that shows is a
		 * box that works. Nothing is re-derived from `is_locked` or from who the player is.
		 */
		canPost(): boolean {
			return this.thread?.self?.can_post === true;
		},
		isLocked(): boolean {
			return this.thread?.is_locked === true;
		},
		canSendReply(): boolean {
			return !this.sending && this.replyContent.trim().length > 0;
		}
	},
	methods: {
		/** Back to the section the thread lives in, or to the forum root if it is not known yet. */
		goBack() {
			const sectionId = this.thread?.section?.id;
			if (sectionId) {
				this.$router.push({ name: 'ForumSection', params: { sectionId } });
			} else {
				this.$router.push({ name: 'Forum' });
			}
		},
		formatDate(dateString: string) {
			return formatDateTime(dateString);
		},
		async readThread() {
			this.currentPage = Math.max(1, +this.$route.params.page || 1);
			try {
				const thread = await ForumService.getThread(this.threadId, this.currentPage);
				this.thread = thread;
				this.reauthorize = false;
				this.title = thread.title;
				this.messages = thread.posts.items ?? [];
				this.totalPages = Math.max(1, Math.ceil(thread.posts.count / (thread.posts.limit ?? 1)));
			} catch (e) {
				this.messages = [];
				this.reauthorize = handleForumError(e, this.$t, this.$toast) === ForumErrorCode.Reauthorize;
			}
		},
		goToPage(page: number) {
			if (page === this.currentPage) {
				return this.readThread();
			}
			this.$router.push({ name: 'ForumThread', params: { threadId: this.threadId, page } });
		},
		previousPage() {
			if (this.currentPage > 1) {
				this.goToPage(this.currentPage - 1);
			}
		},
		nextPage() {
			if (this.currentPage < this.totalPages) {
				this.goToPage(this.currentPage + 1);
			}
		},
		async sendReply() {
			if (!this.canSendReply) return;

			this.sending = true;
			try {
				await ForumService.replyToThread(this.threadId, this.replyContent);
				this.replyContent = '';
				// The reply is the newest post, so it sits on the last page — which the reply itself
				// may just have created.
				const count = (this.thread?.posts.count ?? 0) + 1;
				this.goToPage(Math.max(1, Math.ceil(count / (this.thread?.posts.limit ?? 1))));
			} catch (e) {
				handleForumError(e, this.$t, this.$toast);
			} finally {
				this.sending = false;
			}
		},
		/**
		 * Open an editor on a post.
		 *
		 * The Marktwin source comes from its own endpoint: a read only carries the rendered HTML,
		 * and editing that would send markup back through the parser a second time.
		 */
		async startEdit(post: forumPost) {
			try {
				const source = await ForumService.getPostSource(post.id);
				this.editContent = source.revisions.last.content?.marktwin ?? '';
				this.editingPostId = post.id;
			} catch (e) {
				handleForumError(e, this.$t, this.$toast);
			}
		},
		cancelEdit() {
			this.editingPostId = undefined;
			this.editContent = '';
		},
		async saveEdit() {
			if (this.sending || this.editingPostId === undefined || this.editContent.trim().length === 0) return;

			this.sending = true;
			try {
				await ForumService.updatePost(this.editingPostId, this.editContent);
				this.cancelEdit();
				await this.readThread();
			} catch (e) {
				// A refusal here is final — someone replied since, or a moderator rewrote the post.
				// The editor stays open so nothing typed is lost.
				handleForumError(e, this.$t, this.$toast);
			} finally {
				this.sending = false;
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
.notice {
	background-color: #cb7c49;
	color: #ffee92;
	padding: 8px;
	margin: 4px 0;
	font-size: 13px;
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
			.edited {
				font-size: 0.75rem;
				font-style: italic;
				margin-left: 4px;
			}
		}
	}
	.message {
		padding: 5px;
		font-feature-settings: normal;
		font-size: 16px;
		font-variation-settings: normal;
		// A pasted URL is one long word: without this it pushes the post wider than the page.
		overflow-wrap: break-word;
		&.moderated {
			font-style: italic;
			opacity: 0.8;
		}

		// --- The rendered Marktwin ---------------------------------------------------------------
		// `v-html`, so scoped selectors miss it: every rule below has to go through `:deep`.
		//
		// This is the whole set marktwin 0.5 emits (`src/emitter.rs`): `<strong>`, `<em>`,
		// `span.strikethrough`, `<a>`, `<br />`, `div.mod` for `[mod]` and `div.mkt-admin` for
		// `[admin]`. Icons emit `span.mkt-icon mkt-icon-<key>` and are left alone: Eternaltwin
		// serves an empty icon list, so no key can reach us and there is no sprite to point at.
		:deep(a) {
			color: #fff1ad;
			font-variant: normal;
			text-decoration: underline;
			&:hover {
				color: #ffffff;
			}
		}
		:deep(strong) {
			font-weight: bold;
			color: #ffffff;
		}
		:deep(em) {
			font-style: italic;
		}
		:deep(.strikethrough) {
			text-decoration: line-through;
		}
		// Who is speaking, said with a frame and an icon rather than a caption: `content:` cannot be
		// translated, and the markup carries no text for the four locales to key off. The icons are
		// Eternaltwin's own (`packages/website/src/static/assets/icons`), so the same `[mod]` block
		// wears the same badge on both sites.
		:deep(.mod),
		:deep(.mkt-admin) {
			margin: 6px 0;
			padding: 8px 8px 8px 26px;
			border: 1px solid transparent;
			border-bottom-width: 3px;
			border-radius: 3px;
			background-repeat: no-repeat;
			background-position: 6px 9px;
		}
		:deep(.mod) {
			border-color: #ff9c5b;
			background-color: #8d3e17;
			background-image: url('../../assets/icons/warning.png');
			// The warning is 8px wide against the announce's 16: nudged to sit centred in the same
			// gutter, so the two blocks still line up when a post carries both.
			background-position-x: 9px;
		}
		:deep(.mkt-admin) {
			border-color: #f9c825;
			background-color: #5d2a11;
			background-image: url('../../assets/icons/adminAnnounce.png');
		}
	}
	.post-actions {
		display: flex;
		justify-content: end;
		padding: 0 5px 3px;
		a {
			cursor: pointer;
			font-size: 12px;
			text-decoration: underline;
		}
	}
}
.reply {
	display: flex;
	flex-direction: column;
	gap: 5px;
	background-color: #cb7c49;
	color: #ffee92;
	padding: 4px;
	margin-top: 10px;
	.label {
		font-weight: bold;
	}
}
.actions {
	display: flex;
	justify-content: end;
	gap: 5px;
	padding: 4px 0;
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
