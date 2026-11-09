<template>
	<div class="clan-chat" data-testid="clan-chat">
		<div ref="scroller" class="messages" @scroll="onScroll">
			<DZButton v-if="canLoadMore" :off="loadingMore" class="more" data-testid="chat-more" @click="loadMore">{{
				$t('clanChampionship.chat.more')
			}}</DZButton>
			<p v-if="loaded && messages.length === 0" class="muted">{{ $t('clanChampionship.chat.empty') }}</p>
			<div
				v-for="msg in messages"
				:key="msg.id"
				class="message"
				:class="{ self: isSelf(msg) }"
				data-testid="chat-message"
			>
				<div class="head">
					<RouterLink v-if="msg.author" class="author" :to="{ name: 'Account', params: { id: msg.author.id } }">
						<img v-if="isLeader(msg)" src="\src\assets\icons\crown.png" alt="" />
						{{ msg.author.name }}
					</RouterLink>
					<span v-else class="author">{{ msg.authorName }}</span>
					<span class="date">{{ formatDateTime(String(msg.date)) }}</span>
					<button
						v-if="canDelete(msg)"
						type="button"
						class="delete"
						:title="$t('messagerie.deletedConv')"
						@click="deleteMessage(msg)"
					>
						✕
					</button>
				</div>
				<div class="content mkt-content" v-html="sanitizeHtml(msg.content)" />
			</div>
		</div>

		<p v-if="connectionLost" class="error">{{ $t('clan.forum.connectionFailed') }}</p>
		<MarktwinEditor
			v-model="draft"
			:grammar="PLAYER_MARKTWIN_GRAMMAR"
			:maxlength="PLAYER_MESSAGE_MAX_LENGTH"
			:placeholder="$t('clanChampionship.chat.placeholder')"
			:disabled="!clanSocket.connected.value"
			:rows="2"
			@submit="send"
		/>
		<DZButton :off="!clanSocket.connected.value || draft.trim().length === 0" data-testid="chat-send" @click="send">{{
			$t('clanChampionship.chat.send')
		}}</DZButton>
	</div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toast-notification';
import type { CreateClanMessage } from '@drpg/core/models/clan/CreateClanMessage';
import { WsMessageAction } from '@drpg/core/models/serverEvents/WsMessageAction';
import type { WsMsgRequestCreation } from '@drpg/core/models/serverEvents/WsMsgRequestCreation';
import type { WsMsgRequestDeletion } from '@drpg/core/models/serverEvents/WsMsgRequestDeletion';
import { PLAYER_MARKTWIN_GRAMMAR, PLAYER_MESSAGE_MAX_LENGTH } from '@drpg/core/utils/marktwin';
import { ClanService } from '../../services';
import { clanSocket } from '../../services/clanSocket';
import { playerStore } from '../../store';
import { errorHandler } from '../../utils';
import { formatDateTime } from '../../utils/formatDateTime';
import { sanitizeHtml } from '../../utils/sanitizeHtml';
import { confirm } from '../../mixin/confirmPlugin';
import DZButton from '../common/DZButton.vue';
import MarktwinEditor from '../common/MarktwinEditor.vue';

/** Size of a page of `GET /clan/:id/messages/:page`. */
const PAGE_SIZE = 20;
/** Distance to the bottom under which the reader still follows the conversation. */
const STICK_THRESHOLD = 40;
const CONNECTION_GRACE = 3000;

const props = defineProps<{ clanId: number }>();
const emit = defineEmits<{ unread: [] }>();

const { t } = useI18n();
const $toast = useToast();
const player = playerStore();

/** Oldest first, like a chat. */
const messages = ref<CreateClanMessage[]>([]);
const draft = ref('');
const loaded = ref(false);
const loadingMore = ref(false);
const exhausted = ref(false);
/** Next page to load: pages shift as new messages arrive, the merge drops what is already shown. */
let nextPage = 2;
const scroller = ref<HTMLElement | null>(null);
let stickToBottom = true;

const connectionAttempted = ref(false);
const connectionLost = computed(() => connectionAttempted.value && !clanSocket.connected.value);
let connectionTimer: ReturnType<typeof setTimeout> | undefined;
let unmounted = false;

const canLoadMore = computed(() => loaded.value && !exhausted.value && messages.value.length >= PAGE_SIZE);

function isSelf(msg: CreateClanMessage): boolean {
	return msg.author?.id === player.playerId;
}
function isLeader(msg: CreateClanMessage): boolean {
	return !!msg.author && msg.author.id === msg.clan?.leaderId;
}
function canDelete(msg: CreateClanMessage): boolean {
	return isSelf(msg) || msg.clan?.leaderId === player.playerId;
}

function chronological(list: CreateClanMessage[]): CreateClanMessage[] {
	return [...list].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.id - b.id);
}

function merge(incoming: CreateClanMessage[]): void {
	const byId = new Map(messages.value.map(m => [m.id, m]));
	incoming.forEach(m => byId.set(m.id, m));
	messages.value = chronological([...byId.values()]);
}

