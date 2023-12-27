<template>
	<div class="details">
		<p class="wrapperMenu" @click="hidden = !hidden">
			{{ $t('details.sort.title') }}
		</p>
		<div ref="butt" class="wrapper" :class="hidden ? 'hidden' : 'shown'">
			<div class="label">
				<select name="sort" v-model="selectedSort" @change="sort()">
					<option value="Default">{{ $t('details.sort.default') }}</option>
					<option value="Energy">{{ $t('details.sort.energy') }}</option>
					<option value="Type">{{ $t('details.sort.type') }}</option>
					<option value="State">{{ $t('details.sort.state') }}</option>
				</select>
			</div>
			<div class="label">
				<input type="radio" id="Ascendant" value="Ascendant" v-model="picked" @change="reverse()" />
				<input type="radio" id="Descendant" value="Descendant" v-model="picked" @change="reverse()" />
			</div>
			<div class="label">
				<label for="Ascendant">Ascendant</label>
				<label for="Descendant">Descendant</label>
			</div>
		</div>
		<table>
			<tbody>
				<tr>
					<th class="name">{{ $t('details.th.comp') }}</th>
					<th class="type">{{ $t('details.th.type') }}</th>
					<th class="state" v-if="hasAmulst()">
						{{ $t('details.th.active') }}
					</th>
				</tr>
				<tr
					v-for="skill in dinozSkill as DinozSkillFiche[]"
					:key="skill.id"
					:class="skill.state === false ? 'disabled' : ''"
				>
					<td class="name">
						<Tippy theme="normal">
							<img
								v-for="(element, index) in skill.element"
								:key="index"
								:src="getImgURL('elements', `elem_${ElementType[element].toLowerCase()}`)"
								:alt="ElementType[element]"
							/>
							<p>{{ $t(`skill.name.${skillList[skill.id].name}`) }}</p>
							<template #content>
								<h1 v-html="formatContent($t(`skill.name.${skillList[skill.id].name}`))" />
								<p v-html="formatContent($t(`skill.description.${skillList[skill.id].name}`))" />
								<h3 v-html="formatContent($t(`skill.energy.${skill.energy}`))" />
							</template>
						</Tippy>
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
					<template v-if="hasAmulst()">
						<td class="state">
							<img
								:src="getImgURL('icons', `small_skill_${skill.state}`)"
								:alt="skill.state ? 'active' : 'inactive'"
								v-if="skill.activatable"
								@click="changeState(skill)"
								v-tippy="{
									content: formatContent($t(`details.activate.${skill.state}`)),
									theme: 'small'
								}"
							/>
							<img
								v-else
								src="../../assets/icons/small_skill_inactive.webp"
								v-tippy="{
									content: formatContent($t(`details.activate.locked`)),
									theme: 'small'
								}"
							/>
						</td>
					</template>
				</tr>
			</tbody>
		</table>
		<p class="title">
			{{ $t('details.statistics') }}
		</p>
		<div class="stats">
			<p class="subtitle">
				<span>{{ $t('details.assaults') }}</span>
				<Tippy tag="img" :src="getImgURL('icons', `help${getLanguage()}`)" theme="normal" class="help">
					<template #content>
						<h1 v-html="$t('details.assaults')" />
						<p v-html="'TODO'" />
					</template>
				</Tippy>
			</p>
			<ul class="stat-values">
				<Tippy tag="li" v-for="stat in assaultStats" :key="stat.name" theme="normal">
					<img :src="getImgURL('elements', `elem_${stat.name}`)" :alt="stat.name" />
					<span>{{ stat.value }}</span>
					<template #content>
						<h1 v-html="formatContent($t(`details.${stat.name}Assault`))" />
						<ul class="stat-details">
							<li v-for="(detail, i) in stat.details" :key="i">
								<img :src="getImgURL('design', 'info_button')" alt="info_button" />
								<span v-if="detail.type === 'element'">{{ detail.value }}</span>
								<span v-if="detail.type === 'element'" class="detail-name"
									>x 5 ({{ $t('details.baseElementContribution') }})</span
								>
								<span v-if="detail.type === 'skill'">+{{ detail.value }}</span>
								<span v-if="detail.type === 'skill'" class="detail-name">
									<span>{{ $t(`skill.name.${detail.name}`) }}</span>
									<img
										v-for="element in detail.elements"
										:key="element"
										:src="getImgURL('elements', `elem_${element}`)"
										alt="info_button"
									/>
								</span>
							</li>
						</ul>
					</template>
				</Tippy>
			</ul>
		</div>
		<div class="stats">
			<p class="subtitle">
				<span>{{ $t('details.defenses') }}</span>
				<Tippy tag="img" :src="getImgURL('icons', `help${getLanguage()}`)" theme="normal" class="help">
					<template #content>
						<h1 v-html="$t('details.defenses')" />
						<p v-html="'TODO'" />
					</template>
				</Tippy>
			</p>
			<ul class="stat-values">
				<Tippy tag="li" v-for="stat in defenseStats" :key="stat.name" theme="normal">
					<img :src="getImgURL('elements', `elem_${stat.name}`)" :alt="stat.name" />
					<span>{{ stat.value }}</span>
					<template #content>
						<h1 v-html="formatContent($t(`details.${stat.name}Defense`))" />
						<ul class="stat-details">
							<li v-if="!stat.neutral">
								<img :src="getImgURL('design', 'info_button')" alt="info_button" />
								<img :src="getImgURL('elements', `elem_${stat.weak2.name}`)" alt="info_button" class="ml-4" />
								<span>{{ stat.weak2.value }}</span>
								<span class="detail-name"> x 0.5</span>
							</li>
							<li v-if="!stat.neutral">
								<img :src="getImgURL('design', 'info_button')" alt="info_button" />
								<img :src="getImgURL('elements', `elem_${stat.weak1.name}`)" alt="info_button" class="ml-4" />
								<span>{{ stat.weak1.value }}</span>
								<span class="detail-name"> x 0.5</span>
							</li>
							<li v-if="!stat.neutral">
								<img :src="getImgURL('design', 'info_button')" alt="info_button" />
								<img :src="getImgURL('elements', `elem_${stat.element.name}`)" alt="info_button" class="ml-4" />
								<span>{{ stat.element.value }}</span>
								<span class="detail-name"> x 1</span>
							</li>
							<li v-if="!stat.neutral">
								<img :src="getImgURL('design', 'info_button')" alt="info_button" />
								<img :src="getImgURL('elements', `elem_${stat.strong1.name}`)" alt="info_button" class="ml-4" />
								<span>{{ stat.strong1.value }}</span>
								<span class="detail-name"> x 1.5</span>
							</li>
							<li v-if="!stat.neutral">
								<img :src="getImgURL('design', 'info_button')" alt="info_button" />
								<img :src="getImgURL('elements', `elem_${stat.strong2.name}`)" alt="info_button" class="ml-4" />
								<span>{{ stat.strong2.value }}</span>
								<span class="detail-name"> x 1.5</span>
							</li>
							<li v-for="(detail, i) in stat.details" :key="i">
								<img :src="getImgURL('design', 'info_button')" alt="info_button" />
								<span v-if="detail.type === 'element'">{{ detail.value }}</span>
								<img
									v-if="detail.type === 'element'"
									:src="getImgURL('elements', `elem_${detail.elements[0]}`)"
									alt="info_button"
									class="ml-4"
								/>
								<span v-if="detail.type === 'skill'">+{{ detail.value }}</span>
								<span v-if="detail.type === 'skill' && detail.global" class="detail-name">
									{{ 'x ' }}
									<span v-if="detail.element === stat.weak1?.name || detail.element === stat.weak2?.name"> 0.5</span>
									<span v-else-if="detail.element === stat.element?.name">1</span>
									<span v-else>1.5</span>
									{{ ' - ' }}
								</span>
								<span v-if="detail.type === 'skill'" class="detail-name">
									<span>{{ $t(`skill.name.${detail.name}`) }}</span>
									<img
										v-for="element in detail.elements"
										:key="element"
										:src="getImgURL('elements', `elem_${element}`)"
										alt="info_button"
									/>
								</span>
							</li>
						</ul>
					</template>
				</Tippy>
			</ul>
		</div>
		<div class="stats">
			<p class="subtitle">
				<span>{{ $t('details.specials') }}</span>
			</p>
			<ul class="stat-values">
				<Tippy v-for="stat in specialStats" :key="stat.name" tag="li" theme="normal">
					<img :src="getImgURL('specialStats', stat.name)" :alt="stat.name" />
					<span>{{ stat.value }}{{ stat.percent ? '%' : '' }}</span>
					<template #content>
						<h1 v-html="formatContent($t(`details.${stat.name}`))" />
						<ul class="stat-details">
							<li v-if="stat.name === SpecialStat.BUBBLE_RATE">
								<img :src="getImgURL('design', 'info_button')" alt="info_button" />
								<span>
									<span />
									<img :src="getImgURL('elements', 'elem_water')" />
									<img :src="getImgURL('elements', 'elem_air')" />
									/
									<img :src="getImgURL('elements', 'elem_water')" />
									<img :src="getImgURL('elements', 'elem_air')" />
									<img :src="getImgURL('elements', 'elem_wood')" />
									<img :src="getImgURL('elements', 'elem_fire')" />
									<img :src="getImgURL('elements', 'elem_lightning')" />
								</span>
							</li>
							<li v-for="(detail, i) in stat.details" :key="i">
								<img :src="getImgURL('design', 'info_button')" alt="info_button" />
								<img
									v-if="detail.type === 'base' && detail.elements.length"
									:src="getImgURL('elements', `elem_${detail.elements[0]}`)"
									alt="info_button"
								/>
								<span v-if="detail.type === 'base'">
									{{ detail.value }}{{ detail.percent ? '%' : '' }}
									<span class="detail-name">
										{{ stat.name === SpecialStat.ACID_BLOOD_DAMAGE ? '/ 2' : '' }} ({{ $t('details.baseValue') }})
									</span>
								</span>
								<span v-else>+{{ detail.value }}{{ detail.percent ? '%' : '' }}</span>
								<span v-if="detail.type !== 'base'" class="detail-name">
									<span>{{ $t(`skill.name.${detail.name}`) }}</span>
									<img
										v-for="element in detail.elements"
										:key="element"
										:src="getImgURL('elements', `elem_${element}`)"
										alt="info_button"
									/>
								</span>
							</li>
						</ul>
					</template>
				</Tippy>
			</ul>
		</div>
	</div>
