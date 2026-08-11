<template>
	<TitleHeader :title="$t('pageTitle.demonShop')" :header="formatContent($t(`shop.demon.name`))" />
	<DZDisclaimer help round :content="$t('shop.demon.help')" />
	<!-- TODO1 Rework so the player picks between the sacrifice view, the buy view and the resurrect view. -->
	<!-- TODO1 only show the buy & help views if the player has Dinoz in those categories -->
	<DZDisclaimer help round :content="$t('shop.demon.sacrifice_help')" />
	<DZDisclaimer help round :content="$t('shop.demon.buy_help')" />
	<DZDisclaimer help round :content="$t('shop.demon.unsacrifice_help')" />

	<div class="shop_view">
		<div class="titleContent">
			<h3>{{ $t('shop.demon.sacrifice_title') }}</h3>
		</div>
		<div
			class="sacrifice_sheets"
			:id="'sacrifice_sheet_' + index"
			v-for="(dinoz, index) in demonShop.dinoz"
			:key="dinoz.id"
		>
			<DZShop :dinoz="dinoz" sacrifice currency="demon" @action="confirmSacrifice" />
		</div>

		<div class="titleContent">
			<h3>{{ $t('shop.demon.buy_title') }}</h3>
		</div>
		<div class="demon_sheets" :id="'demon_sheet_' + index" v-for="(dinoz, index) in demonShop.shop" :key="dinoz.id">
			<DZShop :dinoz="dinoz" currency="demon" details @action="confirmPurchase(dinoz.id)" />
		</div>

		<div class="titleContent">
			<h3>{{ $t('shop.demon.unsacrifice_title') }}</h3>
		</div>

		<div
			class="unsacrifice_sheets"
			:id="'unsacrifice_sheet_' + index"
			v-for="(dinoz, index) in demonShop.sacrificed"
			:key="dinoz.id"
		>
			<DZShop :dinoz="dinoz" currency="demon" details @action="confirmUnsacrifice(dinoz.id)" />	
		</div>
	</div>
</template>

<script lang="ts" scoped>
import { defineComponent } from 'vue';
import DZDisclaimer from '../components/common/DZDisclaimer.vue';
import DZShop from '../components/common/DZShop.vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import { DemonShopService } from '../services/DemonShopService.js';
import { playerStore, useDinozStore } from '../store/index.js';
import { errorHandler, utils } from '../utils/index.js';
import { demonDinozFiche, demonShopFiche } from '@drpg/core/models/shop/demonShopFiche';
import { raceList } from '@drpg/core/models/dinoz/RaceList';
import { skillList } from '@drpg/core/models/dinoz/SkillList';
import { SkillDetails } from '@drpg/core/models/dinoz/SkillDetails';
import { toSkillDetails } from '@drpg/core/utils/DinozUtils';
import { ElementType } from '@drpg/core/models/enums/ElementType';

export default defineComponent({
	name: 'DemonShopPage',
	components: {
		DZDisclaimer,
		DZShop,
		TitleHeader
	},
	data() {
		return {
			playerStore: playerStore(),
			utils,
			raceList,
			skillList,
			ElementType,
			demonShop: {} as demonShopFiche,
			openDetails: new Map() as Map<number, SkillDetails[]>
		};
	},
	methods: {
		async refresh(): Promise<void> {
			try {
				this.demonShop = await DemonShopService.getDemonDinozShop();
				this.openDetails = new Map();
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		async confirmSacrifice(sacrifice: demonDinozFiche): Promise<void> {
			const res: boolean = await this.$confirm({
				message: this.$t('popup.confirm'),
				header: this.$t('popup.attention'),
				acceptLabel: this.$t('popup.accept'),
				rejectLabel: this.$t('popup.reject'),
				icon: 'pi pi-trash'
			});
			if (res) {
				try {
					const tickets = await DemonShopService.sacrificeDinoz(sacrifice.id);
					this.$toast.open({
						message: this.$t(`shop.demon.sacrifice_toast`, { tickets: tickets }),
						type: 'reward'
					});
				} catch (err) {
					errorHandler.handle(err, this.$toast);
					return;
				}
				// Update Dinoz list
				let dinozStore = useDinozStore().getDinozList;
				dinozStore = dinozStore.filter(d => d.id !== sacrifice.id);
				useDinozStore().setDinozList(dinozStore);
				// Update store to show the dinoz as buy back
				this.demonShop.dinoz = this.demonShop.dinoz.filter(d => d.id !== sacrifice.id);
				this.demonShop.sacrificed.push(sacrifice);
			}
		},
		async confirmPurchase(id: number): Promise<void> {
			const res: boolean = await this.$confirm({
				message: this.$t('popup.confirm'),
				header: this.$t('popup.attention'),
				acceptLabel: this.$t('popup.accept'),
				rejectLabel: this.$t('popup.reject'),
				icon: 'pi pi-trash'
			});
			if (res) {
				try {
					const dinozCreated = await DemonShopService.buyDinoz(id);

					// Update dinoz list
					const dinozStore = useDinozStore().getDinozList;
					dinozStore.push(dinozCreated);
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
		},
		async confirmUnsacrifice(id: number): Promise<void> {
			const res: boolean = await this.$confirm({
				message: this.$t('popup.confirm'),
				header: this.$t('popup.attention'),
				acceptLabel: this.$t('popup.accept'),
				rejectLabel: this.$t('popup.reject'),
				icon: 'pi pi-trash'
			});
			if (res) {
				try {
					await DemonShopService.unsacrificeDinoz(id);
					this.demonShop.sacrificed = this.demonShop.sacrificed.filter(d => d.id !== id);
					await useDinozStore().refreshDinozFiche(id);
					this.$toast.open({
						message: this.$t('shop.demon.unsacrifice_toast'),
						type: 'info'
					});
				} catch (err) {
					errorHandler.handle(err, this.$toast);
					return;
				}
			}
		},
		toggleDetails(dinoz: demonDinozFiche) {
			if (this.openDetails.has(dinoz.id)) {
				this.openDetails.delete(dinoz.id);
			} else {
				this.openDetails.set(
					dinoz.id,
					toSkillDetails(
						dinoz.skills.map(s => {
							return {
								skillId: s,
								state: true
							};
						})
					)
				);
			}
		}
	},
	async mounted(): Promise<void> {
		await this.refresh();
	}
});
</script>

<style lang="scss" scoped>
@media (max-width: 510px) {
	.shop_view {
		max-width: 95%;
	}
}
.shop_view {
	display: flex;
	gap: 30px;
	flex-direction: column;
	align-self: center;
}
.titleContent {
	height: fit-content;
	background-image: url('../assets/design/title_h1.webp');
	background-position: left bottom;
	background-repeat: no-repeat;
	padding-bottom: 22px;
	h3 {
		margin-left: 5px;
		color: #71b703;
		font-variant: small-caps;
	}
}
</style>
