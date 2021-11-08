<template>
	<Title :title="$t('pageTitle.dinozShop')" />
	<div id="centerContent">
		<div class="enclos">
			<div class="section">
				<div class="titlePage">Enclos des dinoz</div>
			</div>
			<div class="help">
				<p v-html="$t('shop.help')"></p>
			</div>
			<div
				class="sheet"
				:id="'detail_' + index"
				v-for="(dinoz, index) in dinozList"
				:key="dinoz.dinozId"
			>
				<DinozSWF
					:display="dinoz.display"
					:width="190"
					:height="165"
					type="dino"
				></DinozSWF>
				<div class="infos">
					<div class="price">
						<span class="money"
							>{{ utils.beautifulNumber(dinoz.race.price.toString()) }}
							<img src="@/assets/icons/small_gold.webp" />
						</span>
					</div>
					<a class="button bSmall" @click="openPopinConfirmChoice(dinoz)">{{
						$t('button.chose')
					}}</a>
					<div class="race">
						<Tooltip theme="normal">
							<template #tooltip-trigger>
								<strong>Race :</strong> {{ $t(`race.name.${dinoz.race.name}`) }}
							</template>
							<template #tooltip-content>
								<h1>{{ $t(`race.name.${dinoz.race.name}`) }}</h1>
								<p>{{ $t(`race.description.${dinoz.race.name}`) }}</p>
							</template>
						</Tooltip>
					</div>
					<Elements
						:fire="dinoz.race.nbrFireCase"
						:wood="dinoz.race.nbrWoodCase"
						:water="dinoz.race.nbrWaterCase"
						:light="dinoz.race.nbrLightCase"
						:air="dinoz.race.nbrAirCase"
					></Elements>
					<div class="skill" v-if="dinoz.skill">
						<img src="@/assets/icons/small_follow.webp" alt="follow" />
						{{ $t(`skill.name.${dinoz.skill}`) }}
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ShopService, DinozService } from '@/services';
import { DinozShop, Dinoz } from '@/models';
import { errorHandler, utils } from '@/utils';
import DinozSWF from '@/components/dinoz/dinozSWF.vue';
import Elements from '@/components/data/elements.vue';
import store from '@/store';
import Tooltip from '@/components/utils/ToolTip.vue';
import Title from '@/components/utils/Title.vue';

export default defineComponent({
	name: 'DinozShopPage',
	data() {
		return {
			utils: utils,
			dinozList: [] as Array<DinozShop>
		};
	},
	components: {
		DinozSWF,
		Elements,
		Tooltip,
		Title
	},
	methods: {
		async openPopinConfirmChoice(dinoz: DinozShop): Promise<void> {
			const res: boolean = confirm(this.$t('button.confirm'));
			if (res) {
				let dinozCreated: Dinoz;
				try {
					dinozCreated = await DinozService.buyDinoz(dinoz.id);
				} catch (err) {
					errorHandler.handle(err);
					return Promise.reject(err);
				}

				// Update player's money
				const newMoney = (store.getters.getMoney - dinoz.race.price!) as number;
				store.commit('setMoney', newMoney);

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
