<template>
	<div class="archetype" data-testid="tournament-archetype">
		<p class="meta" v-if="info.metaArchetype && !isLegacy">{{ metaName }}</p>
		<p class="sub" v-if="info.formatName">{{ subName }}</p>
		<p class="description" v-if="subDescription" v-html="formatContent(subDescription)" />
		<p class="description" v-else-if="metaDescription && !isLegacy" v-html="formatContent(metaDescription)" />
		<ul class="params">
			<li>{{ $t('dojo.ui.archetype.teamSize', { qty: info.teamSize }) }}</li>
			<li v-if="info.raceMinimum && info.raceMinimum > 1">
				{{ $t('dojo.ui.archetype.raceMinimum', { qty: info.raceMinimum }) }}
			</li>
			<li>{{ $t('dojo.ui.archetype.levelLimit', { level: info.levelLimit }) }}</li>
			<li v-if="info.poison !== undefined">
				{{ info.poison ? $t('dojo.ui.archetype.poisonOn') : $t('dojo.ui.archetype.poisonOff') }}
			</li>
		</ul>
		<template v-if="ruleLines.length > 0">
			<p class="rules-title">{{ $t('dojo.ui.archetype.rules') }}</p>
			<ul class="rules">
				<li v-for="line in ruleLines" :key="line.key" v-html="formatContent($t(line.key, line.params))" />
			</ul>
		</template>
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { DojoTournamentInfo } from '../../services/DojoService.js';
import { describeRules, describeSubParams, RuleLine } from '../../utils/dojo.js';
import { findSubArchetype } from '@drpg/core/models/dojo/tournamentArchetypes';

export default defineComponent({
	name: 'TournamentArchetype',
	props: {
		info: {
			type: Object as PropType<DojoTournamentInfo>,
			required: true
		}
	},
	computed: {
		/** Tournament created before the archetypes: its legacy format has no meta (the column defaults to ffa) */
		isLegacy(): boolean {
			return !!this.info.formatName && !findSubArchetype(this.info.formatName);
		},
		metaName(): string {
			const key = this.info.metaArchetype ?? '';
			return this.translateOr(`tournament.archetype.meta.${key}.name`, key);
		},
		metaDescription(): string | null {
			const key = `tournament.archetype.meta.${this.info.metaArchetype}.description`;
			return this.has(key) ? this.$t(key) : null;
		},
		subName(): string {
			const key = this.info.formatName ?? '';
			// Formats of the tournaments created before the archetypes
			const legacy = `dojo.tournamentFormats.${key}`;
			return this.translateOr(`tournament.archetype.sub.${key}.name`, this.has(legacy) ? this.$t(legacy) : key);
		},
		subDescription(): string | null {
			const key = `tournament.archetype.sub.${this.info.formatName}.description`;
			return this.has(key)
				? this.$t(
						key,
						describeSubParams(this.info, k => this.$t(k), this.has)
					)
				: null;
		},
		ruleLines(): RuleLine[] {
			return describeRules(this.info.rules, key => this.$t(key), this.has);
		}
	},
	methods: {
		has(key: string): boolean {
			return this.$te(key) || this.$te(key, 'fr');
		},
		translateOr(key: string, fallback: string): string {
			return this.has(key) ? this.$t(key) : fallback;
		}
	}
});
</script>

<style lang="scss" scoped>
.archetype {
	align-self: center;
	width: 95%;
	box-sizing: border-box;
	margin: 4px auto;
	padding: 8px 12px;
	background-color: #4d2713;
	border: 1px solid #bc683c;
	border-radius: 5px;
	color: #fff;

	.meta {
		text-transform: uppercase;
		font-size: 11px;
		color: #ffda97;
	}

	.sub {
		font-weight: bold;
		font-size: 14px;
		color: #aae59c;
	}

	.description {
		margin: 4px 0;
	}

	.rules-title {
		font-weight: bold;
		color: #ffda97;
		margin-top: 4px;
	}

	ul {
		padding-left: 16px;
		list-style: disc;
	}
}
</style>
