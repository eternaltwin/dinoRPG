<template>
	<div class="gain-recap" data-testid="qualif-gain">
		<p class="title">{{ $t('dojo.ui.gain.title') }}</p>
		<template v-if="gain.total > 0">
			<p class="line">
				<span>{{ $t('dojo.ui.gain.base') }}</span>
				<span>{{ gain.base }}</span>
			</p>
			<p class="line" v-if="gain.levelBonus > 0">
				<span>{{ $t('dojo.ui.gain.levelBonus') }}</span>
				<span>+{{ gain.levelBonus }}</span>
			</p>
			<p class="line" v-if="gain.featuredMultiplier !== 1">
				<span>{{ $t('dojo.ui.gain.featured') }}</span>
				<span>×{{ formatMultiplier(gain.featuredMultiplier) }}</span>
			</p>
			<p class="line total">
				<span>{{ $t('dojo.ui.gain.total') }}</span>
				<span>{{ $t('dojo.ui.gain.points', { qty: gain.total }) }}</span>
			</p>
		</template>
		<p v-else class="line">{{ $t('dojo.ui.gain.none') }}</p>
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { QualifGain } from '@drpg/core/utils/dojoQualif';
import { localStore } from '../../store/index.js';

export default defineComponent({
	name: 'QualifGainRecap',
	props: {
		gain: {
			type: Object as PropType<QualifGain>,
			required: true
		}
	},
	methods: {
		formatMultiplier(value: number): string {
			return value.toLocaleString(localStore().getLanguage || undefined);
		}
	}
});
</script>

<style lang="scss" scoped>
.gain-recap {
	align-self: center;
	width: 95%;
	max-width: 320px;
	box-sizing: border-box;
	padding: 6px 12px;
	background-color: #4d2713;
	border: 1px solid #bc683c;
	border-radius: 5px;
	color: #fff;

	.title {
		text-align: center;
		text-transform: uppercase;
		font-weight: bold;
		color: #ffda97;
		margin-bottom: 4px;
	}

	.line {
		display: flex;
		justify-content: space-between;
		gap: 8px;

		&.total {
			border-top: 1px solid #bc683c;
			margin-top: 4px;
			padding-top: 4px;
			font-weight: bold;
			color: #aae59c;
		}
	}
}
</style>