function onScroll(): void {
	const el = scroller.value;
	if (!el) return;
	stickToBottom = el.scrollHeight - el.scrollTop - el.clientHeight < STICK_THRESHOLD;
}

async function scrollToBottom(force = false): Promise<void> {
	if (!force && !stickToBottom) return;
	await nextTick();
	const el = scroller.value;
	if (el) el.scrollTop = el.scrollHeight;
	stickToBottom = true;
}

/** Reads the latest page again, e.g. after a reconnection: messages may have been missed meanwhile. */
async function loadLatest(): Promise<void> {
	try {
		const page = await ClanService.getClanMessages(props.clanId, 1, true);
		if (unmounted) return;
		if (!loaded.value) messages.value = chronological(page);
		else merge(page);
		if (page.length < PAGE_SIZE) exhausted.value = true;
		loaded.value = true;
		await scrollToBottom(true);
	} catch (e) {
		if (!unmounted) errorHandler.handle(e, $toast);
	}
}

async function loadMore(): Promise<void> {
	if (loadingMore.value) return;
	loadingMore.value = true;
	const el = scroller.value;
	const fromBottom = el ? el.scrollHeight - el.scrollTop : 0;
	try {
		const page = await ClanService.getClanMessages(props.clanId, nextPage, true);
		if (unmounted) return;
		nextPage++;
		merge(page);
		if (page.length < PAGE_SIZE) exhausted.value = true;
		// Keep the reader on the message they were looking at
		await nextTick();
		if (el) el.scrollTop = el.scrollHeight - fromBottom;
	} catch (e) {
		if (!unmounted) errorHandler.handle(e, $toast);
	} finally {
		loadingMore.value = false;
	}
}

function send(): void {
	const message = draft.value.trim();
	if (message.length === 0) return;
	const payload: WsMsgRequestCreation = { action: WsMessageAction.CREATE, message: draft.value };
	if (clanSocket.send(payload)) {
		draft.value = '';
		stickToBottom = true;
	} else {
		$toast.error(t('clan.forum.connectionFailed'));
	}
}

async function deleteMessage(msg: CreateClanMessage): Promise<void> {
	const ok = await confirm({
		message: t('popup.confirm'),
		header: t('popup.attention'),
		acceptLabel: t('popup.accept'),
		rejectLabel: t('popup.reject'),
		icon: 'pi pi-trash'
	});
	if (!ok) return;
	const payload: WsMsgRequestDeletion = { action: WsMessageAction.DELETE, msgId: msg.id };
	if (!clanSocket.send(payload)) $toast.error(t('clan.forum.connectionFailed'));
}

const stopListening = clanSocket.onMessage(message => {
	if (message.action === WsMessageAction.CREATE) {
		const msg = message.payload as CreateClanMessage;
		if (messages.value.some(m => m.id === msg.id)) return;
		messages.value = [...messages.value, msg];
		if (!isSelf(msg)) emit('unread');
		void scrollToBottom(isSelf(msg));
	} else if (message.action === WsMessageAction.DELETE) {
		messages.value = messages.value.filter(m => m.id !== (message.msgId as number));
	}
});
const stopWaitingForReady = clanSocket.onReady(() => {
	if (loaded.value) void loadLatest();
});

watch(
	() => props.clanId,
	() => {
		messages.value = [];
		loaded.value = false;
		exhausted.value = false;
		nextPage = 2;
		void loadLatest();
	}
);

onMounted(() => {
	connectionTimer = setTimeout(() => (connectionAttempted.value = true), CONNECTION_GRACE);
	void loadLatest();
});

onBeforeUnmount(() => {
	unmounted = true;
	stopListening();
	stopWaitingForReady();
	if (connectionTimer) clearTimeout(connectionTimer);
});

// A parent hiding the chat with v-show calls it when showing it again: a hidden box cannot be scrolled
defineExpose({ scrollToBottom });
</script>

<style lang="scss" scoped>
.clan-chat {
	display: flex;
	flex-direction: column;
	gap: 6px;
}
.messages {
	height: 260px;
	overflow-y: auto;
	display: flex;
	flex-direction: column;
	gap: 4px;
	padding: 4px;
	background: #f6d19a;
	border: 1px solid #d19860;
	.more {
		align-self: center;
	}
}
.message {
	padding: 3px 6px;
	border-radius: 4px;
	background: rgba(255, 255, 255, 0.35);
	&.self {
		background: rgba(63, 216, 196, 0.25);
	}
	.head {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.85em;
	}
	.author {
		font-weight: bold;
		color: #7a3a1a;
		display: inline-flex;
		align-items: center;
		gap: 2px;
		img {
			height: 12px;
		}
	}
	.date {
		opacity: 0.7;
	}
	.delete {
		margin-left: auto;
		border: 0;
		background: transparent;
		color: #bf4f1e;
		cursor: pointer;
		font-size: 0.9em;
	}
	.content {
		overflow-wrap: anywhere;
	}
}
.muted {
	opacity: 0.75;
	font-size: 0.9em;
	text-align: center;
}
.error {
	color: #c0392b;
	margin: 0;
}
</style>
