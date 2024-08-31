<template>
	<div class="new-message-container" v-if="hasAccess">
		<ckeditor v-if="isConnectionOk" :editor="editor" v-model="newMessage"></ckeditor>
		<div v-if="isConnectionOk === false" class="msg-error">
			<p>{{ $t('clan.forum.connectionFailed') }}</p>
			<p>{{ $t('clan.forum.connectionFailed2') }}</p>
		</div>
		<div class="button-land">
			<a class="button" @click="createNewMessage()">{{ $t('clanDiscussion.action.create') }}</a>
		</div>
	</div>

	<div class="page-content" v-if="hasAccess">
		<div class="discussion" v-if="messages">
			<div class="msg" v-for="msg in messages" :key="msg.id">
				<div class="msg-header">
					<img src="\src\assets\achievements\msg.webp" alt="Profile" />
					<div class="msg-info">
						<div class="author-name">
							<img
								src="\src\assets\icons\crown.png"
								alt="rank"
								v-if="isLeader(msg)"
								v-tippy="{
									content: $t('clan.icons.crown'),
									theme: 'small'
								}"
							/>
							<div class="msg-author" :class="{ self: isSelf(msg) }" @click="goToPlayer(msg.author.id)">
								{{ msg.author.name }}
							</div>
						</div>
						<div class="msg-date">{{ dateToString(msg.date) }}</div>
					</div>
					<button v-if="canDeleteMessage(msg)" @click="deleteMessage(msg)">X</button>
				</div>
				<p class="msg-content" style="white-space: pre-line" v-html="msg.content" />
			</div>
		</div>
		<div class="switch-page-container">
			<div class="arrow-button">
				<img src="\src\assets\icons\left.webp" alt="left" @click="changePage(-1)" v-if="page > 1" />
			</div>

			<p>{{ $t('clanDiscussion.pagination.page') }} {{ page }} / {{ maxPage }}</p>

			<div class="arrow-button">
				<img src="\src\assets\icons\right.webp" alt="right" @click="changePage(1)" v-if="messages.length >= 20" />
			</div>
		</div>
		<div class="page-selector">
			<p>{{ $t('clanDiscussion.pagination.go_to') }}</p>
			<input type="number" v-model="pageSelector" />
			<button @click="goToSelectedPage()">Go !</button>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { playerStore } from '../../store/index.js';
import EventBus from '../../events/index.js';
import { ClanService } from '../../services/ClanService.js';
import { errorHandler } from '../../utils/index.js';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { WebSocketService } from '../../services/WebSocketService';
import { WsChannel } from '@drpg/core/models/webSocket/WsChannel';
import { CreateClanMessage } from '@drpg/core/models/clan/CreateClanMessage';

export default defineComponent({
	name: 'ClanDiscussion',
	components: {},
	data() {
		return {
			webSocket: {} as WebSocket,
			playerStore: playerStore(),
			hasAccess: false as boolean,
			messages: [] as CreateClanMessage[],
			newMessage: '' as string,
			page: 1 as number,
			maxPage: 1 as number,
			pageSelector: 1 as number,
			isConnectionOk: undefined as boolean | undefined,
			editor: ClassicEditor
		};
	},
	methods: {
		isLeader(msg): boolean {
			return msg.author.id == msg.clan.leaderId;
		},
		isSelf(msg): boolean {
			return msg.author.id == this.playerStore.playerId;
		},
		dateToString(date: Date): string {
			return new Date(date).toLocaleString('fr-FR');
		},
		canDeleteMessage(msg): boolean {
			return msg.author.id == this.playerStore.playerId || msg.clan.leaderId == this.playerStore.playerId;
		},
		goToPlayer(id: number) {
			this.$router.push({ name: 'MyAccount', params: { id } });
		},
		async createNewMessage() {
			if (!this.hasAccess || !this.newMessage) {
				return;
			}
			this.page = 1;
			this.webSocket.send(this.newMessage);
			this.newMessage = '';
		},
		async deleteMessage(msg) {
			if (!this.canDeleteMessage(msg)) {
				return;
			}
			const res: boolean = confirm(this.$t('popup.confirm'));
			if (res) {
				await this.deleteClanMessage(msg.id);
				await this.getClanMessages();
			}
		},
		async getClanMessages() {
			EventBus.emit('isLoading', true);
			try {
				this.messages = await ClanService.getClanMessages(Number(this.$route.params.id), this.page);
				const messagesCount = await ClanService.getClanMessagesCount(Number(this.$route.params.id));
				this.maxPage = Math.floor((messagesCount.count + 19) / 20);

				const wsTicket = await WebSocketService.getWsTicket(WsChannel.CLAN_FORUM);
				if (import.meta.env.MODE === 'development') {
					this.webSocket = new WebSocket(`wss://localhost:8081?ticket=${wsTicket}`);
				} else {
					this.webSocket = new WebSocket(`wss://${document.location.host}?ticket=${wsTicket}`);
				}

				this.webSocket.onmessage = (message: MessageEvent) => this.updateMessages(message);
				this.webSocket.onerror = () => (this.isConnectionOk = false);
				this.webSocket.onopen = (() => this.isConnectionOk = true);

				EventBus.emit('isLoading', false);
			} catch (err) {
				this.isConnectionOk = false;
				errorHandler.handle(err as Error, this.$toast);
				return;
			}
		},
		async changePage(n: number) {
			this.page += n;
			await this.getClanMessages();
		},
		async goToSelectedPage() {
			if (this.pageSelector <= this.maxPage && this.pageSelector > 0) {
				this.page = this.pageSelector;
				await this.getClanMessages();
			}
		},
		async deleteClanMessage(id: number) {
			EventBus.emit('isLoading', true);
			try {
				this.messages = await ClanService.deleteClanMessage(id);
				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err as Error, this.$toast);
				return;
			}
		},
		updateMessages(messageEvent: MessageEvent) {
			const message: CreateClanMessage = JSON.parse(messageEvent.data);
			this.messages.unshift(message);
		}
	},
	async mounted(): Promise<void> {
		this.hasAccess = this.playerStore.clanId == Number(this.$route.params.id);
		if (!this.hasAccess) {
			this.$router.push({ name: 'Clan', params: { id: this.$route.params.id } });
		}
		await this.getClanMessages();
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
}

.msg {
	margin: 0 10px;
	background-color: #d8b68a;
	color: black;
	.msg-header {
		background-color: #ca9957;
		display: flex;
		justify-content: space-between;
		gap: 4px;
		height: 30px;
		.msg-info {
			width: 100%;
			display: flex;
			flex-direction: column;
			.author-name {
				display: flex;
				align-items: baseline;
				gap: 2px;
				img {
					height: 50%;
				}
			}
			.msg-author {
				font-size: 14px;
				&.self {
					color: white;
				}
				&:hover {
					color: #fff798;
					cursor: pointer;
				}
			}
			.msg-date {
				font-size: 10px;
			}
		}

		button {
			float: right;
			height: 18px;
			font-size: 10px;
			background-color: #e75c32;
			color: #e0c49f;
			border-color: #e0c49f;
			&:hover {
				cursor: pointer;
			}
		}
	}
	.msg-content {
		padding: 0 4px;
		color: rgb(50, 50, 50);
	}
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
