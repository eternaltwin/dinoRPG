<template>
	<div id="enclos" class="ml-[-32px] mt-[-7%] sm:ml-0 sm:mt-0">
		<TitleHeader :title="$t('pageTitle.dinozShop')" />
		<div class="section">
			<div class="titlePage">Enclos des dinoz</div>
		</div>
		<DZDisclaimer help :content="$t('shop.dinoz.help')" class="ml-[-10px] sm:ml-0" />
		<div class="ml-[-17px] mt-[50px] flex w-full flex-col gap-[30px]">
			<div
				class="ml-[25px] flex h-auto items-start gap-[25px] bg-[#bc683c] bg-contain bg-no-repeat p-1 sm:h-[110px] sm:gap-[55px] sm:bg-transparent sm:bg-[url('./assets/design/shop_dinoz_bg.webp')] md:gap-[5px] lg:h-[90px] lg:bg-auto"
				:id="'detail_' + index"
				v-for="(dinoz, index) in dinozList"
				:key="dinoz.id"
			>
				<Suspense>
					<DinozWithoutFlash
						class="relative bottom-[10px] left-[-65px] w-[150px] sm:bottom-[70px] sm:left-[-35px] sm:w-[190px]"
						:display="dinoz.display"
						:life="1"
						:flip="-1"
					></DinozWithoutFlash>
					<template #fallback>
						<div class="mt-[5px] flex items-center justify-center"><Loading /></div>
					</template>
				</Suspense>
				<div class="ml-[-90px] mt-[2px] flex w-2/3 flex-col gap-[15px] sm:gap-[8px] md:ml-[-45px]">
					<div
						class="mb-px h-auto cursor-help rounded-[10px] bg-[#9a4029] pl-[10px] text-[10pt] text-[#ffee92] sm:h-[18px]"
					>
						<Tippy theme="normal">
							<strong>Race :</strong>
							{{ $t(`race.name.${raceList[dinoz.race].name}`) }}
							<template #content>
								<h1>{{ $t(`race.name.${raceList[dinoz.race].name}`) }}</h1>
								<p>
									{{ $t(`race.description.${raceList[dinoz.race].name}`) }}
								</p>
							</template>
						</Tippy>
					</div>
					<div class="items-center justify-around">
						<Elements
							:fire="raceList[dinoz.race].nbrFire"
							:wood="raceList[dinoz.race].nbrWood"
							:water="raceList[dinoz.race].nbrWater"
							:lightning="raceList[dinoz.race].nbrLightning"
							:air="raceList[dinoz.race].nbrAir"
							style="margin-top: -5px"
						></Elements>
					</div>
					<template v-if="raceList[dinoz.race].skillId">
						<Tippy
							theme="normal"
							tag="div"
							class="mt-[-5px] h-auto cursor-help rounded-[10px] bg-[#9a4029] pl-[10px] text-[10pt] text-[#ffee92] sm:h-[18px]"
							v-for="skillId in raceList[dinoz.race].skillId"
							:key="skillId"
						>
							<img class="mt-[-2px]" :src="getImgURL('icons', 'small_follow')" alt="follow" />
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
				<div class="flex flex-col gap-[10px] p-1 sm:w-1/4">
					<div class="h-[18px] w-[90px] rounded-[10px] bg-[#9a4029] pl-[17px] text-[10pt]">
						<span class="font-bold text-[#ffee92]"
							>{{ utils.beautifulNumber(raceList[dinoz.race].price.toString()) }}
							<img :src="getImgURL('icons', 'small_gold')" alt="gold" />
						</span>
					</div>
					<a class="bSmall -ml-3 sm:ml-0" @click="openPopinConfirmChoice(dinoz)">{{ $t('button.chose') }}</a>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from 'vue';
import { DinozShopService, DinozService } from '../services/index.js';
import { DinozShopFicheLite } from '@drpg/core/models/shop/DinozShopFiche';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { errorHandler, utils } from '../utils/index.js';
import { playerStore, dinozStore } from '../store/index.js';
import { raceList } from '@drpg/core/models/dinoz/RaceList';
import EventBus from '../events/index.js';
import TitleHeader from '../components/utils/TitleHeader.vue';
import Elements from '../components/data/Elements.vue';
import { skillList } from '@drpg/core/models/dinoz/SkillList';
import DZDisclaimer from '../components/common/DZDisclaimer.vue';

export default defineComponent({
	name: 'DinozShopPage',
	data() {
		return {
			dinozStore: dinozStore(),
			playerStore: playerStore(),
			utils: utils,
			dinozList: [] as Array<DinozShopFicheLite>,
			raceList: raceList,
			skillList
		};
	},
	components: {
		TitleHeader,
		Elements,
		DinozWithoutFlash: defineAsyncComponent(() => import('../components/dinoz/DinozWithoutFlash.vue')),
		DZDisclaimer
	},
	methods: {
		async openPopinConfirmChoice(dinoz: DinozShopFicheLite): Promise<void> {
			const res: boolean = confirm(this.$t('popup.confirm'));
			if (res) {
				EventBus.emit('isLoading', true);
				let dinozCreated: DinozFiche;
				try {
					dinozCreated = await DinozService.buyDinoz(parseInt(dinoz.id));
					EventBus.emit('isLoading', false);
				} catch (err) {
					errorHandler.handle(err, this.$toast);
					return;
				}
				// Update player's money
				const newMoney = (this.playerStore.getMoney! - this.raceList[dinoz.race].price) as number;
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
			errorHandler.handle(err, this.$toast);
			return;
		}
	}
});
</script>
