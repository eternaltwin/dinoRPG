<template>
	THIS IS A TEMPORARY DISPLAY ! <br /><br /><br /><br />
	<div v-if="fight.result">YOU WON!</div>
	<div v-else>YOU LOST!</div>
	<div class="monster">You fought a: {{ fight.opponent }}</div>
	<div class="life">HP Lost : {{ fight.hpLost }}</div>
	<div class="xp">XP Earned : {{ fight.xpEarned }}</div>
	<div class="money">Gold Earned : {{ fight.goldEarned }}</div>
	<a class="button" @click="returnToDinoz()">Continuer</a>
	<a class="button" v-if="isDevEnv()" @click="processFight()">Combattre de nouveau</a>
	<a class="button">Afficher le combat</a>
</template>

<script lang="ts">
import { Dinoz, FightResult } from '@/models';
import { FightService } from '@/services';
import { sessionStore } from '@/store';
import { errorHandler } from '@/utils';
import EventBus from '@/events';
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'Fight',
	data() {
		return {
			sessionStore: sessionStore(),
			fight: {} as FightResult,
			dinozId: undefined as number | undefined
		};
	},
	methods: {
		returnToDinoz() {
			this.$router.go(-1);
		},
		async processFight() {
			EventBus.emit('isLoading', true);
			try {
				const result: FightResult = await FightService.processFight(this.dinozId!);
				this.sessionStore.setFightResult(result);
				this.fight = this.sessionStore.getFightResult!;
				if (result.result) {
					const newMoney: number = this.sessionStore.getMoney! + this.fight.goldEarned;
					this.sessionStore.setMoney(newMoney);
					const dinozInStore: Array<Dinoz> = this.sessionStore.getDinozList!;
					const dinoz: Dinoz = dinozInStore.find(dinoz => dinoz.id! === this.dinozId)!;
					dinoz.experience! += this.fight.xpEarned;
				}
				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err);
				return;
			}
		},
		isDevEnv(): boolean {
			return import.meta.env.MODE === 'development';
		}
	},
	created(): void {
		this.dinozId = parseInt(this.$router.currentRoute.value.query.dinozId as string);
		if (this.sessionStore.getFightResult) {
			this.fight = this.sessionStore.getFightResult;
		}
	},
	unmounted(): void {
		this.sessionStore.setFightResult(undefined);
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
