<template>
	<div id="pixiCanvas"></div>
</template>

<script lang="ts">
import { defineComponent, toRaw } from 'vue';
import { Fight } from '@drpg/dino-animation';
import { sessionStore } from '../../store/index.js';
import { resolveFightingPlace, transpileFight } from '../../utils/transpileFight.js';
import { FightStep } from '@drpg/core/models/fight/FightStep';
import { FighterRecap } from '@drpg/core/models/fight/FightResult';

export default defineComponent({
	name: 'Fight',
	data() {
		return {
			hidden: true,
			sessionStore: sessionStore()
		};
	},
	props: {
		place: {
			type: Number,
			required: true
		}
	},
	mounted() {
		const canvas = document.getElementById('pixiCanvas') as HTMLCanvasElement;

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
		const fight2 = new Fight({
			...initPlace,
			history: nexFight.filter(n => n != undefined)
		});

		console.log(nexFight.filter(n => n != undefined));
		canvas.appendChild(fight2.getDisplay());
	}
});
</script>

<style scoped lang="scss">
#pixiCanvas {
	margin-left: 21px;
}
</style>
