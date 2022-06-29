<template>
	THIS IS A TEMPORARY DISPLAY ! <br /><br /><br /><br />
	<div class="life">HP Lost : {{ fight.hpLost }}</div>
	<div class="xp">XP Earned : {{ fight.xpEarned }}</div>
	<div class="money">Gold Earned : {{ fight.goldEarned }}</div>
	<a class="button" @click="returnToDinoz()">Continuer</a>
	<a class="button">Afficher le combat</a>
</template>

<script lang="ts">
import { Dinoz, FightResult } from '@/models';
import { sessionStore } from '@/store';
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'Fight',
	data() {
		return {
			fight: {} as FightResult
		};
	},
	methods: {
		returnToDinoz() {
			this.$router.go(-1);
		}
	},
	mounted(): void {
		this.fight = sessionStore.getters.getFightResult;
		const newMoney = (sessionStore.getters.getMoney +
			this.fight.goldEarned) as number;
		sessionStore.commit('setMoney', newMoney);

		const dinozInStore: Array<Dinoz> = sessionStore.getters.getDinozList;
		const dinoz: Dinoz = dinozInStore.find(
			dinoz => dinoz.dinozId!.toString() === this.$route.params.dinozId
		)!;
		dinoz.experience! += this.fight.xpEarned;
		sessionStore.commit('setDinozList', dinozInStore);
	}
});
</script>

<style lang="scss" scoped>
.filler {
	height: 180px;
	width: 550px;
}
.wrapper {
	display: flex;
	width: 620px;
	justify-content: space-between;
	gap: 10px;
	flex-wrap: wrap;
}
</style>
