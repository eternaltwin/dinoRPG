<template>
	<div id="pixiCanvas"></div>
</template>

<script lang="ts">
import { defineComponent, toRaw } from 'vue';
import { Fight } from '@drpg/dino-animation';
import { dinozStore, sessionStore } from '../../store/index.js';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { resolveFightingPlace, transpileFight } from '../../utils/transpileFight.js';

export default defineComponent({
	name: 'Fight',
	data() {
		return {
			dinoz: dinozStore().getDinoz(parseInt(this.$route.params.dinozId as string)) as DinozFiche,
			hidden: true,
			fight: sessionStore().getFightResult
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
		const allDinoz = [this.dinoz];
		if (this.dinoz.followers.length > 0) {
			this.dinoz.followers.forEach(d => allDinoz.push(dinozStore().getDinoz(d)));
		}
		if (!this.fight) return;
		const history = this.fight.history;
		console.log(history);

		const objStructuredCopy = structuredClone(toRaw(history));

		const nexFight = transpileFight(objStructuredCopy, this.$t);
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
