<template>
	<div class="elements_div">
		<div class="elements_top">
			<p>{{ $t('layout.elements') }}</p>
		</div>
		<Elements
			:fire="dinozData.nbrUpFire"
			:wood="dinozData.nbrUpWood"
			:water="dinozData.nbrUpWater"
			:lightning="dinozData.nbrUpLightning"
			:air="dinozData.nbrUpAir"
			class="elements_content"
		/>
	</div>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent, PropType } from 'vue';
import { Dinoz } from '@/models';

export default defineComponent({
	name: 'DinozElements',
	components: {
		Elements: defineAsyncComponent(() =>
			import('@/components/data/elements.vue')
		)
	},
	props: {
		dinozData: Object as PropType<Dinoz>
	}
});
</script>

<style lang="scss" scoped>
.elements_div {
	position: absolute;
	margin-left: 192px;
	margin-top: 198px;
	background: linear-gradient(
		180deg,
		rgba(186, 107, 66, 1) 0%,
		rgba(211, 152, 96, 1) 100%
	);
	background-size: auto;
	box-shadow: inset 0 0 1px 2px #d3a76a;
	.elements_content {
		list-style: none;
		height: 23px;
		margin-top: -13px;
		border-style: hidden solid solid solid;
		border-width: 0 1px 1px 1px;
		border-color: #9f5841;
		li {
			float: left;
			position: relative;
			width: 42px;
			height: 23px;
			margin-right: 2px;
			font-size: 10pt !important;
			font-weight: bold;
			color: white;
			text-align: left;
			letter-spacing: -0.2pt;
			background-image: url('~@/assets/icons/element_bg.webp');
			background-position: 7px 5px;
			background-repeat: no-repeat;
			cursor: help;

			&.max {
				color: yellow;
			}

			img {
				margin-right: -3px;
				vertical-align: -30%;
			}
			span {
				font-size: 10pt;
			}
		}
	}
	.elements_top {
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
}
</style>
