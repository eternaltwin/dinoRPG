<template>
	<div id="pixiCanvas"></div>
</template>

<script lang="ts">
import { defineComponent, toRaw } from 'vue';
import { Fight } from '@drpg/dino-animation';
import { localStore, sessionStore } from '../../store/index.js';
import { resolveFightingPlace, transpileFight } from '../../utils/transpileFight.js';
import { FightStep } from '@drpg/core/models/fight/FightStep';
import { FighterRecap } from '@drpg/core/models/fight/FightResult';

export default defineComponent({
	name: 'Fight',
	data() {
		return {
			loaded: false,
			sessionStore: sessionStore(),
			fight: undefined as Fight | undefined,
			localStore: localStore()
		};
	},
	emits: ['fightEnded'],
	props: {
		place: {
			type: Number,
			required: true
		}
	},
	methods: {
		loadAnimation() {
			const canvas = document.getElementById('pixiCanvas') as HTMLCanvasElement;
			if (this.fight && this.loaded) {
				canvas.appendChild(this.fight.getDisplay());
			}
		}
	},
	mounted() {
		const fightResult = this.sessionStore.getFightResult;
		if (!fightResult) return;
		const fightSteps = fightResult.history as FightStep[];
		const fighters = fightResult.fighters as FighterRecap[];
		if (!fightSteps || !fighters) return;

		console.log(fightSteps);

		console.log(fighters);
		const nexFight = transpileFight(structuredClone(toRaw(fighters)), fightSteps, this.$t);
		if (!nexFight) {
			return;
		}
		const initPlace = resolveFightingPlace(this.place);
		this.fight = new Fight({
			...initPlace,
			history: nexFight.filter(n => n != undefined),
			lang: this.localStore.getLanguage ?? 'fr'
		});

		console.log(nexFight.filter(n => n != undefined));
		this.loaded = true;
		this.fight.onFightEnd = () => {
			this.$emit('fightEnded');
		};
	},
	unmounted() {
		this.fight?.destroy();
	},
	watch: {
		loaded() {
			this.loadAnimation();
		}
	}
});
</script>

<style scoped lang="scss">
#pixiCanvas {
	margin-left: 21px;
}
</style>
