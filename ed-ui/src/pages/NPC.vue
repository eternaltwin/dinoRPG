<template>
	<TitleHeader :title="`${$t('pageTitle.npc')}${$t(`npc.name.${npcName}`)}]`"></TitleHeader>
	<div class="section ml-[-30px] mt-[-15px] sm:ml-0 sm:mt-0">
		<div class="titlePage" v-html="formatContent($t(`npc.header.character`))" />
		<div class="subTitlePage" v-html="formatContent($t(`npc.name.${npcName}`))" />
	</div>
	<div
		class="ml-[-45px] flex min-w-full cursor-pointer flex-col bg-[url('./assets/background/dialog_bg_pix.webp')] bg-contain bg-repeat-y sm:ml-[-20px] sm:mr-[20px] lg:mx-0"
	>
		<div class="min-h-[40px] min-w-full bg-[url('./assets/background/dialog_bg_header.webp')] bg-cover bg-no-repeat">
			<p class="ml-[15px] pt-[15px] font-bold text-[#693118]" style="font-variant: small-caps">
				{{ $t(`npc.name.${npcName}`) }} :
			</p>
		</div>
		<div class="flex flex-col-reverse justify-around px-[15px] sm:flex-row">
			<span
				class="text-[10pt] italic text-[#fff3b3]"
				v-if="npcSpeech.speech"
				v-html="formatContent($t(`npc.${npcName}.speech.${npcSpeech.speech}`))"
			/>
			<div class="flex flex-col items-center justify-center gap-6">
				<AnimatedNPC :NPC="swfName" :flashvars="npcSpeech.flashvars" />
				<a class="button" @click="stop()">
					<span v-html="formatContent($t(`npc.stop`))" />
				</a>
			</div>
		</div>
		<div
			class="h-[40px] min-w-full overflow-hidden bg-[url('./assets/background/dialog_bg_footer.webp')] bg-contain bg-no-repeat"
			style="background-position: bottom left"
		></div>
	</div>
	<ul
		class="ml-[-35px] mt-[10px] min-w-full cursor-pointer bg-[#9a4029] py-[5px] sm:ml-0"
		style="border: 1px solid white; outline: 1px solid black"
		v-if="loaded && npcSpeech.playerChoice.length > 0"
	>
		<li v-for="choice in npcSpeech.playerChoice" :key="choice">
			<a v-html="formatContent($t(`npc.${npcName}.playerChoice.${choice}`))" @click="choiseStep(choice)" />
		</li>
	</ul>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import EventBus from '../events/index.js';
import { errorHandler } from '../utils/index.js';
import { DinozService, NPCService, PlayerService } from '../services/index.js';
import { NpcTalk } from '@drpg/core/models/npc/NpcTalk';
import { NavigationFailure } from 'vue-router';
import { ServiceEnum } from '@drpg/core/models/enums/ServiceEnum';
import { dinozStore, sessionStore } from '../store/index.js';
import TitleHeader from '../components/utils/TitleHeader.vue';
import AnimatedNPC from '../components/common/AnimatedNPC.vue';
import { npcList } from '@drpg/core/models/npc/NpcList';
import { formatText } from '../utils/formatText.js';

export default defineComponent({
	name: 'NPC',
	data() {
		return {
			npcName: undefined as string | undefined,
			dinozId: +this.$route.params.id as number,
			npcSpeech: {} as NpcTalk,
			loaded: false as boolean,
			dinozStore: dinozStore(),
			sessionStore: sessionStore(),
			swfName: undefined as string | undefined
		};
	},
	components: {
		TitleHeader,
		AnimatedNPC
	},
	methods: {
		async choiseStep(choice: string): Promise<void | NavigationFailure> {
			if (choice === 'missions') {
				return this.$router.push({ name: 'Missions', params: { id: this.dinozId, npc: this.npcName } });
			}
			EventBus.emit('isLoading', true);
			try {
				this.npcSpeech = await NPCService.talkTo(this.dinozId!, this.npcName!, choice);
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
			EventBus.emit('isLoading', false);
			if (this.npcSpeech.service) {
				const dinozId = +this.$route.params.id;
				EventBus.emit('isLoading', true);
				for (const service of this.npcSpeech.service) {
					switch (service) {
						case ServiceEnum.CONCENTRATION:
							await DinozService.concentration(this.dinozId!);
							EventBus.emit('isLoading', false);
							break;
						case ServiceEnum.DINOZ:
							this.$router.push({ name: 'DinozPage', params: { id: this.dinozId } });
							EventBus.emit('isLoading', false);
							break;
						case ServiceEnum.REFRESH_DINOZLIST:
							this.dinozStore.setDinozList(await PlayerService.getDinozList());
							EventBus.emit('isLoading', false);
							break;
						case ServiceEnum.FIGHT:
							try {
								this.sessionStore.setFightResult(this.npcSpeech.fight);
								this.dinozStore.setNpc(this.dinozId, this.npcSpeech.speech, this.npcSpeech.name);
								const dinozList = this.dinozStore.getDinozList;

								if (!dinozList) {
									this.$toast.open({
										message: formatText(this.$t(`toast.missingData`)),
										type: 'error'
									});
									EventBus.emit('isLoading', false);
									return;
								}

								this.dinozStore.setDinozList(
									dinozList.map(dinoz => {
										if (dinoz.id === dinozId || dinoz.leaderId === dinozId) {
											// Update dinoz HP
											dinoz.life -= this.npcSpeech.fight!.hpLost.find(hpLost => hpLost.id === dinoz.id)?.hpLost || 0;
										}
										return dinoz;
									})
								);

								this.$router.push({
									name: 'Fight',
									params: { dinozId: this.$route.params.id.toString() }
								});
							} catch (e) {
								errorHandler.handle(e, this.$toast);
							}
							break;
						default:
							break;
					}
				}
			}
		},
		async stop(): Promise<void> {
			await NPCService.talkTo(this.dinozId!, this.npcName!, 'begin', true);
			this.$router.push({ name: 'DinozPage', params: { id: this.dinozId } });
		}
	},
	async mounted(): Promise<void> {
		EventBus.emit('isLoading', true);
		const npc = this.dinozStore.getNpc(this.dinozId);
		this.npcName = this.$route.params.npc as string;
		let step = 'begin';
		if (npc && npc.npcName === this.npcName) {
			step = npc.npcSpeech;
		} else {
			this.dinozStore.clearNpc(this.dinozId);
		}
		try {
			this.dinozId = parseInt(this.$route.params.id as string);
			this.npcSpeech = await NPCService.talkTo(this.dinozId, this.npcName, step);
			this.loaded = true;
			EventBus.emit('isLoading', false);
		} catch (err) {
			errorHandler.handle(err, this.$toast);
			return;
		}
		const npcCore = Object.values(npcList).find(npc => npc.name === this.npcName);
		if (npcCore) {
			this.swfName = npcCore.display ?? npcCore.name;
		} else {
			this.swfName = this.npcName;
		}
	}
});
</script>

<style lang="scss" scoped>
li a {
	display: block;
	padding-left: 20px;
	color: #fdd58a;
	font-family: Verdana, sans-serif;
	text-decoration: none;
	font-size: 10pt;
	line-height: 12pt;
	background-image: url('../assets/button/dot.webp');
	background-position: 13px 8px;
	background-repeat: no-repeat;
	border-radius: 0px;
	cursor: pointer;
	font-variant: small-caps;
	&:first-letter {
		font-size: 115%;
	}
	&:hover {
		color: #9a4029;
		background-color: #fdd58a;
	}
}
</style>
