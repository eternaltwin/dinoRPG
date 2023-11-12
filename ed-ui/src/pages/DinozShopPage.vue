<template>
	<div class="enclos">
		<TitleHeader :title="$t('pageTitle.dinozShop')" />
		<div class="section">
			<div class="titlePage">Enclos des dinoz</div>
		</div>
		<div class="help">
			<p v-html="$t('shop.dinoz.help')"></p>
		</div>
		<div class="sheet" :id="'detail_' + index" v-for="(dinoz, index) in dinozList" :key="dinoz.id">
			<div class="dinoz_display">
				<DinozWithoutFlash
					:display="dinoz.display"
					:life="parseInt(dinoz.life)"
					:flip="-1"
					:race="dinoz.race.raceId"
					:shop="true"
				></DinozWithoutFlash>
			</div>
			<div class="infos">
				<div class="price">
					<span class="money"
						>{{ utils.beautifulNumber(dinoz.race.price.toString()) }}
						<img :src="getImgURL('icons', 'small_gold')" alt="gold" />
					</span>
				</div>
				<a class="button bSmall" @click="openPopinConfirmChoice(dinoz)">{{ $t('button.chose') }}</a>
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
					:fire="dinoz.race.nbrFire"
					:wood="dinoz.race.nbrWood"
					:water="dinoz.race.nbrWater"
					:lightning="dinoz.race.nbrLightning"
					:air="dinoz.race.nbrAir"
				></Elements>
				<template v-if="dinoz.race.skillId && dinoz.race.skillId.length > 0">
					<Tippy theme="normal" tag="div" class="skill" v-for="skillId in dinoz.race.skillId" :key="skillId">
						<img :src="getImgURL('icons', 'small_follow')" alt="follow" />
						{{ $t(`skill.name.${skillNameList[skillId]}`) }}
						<template #content>
							<h1>
								{{ $t(`skill.name.${skillNameList[skillId]}`) }}
							</h1>
							<p>
								{{ $t(`skill.description.${skillNameList[skillId]}`) }}
							</p>
						</template>
					</Tippy>
				</template>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from 'vue';
import { DinozShopService, DinozService } from '../services/index.js';
import { DinozShopFiche } from '@drpg/core/models/shop/DinozShopFiche';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { errorHandler, utils } from '../utils/index.js';
import { playerStore, dinozStore } from '../store/index.js';
import { raceList, skillNameList } from '../constants/index.js';
import EventBus from '../events/index.js';

export default defineComponent({
	name: 'DinozShopPage',
	data() {
		return {
			dinozStore: dinozStore(),
			playerStore: playerStore(),
			utils: utils,
			dinozList: [] as Array<DinozShopFiche>,
			raceList: raceList,
			skillNameList: skillNameList
		};
	},
	components: {
		TitleHeader: defineAsyncComponent(() => import('../components/utils/TitleHeader.vue')),
		Elements: defineAsyncComponent(() => import('../components/data/elements.vue')),
		DinozWithoutFlash: defineAsyncComponent(() => import('../components/dinoz/dinozWithoutFlash.vue'))
	},
	methods: {
		async openPopinConfirmChoice(dinoz: DinozShopFiche): Promise<void> {
			const res: boolean = confirm(this.$t('popup.confirm'));
			if (res) {
				EventBus.emit('isLoading', true);
				let dinozCreated: DinozFiche;
				try {
					dinozCreated = await DinozService.buyDinoz(parseInt(dinoz.id));
					EventBus.emit('isLoading', false);
				} catch (err) {
					errorHandler.handle(err);
					return;
				}

				// Update player's money
				const newMoney = (this.playerStore.getMoney! - dinoz.race.price!) as number;
				this.playerStore.setMoney(newMoney);

				const dinozStore = this.dinozStore.getDinozList;

				dinozStore!.push(dinozCreated);

				// Update dinoz list
				this.dinozStore.setDinozList(dinozStore!);

				// Update dinoz count
				this.dinozStore.setDinozCount(this.dinozStore.getDinozCount! + 1);

				// Go to dinoz page
				await this.$router.push({
					name: 'DinozPage',
					params: {
						id: dinozCreated.id!
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

<style lang="scss" scoped>
.dinoz_display {
	position: relative;
	left: 15px;
	top: -12px;
}
</style>
