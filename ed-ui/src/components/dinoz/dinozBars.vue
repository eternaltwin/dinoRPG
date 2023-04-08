<template>
	<div class="dinozBars">
		<div
			class="level"
			v-tippy="{
				content: formatContent($t('layout.level')),
				theme: 'small'
			}"
		>
			<div class="over">{{ dinozData.level }}</div>
		</div>
		<div class="bars">
			<div class="life">
				<div class="bar">
					<img
						v-if="dinozData.life === 0"
						:src="getImgURL('bar', 'bar_warning')"
						alt="life"
						style="width: 98px; height: 11px"
					/>
					<img
						v-else
						:src="getImgURL('bar', 'bar_life')"
						alt="life"
						:style="getBarSize(dinozData.life, dinozData.maxLife)"
					/>
				</div>
			</div>
			<div class="lifetext">{{ dinozData.life }} / {{ dinozData.maxLife }}</div>
			<div class="xp">
				<div class="bar">
					<img
						:src="getImgURL('bar', 'bar_xp')"
						alt="xp"
						:style="getBarSize(dinozData.experience, dinozData.maxExperience)"
					/>
				</div>
			</div>
			<div class="xptext">{{ dinozData.experience }} / {{ dinozData.maxExperience }}</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Dinoz } from '../../models/index.js';

export default defineComponent({
	name: 'DinozBars',
	props: { dinozData: Object as PropType<Dinoz> },
	methods: {
		getBarSize(value: number, maxValue: number): string {
			const width: number = Math.round((value / maxValue) * 98);
			if (maxValue === 0) {
				return `width : 0px ; height : 11px`;
			}
			return `width : ${width}px ; height : 11px`;
		}
	}
});
</script>

<style lang="scss" scoped>
.dinozBars {
	background: url('../../assets/background/stats_box.webp') no-repeat;
	width: 180px;
	height: 40px;
	position: absolute;
	top: 198px;
	left: 10px;
	.bars {
		position: absolute;
		margin-left: 69px;
		margin-top: 7px;
		width: 100px;
		font-size: 8pt;
		line-height: 11pt;
		color: white;

		.lifetext {
			font-size: 11px;
			margin-top: -1px;
			position: absolute;
			font-weight: bold;
			width: 98px;
			text-align: center;
			color: #fef4d4;
			text-shadow: 1px 1px 0px #8f5203;
		}

		.xptext {
			position: absolute;
			font-size: 11px;
			margin-top: 14px;
			font-weight: bold;
			width: 98px;
			text-align: center;
			color: #fbd7ff;
			text-shadow: 1px 1px 0px #812b56;
		}
	}

	.bar {
		cursor: help;
		position: absolute;
		width: 98px;
		height: 11px;
		font-size: 0pt;
		line-height: 0pt;
	}

	.xp {
		.bar {
			margin-top: 15px;
		}
	}
	.level {
		position: absolute;
		margin-top: 7px;
		font-weight: bold;
		text-align: center;
		font-size: 17pt;
		color: #faf1c5;
		text-shadow: -1px -2px 0px #581a10;

		.over {
			cursor: help;
			position: absolute;
			width: 40px;
			letter-spacing: -2pt;
		}
	}
}
</style>
