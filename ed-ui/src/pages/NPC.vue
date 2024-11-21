<template>
	<TitleHeader
		:title="`${$t('pageTitle.npc')}${$t(`npc.name.${npcName}`)}]`"
		:header="formatContent($t(`npc.header.character`))"
		:subHeader="formatContent($t(`npc.name.${npcName}`))"
	></TitleHeader>
	<div class="wrapper">
		<div class="box">
			<p class="name">{{ $t(`npc.name.${npcName}`) }} :</p>
			<div class="content">
				<span
					class="dialog"
					v-if="npcSpeech.speech"
					v-html="formatContent($t(`npc.${npcName}.speech.${npcSpeech.speech}`))"
				/>
				<div class="portrait">
					<AnimatedNPC :NPC="swfName" :flashvars="npcSpeech.flashvars" />
					<DZButton @click="stop()">{{ $t(`npc.stop`) }}</DZButton>
				</div>
			</div>
		</div>
		<div class="footer"></div>
		<ul id="answer" v-if="loaded && npcSpeech.playerChoice.length > 0">
			<li v-for="choice in npcSpeech.playerChoice" :key="choice">
				<a v-html="formatContent($t(`npc.${npcName}.playerChoice.${choice}`))" @click="choiseStep(choice)" />
			</li>
		</ul>
	</div>
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
import DZButton from '../components/common/DZButton.vue';

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
		DZButton,
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
.wrapper {
	width: 95%;
	align-self: center;
}
.box {
	cursor: pointer;
	background-repeat: repeat-y;
	//background-image: url('../assets/background/dialog_bg_pix.webp');
	background: url('../assets/background/dialog_bg_top_left.webp'), url('../assets/background/dialog_bg_top_right.webp'),
		url('../assets/background/dialog_bg_top_center.webp'), url('../assets/background/dialog_bg_footer_left.webp'),
		url('../assets/background/dialog_bg_footer_right.webp'), url('../assets/background/dialog_bg_footer_center.webp'),
		url('../assets/background/dialog_bg_center_left.webp'), url('../assets/background/dialog_bg_center_right.webp'),
		url('../assets/background/dialog_bg_center_center.webp');
	background-position-x: left, right, center, left, right, center, left, right, center;
	background-position-y: top, top, top, bottom, bottom, bottom, 40px, 40px, 40px;
	background-repeat: no-repeat, no-repeat, repeat-x, no-repeat, no-repeat, repeat-x, repeat-y, repeat-y, repeat;

	padding-right: 5px;
	padding-left: 5px;
	.name {
		margin-left: 15px;
		padding-top: 15px;
		font-variant: small-caps;
		font-weight: bold;
		font-size: 10pt;
		color: #693118;
	}
	.content {
		min-height: 148px;
		padding: 1px;
		background-repeat: no-repeat;
		background-position: bottom left;
		overflow: hidden;
		display: flex;
		justify-content: space-between;
		gap: 15px;
		.portrait {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 5px;
			width: fit-content;
		}

		.dialog {
			width: fit-content;
			float: left;
			position: relative;
			margin-bottom: 10px;
			margin-left: 10px;
			color: #fff3b3;
			font-size: 10pt;
			font-style: italic;
			overflow: hidden;
		}
	}
}
/*.footer {
	&::after {
		content: '.';
		visibility: hidden;
	}
	background: url('../assets/background/dialog_bg_footer_left.webp'), url('../assets/background/dialog_bg_footer_right.webp'),
	url('../assets/background/dialog_bg_footer_center.webp');
	background-position-x: left, right, center;
	background-repeat: no-repeat, no-repeat, repeat-x;
	display: block;

}*/
#answer {
	list-style: none;
	margin-top: 10px;
	padding-top: 5px;
	padding-bottom: 5px;
	background-color: #9a4029;
	border: 1px solid white;
	outline: 1px solid black;
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
}
</style>
