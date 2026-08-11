<template>
	<TitleHeader :title="$t('pageTitle.dinozShop')" :header="$t(`shop.dinoz.header`)" />
	<DZDisclaimer help round :content="$t('shop.dinoz.help')" />
	<div class="shop_view">
		<div class="sheets" :id="'detail_' + index" v-for="(dinoz, index) in dinozList" :key="dinoz.id">
			<DZShop :dinoz="dinoz" currency="gold" @action="openPopinConfirmChoice(dinoz)" />
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DZDisclaimer from '../components/common/DZDisclaimer.vue';
import DZShop from '../components/common/DZShop.vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import { DinozShopService, DinozService } from '../services/index.js';
import { errorHandler, utils } from '../utils/index.js';
import { DinozShopFiche } from '@drpg/core/models/shop/DinozShopFiche';
import { playerStore, useDinozStore } from '../store/index.js';
import { raceList } from '@drpg/core/models/dinoz/RaceList';
import { skillList } from '@drpg/core/models/dinoz/SkillList';

export default defineComponent({
	name: 'DinozShopPage',
	data() {
		return {
			playerStore: playerStore(),
			utils,
			dinozList: [] as Array<DinozShopFiche>,
			raceList,
			skillList
		};
	},
	components: {
		TitleHeader,
		DZDisclaimer,
		DZShop
	},
	methods: {
		async openPopinConfirmChoice(dinoz: DinozShopFiche): Promise<void> {
			const res: boolean = await this.$confirm({
				message: this.$t('popup.confirm'),
				header: this.$t('popup.attention'),
				acceptLabel: this.$t('popup.accept'),
				rejectLabel: this.$t('popup.reject'),
				icon: 'pi pi-trash'
			});
			if (res) {
				try {
					const dinozCreated = await DinozService.buyDinoz(parseInt(dinoz.id));
					await this.$refreshGold();

					const dinozStore = useDinozStore().getDinozList;

					dinozStore.push(dinozCreated);

					// Update dinoz list
					useDinozStore().setDinozList(dinozStore);

					// Go to dinoz page
					await this.$router.push({
						name: 'DinozPage',
						params: {
							id: dinozCreated.id
						}
					});
				} catch (err) {
					errorHandler.handle(err, this.$toast);
					return;
				}
			}
		}
	},
	async mounted(): Promise<void> {
		// Get dinoz to display
		try {
			this.dinozList = (await DinozShopService.getDinozFromDinozShop()).map(d => {
				return {
					id: d.id,
					level: 1,
					display: d.display,
					raceId: d.race,
					nbrUpFire: raceList[d.race].nbrFire,
					nbrUpWood: raceList[d.race].nbrWood,
					nbrUpWater: raceList[d.race].nbrWater,
					nbrUpLightning: raceList[d.race].nbrLightning,
					nbrUpAir: raceList[d.race].nbrAir,
					skills: raceList[d.race].skills ?? [],
					// unlockable skills?
					price: raceList[d.race].price
				} satisfies DinozShopFiche;
			});
		} catch (err) {
			errorHandler.handle(err, this.$toast);
			return;
		}
	}
});
</script>

<style lang="scss" scoped>
@media (max-width: 510px) {
	.sheets {
		max-width: 95%;
	}
}
.shop_view {
	display: flex;
	gap: 30px;
	flex-direction: column;
	align-self: center;
}
</style>