</template>

<script lang="ts" scoped>
import { defineComponent, PropType } from 'vue';
import { statusList } from '../../constants/index.js';
import { DinozSkillFiche } from '@drpg/core/models/dinoz/DinozSkillFiche';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { DinozService } from '../../services/index.js';
import { errorHandler } from '../../utils/index.js';
import EventBus from '../../events/index.js';
import { ElementType } from '@drpg/core/models/enums/ElementType';
import { AssaultElement, getAssaultStat } from '@drpg/core/utils/getAssaultStat';
import { DefenseElement, getDefenseStat } from '@drpg/core/utils/getDefenseStat';
import { SpecialStat, getSpecialStat } from '@drpg/core/utils/getSpecialStat';
import { skillList } from '@drpg/core/models/dinoz/SkillList';
import { itemList } from '@drpg/core/models/item/ItemList';
import { dinozStore } from '../../store/dinozStore.js';

export default defineComponent({
	name: 'DetailsTab',
	props: { dinozData: Object as PropType<DinozFiche> },
	data() {
		return {
			dinozStore: dinozStore(),
			dinozSkill: [] as Array<DinozSkillFiche>,
			skillList,
			selectedSort: 'Default' as string,
			picked: 'Ascendant' as string,
			hidden: true as boolean,
			ElementType: ElementType,
			AssaultElement: AssaultElement,
			getAssaultStat,
			assaultStats: [] as ReturnType<typeof getAssaultStat>[],
			DefenseElement: DefenseElement,
			getDefenseStat,
			defenseStats: [] as ReturnType<typeof getDefenseStat>[],
			SpecialStat: SpecialStat,
			getSpecialStat,
			specialStats: [] as ReturnType<typeof getSpecialStat>[]
		};
	},
	methods: {
		async changeState(skill: DinozSkillFiche): Promise<void> {
			const dinozId = this.$route.params.id as string;
			EventBus.emit('isLoading', true);
			try {
				await DinozService.setSkillState(parseInt(dinozId), skill.id, !skill.state);
				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err);
				return;
			}

			skill.state = !skill.state;
		},
		hasAmulst(): boolean {
			return this.dinozData!.status!.includes(statusList.id.amulst);
		},
		sort(): void {
			switch (this.selectedSort) {
				case 'Default':
					this.dinozSkill = this.dinozSkill.sort((a: DinozSkillFiche, b: DinozSkillFiche) =>
						a.id > b.id ? 1 : b.id > a.id ? -1 : 0
					);
					break;
				case 'Type':
					this.dinozSkill = this.dinozSkill.sort((a: DinozSkillFiche, b: DinozSkillFiche) =>
						a.type > b.type ? 1 : b.type > a.type ? -1 : 0
					);
					break;
				case 'Energy':
					this.dinozSkill = this.dinozSkill.sort((a: DinozSkillFiche, b: DinozSkillFiche) =>
						a.energy > b.energy ? 1 : b.energy > a.energy ? -1 : 0
					);
					break;
				case 'State':
					this.dinozSkill = this.dinozSkill.sort((a: DinozSkillFiche, b: DinozSkillFiche) =>
						!!a.state > !!b.state ? 1 : !!b.state > !!a.state ? -1 : 0
					);
					break;
				default:
					break;
			}
		},
		reverse(): void {
			this.dinozSkill = this.dinozSkill.reverse();
		},
		getLanguage() {
			return this.$i18n.locale.toLocaleUpperCase();
		},
		async loadComponent(): Promise<void> {
			EventBus.emit('isLoading', true);
			try {
				const dinozId = this.$route.params.id as string;
				this.dinozSkill = await DinozService.getDinozSkill(+dinozId);
				this.sort();
				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err);
				return;
			}

			const data = this.dinozData;
			if (!data) {
				EventBus.emit('toast', { type: 'error', message: 'dinozDataMissing' });
				return;
			}

			// Get stats
			this.assaultStats = Object.values(AssaultElement).map(stat =>
				getAssaultStat(data, this.dinozSkill, stat as AssaultElement)
			);

			this.defenseStats = Object.values(DefenseElement).map(stat =>
				getDefenseStat(data, this.dinozSkill, stat as DefenseElement)
			);

			this.specialStats = Object.values(SpecialStat)
				.map(stat => getSpecialStat(data, this.dinozSkill, stat as SpecialStat))
				.filter(Boolean);

			// Refresh special stats on EventBus `refreshInventory`
			EventBus.on('refreshInventory', async ({ event, item }: { event: string; item: number }) => {
				if (!this.dinozData) {
					EventBus.emit('toast', { type: 'error', message: 'dinozDataMissing' });
					return;
				}

				// Remove torchDamage stat if last lighter was unequipped
				if (event === 'unequip' && item === itemList.ZIPPO.itemId) {
					if (this.dinozData.items?.filter(i => i === item).length === 1) {
						this.specialStats = this.specialStats.filter(stat => stat?.name !== SpecialStat.TORCH_DAMAGE);
					}
				} else if (event === 'equip' && item === itemList.ZIPPO.itemId) {
					// Add torchDamage stat if lighter was equipped and no other lighter was equipped
					if (!this.specialStats.find(stat => stat?.name === SpecialStat.TORCH_DAMAGE)) {
						this.specialStats.push(getSpecialStat(this.dinozData, this.dinozSkill, SpecialStat.TORCH_DAMAGE));
					}
				}
			});
		}
	},
	async mounted(): Promise<void> {
		await this.loadComponent();
	},
	unmounted() {
		EventBus.off('refreshInventory');
	},
	watch: {
		// Reload page if player go on another dinoz page
		'$route.params.id': async function (to) {
			if (to !== undefined && this.$route.name === 'DinozPage') {
				await this.loadComponent();
			}
		}
	}
});
</script>

