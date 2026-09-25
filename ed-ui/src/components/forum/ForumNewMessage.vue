<template>
	<div class="creationMode">
		<div class="title">
			<p>{{ $t('forum.newThread.title') }}</p>
		</div>
		<div class="messageTitle">
			<label for="threadTitle">{{ $t('forum.newThread.titleLabel') }}</label>
			<input
				type="text"
				id="threadTitle"
				v-model="titleThread"
				:maxlength="TITLE_MAX_LENGTH"
				:disabled="sending"
				:placeholder="$t('forum.newThread.titlePlaceholder')"
			/>
		</div>
		<div class="message">
			<label for="threadMessage">{{ $t('forum.newThread.messageLabel') }}</label>
			<ForumEditor
				field-id="threadMessage"
				v-model="messageThread"
				:grammar="grammar"
				:disabled="sending"
				:placeholder="$t('forum.newThread.messagePlaceholder')"
			/>
		</div>
		<p class="hint" v-if="error">{{ error }}</p>
		<div class="actions">
			<DZButton :off="!canSend" @click="send()">{{ $t('forum.newThread.submit') }}</DZButton>
			<DZButton @click="$emit('cancel')">{{ $t('forum.cancel') }}</DZButton>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import DZButton from '../common/DZButton.vue';
import ForumEditor from './ForumEditor.vue';
import { ForumService } from '../../services/ForumService.js';
import { handleForumError } from '../../utils/index.js';
import { ForumGrammar } from '@drpg/core/models/forum/Forum';

/**
 * What Eternaltwin accepts as a thread title: trimmed, 2 to 64 characters.
 * `packages/core/src/lib/forum/forum-thread-title.mts`.
 */
const TITLE_MIN_LENGTH = 2;
const TITLE_MAX_LENGTH = 64;

export default defineComponent({
	name: 'ForumNewMessage',
	components: { DZButton, ForumEditor },
	props: {
		sectionId: { type: String, required: true },
		grammar: { type: Object as PropType<ForumGrammar | undefined>, default: undefined }
	},
	emits: ['created', 'cancel'],
	data() {
		return {
			titleThread: '',
			messageThread: '',
			sending: false,
			error: '',
			TITLE_MAX_LENGTH
		};
	},
	computed: {
		canSend(): boolean {
			return (
				!this.sending && this.titleThread.trim().length >= TITLE_MIN_LENGTH && this.messageThread.trim().length > 0
			);
		}
	},
	methods: {
		async send() {
			// Checked here only to spare a round-trip: the server holds the same bounds and is the
			// one that decides.
			if (this.titleThread.trim().length < TITLE_MIN_LENGTH) {
				this.error = this.$t('forum.newThread.titleTooShort', { min: TITLE_MIN_LENGTH });
				return;
			}
			if (this.messageThread.trim().length === 0) {
				this.error = this.$t('forum.newThread.messageRequired');
				return;
			}
			if (this.sending) return;

			this.sending = true;
			this.error = '';
			try {
				const thread = await ForumService.createThread(this.sectionId, this.titleThread.trim(), this.messageThread);
				this.$emit('created', thread.id);
			} catch (e) {
				handleForumError(e, this.$t, this.$toast);
			} finally {
				this.sending = false;
			}
		}
	}
});
</script>

<style scoped lang="scss">
.creationMode {
	display: flex;
	flex-direction: column;
	gap: 15px;
	background-color: #cb7c49;
	padding: 4px;
	color: #ffee92;
	.title {
		display: flex;
		background-color: rgb(174 97 57);
		align-items: center;
		gap: 0.75rem;
		padding: 4px;
		box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
	}
	.messageTitle {
		display: flex;
		label {
			width: 25%;
		}
		input {
			background-color: #b05733;
			outline: 1px solid transparent;
			color: #ffee92;
			font-weight: 400;
			font-size: 16px;
			outline-offset: 2px;
			width: auto;
			border: none;
			padding-left: 4px;
			&:focus {
				transition: outline-color 0.5s;
				outline-color: #efdba8;
			}
		}
	}
	.message {
		display: flex;
		flex-direction: column;
		gap: 10px;
		label {
			width: 25%;
		}
	}
	.hint {
		color: #ffd7d7;
		font-size: 13px;
	}
	.actions {
		display: flex;
		justify-content: end;
		gap: 5px;
	}
}
</style>
