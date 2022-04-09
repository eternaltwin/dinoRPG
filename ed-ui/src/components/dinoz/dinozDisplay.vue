<template>
	<Title :title="`${$t('pageTitle.dinoz')}${dinozData.name}]`"></Title>
	<a class="left" />
	<div class="title">
		{{ dinozData.name }}
	</div>
	<a class="right" />
	<DinozElements :dinozData="dinozData" />
	<DinozBars :dinozData="dinozData" />
	<DinozEquip :itemList="dinozData.items" />
	<DinozStatus :dinozStatus="dinozData.statusList" />
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent, PropType } from 'vue';
import { Dinoz } from '@/models';

export default defineComponent({
	name: 'DinozDisplay',
	props: { dinozData: Object as PropType<Dinoz> },
	data() {
		return {
			nameChoosen: undefined as boolean | undefined
		};
	},
	components: {
		DinozElements: defineAsyncComponent(() =>
			import('@/components/dinoz/dinozElements.vue')
		),
		DinozBars: defineAsyncComponent(() =>
			import('@/components/dinoz/dinozBars.vue')
		),
		DinozEquip: defineAsyncComponent(() =>
			import('@/components/dinoz/dinozEquip.vue')
		),
		DinozStatus: defineAsyncComponent(() =>
			import('@/components/dinoz/dinozStatus.vue')
		),
		Title: defineAsyncComponent(() => import('@/components/utils/Title.vue'))
	},
	methods: {
		getImg(folder: string, imgPrefix: string, imgName: string): string {
			return require(`@/assets/${folder}/${imgPrefix}${imgName}.webp`);
		}
	}
});
</script>

<style lang="scss" scoped>
.left {
	position: absolute;
	margin-left: 205px;
	margin-top: 69px;
	background-image: url('~@/assets/icons/left.webp');
	background-color: transparent;
	width: 15px;
	height: 21px;
	border-radius: 0px;
	cursor: pointer;
}
.title {
	position: absolute;
	top: -6.5px;
	background: url('~@/assets/background/name_box.gif') no-repeat;
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
	background-image: url('~@/assets/icons/right.webp');
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
