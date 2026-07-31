<template>
	<TitleHeader :title="$t('pageTitle.demonShop')" :header="formatContent($t(`shop.demon.name`))" />
	<DZDisclaimer help round :content="$t('shop.demon.help')" />
	<!-- TODO1 Rework so the player picks between the sacrifice view, the buy view and the resurrect view. -->
	<!-- TODO1 only show the buy & help views if the player has Dinoz in those categories -->
	<!-- TODO2 Make the tile (Suspense + DinozWithoutFlash + race-level + button/skills a component reusable across all 3 views)-->
	<DZDisclaimer help round :content="$t('shop.demon.sacrifice_help')" />
	<DZDisclaimer help round :content="$t('shop.demon.buy_help')" />
	<DZDisclaimer help round :content="$t('shop.demon.unsacrifice_help')" />

	<div class="shop_view">
		<div class="titleContent">
			<h3>{{ $t('shop.demon.sacrifice_title') }}</h3>
		</div>
		<div
			class="sacrifice_sheet"
			:id="'sacrifice_sheet_' + index"
			v-for="(dinoz, index) in demonShop.dinoz"
			:key="dinoz.id"
		>
			<Suspense>
				<DinozWithoutFlash class="dinoImg" :display="dinoz.display" flip :life="1"></DinozWithoutFlash>

				<template #fallback
					><div class="loading-wrapper"><Loading /></div
				></template>
			</Suspense>
			<div class="infos">
				<div class="desc_row">
					<div class="desc">
						<Tippy theme="normal">
							{{ $t(`race.name.${raceList[dinoz.raceId].name}`) }}
							<strong>{{ $t(`shop.demon.level`, { level: dinoz.level }) }}</strong>
							<template #content>
								<h1>{{ $t(`race.name.${raceList[dinoz.raceId].name}`) }}</h1>
								<p>
									{{ $t(`race.description.${raceList[dinoz.raceId].name}`) }}
								</p>
							</template>
						</Tippy>
					</div>
					<div class="price">
						<span class="money"
							>{{ utils.beautifulNumber(dinoz.price.toString()) }}
							<img :src="getImgURL('icons', 'small_demon_tk')" alt="demon ticket" />
						</span>
					</div>
				</div>
				<div class="element_row">
					<Elements
						:fire="dinoz.nbrUpFire"
						:wood="dinoz.nbrUpWood"
						:water="dinoz.nbrUpWater"
						:lightning="dinoz.nbrUpLightning"
						:air="dinoz.nbrUpAir"
						style="margin-top: -5px"
					></Elements>
					<DZButton @click="confirmSacrifice(dinoz)">{{ $t('shop.demon.sacrifice') }}</DZButton>
				</div>
			</div>
		</div>

		<div class="titleContent">
			<h3>{{ $t('shop.demon.buy_title') }}</h3>
		</div>
		<div class="demon_sheets" :id="'demon_sheet_' + index" v-for="(dinoz, index) in demonShop.shop" :key="dinoz.id">
			<div class="demon_sheet">
				<Suspense>
					<DinozWithoutFlash class="dinoImg" :display="dinoz.display" flip :life="1"></DinozWithoutFlash>

					<template #fallback
						><div class="loading-wrapper"><Loading /></div
					></template>
				</Suspense>
				<div class="infos">
					<div class="desc_row">
						<div class="desc">
							<Tippy theme="normal">
								{{ $t(`race.name.${raceList[dinoz.raceId].name}`) }}
								<strong>{{ $t(`shop.demon.level`, { level: dinoz.level }) }}</strong>
								<template #content>
									<h1>{{ $t(`race.name.${raceList[dinoz.raceId].name}`) }}</h1>
									<p>
										{{ $t(`race.description.${raceList[dinoz.raceId].name}`) }}
									</p>
								</template>
							</Tippy>
						</div>
						<div class="price">
							<span class="money"
								>{{ utils.beautifulNumber(dinoz.price.toString()) }}
								<img :src="getImgURL('icons', 'small_demon_tk')" alt="demon ticket" />
							</span>
						</div>
					</div>
					<div class="element_row">
						<DZButton size="small" @click="toggleDetails(dinoz)">{{ $t('button.details') }}</DZButton>
						<DZButton @click="confirmPurchase(dinoz.id)">{{ $t('button.chose') }}</DZButton>
					</div>
				</div>
			</div>

			<DZDisclaimer round class="demon_details" v-if="openDetails.has(dinoz.id)">
				<div class="element_row">
					<Elements
						:fire="dinoz.nbrUpFire"
						:wood="dinoz.nbrUpWood"
						:water="dinoz.nbrUpWater"
						:lightning="dinoz.nbrUpLightning"
						:air="dinoz.nbrUpAir"
						style="margin-top: -5px"
					></Elements>
				</div>
				<table class="skill_row">
					<tbody>
						<tr>
							<th class="name">{{ $t('details.th.comp') }}</th>
							<th class="type">{{ $t('details.th.type') }}</th>
						</tr>
						<tr v-for="skill in openDetails.get(dinoz.id)" :key="skill.id">
							<td class="name">
								<SkillTooltip :skill="skill.id">
									<img
										v-for="(element, index) in skill.element"
										:key="index"
										:src="getImgURL('elements', `elem_${ElementType[element].toLowerCase()}`)"
										:alt="ElementType[element]"
									/>
									<p>{{ $t(`skill.name.${skillList[skill.id].name}`) }}</p>
								</SkillTooltip>
							</td>
							<td class="type">
								<Tippy theme="normal">
									{{ skill.type }}
									<template #content>
										<h1 v-html="formatContent($t(`details.type.name.${skill.type}`))" />
										<p v-html="formatContent($t(`details.type.description.${skill.type}`))" />
									</template>
								</Tippy>
							</td>
						</tr>
					</tbody>
				</table>
			</DZDisclaimer>
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
			<div class="unsacrifice_sheet">
				<Suspense>
					<DinozWithoutFlash class="dinoImg" :display="dinoz.display" flip :life="1"></DinozWithoutFlash>

					<template #fallback
						><div class="loading-wrapper"><Loading /></div
					></template>
				</Suspense>
				<div class="infos">
					<div class="desc_row">
						<div class="desc">
							<Tippy theme="normal">
								{{ $t(`race.name.${raceList[dinoz.raceId].name}`) }}
								<strong>{{ $t(`shop.demon.level`, { level: dinoz.level }) }}</strong>
								<template #content>
									<h1>{{ $t(`race.name.${raceList[dinoz.raceId].name}`) }}</h1>
									<p>
										{{ $t(`race.description.${raceList[dinoz.raceId].name}`) }}
									</p>
								</template>
							</Tippy>
						</div>
						<div class="price">
							<span class="money"
								>{{ utils.beautifulNumber(dinoz.price.toString()) }}
								<img :src="getImgURL('icons', 'small_demon_tk')" alt="demon ticket" />
							</span>
						</div>
					</div>
					<div class="element_row">
						<DZButton size="small" @click="toggleDetails(dinoz)">{{ $t('button.details') }}</DZButton>
						<DZButton @click="confirmUnsacrifice(dinoz.id)">{{ $t('button.chose') }}</DZButton>
					</div>
				</div>
			</div>

			<DZDisclaimer round class="unsacrifice_details" v-if="openDetails.has(dinoz.id)">
				<div class="element_row">
					<Elements
						:fire="dinoz.nbrUpFire"
						:wood="dinoz.nbrUpWood"
						:water="dinoz.nbrUpWater"
						:lightning="dinoz.nbrUpLightning"
						:air="dinoz.nbrUpAir"
						style="margin-top: -5px"
					></Elements>
				</div>
				<table class="skill_row">
					<tbody>
						<tr>
							<th class="name">{{ $t('details.th.comp') }}</th>
							<th class="type">{{ $t('details.th.type') }}</th>
						</tr>
						<tr v-for="skill in openDetails.get(dinoz.id)" :key="skill.id">
							<td class="name">
								<SkillTooltip :skill="skill.id">
									<img
										v-for="(element, index) in skill.element"
										:key="index"
										:src="getImgURL('elements', `elem_${ElementType[element].toLowerCase()}`)"
										:alt="ElementType[element]"
									/>
									<p>{{ $t(`skill.name.${skillList[skill.id].name}`) }}</p>
								</SkillTooltip>
							</td>
							<td class="type">
								<Tippy theme="normal">
									{{ skill.type }}
									<template #content>
										<h1 v-html="formatContent($t(`details.type.name.${skill.type}`))" />
										<p v-html="formatContent($t(`details.type.description.${skill.type}`))" />
									</template>
								</Tippy>
							</td>
						</tr>
					</tbody>
				</table>
			</DZDisclaimer>
		</div>
	</div>
