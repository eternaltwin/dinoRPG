<template>
	<div class="new-message-container" v-if="hasAccess">
		<div v-if="isConnectionOk">
			<Editor v-model="newMessage" />
		</div>

		<div v-if="isConnectionOk === false" class="msg-error">
			<p>{{ t('clan.forum.connectionFailed') }}</p>
			<p>{{ t('clan.forum.connectionFailed2') }}</p>
		</div>

		<div class="button-land">
			<a class="button" @click="createNewMessage()">{{ t('clanDiscussion.action.create') }}</a>
		</div>
	</div>

	<div class="page-content" v-if="hasAccess">
		<div class="discussion" v-if="messages">
			<ClanMessageItem
				v-for="msg in messages"
				:key="msg.id"
				:author="msg.author"
				:itsLeader="isLeader(msg)"
				:contentHtml="msg.content"
				:date="msg.date"
				:topItem="getTopItem(msg.author?.playerTracking ?? [])"
				:isSelf="isSelf(msg)"
				:canDelete="canDeleteMessage(msg)"
				@delete="deleteMessage(msg)"
				@openProfile="goToPlayer(msg.author?.id ?? '1')"
			/>
		</div>

		<div class="switch-page-container">
			<div class="arrow-button">
				<img src="\src\assets\icons\left.webp" alt="left" @click="changePage(-1)" v-if="page > 1" />
			</div>

			<p>{{ t('clanDiscussion.pagination.page') }} {{ page }} / {{ maxPage }}</p>

			<div class="arrow-button">
				<img src="\src\assets\icons\right.webp" alt="right" @click="changePage(1)" v-if="messages.length >= 20" />
			</div>
		</div>
		<div class="page-selector">
			<p>{{ t('clanDiscussion.pagination.go_to') }}</p>
			<input type="number" v-model="pageSelector" />
			<button @click="goToSelectedPage()">Go !</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { getCurrentInstance, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import { CreateClanMessage } from '@drpg/core/models/clan/CreateClanMessage';
import { WsChannel } from '@drpg/core/models/serverEvents/WsChannel';
import { WsMessageAction } from '@drpg/core/models/serverEvents/WsMessageAction';
import { WsMsgRequestCreation } from '@drpg/core/models/serverEvents/WsMsgRequestCreation';
import { WsMsgRequestDeletion } from '@drpg/core/models/serverEvents/WsMsgRequestDeletion';
import { WsMsgResponse } from '@drpg/core/models/serverEvents/WsMsgResponse';
import { ServerEventTicketDto } from '@drpg/core/models/serverEvents/ServerEventTicketDto';
import EventBus from '../../events/index.js';
import { ClanService } from '../../services';
import { ServerEventsService } from '../../services/ServerEventsService';
import { playerStore } from '../../store';
import { errorHandler } from '../../utils';
import Editor from '../common/Editor.vue';
import { ToastPluginApi } from 'vue-toast-notification';
import { getGoal } from '@drpg/core/utils/twinoidGoals';
import ClanMessageItem from './ClanMessageItem.vue';

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();
const instance = getCurrentInstance();

const webSocket = ref<WebSocket | null>(null);
const store = playerStore();

const hasAccess = ref<boolean>(false);
const messages = ref<CreateClanMessage[]>([]);
const page = ref<number>(1);
const maxPage = ref<number>(1);
const pageSelector = ref<number>(1);
const isConnectionOk = ref<boolean | undefined>(undefined);
const newMessage = ref<string>('');

// helpers
function isLeader(msg: CreateClanMessage): boolean {
	return msg.author?.id == msg.clan?.leaderId;
}
function isSelf(msg: CreateClanMessage): boolean {
	return msg.author?.id == store.playerId;
}
function canDeleteMessage(msg: CreateClanMessage): boolean {
	return msg.author?.id == store.playerId || msg.clan?.leaderId == store.playerId;
}
function goToPlayer(id: string) {
	router.push({ name: 'MyAccount', params: { id } });
}

function getTopItem(arr) {
	const topItem = arr.reduce((a, b) => (b.quantity > a.quantity ? b : a));
	const goal = getGoal(topItem.stat);
	return goal.name[locale.value] + ' (' + topItem.quantity + ')';
}

async function createNewMessage(): Promise<void> {
	if (!hasAccess.value || !newMessage.value) return;
	page.value = 1;
	const payload: WsMsgRequestCreation = { action: WsMessageAction.CREATE, message: newMessage.value };
	webSocket.value?.send(JSON.stringify(payload));
	newMessage.value = '';
}

async function deleteMessage(msg: CreateClanMessage): Promise<void> {
	if (!canDeleteMessage(msg)) return;
	const res: boolean = await this.$confirm({
		message: this.$t('popup.confirm'),
		header: this.$t('popup.attention'),
		acceptLabel: this.$t('popup.accept'),
		rejectLabel: this.$t('popup.reject'),
		icon: 'pi pi-trash'
	});
	if (!res) return;
	const payload: WsMsgRequestDeletion = { action: WsMessageAction.DELETE, msgId: msg.id };
	webSocket.value?.send(JSON.stringify(payload));
}

async function getClanMessages(): Promise<void> {
	const clanId = Number(route.params.id);
	messages.value = await ClanService.getClanMessages(clanId, page.value);
	const messagesCount = await ClanService.getClanMessagesCount(clanId);
	maxPage.value = Math.floor((messagesCount.count + 19) / 20);
}

async function connectToWs(): Promise<void> {
	const wsTicket: ServerEventTicketDto = await ServerEventsService.getWsTicket(WsChannel.CLAN_FORUM);
	let url: string;
	if (import.meta.env.MODE === 'development') {
		url = `ws://localhost:8082/ws?ticket=${wsTicket.ticket}`;
	} else {
		url = `wss://${document.location.host}/ws?ticket=${wsTicket.ticket}`;
	}
	webSocket.value = new WebSocket(url);
	webSocket.value.onmessage = (message: MessageEvent<WsMsgResponse>) => handleWsAction(message);
	webSocket.value.onerror = () => (isConnectionOk.value = false);
	webSocket.value.onclose = () => (isConnectionOk.value = false);
	webSocket.value.onopen = () => (isConnectionOk.value = true);
}

async function changePage(n: number) {
	page.value += n;
	await getClanMessages();
}

async function goToSelectedPage() {
	if (pageSelector.value <= maxPage.value && pageSelector.value > 0) {
		page.value = pageSelector.value;
		await getClanMessages();
	}
}

function handleWsAction(message: MessageEvent<WsMsgResponse>): void {
	const msgData = JSON.parse(message.data.toString());
	if (msgData.action === WsMessageAction.CREATE) {
		updateMessages(msgData.payload);
	} else if (msgData.action === WsMessageAction.DELETE) {
		removeMsgFromMessages(msgData.msgId);
	}
}

function updateMessages(message: CreateClanMessage): void {
	if (page.value !== 1) return;
	messages.value.unshift(message);
}

function removeMsgFromMessages(msgId: number) {
	messages.value = messages.value.filter(m => m.id !== msgId);
}
/*
 */
onMounted(async () => {
	hasAccess.value = store.clanId == Number(route.params.id);
	if (!hasAccess.value) {
		router.push({ name: 'Clan', params: { id: route.params.id } });
		return;
	}

	EventBus.emit('isLoading', true);
	try {
		await getClanMessages();
		await connectToWs();
	} catch (err) {
		console.error(err);
		isConnectionOk.value = false;
		// $toast from the app instance (if registered globally)
		errorHandler.handle(err as Error, instance?.proxy?.$toast ?? ({} as ToastPluginApi));
	} finally {
		EventBus.emit('isLoading', false);
	}
});

onBeforeUnmount(() => {
	try {
		webSocket.value?.close();
	} catch (e) {
		// noop: safe to ignore on unmount
	}
});
</script>

<style lang="scss" scoped>
.editor {
	display: flex;
	flex-direction: column;
	align-items: center;
}
.button-land {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-around;
}
.discussion {
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding-bottom: 16px;
	padding-left: 16px;
	padding-right: 16px;
}
.msg {
	margin: 0 10px;
	background-color: #bc6733;
	color: white;
	border-radius: 12px;
	.msg-header {
		padding: 4px;
		background-color: #cb7c49;
		display: flex;
		justify-content: space-between;
		gap: 4px;
		height: auto;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		border: #ae6134 1px solid;
		border-radius: 12px 12px 0 0;
		.msg-info {
			width: 100%;
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			.author-name {
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: start;

				text-transform: capitalize;
				font-weight: 600;

				img {
					height: 25%;
				}
			}
			.msg-author {
				font-size: 1.4rem;
				&.self {
					color: white;
				}
				&:hover {
					color: #fff798;
					cursor: pointer;
				}
			}
			.msg-date {
				display: flex;
				flex-direction: column;
				align-items: flex-end;
				justify-content: center;
				font-size: 1.1rem;
				padding-right: 4px;
				color: #f8f5dd;
				.msg-time {
					color: #fcd4a4;
				}
			}
		}
		button {
			float: right;
			height: 18px;
			font-size: 10px;
			background-color: #bf4f1e;
			color: #fabd88;
			border: #93441a 1px solid;
			border-radius: 6px;
			font-weight: 700;
			&:hover {
				cursor: pointer;
				transform: rotateX('angle');
			}
		}
	}
}
.msg-content {
	padding: 16px 8px;
	font-size: 1.2rem;
	color: #f8f5dd;
}
.new-message-container {
	padding: 10px 0;
	display: flex;
	gap: 16px;
	margin: 0 16px;
	flex-direction: column;
	a {
		width: 170px;
	}
	button {
		display: flex;
		align-items: center;
		border: none;
		border-radius: 4px;
		background-color: #df6d3b;
		img {
			height: 25px;
		}
		&:hover {
			cursor: pointer;
			background-color: #ec9975;
		}
	}
}
textarea {
	padding-left: 8px;
	padding-right: 8px;
	color: #ffee92;
	font-size: 9pt;
	font-weight: bold;
	border: none;
	border-radius: 4px;
	width: 80%;
	background-color: #bc683c;
	resize: vertical;
}
.switch-page-container {
	display: flex;
	padding: 8px 16px;
	justify-content: center;
	align-items: center;
	gap: 16px;
	.arrow-button {
		width: 20px;
		height: 20px;
		&:hover {
			filter: brightness(120%);
			cursor: pointer;
		}
	}
}
.page-selector {
	display: flex;
	padding: 8px 16px;
	justify-content: center;
	align-items: center;
	gap: 4px;
	font-size: 12px;
	input {
		width: 35px;
		font-size: 12px;
	}
	button {
		border: none;
		border-radius: 4px;
		background-color: #df6d3b;
		font-size: 12px;
		padding: 4px;
		&:hover {
			filter: brightness(120%);
			cursor: pointer;
		}
	}
}
.msg-error {
	color: #e75c32;
}
</style>