<style lang="scss" scoped>
.wrapperMenu {
	padding-left: 5px;
	padding-right: 5px;
	margin-top: 5px;
	margin-bottom: 5px;
	font-size: 8pt;
	border: 1px dashed rgba(0, 0, 0, 0.1);
	text-align: center;
	&:hover {
		background-color: #9a4029;
		color: #fce3bc;
	}
}
.hidden {
	max-height: 0;
}
.shown {
	max-height: 54px;
}
.wrapper {
	overflow: hidden;
	transition: max-height 0.2s ease-out;
	padding-left: 5px;
	padding-right: 5px;
	margin-top: 5px;
	margin-bottom: 5px;
	font-size: 8pt;
	select {
		margin-bottom: 5px;
	}
	.label {
		display: flex;
		justify-content: space-around;
	}
}
.details {
	margin: 5px;
	table {
		width: 100%;
		margin-bottom: 5px;
		margin-bottom: 10px;
		border: 2px solid #bc683c;
		background-color: #ecbd84;
		border-collapse: separate;
		border-spacing: 1px;
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
				background-image: url('../../assets/background/table_header.webp');
				background-position: left bottom;
				max-width: 222px;
				&.name {
					width: 200px;
				}
				&.type {
					max-width: 26px;
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
					img {
						float: left;
						position: relative;
						left: 17px;
						top: 5px;
						cursor: help;
					}
					background-image: url('../../assets/background/table_cell.webp');
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

	.title {
		color: #f8efa4;
		background-color: #bc683c;
		padding: 4px 8px;
		font-variant: small-caps;
		margin-bottom: 4px;
	}

	.stats {
		border: 1px solid #f8efa4;
		border-radius: 10px;
		padding: 2px 0;
		margin-bottom: 6px;

		.subtitle {
			display: flex;
			align-items: center;
			color: #f8efa4;
			font-variant: small-caps;
			border-bottom: 1px solid #f8efa4;
			font-size: 9pt;
			padding-left: 4px;
			padding-right: 4px;
			padding-bottom: 2px;

			.help {
				border: 1px solid #bc683c;
				cursor: help;
				margin-left: 5px;

				&:hover {
					outline: 1px solid white;
				}
			}
		}

		.stat-values {
			list-style-type: none;
			padding: 4px 8px;
			padding-bottom: 0;

			li {
				position: relative;
				display: inline-flex;
				align-items: center;
				justify-content: space-around;
				min-width: 42px;
				font-size: 10pt;
				font-weight: bold;
				color: white;
				letter-spacing: -0.2pt;
				z-index: 2;
				padding-right: 4px;

				&:not(:last-child) {
					margin-right: 2px;
				}

				&::before {
					content: '';
					position: absolute;
					width: 80%;
					height: 13px;
					background-color: #90452c;
					left: 20%;
					top: 5px;
					border-radius: 10px;
					z-index: -1;
				}

				& > img {
					width: 22px;
				}

				span {
					margin-left: 2px;
				}
			}
		}
	}
}

.stat-details {
	list-style-type: none;
	color: white;
	font-size: 9pt;

	li {
		display: flex;
		align-items: center;

		img {
			margin-right: 4px;

			&:first-child {
				width: 7px;
				margin-left: 8px;
			}
		}

		.detail-name {
			color: #fdf1c4;
			font-style: italic;
			margin-left: 2px;

			img {
				margin: 0 2px;
			}
		}
	}
}

.ml-4 {
	margin-left: 4px;
}
</style>
