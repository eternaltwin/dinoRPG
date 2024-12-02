<template>
	<dialog ref="messageRef">
		<div class="modal">
			<div
				class="menu"
				:class="{
					leftShow: !threadSelected,
					leftHide: threadSelected
				}"
			>
				<div class="actions">
					<div class="title">
						<img :src="getImgURL('icons', 'small_browse_next')" />
						<p>{{ $t('messagerie.actions') }}</p>
					</div>
					<div class="buttons">
						<div @click="create()" class="clickable" style="box-shadow: 0 0 3px rgba(0, 0, 0, 0.3)">
							<img :src="getImgURL('icons', 'edit')" />
							<span>{{ $t('messagerie.create') }}</span>
						</div>
						<div @click="toggleSearch()" class="clickable" style="box-shadow: 0 0 3px rgba(0, 0, 0, 0.3)">
							<img :src="getImgURL('icons', 'search')" />
							<span>{{ $t('messagerie.research') }}</span>
						</div>
					</div>
				</div>
				<div class="search">
					<div v-if="isSearchVisible">
						<div>
							<label for="conv_list_filter"><img :src="getImgURL('icons', 'search')" class="size-10" /></label>
							<input v-model="searchQuery" id="conv_list_filter" :placeholder="$t('messagerie.search')" />
						</div>
					</div>
				</div>
				<div class="threads">
					<div class="title">
						<img :src="getImgURL('icons', 'thread')" />
						<span>{{ $t('messagerie.conversations') }}</span>
					</div>
					<div
						class="thread"
						v-for="thread in filteredThreads()"
						:key="thread.id"
						@click="selectThread(thread.id)"
						:class="{
							selected: thread.id === selectedThreadId
						}"
					>
						<p class="name">{{ thread.title }}</p>
						<div>
							<span>
								<b class="creator">{{ thread.createdBy.name }}</b>
								, {{ thread.participants.length }} {{ $t('messagerie.participants') }},
							</span>
							<span class="date">{{ formatDate(thread.updatedAt.toString()) }}</span>
						</div>
					</div>
				</div>
			</div>
			<div
				class="conversations"
				:class="{
					rightHide: !threadSelected,
					rightShow: threadSelected
				}"
			>
				<DZButton back @click="threadSelected = false">Retour</DZButton>
				<DZDisclaimer help v-if="!threadSelected" content="messagerie.disclaimer" />
				<div class="creationMode" v-if="creationMode">
					<div class="title">
						<p>{{ $t('messagerie.newMsg') }}</p>
					</div>
					<div class="messageTitle">
						<label for="title">{{ $t('messagerie.newMsgTitle') }}</label>
						<input type="text" id="title" v-model="newThread.title" :placeholder="$t('messagerie.title')" />
					</div>
					<div
						class="search"
						v-if="!newThread.participants || (newThread.participants && newThread.participants.length < 9)"
					>
						<label for="player">{{ $t('messagerie.newMsgParticipants') }}</label>
						<SearchPlayer @player="participantThead" />
					</div>
					<p v-else>{{ $t('toast.maxParticipantInThread') }}</p>
					<div class="participants">
						<template v-for="participant in newThread.participants" :key="participant.id">
							<DZUser :user="participant" />
						</template>
					</div>
					<div class="message">
						<label for="message">{{ $t('messagerie.newMsgMessage') }}</label>
						<textarea id="message" v-model="newThread.message" :placeholder="$t('messagerie.message')" />
					</div>
					<div class="send">
						<DZButton @click="sendMessage">{{ $t('messagerie.newMsgSend') }}</DZButton>
					</div>
				</div>
				<template v-if="!creationMode && selectedThreadId && threadSelected">
					<Thread :thread-id="selectedThreadId" />
				</template>
			</div>
		</div>
		<div class="buttons">
			<DZButton @click="close">Close</DZButton>
		</div>
	</dialog>
</template>

<script lang="ts">
import EventBus from '../../events/index.js';
import { defineComponent } from 'vue';
import { localStore, playerStore } from '../../store/index.js';
import DZButton from '../common/DZButton.vue';
import { FullThread, NewThread, ThreadsBasic } from '@drpg/core/models/messagerie/threadsBasic';
import { MessagerieService } from '../../services/MessagerieService.js';
import SearchPlayer from '../data/SearchPlayer.vue';
import DZUser from '../common/DZUser.vue';
import { Player } from '@drpg/core/models/player/Player';
import Thread from '../message/Thread.vue';
import DZDisclaimer from '../common/DZDisclaimer.vue';

