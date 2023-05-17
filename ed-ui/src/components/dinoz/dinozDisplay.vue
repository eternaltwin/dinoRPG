<template>
	<TitleHeader :title="`${$t('pageTitle.dinoz')}${dinozData.name}]`"></TitleHeader>
	<a class="left" />
	<div class="title">
		{{ dinozData.name }}
	</div>
	<a class="right" />
	<Tippy theme="normal" tag="div" id="dinozVisual">
		<DinozWithoutFlash
			:style="style(dinozData.display)"
			:display="dinozData.display"
			:life="dinozData.life"
			:flip="-1"
			:race="dinozData.race.raceId"
		/>
		<template #content>
			<h1>{{ $t(`race.name.${dinozRace}`) }}</h1>
			<p>
				{{ $t(`race.description.${dinozRace}`) }}
			</p>
		</template>
	</Tippy>
	<DinozElements :dinozData="dinozData" />
	<DinozBars :dinozData="dinozData" />
	<DinozEquip :itemList="dinozData.items" />
	<DinozStatus :dinozStatus="dinozData.status" />
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent, PropType } from 'vue';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { dinozPlacement, raceList } from '../../constants/index.js';

export default defineComponent({
	name: 'DinozDisplay',
	components: {
		DinozWithoutFlash: defineAsyncComponent(() => import('../../components/dinoz/dinozWithoutFlash.vue')),
		DinozElements: defineAsyncComponent(() => import('../../components/dinoz/dinozElements.vue')),
		DinozBars: defineAsyncComponent(() => import('../../components/dinoz/dinozBars.vue')),
		DinozEquip: defineAsyncComponent(() => import('../../components/dinoz/dinozEquip.vue')),
		DinozStatus: defineAsyncComponent(() => import('../../components/dinoz/dinozStatus.vue')),
		TitleHeader: defineAsyncComponent(() => import('../../components/utils/TitleHeader.vue'))
	},
	data() {
		return {
			nameChoosen: undefined as boolean | undefined,
			position: dinozPlacement
		};
	},
	props: { dinozData: Object as PropType<DinozFiche> },
	computed: {
		dinozRace(): string {
			return Object.entries(raceList).find(race => parseInt(race[0]) === this.dinozData!.race?.raceId)![1];
		}
	},
	methods: {
		style(dinoz: string): string {
			if (this.dinozRace === 'moueffe' || this.dinozRace === 'pigmou') {
				const taille = parseInt(dinoz[1] === 'A' ? '9' : dinoz[1]);
				const left =
					((dinozPlacement.fliped[dinoz[0]].adult.left - dinozPlacement.fliped[dinoz[0]].baby.left) / 9) * taille +
					dinozPlacement.fliped[dinoz[0]].baby.left;
				const top =
					((dinozPlacement.fliped[dinoz[0]].adult.top - dinozPlacement.fliped[dinoz[0]].baby.top) / 9) * taille +
					dinozPlacement.fliped[dinoz[0]].baby.top;
				return `position: absolute; left: ${left}px; top: ${top}px;`;
			}
			return 'top: -15px;';
		}
	}
});
</script>

<style lang="scss" scoped>
#dinozVisual {
	width: 200px;
	height: 165px;
	position: absolute;
	top: 30px;
}
.left {
	position: absolute;
	margin-left: 205px;
	margin-top: 69px;
	background-image: url('../../assets/icons/left.webp');
	background-color: transparent;
	width: 15px;
	height: 21px;
	border-radius: 0px;
	cursor: pointer;
}
.title {
	position: absolute;
	top: -6.5px;
	background: url('../../assets/background/name_box.webp') no-repeat;
	width: 222px;
	height: 33px;
	margin-left: 240px;
	margin-top: 69px;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 15pt;
	font-weight: bold;
	text-transform: uppercase;
	letter-spacing: 1pt;
	color: #fce3bc;
	text-shadow: -1px -1px 0px #68361b, 1px 1px 0px #ddad8c;
}

.right {
	position: absolute;
	margin-left: 490px;
	margin-top: 69px;
	background-image: url('../../assets/icons/right.webp');
	background-color: transparent;
	width: 15px;
	height: 21px;
	border-radius: 0px;
	cursor: pointer;
}
</style>
