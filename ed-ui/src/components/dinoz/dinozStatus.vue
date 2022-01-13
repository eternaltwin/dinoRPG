<template>
	<div class="fx">
		<div class="fx_top">
			<p>{{ $t('layout.fx') }}</p>
		</div>
		<div class="fx_content">
			<Tippy theme="normal" v-for="(status, index) in dinozStatus" :key="index">
				<img :src="getImg(statusList.imgName[status])" />
				<template #content>
					<h1 v-html="formatContent($t(`status.name.${status}`))"></h1>
					<p v-html="formatContent($t(`status.description.${status}`))"></p>
				</template>
			</Tippy>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { statusList } from '@/constants';

export default defineComponent({
	name: 'DinozStatus',
	data() {
		return {
			statusList: statusList
		};
	},
	props: {
		dinozStatus: Array as PropType<Array<number>>
	},
	methods: {
		getImg(imgName: string): string {
			return require(`@/assets/status/fx_${imgName}.webp`);
		}
	}
});
</script>

<style lang="scss" scoped>
.fx {
	position: absolute;
	margin-left: 192px;
	margin-top: 101px;
	width: 223px;
	// height: 77px !important;
	// display: flex;
	// flex-wrap: wrap;
	background: linear-gradient(
		180deg,
		rgba(186, 107, 66, 1) 0%,
		rgba(211, 152, 96, 1) 100%
	);
	// background-position: bottom;
	background-size: auto;
	box-shadow: inset 0 0 1px 2px #d3a76a;
	.fx_top {
		width: 223px;
		height: 28px;
		background: url('~@/assets/background/box_header.webp') no-repeat;
		p {
			color: white;
			padding-left: 2px;
			font-size: 7.5pt;
			position: absolute;
			top: -1.5px;
			text-shadow: 0.5px 0 1px grey;
			text-transform: uppercase;
			font-family: 'Trebuchet MS', Arial, sans-serif;
			font-weight: bold;
		}
	}
	.fx_content {
		height: 77px;
		margin-top: -13px;
		padding-left: 2px;
		border-style: hidden solid solid solid;
		border-width: 0 1px 1px 1px;
		border-color: #9f5841;
	}
	img {
		border: 1px solid transparent;
		border-radius: 5px;

		&:hover {
			border-color: white;
		}
	}
}
</style>