export default defineComponent({
	name: 'messagerie',
	components: { DZDisclaimer, DZUser, SearchPlayer, DZButton, Thread },
	data() {
		return {
			localStore: localStore(),
			messageRef: null as HTMLDialogElement | null,
			recipientName: '' as string,
			playerId: playerStore().getPlayerId as number,
			threads: [] as ThreadsBasic[], // Liste des messages de la conversation
			creationMode: false as boolean,
			newThread: {} as NewThread,
			response: undefined as undefined | string,
			threadSelected: false as boolean,
			selectedThreadId: null as string | null,
			isSearchVisible: false,
			searchQuery: '',
			currentThread: undefined as undefined | FullThread
		};
	},
	methods: {
		async create() {
			this.creationMode = true;
			this.threadSelected = true;
		},
		participantThead(p: Pick<Player, 'id' | 'name'>) {
			if (!this.newThread.participants) {
				this.newThread.participants = [p];
			} else if (!this.newThread.participants.some(e => e.id === p.id) && this.newThread.participants.length < 9) {
				this.newThread.participants.push(p);
			}
		},
		close(): void {
			if (this.messageRef) {
				this.messageRef.close();
				this.creationMode = false;
				this.threadSelected = false;
				this.selectedThreadId = null;
				this.isSearchVisible = false;
				this.newThread = {} as NewThread;
			}
		},
		async selectThread(id: string) {
			this.creationMode = false;
			this.threadSelected = true;
			this.selectedThreadId = id;
		},
		formatDate(dateString: string) {
			const date = new Date(dateString);
			const lang = this.localStore.getLanguage;
			const dateFormatter = new Intl.DateTimeFormat(lang ?? 'fr', {
				day: '2-digit',
				month: 'long',
				year: 'numeric'
			});
			const formattedDate = dateFormatter.format(date);
			const timeFormatter = new Intl.DateTimeFormat(lang ?? 'fr', {
				hour: '2-digit',
				minute: '2-digit',
				hour12: false
			});
			const formattedTime = timeFormatter.format(date);
			return `${formattedDate}, ${formattedTime}`;
		},
		async sendMessage() {
			try {
				const participants = this.newThread.participants.map(p => p.id);
				const newThread = await MessagerieService.createThread(
					participants,
					this.newThread.title,
					this.newThread.message
				);
				this.threads.unshift(newThread);
				this.creationMode = false;
				this.newThread = {} as NewThread;
			} catch (error) {
				console.error("Erreur lors de l'envoi du message", error);
			}
		},
		toggleSearch() {
			this.isSearchVisible = !this.isSearchVisible;
		},
		filteredThreads() {
			if (!this.searchQuery) {
				return this.threads;
			}
			return this.threads.filter(thread => thread.title.toLowerCase().includes(this.searchQuery.toLowerCase()));
		}
	},
	mounted(): void {
		EventBus.on('message', async e => {
			if (this.messageRef && e) {
				this.messageRef.close();
				this.messageRef.showModal();
			}
			this.threads = await MessagerieService.getThreads();
		});
		this.messageRef = this.$refs.messageRef as HTMLDialogElement;
	}
});
</script>

