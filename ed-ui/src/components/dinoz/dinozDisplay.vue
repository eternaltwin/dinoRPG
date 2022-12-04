<template>
	<TitleHeader :title="`${$t('pageTitle.dinoz')}${dinozData.name}]`"></TitleHeader>
	<a class="left" />
	<div class="title">
		{{ dinozData.name }}
	</div>
	<a class="right" />
	<Tippy theme="normal" tag="div" id="dinozVisual">
		<DinozWithoutFlash
			:style="{
				position: `absolute`,
				left: `${position.fliped[dinozData.display[1]].left}px`,
				top: `${position.fliped[dinozData.display[1]].top}px`
			}"
			:display="dinozData.display"
			:life="dinozData.life"
			:flip="-1"
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
import { Dinoz } from '@/models';
import { dinozPlacement, raceList } from '@/constants';

export default defineComponent({
	name: 'DinozDisplay',
	props: { dinozData: Object as PropType<Dinoz> },
	data() {
		return {
			nameChoosen: undefined as boolean | undefined,
			position: dinozPlacement
		};
	},
	computed: {
		dinozRace(): string {
			return Object.entries(raceList).find(race => race[0].toString() === this.dinozData!.display![0])![1];
		}
	},
	components: {
		DinozWithoutFlash: defineAsyncComponent(() => import('@/components/dinoz/dinozWithoutFlash.vue')),
		DinozElements: defineAsyncComponent(() => import('@/components/dinoz/dinozElements.vue')),
		DinozBars: defineAsyncComponent(() => import('@/components/dinoz/dinozBars.vue')),
		DinozEquip: defineAsyncComponent(() => import('@/components/dinoz/dinozEquip.vue')),
		DinozStatus: defineAsyncComponent(() => import('@/components/dinoz/dinozStatus.vue')),
		TitleHeader: defineAsyncComponent(() => import('@/components/utils/TitleHeader.vue'))
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
	background-image: url('@/assets/icons/left.webp');
	background-color: transparent;
	width: 15px;
	height: 21px;
	border-radius: 0px;
	cursor: pointer;
}
.title {
	position: absolute;
	top: -6.5px;
	background: url('@/assets/background/name_box.webp') no-repeat;
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
	background-image: url('@/assets/icons/right.webp');
	background-color: transparent;
	width: 15px;
	height: 21px;
	border-radius: 0px;
	cursor: pointer;
}
.avatar {
	position: absolute;
	margin-left: 5px;
	margin-top: 25px;
}
</style>
