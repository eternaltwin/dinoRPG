<template>
	<div class="ml-[-30px] mt-[-195px] flex min-w-full items-center justify-center sm:ml-0 sm:mt-0 sm:block">
		<div
			class="ml-[10px] mt-[198px] h-[40px] w-[180px] bg-[url('./assets/background/stats_box.webp')] bg-no-repeat sm:absolute"
			v-if="dinozData"
		>
			<div
				class="absolute mt-[2px] text-center text-[17pt] font-bold text-[#faf1c5]"
				style="text-shadow: -1px -2px 0px #581a10"
				v-tippy="{
					content: formatContent($t('layout.level')),
					theme: 'small'
				}"
			>
				<div class="absolute w-[40px] cursor-help">{{ dinozData.level }}</div>
			</div>
			<div class="absolute ml-[69px] mt-[7px] w-[100px] text-[8pt] leading-[11pt] text-white">
				<div id="life">
					<div class="absolute h-[11px] w-[98px] cursor-help text-[0pt] leading-[0pt]">
						<img
							v-if="dinozData.life <= Math.round(dinozData.maxLife * 0.1)"
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
				<div
					class="absolute -mt-px w-[98px] text-center text-[9pt] font-bold text-[#fef4d4]"
					style="text-shadow: 1px 1px 0px #8f5203"
				>
					{{ dinozData.life }} / {{ dinozData.maxLife }}
				</div>
				<div id="xp">
					<div class="absolute mt-[15px] h-[11px] w-[98px] cursor-help text-[0pt] leading-[0pt]">
						<img
							:src="getImgURL('bar', 'bar_xp')"
							alt="xp"
							:style="getBarSize(dinozData.experience, dinozData.maxExperience)"
						/>
					</div>
				</div>
				<div
					class="absolute mt-[14px] w-[98px] text-center text-[9pt] font-bold text-[#fbd7ff]"
					style="text-shadow: 1px 1px 0px #812b56"
				>
					{{ dinozData.experience > dinozData.maxExperience ? dinozData.maxExperience : dinozData.experience }} /
					{{ dinozData.maxExperience }}
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';

export default defineComponent({
	name: 'DinozBars',
	props: { dinozData: Object as PropType<DinozFiche> },
	methods: {
		getBarSize(value: number, maxValue: number): string {
			// Limit value to max value
			const actualValue = value > maxValue ? maxValue : value;

			const width = Math.round((actualValue / maxValue) * 98);
			if (maxValue === 0) {
				return `width : 0px ; height : 11px`;
			}
			return `width : ${width}px ; height : 11px`;
		}
	}
});
</script>

<style lang="scss" scoped></style>
