<template>
	<div id="DinozShopPage"></div>
	<div v-for="dinoz in dinozList" :key="dinoz.dinozId">
		<dinozSWF
			:display="dinoz.display"
			:width="190"
			:height="165"
			type="dino"
		></dinozSWF>
		<span>{{ dinoz.race.name }}</span>
		<span>{{ dinoz.race.price }}</span>
		<span>{{ dinoz.race.nbrFireCase }}</span>
		<span>{{ dinoz.race.nbrWoodCase }}</span>
		<span>{{ dinoz.race.nbrWaterCase }}</span>
		<span>{{ dinoz.race.nbrLightCase }}</span>
		<span>{{ dinoz.race.nbrAirCase }}</span>
		<span v-if="dinoz.race.skill">{{ dinoz.race.skill.name }}</span>
		<button @click="openPopinConfirmChoice(dinoz)">Choisir</button>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ShopService, DinozService } from '@/services';
import { DinozShop, Dinoz } from '@/models';
import { errorHandler } from '@/utils';
import DinozSWF from '@/components/dinoz/dinozSWF.vue';
import store from '@/store';

export default defineComponent({
	name: 'DinozShopPage',
	data() {
		return {
			dinozList: [] as Array<DinozShop>
		};
	},
	components: {
		DinozSWF
	},
	methods: {
		async openPopinConfirmChoice(dinoz: DinozShop): Promise<void> {
			const res: boolean = confirm(this.$t('bouton.confirmer'));
			if (res) {
				let dinozCreated: Dinoz;
				try {
					dinozCreated = await DinozService.buyDinoz(dinoz.id);
				} catch (err) {
					errorHandler.handle(err);
					return;
				}

				// Update player's money
				const newMoney = (store.getters.getMoney - dinoz.race.price!) as number;
				store.commit('setMoney', newMoney);

				// TODO : A VOIR si factorisable
				const dinozStore = store.getters.getDinozList;

				dinozStore.push(dinozCreated);

				// Update dinoz list
				store.commit('setDinozList', dinozStore);

				// Go to dinoz page
				this.$router.push({
					name: 'DinozPage',
					params: {
						id: dinozCreated.dinozId!
					}
				});
			}
		}
	},
	async mounted(): Promise<void> {
		// Get dinoz to display
		try {
			this.dinozList = await ShopService.getDinozFromDinozShop();
		} catch (err) {
			errorHandler.handle(err);
		}
	}
});
</script>
