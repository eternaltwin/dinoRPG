<template>
	<div class="enclos">
		<TitleHeader :title="$t('pageTitle.dinozShop')" />
		<div class="section">
			<div class="titlePage">Enclos des dinoz</div>
		</div>
		<DZDisclaimer help :content="$t('shop.dinoz.help')" />
		<div class="sheets">
			<div class="sheet" :id="'detail_' + index" v-for="(dinoz, index) in dinozList" :key="dinoz.id">
				<!--			<div class="dinoz_display">-->
				<DinozWithoutFlash class="dinoImg" :display="dinoz.display" :life="1" :flip="-1"></DinozWithoutFlash>
				<!--			</div>-->
				<div class="infos">
					<div class="row1">
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
						<div class="price1">
							<span class="money1"
								>{{ utils.beautifulNumber(dinoz.race.price.toString()) }}
								<img :src="getImgURL('icons', 'small_gold')" alt="gold" />
							</span>
						</div>
					</div>
					<div class="row2">
						<Elements
							:fire="dinoz.race.nbrFire"
							:wood="dinoz.race.nbrWood"
							:water="dinoz.race.nbrWater"
							:lightning="dinoz.race.nbrLightning"
							:air="dinoz.race.nbrAir"
							style="margin-top: -5px"
						></Elements>
						<a class="button bSmall" @click="openPopinConfirmChoice(dinoz)">{{ $t('button.chose') }}</a>
					</div>

					<template v-if="dinoz.race.skillId && dinoz.race.skillId.length > 0">
						<Tippy theme="normal" tag="div" class="skill" v-for="skillId in dinoz.race.skillId" :key="skillId">
							<img :src="getImgURL('icons', 'small_follow')" alt="follow" />
							{{ $t(`skill.name.${skillList[skillId].name}`) }}
							<template #content>
								<h1>
									{{ $t(`skill.name.${skillList[skillId].name}`) }}
								</h1>
								<p>
									{{ $t(`skill.description.${skillList[skillId].name}`) }}
								</p>
							</template>
						</Tippy>
					</template>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { DinozShopService, DinozService } from '../services/index.js';
import { DinozShopFiche } from '@drpg/core/models/shop/DinozShopFiche';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { errorHandler, utils } from '../utils/index.js';
import { playerStore, dinozStore } from '../store/index.js';
import { raceList } from '../constants/index.js';
import EventBus from '../events/index.js';
import TitleHeader from '../components/utils/TitleHeader.vue';
import Elements from '../components/data/Elements.vue';
import DinozWithoutFlash from '../components/dinoz/DinozWithoutFlash.vue';
import { skillList } from '@drpg/core/models/dinoz/SkillList';
import DZDisclaimer from '../components/common/DZDisclaimer.vue';

export default defineComponent({
	name: 'DinozShopPage',
	data() {
		return {
			dinozStore: dinozStore(),
			playerStore: playerStore(),
			utils: utils,
			dinozList: [] as Array<DinozShopFiche>,
			raceList: raceList,
			skillList
		};
	},
	components: {
		TitleHeader,
		Elements,
		DinozWithoutFlash,
		DZDisclaimer
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
.sheets {
	display: flex;
	gap: 30px;
	flex-direction: column;
}
.dinoz_display {
	position: relative;
	left: 15px;
	top: -12px;
}
.row1 {
	display: flex;
	gap: 10px;
}
.row2 {
	display: flex;
	gap: 10px;
	align-items: center;
}
.price1 {
	padding-left: 5px;
	width: 90px;
	height: 18px;
	font-size: 10pt;
	background-color: #9a4029;
	border-radius: 10px;

	.money1 {
		color: #ffee92;
		font-weight: bold;
		font-size: 9pt;
	}
}
.dinoImg {
	bottom: 70px;
	position: relative;
}
</style>
