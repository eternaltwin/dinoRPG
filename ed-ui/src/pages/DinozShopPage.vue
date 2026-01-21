<template>
	<TitleHeader :title="$t('pageTitle.dinozShop')" :header="$t(`shop.dinoz.header`)" />
	<DZDisclaimer help round :content="$t('shop.dinoz.help')" />
	<div class="sheets">
		<div class="sheet" :id="'detail_' + index" v-for="(dinoz, index) in dinozList" :key="dinoz.id">
			<Suspense>
				<DinozWithoutFlash class="dinoImg" :display="dinoz.display" flip :life="1"></DinozWithoutFlash>

				<template #fallback
					><div class="loading-wrapper"><Loading /></div
				></template>
			</Suspense>
			<div class="infos">
				<div class="row1">
					<div class="race">
						<Tippy theme="normal">
							<strong>{{ $t(`race.race`) }}</strong>
							{{ $t(`race.name.${raceList[dinoz.race].name}`) }}
							<template #content>
								<h1>{{ $t(`race.name.${raceList[dinoz.race].name}`) }}</h1>
								<p>
									{{ $t(`race.description.${raceList[dinoz.race].name}`) }}
								</p>
							</template>
						</Tippy>
					</div>
					<div class="price1">
						<span class="money1"
							>{{ utils.beautifulNumber(raceList[dinoz.race].price.toString()) }}
							<img :src="getImgURL('icons', 'small_gold')" alt="gold" />
						</span>
					</div>
				</div>
				<div class="row2">
					<Elements
						:fire="raceList[dinoz.race].nbrFire"
						:wood="raceList[dinoz.race].nbrWood"
						:water="raceList[dinoz.race].nbrWater"
						:lightning="raceList[dinoz.race].nbrLightning"
						:air="raceList[dinoz.race].nbrAir"
						style="margin-top: -5px"
					></Elements>
					<DZButton @click="openPopinConfirmChoice(dinoz)">{{ $t('button.chose') }}</DZButton>
				</div>
				<template v-if="raceList[dinoz.race].skillId">
					<Tippy theme="normal" tag="div" class="skill" v-for="skillId in raceList[dinoz.race].skillId" :key="skillId">
						<img :src="getImgURL('icons', 'small_follow')" alt="follow" />
						{{ $t(`skill.name.${skillList[skillId].name}`) }}
						<template #content>
							<h1>
								{{ $t(`skill.name.${skillList[skillId].name}`) }}
							</h1>
							<p v-html="formatContent($t(`skill.description.${skillList[skillId].name}`))" />
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
import DZButton from '../components/common/DZButton.vue';

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
		DZButton,
		TitleHeader,
		Elements,
		DinozWithoutFlash: defineAsyncComponent(() => import('../components/dinoz/DinozWithoutFlash.vue')),
		DZDisclaimer
	},
	methods: {
		async openPopinConfirmChoice(dinoz: DinozShopFicheLite): Promise<void> {
			const res: boolean = await this.$confirm({
				message: this.$t('popup.confirm'),
				header: this.$t('popup.attention'),
				acceptLabel: this.$t('popup.accept'),
				rejectLabel: this.$t('popup.reject'),
				icon: 'pi pi-trash'
			});
			if (res) {
				EventBus.emit('isLoading', true);
				let dinozCreated: DinozFiche;
				try {
					dinozCreated = await DinozService.buyDinoz(parseInt(dinoz.id));
					await this.$refreshGold();
					EventBus.emit('isLoading', false);
				} catch (err) {
					errorHandler.handle(err, this.$toast);
					return;
				}

				const dinozStore = this.dinozStore.getDinozList;

				dinozStore.push(dinozCreated);

				// Update dinoz list
				this.dinozStore.setDinozList(dinozStore);

				// Go to dinoz page
				await this.$router.push({
					name: 'DinozPage',
					params: {
						id: dinozCreated.id
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

<style lang="scss" scoped>
@media (max-width: 510px) {
	.sheets {
		max-width: 95%;
		align-items: center;
		.sheet {
			background-image: none;
			background-color: #bc683c;
			background-position: 5px 8px;
			background-repeat: no-repeat;
			border-radius: 8px;
			flex-direction: column;
			align-items: center;
			height: fit-content;
			.dinoImg {
				bottom: 0;
				left: 0;
			}
			.infos {
				display: flex;
				flex-direction: column;
				gap: 5px;
				padding: 5px;
				left: 0;
			}
		}
	}
}
.sheet {
	display: flex;
	align-items: flex-start;
	height: 76px;
	padding: 1px;
	clear: both;
	background-image: url('../assets/design/shop_dinoz_bg.webp');
	background-position: 2px 0px;
	background-repeat: no-repeat;

	.price {
		position: absolute;
		margin-left: 225px;
	}

	.swf {
		position: absolute;
		margin-top: -70px;
	}

	.infos {
		margin-top: 5px;
		left: -20px;
		position: relative;

		.race {
			margin-bottom: 1px;

			strong {
				color: white;
			}
		}

		.race,
		.skill {
			width: 210px;
			height: 18px;
			padding-left: 10px;
			font-size: 10pt;
			color: #ffee92;
			background-color: #9a4029;
			border-radius: 10px;
			cursor: help;
		}
	}

	.price {
		//position: absolute;
		//margin-left: 225px;
		padding-left: 5px;
		width: 90px;
		height: 18px;
		font-size: 10pt;
		background-color: #9a4029;
		border-radius: 10px;

		.money {
			color: #ffee92;
		}
	}
}
.loading-wrapper {
	width: 190px;
	display: flex;
	align-items: center;
	justify-content: center;
}
.sheets {
	display: flex;
	gap: 30px;
	flex-direction: column;
	align-self: center;
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
	left: -20px;
}
</style>