<style scoped>
dialog {
	background-color: #fff0c5;
	border: 3px solid #cb7c49;
	color: #ffee92;
	max-height: 100%;
	max-width: 90%;
	min-width: 200px;
	outline: 2px solid #000;
	overflow: auto;
	overflow: visible;
	padding: 0;
	width: auto;
	position: fixed;
	&::backdrop {
		background: linear-gradient(0deg, rgba(107, 32, 17, 0.2), rgba(107, 32, 17, 0.4) 70%, rgba(0, 0, 0, 0.7));
	}
}
.modal {
	display: flex;
	flex-direction: row;
	height: 93vh;
	.menu {
		display: flex;
		flex-direction: column;
		width: 30%;
		padding: 5px;
		gap: 15px;
		.actions {
			background-color: rgb(203 124 73);
			border-color: rgb(112 67 40);
			font-style: italic;
			border-style: solid;
			border-width: 2px;
			padding: 5px;
			.title {
				display: flex;
				background-color: rgb(174 97 57);
				align-items: center;
				gap: 0.75rem;
				padding: 4px;
			}
			.buttons {
				display: flex;
				flex-wrap: nowrap;
				padding: 4px;
				.clickable {
					display: flex;
					box-shadow: rgba(0, 0, 0, 0.3) 0px 0px 3px;
					width: 50%;
					text-align: center;
					gap: 0.5rem;
					align-items: center;
					cursor: pointer;
					padding: 6px;
					&:hover {
						background-color: rgb(174 97 57);
					}
				}
			}
		}
		.threads {
			display: flex;
			flex-direction: column;
			background-color: #cb7c49;
			border-color: #704328;
			border-style: solid;
			border-width: 2px;
			padding-bottom: 4px;
			overflow-y: auto;
			.title {
				display: flex;
				background-color: rgb(174 97 57);
				align-items: center;
				gap: 0.75rem;
				padding: 4px;
			}
			.thread {
				display: flex;
				padding-top: 8px;
				flex-direction: column;
				gap: 3px;
				cursor: pointer;
				transition:
					background-color 0.5s ease,
					box-shadow 0.5s ease;
				&:hover {
					background-color: hsla(0, 0%, 100%, 0.2);
					box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
					transition:
						background-color 0.5s ease,
						box-shadow 0.5s ease;
				}
				&::after {
					content: ' ';
					border: 1px solid #b37c4a;
				}
				.name {
					padding-left: 3px;
					color: white;
					font-size: 17.6px;
					font-weight: 700;
					font-variant: all-petite-caps;
					overflow: hidden;
					text-overflow: ' [...]';
					white-space: nowrap;
					max-width: calc(100% - 50px);
				}
				span {
					padding-left: 3px;
					font-size: 11px;
				}
				.creator {
					color: white;
					margin-right: -3px;
				}
				.date {
					opacity: 0.6;
				}
			}
		}
	}
	.conversations {
		width: 70%;
		padding: 5px;
		scrollbar-width: thin;
		scrollbar-color: rgb(112, 67, 40) rgb(203, 124, 73);
		display: flex;
		flex-direction: column;
		gap: 15px;
		.creationMode {
			display: flex;
			flex-direction: column;
			gap: 15px;
			background-color: #cb7c49;
			padding: 4px;
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
					width: 100%;
					border: none;
					padding-left: 4px;
					&:focus {
						transition: outline-color 0.5s;
						outline-color: #efdba8;
					}
				}
			}
			.search {
				display: flex;
				label {
					width: 25%;
				}
			}
			.participants {
				display: flex;
				justify-content: center;
				width: 100%;
				gap: 3px;
			}
			.message {
				display: flex;
				flex-direction: column;
				gap: 10px;
				label {
					width: 25%;
				}
				textarea {
					background-color: #b05733;
					outline: 1px solid transparent;
					color: #ffee92;
					font-weight: 400;
					font-size: 16px;
					outline-offset: 2px;
					width: 100%;
					border: none;
					padding-left: 4px;
					&:focus {
						transition: outline-color 0.5s;
						outline-color: #efdba8;
					}
				}
			}
			.send {
				display: flex;
				justify-content: end;
			}
		}
	}
}
@media (max-width: 539px) {
	.modal {
		.leftShow {
			width: 100%;
			transition: transform 0.3s ease-out;
			transform: translateX(0%);
		}
		.leftHide {
			transform: translateX(-100%);
			width: 0;
			opacity: 0;
			padding: 0;
		}
		.rightShow {
			width: 100%;
			display: flex;
			transition: transform 0.3s ease-out;
			transform: translateX(0%);
		}
		.rightHide {
			transform: translateX(100%);
			opacity: 0;
			width: 0%;
			padding: 0;
		}
	}
}
li {
	&.selected {
		background-color: #e6b479;
		border-color: black;
		& b,
		span {
			color: #7e4d2a;
		}
	}
}
.scrollable-container {
	::-webkit-scrollbar {
		width: 10px;
	}
	::-webkit-scrollbar-thumb {
		background: #704328;
		border-radius: 10px;
	}
	::-webkit-scrollbar-thumb:hover {
		background: #ae6139;
	}
	::-webkit-scrollbar-track {
		background: #cb7c49;
		border-radius: 10px;
	}
	::-webkit-scrollbar-track:hover {
		background: #d3b2a0;
	}
	scrollbar-width: thin;
	scrollbar-color: #704328 #cb7c49;
}
</style>
