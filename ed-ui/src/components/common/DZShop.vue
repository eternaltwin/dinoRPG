<template>
	<div class="dinoz_card_wrapper">
		<div class="dinoz_card">
			<Suspense>
				<DinozWithoutFlash class="dinoImg" :display="dinoz.display" flip :life="1" />
				<template #fallback>
					<div class="loading-wrapper"><Loading /></div>
				</template>
			</Suspense>

			<div class="infos">
				<div class="desc_row">
					<div class="desc">
						<Tippy theme="normal">
							{{ $t(`race.name.${raceList[dinoz.raceId].name}`) }}
							<strong>{{ $t(`shop.demon.level`, { level: dinoz.level }) }}</strong>
							<template #content>
								<h1>{{ $t(`race.name.${raceList[dinoz.raceId].name}`) }}</h1>
								<p>{{ $t(`race.description.${raceList[dinoz.raceId].name}`) }}</p>
							</template>
						</Tippy>
					</div>
					<div class="price">
						<span class="money">
							{{ utils.beautifulNumber(dinoz.price.toString()) }}
							<img :src="getImgURL('icons', currency === 'demon' ? 'small_demon_tk' : 'small_gold')" :alt="currency" />
						</span>
					</div>
				</div>

				<div class="element_row">
					<!--
						When details=false: Elements shown inline (mirrors sacrifice_sheet).
						When details=true:  Elements live in the collapsible panel below (mirrors demon/unsacrifice_sheet).
						`sacrifice` only controls the action button label — it is independent of `details`.
					-->
					<Elements
						v-if="!details"
						:fire="dinoz.nbrUpFire"
						:wood="dinoz.nbrUpWood"
						:water="dinoz.nbrUpWater"
						:lightning="dinoz.nbrUpLightning"
						:air="dinoz.nbrUpAir"
						style="margin-top: -5px"
					/>
					<DZButton v-if="details" size="small" @click="toggleDetails">
						{{ $t('button.details') }}
					</DZButton>
					<DZButton @click="$emit('action', dinoz)">
						{{ sacrifice ? $t('shop.demon.sacrifice') : $t('button.chose') }}
					</DZButton>
				</div>
			</div>
		</div>

		<DZDisclaimer v-if="details && isDetailsOpen" round class="dinoz_details">
			<div class="element_row">
				<Elements
					:fire="dinoz.nbrUpFire"
					:wood="dinoz.nbrUpWood"
					:water="dinoz.nbrUpWater"
					:lightning="dinoz.nbrUpLightning"
					:air="dinoz.nbrUpAir"
					style="margin-top: -5px"
				/>
			</div>
			<table class="skill_row">
				<tbody>
					<tr>
						<th class="name">{{ $t('details.th.comp') }}</th>
						<th class="type">{{ $t('details.th.type') }}</th>
					</tr>
					<tr v-for="skill in skillDetails" :key="skill.id">
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
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from 'vue';
import type { PropType } from 'vue';
import DZButton from './DZButton.vue';
import DZDisclaimer from './DZDisclaimer.vue';
import Elements from '../data/Elements.vue';
import SkillTooltip from '../dinoz/SkillTooltip.vue';
import { raceList } from '@drpg/core/models/dinoz/RaceList';
import { skillList } from '@drpg/core/models/dinoz/SkillList';
import type { SkillDetails } from '@drpg/core/models/dinoz/SkillDetails';
import { toSkillDetails } from '@drpg/core/utils/DinozUtils';
import { ElementType } from '@drpg/core/models/enums/ElementType';
import type { demonDinozFiche } from '@drpg/core/models/shop/demonShopFiche';
import { utils } from '../../utils/index.js';

/*
 * Usage:
 *
 * sacrifice_sheet   →  <DZShop :dinoz="dinoz" sacrifice @action="confirmSacrifice" />
 * demon_sheet       →  <DZShop :dinoz="dinoz" details @action="d => confirmPurchase(d.id)" />
 * unsacrifice_sheet →  <DZShop :dinoz="dinoz" details @action="d => confirmUnsacrifice(d.id)" />
 * gold currency     →  <DZShop :dinoz="dinoz" currency="gold" details @action="onAction" />
 */
export default defineComponent({
	name: 'DZShop',
	components: {
		Elements,
		DZButton,
		DZDisclaimer,
		DinozWithoutFlash: defineAsyncComponent(() => import('../dinoz/DinozWithoutFlash.vue')),
		SkillTooltip
	},
	props: {
		dinoz: {
			type: Object as PropType<demonDinozFiche>,
			required: true
		},
		// Which currency icon to display next to the price.
		currency: {
			type: String as PropType<'gold' | 'demon'>,
			default: 'gold'
		},
		// Show a collapsible skills panel with a toggle button.
		details: {
			type: Boolean,
			default: false
		},
		// Use the "sacrifier" label on the action button instead of "acheter".
		sacrifice: {
			type: Boolean,
			default: false
		}
	},
	emits: ['action'],
	data() {
		return {
			utils,
			raceList,
			skillList,
			ElementType,
			isDetailsOpen: false,
			skillDetails: [] as SkillDetails[]
		};
	},
	methods: {
		toggleDetails(): void {
			if (this.isDetailsOpen) {
				this.isDetailsOpen = false;
				this.skillDetails = [];
			} else {
				this.skillDetails = toSkillDetails(this.dinoz.skills.map(s => ({ skillId: s, state: true })));
				this.isDetailsOpen = true;
			}
		}
	}
});
</script>

<style lang="scss" scoped>
@media (max-width: 510px) {
	.dinoz_card_wrapper {
		width: 100%;
		max-width: 100%;
		align-items: center;
 
		.dinoz_card {
			width: 100%;
			max-height: none;
			height: fit-content;
			flex-direction: column;
			align-items: center;
			background-image: none;
			background-color: #bc683c;
			border-radius: 8px;
			box-sizing: border-box;

			.dinoImg {
				position: static;
			}

			.infos {
				position: static;
				display: flex;
				flex-direction: column;
				gap: 5px;
				padding: 5px;
				width: 100%;
			}
		}

		.dinoz_details {
			max-height: none;
			height: fit-content;
			background-image: none;
			background-color: #bc683c;
			border-radius: 8px;
		}
	}
}
 
.dinoz_card_wrapper {
	max-width: 510px;
}
 
.dinoz_card {
	display: flex;
	align-items: flex-start;
	max-height: 80px;
	padding: 5px;
	clear: both;
	width: fit-content;
	background-image: url('../../assets/design/shop_dinoz_bg.webp');
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
}
 
.dinoz_details {
	flex-direction: column;
	height: fit-content;
	width: 100%;
	margin: 0;
	margin-top: 10px;
	display: flex;
	align-items: stretch;
	padding: 10px;
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
 
.dinoImg {
	bottom: 70px;
	position: relative;
	left: -20px;
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
 
table {
	width: 90%;
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
			text-shadow: 1px 1px 0px #356847;
			padding: 0 4px 8px;
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
			background-image: url('../../assets/background/table_header.webp');
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
			padding: 1px 5px 1px 0;
			color: #710;
			background-color: #f3ca92;
			border: 1px solid #c88f44;
 
			&.name {
				background-image: url('../../assets/background/table_cell.webp');
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
				background-image: url('../../assets/background/table_cell.webp');
				background-position: -10px 0px;
				max-width: 4px;
			}
 
			&.state {
				vertical-align: top;
				max-width: 40px;
				background-image: url('../../assets/background/table_cell.webp');
				background-position: -10px 0px;
 
				img {
					float: left;
					position: relative;
					left: 17px;
					top: 5px;
					cursor: help;
				}
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
