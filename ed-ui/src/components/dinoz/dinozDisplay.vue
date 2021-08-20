<template>
	<a class="left" />
	<div class="title">{{ dinozData.name }}</div>
	<a class="right" />
	<DinozSWF
		:display="dinozData.display"
		:width="190"
		:height="165"
		type="dino"
		class="avatar"
	></DinozSWF>
	<DinozElements
		:fire="dinozData.nbrUpFire"
		:wood="dinozData.nbrUpWood"
		:water="dinozData.nbrUpWater"
		:light="dinozData.nbrUpLight"
		:air="dinozData.nbrUpAir"
		class="infos"
	></DinozElements>
	<DinozBars :dinozData="dinozData" />
	<DinozEquip :dinozData="dinozData" />
	<DinozStatus :statusList="dinozData.status" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DinozSWF from '@/components/dinoz/dinozSWF.vue';
import DinozElements from '@/components/dinoz/dinozElements.vue';
import DinozBars from '@/components/dinoz/dinozBars.vue';
import DinozEquip from '@/components/dinoz/dinozEquip.vue';
import DinozStatus from '@/components/dinoz/dinozStatus.vue';

export default defineComponent({
	name: 'DinozDisplay',
	props: ['dinozData'],
	data() {
		return {
			nameChoosen: undefined as boolean | undefined
		};
	},
	components: {
		DinozElements,
		DinozSWF,
		DinozBars,
		DinozEquip,
		DinozStatus
	},
	methods: {
		getImg(folder: string, imgPrefix: string, imgName: string): string {
			return require(`@/assets/${folder}/${imgPrefix}${imgName}.png`);
		}
	}
});
</script>

<style lang="scss" scoped>
.left {
	position: absolute;
	margin-left: 205px;
	margin-top: 69px;
	background-image: url('~@/assets/icons/left.png');
	background-color: transparent;
	width: 15px;
	height: 21px;
	border-radius: 0px;
	cursor: pointer;
}
.title {
	position: absolute;
	text-align: center;
	width: 232px;
	margin-left: 240px;
	margin-top: 67px;
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
	background-image: url('~@/assets/icons/right.png');
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
.infos {
	position: absolute;
	margin-left: 195px;
	margin-top: 212px;

	ul.elements {
		position: absolute;
		width: 230px;
		margin-top: 2px;
	}
}
</style>
