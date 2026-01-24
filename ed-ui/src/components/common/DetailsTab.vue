<template>
	<div class="details">
		<DZSelect
			v-if="playerStore.playerOptions.hasPAC && ownBuilds.length"
			id="build-select"
			:options="ownBuilds.map(build => ({ label: build.name, value: build.id }))"
			:placeholder="$t('skillTrees.build')"
			v-model="dinozBuild"
			@change="changeDinozBuild"
			class="build-select"
		/>
		<p
			v-if="playerStore.playerOptions.hasPAC"
			class="wrapperMenu"
			@click="goTo($router, 'DinozSkills', { params: { id: dinozStore.currentDinozId } })"
		>
			{{ $t('skillTrees.title') }}
		</p>
		<p class="wrapperMenu" @click="hidden = !hidden">
			{{ $t('details.sort.title') }}
		</p>
		<div ref="butt" class="wrapper" :class="hidden ? 'hidden' : 'shown'">
			<div class="label">
				<DZSelect class="sort-select" id="sort" v-model="selectedSort" :options="sortOptions" />
			</div>
			<div class="label">
				<DZRadio id="asc" :label="$t('details.asc')" value="asc" v-model="picked" />
				<DZRadio id="desc" :label="$t('details.desc')" value="desc" v-model="picked" />
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
					v-for="skill in dinozSkills as SkillDetails[]"
					:key="skill.id"
					:class="skill.state === false ? 'disabled' : ''"
				>
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
								<span v-if="detail.type !== 'element'">+{{ detail.value }}</span>
								<span v-if="detail.type === 'skill'" class="detail-name">
									<span>{{ $t(`skill.name.${detail.name}`) }}</span>
									<img
										v-for="element in detail.elements"
										:key="element"
										:src="getImgURL('elements', `elem_${element}`)"
										alt="info_button"
									/>
								</span>
								<span v-if="detail.type === 'status'" class="detail-name">
									<img
										:src="getImgURL('status', `fx_${statusList.imgName[+(detail.name || '0')]}`)"
										:alt="$t(`status.name.${detail.name}`)"
									/>
									<span>{{ $t(`status.name.${detail.name}`) }}</span>
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
								<img :src="getImgURL('elements', `elem_${stat.weak2?.name}`)" alt="info_button" class="ml-4" />
								<span>{{ stat.weak2?.value }}</span>
								<span class="detail-name"> x 0.5</span>
							</li>
							<li v-if="!stat.neutral">
								<img :src="getImgURL('design', 'info_button')" alt="info_button" />
								<img :src="getImgURL('elements', `elem_${stat.weak1?.name}`)" alt="info_button" class="ml-4" />
								<span>{{ stat.weak1?.value }}</span>
								<span class="detail-name"> x 0.5</span>
							</li>
							<li v-if="!stat.neutral">
								<img :src="getImgURL('design', 'info_button')" alt="info_button" />
								<img :src="getImgURL('elements', `elem_${stat.element?.name}`)" alt="info_button" class="ml-4" />
								<span>{{ stat.element?.value }}</span>
								<span class="detail-name"> x 1</span>
							</li>
							<li v-if="!stat.neutral">
								<img :src="getImgURL('design', 'info_button')" alt="info_button" />
								<img :src="getImgURL('elements', `elem_${stat.strong1?.name}`)" alt="info_button" class="ml-4" />
								<span>{{ stat.strong1?.value }}</span>
								<span class="detail-name"> x 1.5</span>
							</li>
							<li v-if="!stat.neutral">
								<img :src="getImgURL('design', 'info_button')" alt="info_button" />
								<img :src="getImgURL('elements', `elem_${stat.strong2?.name}`)" alt="info_button" class="ml-4" />
								<span>{{ stat.strong2?.value }}</span>
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
								<span v-if="detail.type === 'skill' || detail.type === 'status'"
									>{{ detail.value < 0 ? '-' : '+' }}{{ Math.abs(detail.value) }}</span
								>
								<span v-if="detail.type !== 'element' && detail.global" class="detail-name">
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
								<span v-if="detail.type === 'status'" class="detail-name">
									<img
										:src="getImgURL('status', `fx_${statusList.imgName[+(detail.name || '0')]}`)"
										:alt="$t(`status.name.${detail.name}`)"
									/>
									<span>{{ $t(`status.name.${detail.name}`) }}</span>
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
					<span>
						{{ stat.percent ? Math.round((stat.value - 1) * 100) : stat.value }}{{ stat.percent ? '%' : '' }}
					</span>
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
								<span v-if="detail.type === 'base'">
									{{ detail.value }}{{ detail.percent ? '%' : '' }}
									<span class="detail-name">
										{{ stat.name === SpecialStat.ACID_BLOOD_DAMAGE ? '/ 2' : '' }} ({{ $t('details.baseValue') }})
									</span>
								</span>
								<span v-else>
									{{ detail.multiplier ? 'x' : detail.value < 0 ? '-' : '+' }}
									{{ Math.abs(detail.value) }} {{ detail.percent ? '%' : '' }}
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
								<span v-if="detail.type === 'status'" class="detail-name">
									<img
										:src="getImgURL('status', `fx_${statusList.imgName[+(detail.name || '0')]}`)"
										:alt="$t(`status.name.${detail.name}`)"
									/>
									<span>{{ $t(`status.name.${detail.name}`) }}</span>
								</span>
								<span v-if="detail.type === 'item'" class="detail-name">
									<img :src="getImgURL('item', `item_${detail.name}`)" :alt="$t(`item.name.${detail.name}`)" />
									<span>{{ $t(`item.name.${detail.name}`) }}</span>
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
import { defineComponent } from 'vue';
import { statusList } from '../../constants/index.js';
import { DinozService } from '../../services/index.js';
import { errorHandler } from '../../utils/index.js';
import { dinozStore, playerStore } from '../../store/index.js';
import SkillTooltip from '../dinoz/SkillTooltip.vue';
import { goTo } from '../../utils/goTo.js';
import DZSelect from './DZSelect.vue';
import DZRadio from './DZRadio.vue';
import { DinozBuildService } from '../../services/DinozBuildService.js';
import { DinozBuild } from '@drpg/prisma';
import { ElementType } from '@drpg/core/models/enums/ElementType';
import { GetOwnDinozBuildResponse } from '@drpg/core/returnTypes/DinozBuild';
import { AssaultElement, getAssaultStat } from '@drpg/core/utils/getAssaultStat';
import { DefenseElement, getDefenseStat } from '@drpg/core/utils/getDefenseStat';
import { getSpecialStat, SpecialStat } from '@drpg/core/utils/getSpecialStat';
import { SkillDetails } from '@drpg/core/models/dinoz/SkillDetails';
import { skillList } from '@drpg/core/models/dinoz/SkillList';
import { toSkillDetails } from '@drpg/core/utils/DinozUtils';
import { TIME_BASE } from '@drpg/core/utils/fightConstants';