</template>

<script lang="ts" scoped>
import { defineAsyncComponent, defineComponent } from 'vue';
import DZButton from '../components/common/DZButton.vue';
import DZDisclaimer from '../components/common/DZDisclaimer.vue';
import Elements from '../components/data/Elements.vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import SkillTooltip from '../components/dinoz/SkillTooltip.vue';
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
		Elements,
		DZButton,
		DZDisclaimer,
		DinozWithoutFlash: defineAsyncComponent(() => import('../components/dinoz/DinozWithoutFlash.vue')),
		SkillTooltip,
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
		align-items: center;
		.demon_sheet,
		.demon_details,
		.unsacrifice_sheet,
		.unsacrifice_details,
		.sacrifice_sheet {
			max-height: none;
			align-items: center;
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
			.details,
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
.unsacrifice_sheets,
.demon_sheets {
	max-width: 510px;
}
.unsacrifice_sheet,
.demon_sheet,
.sacrifice_sheet {
	display: flex;
	align-items: flex-start;
	max-height: 80px;
	padding: 5px;
	clear: both;
	width: fit-content;
	background-image: url('../assets/design/shop_dinoz_bg.webp');
	background-repeat: no-repeat;

	.details,
	.infos {
		margin-top: 5px;
		left: -20px;
		position: relative;

		.desc,
		.race {
			margin-bottom: 1px;

			strong {
				color: white;
			}
		}

		.desc,
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
.unsacrifice_details,
.demon_details {
	flex-direction: column;
	height: fit-content;
	width: 100%;
	margin: 0;
	margin-top: 10px;
	display: flex;
	align-items: stretch;
	padding: 10px 10px;
	box-sizing: border-box;
	clear: both;
	position: relative;
	z-index: 0;
}
.loading-wrapper {
	width: 190px;
	display: flex;
	align-items: center;
	justify-content: center;
}
.shop_view {
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
.desc_row {
	display: flex;
	gap: 10px;
}
.button_row,
.element_row {
	width: 100%;
	display: flex;
	gap: 10px;
	align-items: center;
	justify-content: space-between;
}
.price {
	padding-left: 5px;
	width: 90px;
	height: 18px;
	font-size: 10pt;
	background-color: #9a4029;
	border-radius: 10px;
	display: flex;
	align-items: center;

	.money {
		color: #ffee92;
		font-weight: bold;
		font-size: 9pt;
		gap: 4px;
		display: flex;
		align-items: center;
	}
}
.dinoImg {
	bottom: 70px;
	position: relative;
	left: -20px;
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
table {
	width: 90%;
	margin-bottom: 5px;
	margin-bottom: 10px;
	border: 2px solid #bc683c;
	background-color: #ecbd84;
	border-collapse: separate;
	border-spacing: 1px;
	align-self: center;

	tr {
		display: table-row;

		th {
			font-size: 8pt;
			letter-spacing: 0pt;
			text-shadow: 1px 1px 0px #356847;
			padding-left: 4px;
			padding-right: 4px;
			padding-bottom: 8px;
			height: 41px;
			vertical-align: bottom;
			color: #fffdba;
			text-transform: uppercase;
			font-weight: bold;
			letter-spacing: 1pt;
			text-align: left;
			white-space: nowrap;
			border: 1px solid #356847;
			background-color: #c64e36;
			background-image: url('../assets/background/table_header.webp');
			background-position: left bottom;
			max-width: 222px;

			&.name {
				width: 100%;
			}

			&.type {
				width: 1%;
				white-space: nowrap;
			}

			&.state {
				max-width: 38px;
			}
		}

		td {
			font-size: 9pt;
			padding-right: 5px;
			padding-top: 1px;
			padding-bottom: 1px;
			color: #710;
			background-color: #f3ca92;
			border: 1px solid #c88f44;

			&.name {
				background-image: url('../assets/background/table_cell.webp');
				background-position: 0px 0px;
				padding-left: 15px;
				max-width: 222px;

				p {
					padding-top: 4px;
				}

				img {
					float: left;
					position: relative;
					margin-right: 5px;
					vertical-align: bottom;
				}
			}

			&.type {
				font-weight: bold;
				text-align: center;
				color: #bc683c;
				background-image: url('../assets/background/table_cell.webp');
				background-position: -10px 0px;
				max-width: 4px;
			}

			&.state {
				vertical-align: top;
				max-width: 40px;

				img {
					float: left;
					position: relative;
					left: 17px;
					top: 5px;
					cursor: help;
				}

				background-image: url('../assets/background/table_cell.webp');
				background-position: -10px 0px;
			}
		}
	}

	.disabled {
		td {
			opacity: 0.4;

			&.state {
				background-color: red;
				background-image: none;
				opacity: 1;
			}
		}
	}
}
</style>
