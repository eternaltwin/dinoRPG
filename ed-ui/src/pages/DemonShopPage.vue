<template>
	<TitleHeader :title="$t('pageTitle.demonShop')" :header="formatContent($t(`shop.demon.name`))" />
	<div class="tabPanel">
		<ul class="tabs">
			<li :class="tab === 0 ? 'active' : ''">
				<a href="#" @click="changeTab(0)">{{ $t('shop.demon.sacrifice_title') }}</a>
			</li>
			<li :class="{ active: tab === 1, disabled: isShopEmpty }">
				<a href="#" @click.prevent="!isShopEmpty && changeTab(1)">
					{{ $t('shop.demon.buy_title') }}
				</a>
			</li>
			<li :class="{ active: tab === 2, disabled: isSacrificedEmpty }">
				<a href="#" @click.prevent="!isSacrificedEmpty && changeTab(2)">
					{{ $t('shop.demon.unsacrifice_title') }}
				</a>
			</li>
		</ul>
	</div>

	<DZDisclaimer v-if="tab === 0" help :content="$t('shop.demon.sacrifice_help')" />
	<DZDisclaimer v-if="tab === 1" help :content="$t('shop.demon.buy_help')" />
	<DZDisclaimer v-if="tab === 2" help :content="$t('shop.demon.unsacrifice_help')" />

	<Tippy theme="small" tag="div" class="treasury-notes dz-golden-box no-shadow">
		<span>{{ demonTickets }}</span>
		<img :src="getImgURL('icons', 'small_demon_tk')" :alt="$t('item.name.demon_ticket')" />
		<template #content>
			{{ $t('shop.demon.yourDemonTickets') }}
		</template>
	</Tippy>

	<div v-if="tab === 0" class="shop_view">
		<div
			class="sacrifice_sheets"
			:id="'sacrifice_sheet_' + index"
			v-for="(dinoz, index) in demonShop.dinoz"
			:key="dinoz.id"
		>
			<DZShop :dinoz="dinoz" sacrifice currency="demon" details="elementsOnly" @action="confirmSacrifice" />
		</div>
	</div>

	<div v-if="tab === 1" class="shop_view">
		<div class="demon_sheets" :id="'demon_sheet_' + index" v-for="(dinoz, index) in demonShop.shop" :key="dinoz.id">
			<DZShop :dinoz="dinoz" currency="demon" details="advanced" @action="confirmPurchase(dinoz.id)" />
		</div>
	</div>

	<!-- TODO paginate sacrificed Dinoz to avoid pulling 100s in a single query -->
	<div v-if="tab === 2" class="shop_view">
		<div
			class="unsacrifice_sheets"
			:id="'unsacrifice_sheet_' + index"
			v-for="(dinoz, index) in demonShop.sacrificed"
			:key="dinoz.id"
		>
			<DZShop :dinoz="dinoz" currency="demon" details="advanced" @action="confirmUnsacrifice(dinoz.id, dinoz.price)" />
		</div>
	</div>
</template>

<script lang="ts" scoped>
import { defineComponent } from 'vue';
import DZDisclaimer from '../components/common/DZDisclaimer.vue';
import DZShop from '../components/common/DZShop.vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import { DemonShopService } from '../services/DemonShopService.js';
import { InventoryService } from '../services/InventoryService.js';
import { playerStore, useDinozStore } from '../store/index.js';
import { errorHandler, utils } from '../utils/index.js';
import { demonShopFiche } from '@drpg/core/models/shop/demonShopFiche';
import { raceList } from '@drpg/core/models/dinoz/RaceList';
import { skillList } from '@drpg/core/models/dinoz/SkillList';
import { SkillDetails } from '@drpg/core/models/dinoz/SkillDetails';
import { toSkillDetails } from '@drpg/core/utils/DinozUtils';
import { ElementType } from '@drpg/core/models/enums/ElementType';
import { DinozShopFiche } from '@drpg/core/models/shop/DinozShopFiche';
import { Item } from '@drpg/core/models/item/ItemList';

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
			openDetails: new Map() as Map<number, SkillDetails[]>,
			tab: 0 as number,
			demonTickets: 0
		};
	},
	computed: {
		isShopEmpty(): boolean {
			return !this.demonShop.shop?.length;
		},
		isSacrificedEmpty(): boolean {
			return !this.demonShop.sacrificed?.length;
		}
	},
	methods: {
		changeTab(tab: number) {
			this.tab = tab;
		},
		async refresh(): Promise<void> {
			try {
				this.demonShop = await DemonShopService.getDemonDinozShop();
				this.openDetails = new Map();
				// Get player's treasury notes
				const items = await InventoryService.getAllItemsData();
				const demonTicketItem = items.find(i => i.id === Item.DEMON_TICKET);
				this.demonTickets = demonTicketItem ? demonTicketItem.quantity : 0;
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		async confirmSacrifice(sacrifice: DinozShopFiche): Promise<void> {
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
				const oldValue = this.demonTickets;
				this.demonTickets += sacrifice.price;
				if (oldValue < 30 && this.demonTickets >= 30) {
					await this.refresh();
				}
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

					// Go to dinoz page
					await this.$router.push({
						name: 'DinozPage',
						params: {
							id
						}
					});
				} catch (err) {
					errorHandler.handle(err, this.$toast);
					return;
				}
			}
		},
		toggleDetails(dinoz: DinozShopFiche) {
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
.treasury-notes {
	color: #fce3bc;
	width: fit-content;
	display: flex;
	align-items: center;
	gap: 4px;
	padding: 2px 4px;
	margin: 0 auto;
	margin-top: 10px;
	margin-bottom: 20px;
}

.tabPanel {
	position: relative;
	color: white;
	width: 100%;
	top: 6px;

	.tabs {
		padding-top: 4px;
		background-color: transparent;
		text-shadow: 1px 1px 0px #9a4029;
		border-bottom: 3px solid #bc683c;

		:hover {
			color: white;
		}

		li.active {
			margin-top: 1px;
			text-shadow: 1px 1px 0px #9a4029;
			a {
				background-color: #d69e68;
				line-height: 16pt;
				color: white;
				border-left-color: #ffe7aa;
				border-top-color: #ffe7aa;
				border-bottom: 1px solid #d69e68;
			}
		}
		li.disabled {
			a {
				opacity: 0.45;
				cursor: not-allowed;
				pointer-events: none; // belt-and-suspenders alongside the @click guard
			}
		}
	}
}

.shop_view {
	display: flex;
	gap: 40px;
	flex-direction: column;
	align-self: center;
	align-items: center;
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
