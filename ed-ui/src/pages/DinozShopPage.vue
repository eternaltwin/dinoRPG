<template>
	<div class="enclos">
		<Title :title="$t('pageTitle.dinozShop')" />
		<div class="section">
			<div class="titlePage">Enclos des dinoz</div>
		</div>
		<div class="help">
			<p v-html="$t('shop.dinoz.help')"></p>
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
					<Tippy theme="normal">
						<strong>Race :</strong>
						{{ $t(`race.name.${raceList[dinoz.race.raceId]}`) }}
						<template #content>
							<h1>{{ $t(`race.name.${raceList[dinoz.race.raceId]}`) }}</h1>
							<p>
								{{ $t(`race.description.${raceList[dinoz.race.raceId]}`) }}
							</p>
						</template>
					</Tippy>
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
					{{ $t(`skill.name.${skillNameList[dinoz.skill]}`) }}
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { DinozShopService, DinozService } from '@/services';
import { DinozShop, Dinoz } from '@/models';
import { errorHandler, utils } from '@/utils';
import DinozSWF from '@/components/dinoz/dinozSWF.vue';
import Elements from '@/components/data/elements.vue';
import { sessionStore } from '@/store';
import Title from '@/components/utils/Title.vue';
import { raceList, skillNameList } from '@/constants';
import EventBus from '@/events';

export default defineComponent({
	name: 'DinozShopPage',
	data() {
		return {
			utils: utils,
			dinozList: [] as Array<DinozShop>,
			raceList: raceList,
			skillNameList: skillNameList
		};
	},
	components: {
		DinozSWF,
		Title,
		Elements
	},
	methods: {
		async openPopinConfirmChoice(dinoz: DinozShop): Promise<void> {
			const res: boolean = confirm(this.$t('popup.confirm'));
			if (res) {
				EventBus.emit('isLoading', true);
				let dinozCreated: Dinoz;
				try {
					dinozCreated = await DinozService.buyDinoz(dinoz.id);
					EventBus.emit('isLoading', false);
				} catch (err) {
					errorHandler.handle(err);
					return;
				}

				// Update player's money
				const newMoney = (sessionStore.getters.getMoney -
					dinoz.race.price!) as number;
				sessionStore.commit('setMoney', newMoney);

				const dinozStore = sessionStore.getters.getDinozList;

				dinozStore.push(dinozCreated);

				// Update dinoz list
				sessionStore.commit('setDinozList', dinozStore);

				// Update dinoz count
				sessionStore.commit(
					'setDinozCount',
					sessionStore.getters.getDinozCount + 1
				);

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
		EventBus.emit('isLoading', true);
		// Get dinoz to display
		try {
			this.dinozList = await DinozShopService.getDinozFromDinozShop();
			EventBus.emit('isLoading', false);
		} catch (err) {
			errorHandler.handle(err);
			return;
		}
	}
});
</script>
