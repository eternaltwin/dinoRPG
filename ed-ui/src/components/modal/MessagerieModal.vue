<template>
	<dialog ref="messageRef">
		<div class="conversation-container">
			<div class="conversation-list">
				<div class="buttons">
					<DZButton @click="create()">Créer</DZButton>
					<DZButton @click="close">Close</DZButton>
				</div>
				<div v-for="thread in threads" :key="thread.id" @click="selectThread(thread.id)">
					<b class="title">{{ thread.title }}</b>
					<span class="">
						<b class="creator">{{ thread.createdBy }}</b
						>, {{ thread.participants.length }} participants
					</span>
					<span class="date">
						{{ thread.lastMessage }}
					</span>
				</div>
			</div>
			<div class="conversation-content">
				<div class="creation" v-if="creationMode">
					<input type="text" id="title" v-model="newThread.title" class="editTexte" placeholder="Titre" />
					<div class="participants">
						<SearchPlayer @player="participantThead" />
						<template v-for="participant in newThread.participants" :key="participant.id">
							<DZUser :user="participant" />
						</template>
					</div>

					<textarea id="message" v-model="newThread.message" class="editTexte" placeholder="Message" />
					<DZButton @click="sendMessage">Envoyer le message</DZButton>
				</div>
				<div class="displayThread" v-if="!creationMode && currentThread">
					<Thread :current-thread="currentThread" />
				</div>
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

export default defineComponent({
	name: 'messagerie',
	components: { DZUser, SearchPlayer, DZButton, Thread },
	data() {
		return {
			localStore: localStore(),
			messageRef: null as HTMLDialogElement | null,
			recipientName: '' as string,
			playerId: playerStore().getPlayerId as number,
			threads: [] as ThreadsBasic[], // Liste des messages de la conversation
			creationMode: false as boolean,
			newThread: {} as NewThread,
			currentThread: undefined as undefined | FullThread,
			response: undefined as undefined | string
		};
	},
	methods: {
		async create() {
			this.creationMode = true;
		},
		participantThead(p: Pick<Player, 'id' | 'name'>) {
			if (!this.newThread.participants) {
				this.newThread.participants = [p];
			} else if (!this.newThread.participants.some(e => e.id === p.id)) {
				this.newThread.participants.push(p);
			}
		},
		close(): void {
			if (this.messageRef) {
				this.messageRef.close();
				this.currentThread = undefined;
			}
		},
		async selectThread(id: string) {
			this.creationMode = false;
			this.currentThread = await MessagerieService.getThread(id, 1);
		},
		formatDate(dateString: string) {
			const date = new Date(dateString);
			const lang = this.localStore.getLanguage;
			const formatter = new Intl.DateTimeFormat(lang ?? 'fr', { month: 'long' });
			const day = String(date.getDate()).padStart(2, '0'); // Ajoute un '0' si nécessaire
			const month = formatter.format(date);
			const year = date.getFullYear();
			return `${day} ${month} ${year}`;
		},
		async sendMessage() {
			try {
				const participants = this.newThread.participants.map(p => p.id);
				const newThread = await MessagerieService.createThread(
					participants,
					this.newThread.title,
					this.newThread.message
				);
				this.threads.push(newThread);
				this.creationMode = false;
			} catch (error) {
				console.error("Erreur lors de l'envoi du message", error);
			}
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
	background-color: #5c2b20;
	border: 1px solid #b37c4a;
	color: wheat;
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
.conversation-container {
	display: flex;

	flex-direction: row;

	height: 100vh;
}

.conversation-list {
	width: 30%;

	border: 1px solid #ccc;

	padding: 20px;
}

.conversation-content {
	width: 70%;

	padding: 20px;
}
</style>