export default defineComponent({
	name: 'DetailsTab',
	components: {
		SkillTooltip,
		DZSelect,
		DZRadio
	},
	data() {
		return {
			dinozStore: dinozStore(),
			dinozSkill: [] as Array<SkillDetails>,
			skillList,
			statusList,
			selectedSort: 'Default' as string,
			picked: 'Ascendant' as string,
			hidden: true as boolean,
			ElementType,
			SpecialStat: SpecialStat,
			playerStore: playerStore(),
			goTo,
			sortOptions: [
				{ label: this.$t('details.sort.default'), value: 'Default' },
				{ label: this.$t('details.sort.energy'), value: 'Energy' },
				{ label: this.$t('details.sort.type'), value: 'Type' },
				{ label: this.$t('details.sort.state'), value: 'State' }
			],
			ownBuilds: [] as GetOwnDinozBuildResponse,
			dinozBuild: undefined as DinozBuild['id'] | undefined
		};
	},
	computed: {
		dinozSkills() {
			try {
				const currentDinoz = this.dinozStore.getCurrentDinoz;
				let skills = toSkillDetails(currentDinoz.skills);
				this.sortSkills(skills); // Mutate the array
				if (this.picked === 'desc') {
					skills = [...skills].reverse();
				}
				// Else, nothing to do as the computed property is refreshed
				return skills;
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return [];
			}
		},
		assaultStats() {
			try {
				const currentDinoz = this.dinozStore.getCurrentDinoz;
				return Object.values(AssaultElement).map(stat =>
					getAssaultStat(
						currentDinoz,
						currentDinoz.status.map(s => s.statusId),
						toSkillDetails(currentDinoz.skills),
						stat as AssaultElement
					)
				);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return [];
			}
		},
		defenseStats() {
			try {
				const currentDinoz = this.dinozStore.getCurrentDinoz;
				return Object.values(DefenseElement).map(stat =>
					getDefenseStat(
						currentDinoz,
						currentDinoz.status.map(s => s.statusId),
						toSkillDetails(currentDinoz.skills),
						stat as DefenseElement
					)
				);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return [];
			}
		},
		specialStats() {
			try {
				const currentDinoz = this.dinozStore.getCurrentDinoz;
				const priest = this.playerStore.isPriest;
				// Find global speed value to compute it with elemental speed
				const global_speed_special = getSpecialStat(
					currentDinoz,
					currentDinoz.status.map(s => s.statusId),
					toSkillDetails(currentDinoz.skills),
					SpecialStat.SPEED,
					priest
				);

				// Find global critical value
				const global_critical_hit = getSpecialStat(
					currentDinoz,
					currentDinoz.status.map(s => s.statusId),
					toSkillDetails(currentDinoz.skills),
					SpecialStat.CRITICAL_HIT_CHANCE,
					priest
				);

				let global_speed = 1;
				if (global_speed_special) {
					global_speed = global_speed_special.value;
				}

				return Object.values(SpecialStat)
					.map(stat => {
						let special = getSpecialStat(
							currentDinoz,
							currentDinoz.status.map(s => s.statusId),
							toSkillDetails(currentDinoz.skills),
							stat as SpecialStat,
							priest
						);

						// Add +1 to bubble for proper display
						if (special && special.name.includes('bubble')) {
							special.value += 1;
						}

						// Transform speed into the duration of a turn
						if (special && special.name.toLowerCase().includes('speed')) {
							special.percent = false;
							// Specific handling for elemental speed
							if (!special.name.startsWith('speed')) {
								if (special.value === 1) {
									// Hide element speeds if they are only at the base value
									special = null;
								} else {
									// Multiply by global speed
									special.value = Math.round(100 * TIME_BASE * special.value * global_speed) / 100;
									// Set base as global speed
									if (special.details) {
										special.details.map(detail => {
											detail.percent = false;
											if (detail.type === 'base') {
												detail.value = Math.round(global_speed * TIME_BASE * 100) / 100;
											}
											return detail;
										});
									}
								}
							} else {
								special.value = Math.round(TIME_BASE * special.value * 100) / 100;
								if (special.details) {
									special.details.map(detail => {
										detail.percent = false;
										if (detail.type === 'base') {
											detail.value = TIME_BASE;
										}
										return detail;
									});
								}
							}
						}

						// Filter out other special stats that are at default value
						if (special && !special.name.startsWith('speed') && special.value === 100) {
							special = null;
						}

						// Filter out critical hit damage if critical hit chance is default (0%)
						if (
							special &&
							special.name.startsWith('criticalHitDamage') &&
							global_critical_hit &&
							global_critical_hit.value === 1
						) {
							special = null;
						}

						// Filter out stats with no details, with some exceptions
						if (
							special &&
							((special.details && special.details.length > 0) || special.name === SpecialStat.BUBBLE_RATE)
						) {
							return special;
						} else {
							return null;
						}
					})
					.filter(Boolean) as NonNullable<ReturnType<typeof getSpecialStat>>[];
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return [];
			}
		}
	},
	methods: {
		async changeState(skill: SkillDetails): Promise<void> {
			const dinozId = this.$route.params.id as string;

			try {
				await DinozService.setSkillState(parseInt(dinozId), skill.id, !skill.state);
				this.dinozStore.setDinozSkillState(parseInt(dinozId), skill.id, !skill.state);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		hasAmulst(): boolean {
			try {
				const currentDinoz = this.dinozStore.getCurrentDinoz;
				return currentDinoz.status.some(s => s.statusId === statusList.id.amulst) ?? false;
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return false;
			}
		},
		sortSkills(skills: SkillDetails[]) {
			switch (this.selectedSort) {
				case 'Default':
					return skills.sort((a: SkillDetails, b: SkillDetails) => (a.id > b.id ? 1 : b.id > a.id ? -1 : 0));
				case 'Type':
					return skills.sort((a: SkillDetails, b: SkillDetails) => (a.type > b.type ? 1 : b.type > a.type ? -1 : 0));
				case 'Energy':
					return skills.sort((a: SkillDetails, b: SkillDetails) =>
						a.energy > b.energy ? 1 : b.energy > a.energy ? -1 : 0
					);
				case 'State':
					return skills.sort((a: SkillDetails, b: SkillDetails) =>
						!!a.state > !!b.state ? 1 : !!b.state > !!a.state ? -1 : 0
					);
				default:
					return skills;
			}
		},
		reverse(): void {
			this.dinozSkill = this.dinozSkill.reverse();
		},
		getLanguage() {
			return this.$i18n.locale.toLocaleUpperCase();
		},
		async loadComponent(): Promise<void> {
			if (this.playerStore.playerOptions.hasPAC) {
				try {
					const currentDinoz = this.dinozStore.getCurrentDinoz;
					this.ownBuilds = await DinozBuildService.getOwn();
					this.dinozBuild = currentDinoz.build?.id;
				} catch (err) {
					errorHandler.handle(err, this.$toast);
				}
			}
		},
		async changeDinozBuild() {
			if (!this.dinozBuild || !this.dinozStore.currentDinozId) {
				return;
			}

			try {
				await DinozService.assignBuild(this.dinozStore.currentDinozId, this.dinozBuild);
				const currentDinoz = this.dinozStore.getCurrentDinoz;
				const build = this.ownBuilds.find(b => b.id === this.dinozBuild);

				this.dinozStore.setDinoz({
					...currentDinoz,
					build
				});

				this.$toast.success(this.$t('toast.buildAssigned', { name: build?.name ?? '' }).toString());
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		}
	},
	async mounted(): Promise<void> {
		await this.loadComponent();
	},
	watch: {
		'$route.params.id': 'loadComponent',
		dinozData() {
			this.loadComponent();
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
	cursor: pointer;

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

		label[for] {
			cursor: pointer;
		}
	}

	.sort-select {
		width: 100%;
		margin-bottom: 8px;
	}

	&.shown {
		overflow: visible;
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

		& > img {
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

.build-select {
	width: 100%;
}
</style>
