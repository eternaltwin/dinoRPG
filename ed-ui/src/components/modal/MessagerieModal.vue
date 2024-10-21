<template>
	<dialog ref="messageRef">
		<div class="flex h-screen flex-col md:flex-row">
			<div class="mt-[2px] px-[5px] md:w-[30%]">
				<div class="mb-[10px] flex h-auto w-full flex-col border-2 border-[#704328] bg-[#cb7c49] p-[5px] italic">
					<div class="flex items-center gap-3 bg-[#ae6139] p-[4px]">
						<img :src="getImgURL('icons', 'small_browse_next')" />
						<p>{{ $t('messagerie.actions') }}</p>
					</div>
					<div class="flex flex-wrap p-[4px] md:flex-nowrap">
						<div
							@click="create()"
							class="m-[3px] flex w-full cursor-pointer items-center gap-2 p-[6px] text-center hover:bg-[#ae6139] md:w-1/2"
							style="box-shadow: 0 0 3px rgba(0, 0, 0, 0.3)"
						>
							<img :src="getImgURL('icons', 'edit')" />
							<span>{{ $t('messagerie.create') }}</span>
						</div>
						<div
							@click="toggleSearch()"
							class="m-[3px] flex w-full cursor-pointer items-center gap-2 p-[6px] text-center hover:bg-[#ae6139] md:w-1/2"
							style="box-shadow: 0 0 3px rgba(0, 0, 0, 0.3)"
						>
							<img :src="getImgURL('icons', 'search')" />
							<span>{{ $t('messagerie.research') }}</span>
						</div>
					</div>
				</div>
				<div class="my-[10px] px-[5px]">
					<div v-if="isSearchVisible">
						<div class="flex items-center gap-2">
							<label for="conv_list_filter"><img :src="getImgURL('icons', 'search')" class="size-10" /></label>
							<input
								v-model="searchQuery"
								id="conv_list_filter"
								class="w-full border-2 border-black bg-[url('./assets/background/bg_conv_input.webp')] bg-cover bg-no-repeat pl-[10px] outline-none placeholder:text-[#ffee92]"
								:placeholder="$t('messagerie.search')"
							/>
						</div>
					</div>
				</div>
				<div class="border-2 border-b-0 border-[#704328] bg-[#cb7c49]">
					<div class="flex items-center gap-2 bg-[#ae6139] pl-[5px]">
						<img :src="getImgURL('icons', 'thread')" />
						<span>{{ $t('messagerie.conversations') }}</span>
					</div>
				</div>
				<div class="mt-[-2px] border-2 border-t-0 border-[#704328] bg-[#cb7c49] p-[10px]">
					<div class="flex flex-col gap-2 scroll-auto">
						<ul class="m-0 p-0">
							<li
								v-for="thread in filteredThreads()"
								:key="thread.id"
								@click="selectThread(thread.id)"
								class="box-border flex cursor-pointer flex-col overflow-y-auto border-2 border-[#b37c4a] p-2 pl-[15px] hover:bg-[#ae6139]"
								:class="{
									selected: thread.id === selectedThreadId
								}"
							>
								<b class="text-white">{{ thread.title }}</b>
								<span class="">
									<b class="text-white">{{ thread.createdBy }}</b>
									<span>, {{ thread.participants.length }} {{ $t('messagerie.participants') }},</span>
									<span class="text-gray-300">{{ thread.lastMessage }}</span>
								</span>
							</li>
						</ul>
					</div>
				</div>
			</div>
			<div class="ml-[-12px] mt-5 flex flex-col overflow-y-auto p-[20px] sm:mt-0 md:w-[70%]">
				<div
					class="mt-[-17px] bg-[#ae6139] p-[5px]"
					style="box-shadow: 0 0 5px rgba(0, 0, 0, 0.2)"
					v-if="!threadSelected"
				>
					<p style="font-variant: small-caps">{{ $t('messagerie.disclaimer') }}</p>
				</div>
				<div class="flex flex-col gap-2 bg-[#cb7c49]" v-if="creationMode">
					<div
						class="mb-[10px] mt-[-17px] h-[26px] bg-[#ae6139] p-[5px]"
						style="box-shadow: 0 0 5px rgba(0, 0, 0, 0.2)"
					>
						<p>{{ $t('messagerie.newMsg') }}</p>
					</div>
					<div class="flex flex-col p-[5px] lg:flex-row">
						<label for="title" class="lg:w-1/4">{{ $t('messagerie.newMsgTitle') }}</label>
						<input
							type="text"
							id="title"
							v-model="newThread.title"
							class="w-full bg-[url('./assets/background/bg_conv_input.webp')] pl-[5px] outline-none placeholder:text-[#ffee92]"
							:placeholder="$t('messagerie.title')"
						/>
					</div>
					<div class="flex flex-col p-[5px] lg:flex-row">
						<label for="player" class="lg:w-1/4">{{ $t('messagerie.newMsgParticipants') }}</label>
						<SearchPlayer @player="participantThead" />
					</div>
					<div class="flex w-full items-center justify-center gap-3">
						<template v-for="participant in newThread.participants" :key="participant.id">
							<DZUser :user="participant" />
						</template>
					</div>
					<!-- Ajouter un éditeur de texte avancé -->
					<div class="mt-4 flex flex-col p-[5px]">
						<label for="message">{{ $t('messagerie.newMsgMessage') }}</label>
						<textarea
							id="message"
							v-model="newThread.message"
							class="w-full bg-[url('./assets/background/bg_conv_textarea.webp')] pl-[5px] outline-none placeholder:text-[#ffee92]"
							:placeholder="$t('messagerie.message')"
						/>
					</div>
					<div class="flex justify-end p-[5px]">
						<DZButton @click="sendMessage">{{ $t('messagerie.newMsgSend') }}</DZButton>
					</div>
				</div>
				<!-- Ajouter un aperçu du message -->
				<div v-if="!creationMode && currentThread">
					<Thread :current-thread="currentThread" />
				</div>
			</div>
		</div>
		<div class="absolute right-1 top-[4px] z-20">
			<span
				@click="close"
				class="cursor-pointer border-2 border-red-500 bg-orange-200 px-3 py-1 font-extrabold text-red-700 hover:bg-red-700 hover:text-black"
				>X</span
			>
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
			response: undefined as undefined | string,
			threadSelected: false as boolean,
			selectedThreadId: null as string | null,
			isSearchVisible: false,
			searchQuery: ''
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
			} else if (!this.newThread.participants.some(e => e.id === p.id)) {
				this.newThread.participants.push(p);
			}
		},
		close(): void {
			if (this.messageRef) {
				this.messageRef.close();
				this.currentThread = undefined;
				this.creationMode = false;
				this.threadSelected = false;
				this.selectedThreadId = null;
				this.isSearchVisible = false;
			}
		},
		async selectThread(id: string) {
			this.creationMode = false;
			this.threadSelected = true;
			this.selectedThreadId = id;
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
</style>
