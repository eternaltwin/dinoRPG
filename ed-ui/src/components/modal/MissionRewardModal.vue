<template>
	<Transition>
		<div v-if="missionReward" class="modal-background">
			<div class="modal-box">
				<div class="result">
					{{ $t(`missions.status.over`, { mission: $t(`missions.name.${missionName}`) }) }}
				</div>
				<p>{{ $t(`missions.dialog.${missionName}.${validator}`) }}</p>
				<ul>
					<li v-if="xp"><img :src="getImgURL('icons', 'small_xp')" alt="xp" /> {{ xp }} {{ $t('missions.xp') }}</li>
					<li v-if="gold">
						<img :src="getImgURL('icons', 'small_gold')" alt="or" /> {{ gold }} {{ $t('missions.gold') }}
					</li>
					<li v-if="items.length > 0">
						{{ $t('missions.item') }}
						<Tippy
							theme="normal"
							tag="img"
							v-for="item in items"
							:key="item"
							:src="getImgURL('item', `item_${item}`)"
							alt="use"
						>
							<template #content>
								<h1 v-html="formatContent($t(`item.name.${item}`))" />
								<p v-html="formatContent($t(`item.description.${item}`))" />
							</template>
						</Tippy>
					</li>
				</ul>
				<div class="option">
					<a class="button" @click="$emit('close')">
						{{ $t('missions.continue') }}
					</a>
				</div>
			</div>
		</div>
	</Transition>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { missionsList } from '@/constants/index.js';
import { Dinoz } from '@/models/index.js';
import { sessionStore } from '@/store/index.js';

export default defineComponent({
	name: 'MissionRewardModal',
	data() {
		return {
			sessionStore: sessionStore()
		};
	},
	props: {
		missionText: String,
		missionReward: String,
		npc: String
	},
	computed: {
		missionName(): string {
			const dinozId = this.$route.params.id as string;
			const dinozList: Array<Dinoz> = this.sessionStore.getDinozList!;
			const myDinoz = dinozList.find(dinoz => dinoz.id!.toString() === dinozId)!;
			const missionId = myDinoz.missionId as number;
			return missionsList[missionId];
		},
		validator(): string {
			const dinozId = this.$route.params.id as string;
			const dinozList: Array<Dinoz> = this.sessionStore.getDinozList!;
			const myDinoz = dinozList.find(dinoz => dinoz.id!.toString() === dinozId)!;
			return myDinoz.missions!.substring(myDinoz.missions!.indexOf('(') + 1, myDinoz.missions!.indexOf(')'));
		},
		rewards(): Array<string> {
			return this.missionReward!.split('-');
		},
		xp(): number | undefined {
			const isXP: string | undefined = this.rewards.find(el => el.includes('xp'));
			if (!isXP) {
				return undefined;
			} else {
				return parseInt(isXP.substring(isXP.indexOf('(') + 1, isXP.indexOf(')')));
			}
		},
		gold(): number | undefined {
			const isGold: string | undefined = this.rewards.find(el => el.includes('gold'));
			if (!isGold) {
				return undefined;
			} else {
				return parseInt(isGold.substring(isGold.indexOf('(') + 1, isGold.indexOf(')')));
			}
		},
		items(): Array<string> | undefined {
			const isItem: Array<string> | undefined = this.rewards.filter(el => el.includes('item'));
			if (!isItem) {
				return undefined;
			} else {
				return isItem.map(el =>
					el
						.substring(el.indexOf('(') + 1, el.indexOf(')'))
						.split(',')[0]
						.toLowerCase()
				);
			}
		}
	}
});
</script>

<style lang="scss" scoped>
.modal-background {
	position: fixed;
	background: transparentize(#09092d, 0.4);
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	z-index: 999;
	transition: all 0.3s;
	display: flex;
	justify-content: center;
	align-items: center;

	.modal-box {
		background-image: url('@/assets/background/mission.webp');
		background-repeat: no-repeat;
		width: 394px;
		height: 296px;
		position: absolute;
		background-color: #fff0d1;
		border-radius: 3px;
		border: 1px solid #efbf86;
		box-shadow: 0 0 0 1px #aa885f, 0 0 5px 1px #aa885f;
		animation: blowUpModal 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
		.result {
			font-size: 10pt;
			text-align: justify;
			line-height: 12pt;
			padding-bottom: 5px;
			margin: 25px 40px 5px 35px;
			color: black;
			font-weight: bold;
			border-bottom: 1px solid #e6b778;
		}
		p {
			margin-bottom: 5px;
			line-height: 12pt;
			padding-left: 35px;
			padding-right: 40px;
			color: #9d6523;
			text-align: justify;
			font-size: 10pt;
		}
		ul {
			width: 250px;
			list-style: none;
			margin-bottom: 15px;
			padding-left: 35px;
			padding-right: 40px;
			li {
				color: #ffee92;
				padding-left: 10px;
				padding-top: 1px;
				padding-bottom: 1px;
				margin-bottom: 2px;
				font-size: 10pt;
				background-color: #bc683c;
				border-radius: 10px;
				-webkit-border-radius: 10px;
			}
		}
		.option {
			margin-left: 35px;
			margin-right: 35px;
			padding-top: 10px;
			border-top: 1px solid #e6b778;
			font-weight: bold;
			p {
				margin-bottom: 0;
				padding-left: 0;
				padding-right: 0;
				padding-top: 0;
				color: #9d6523;
				text-align: justify;
				font-size: 10pt;
			}
		}
	}
}

.v-enter-active {
	transition: opacity 0.5s ease, bottom 0.5s ease;
	animation-delay: 0.35s;
}
.v-leave-active {
	transition: opacity 0.5s ease, bottom 0.5s ease;
}

.v-enter-from {
	bottom: 0;
	opacity: 0;
}
.v-leave-to {
	bottom: 0;
	opacity: 0;
}

.modal-close {
	min-width: 31px;
	cursor: pointer;
	position: absolute;
	text-align: center;
	right: 0;
	top: 0;
	padding: 5px;
	background-color: #fadcb0;
	color: transparentize(brown, 0.4);
	font-size: 0.85em;
	letter-spacing: 0.03em;
	text-decoration: none;
	font-variant: small-caps;
	transition: all 0.15s;

	&:hover,
	&:focus,
	&:active {
		color: black;
	}
}

@keyframes blowUpModal {
	0% {
		transform: scale(0);
	}
	100% {
		transform: scale(1);
	}
}
</style>
