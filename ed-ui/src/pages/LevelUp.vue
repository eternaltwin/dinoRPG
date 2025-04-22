<template>
	<TitleHeader
		v-if="availableSkills"
		:title="`${$t('pageTitle.levelup')}${availableSkills.name} ]`"
		:header="$t(`levelup.title`, { name: availableSkills.name })"
	></TitleHeader>
	<div class="levelUp">
		<DZDisclaimer content="levelup.disclaimer" />
		<div class="wrapper border" v-if="availableSkills">
			<LevelUpGrid
				v-if="availableSkills.upChance && availableSkills.element"
				:grid="availableSkills.upChance"
				:element="availableSkills.element"
				@spinOver="spinOver"
			/>
			<div class="dinozWrapper">
				<Suspense>
					<DinozWithoutFlash
						:style="{
							position: `relative`,
							top: `45px`
						}"
						:display="availableSkills.display"
						:life="1"
					/>
					<template #fallback><Loading /></template>
				</Suspense>
			</div>
		</div>
		<div class="slide-bottom" :class="isSpinOver ? '' : 'hidden'" v-if="availableSkills">
			<div class="result" v-if="ElementType[availableSkills.element]">
				{{ availableSkills.name }}
				<p v-html="formatContent($t(`levelup.${ElementType[availableSkills.element].toLowerCase()}`))" />
				<Elements
					:fire="
						ElementType[availableSkills.element] === 'fire' ? availableSkills.nbrUpFire + 1 : availableSkills.nbrUpFire
					"
					:wood="
						ElementType[availableSkills.element] === 'wood' ? availableSkills.nbrUpWood + 1 : availableSkills.nbrUpWood
					"
					:water="
						ElementType[availableSkills.element] === 'water'
							? availableSkills.nbrUpWater + 1
							: availableSkills.nbrUpWater
					"
					:lightning="
						ElementType[availableSkills.element] === 'lightning'
							? availableSkills.nbrUpLightning + 1
							: availableSkills.nbrUpLightning
					"
					:air="
						ElementType[availableSkills.element] === 'air' ? availableSkills.nbrUpAir + 1 : availableSkills.nbrUpAir
					"
					class="elements"
				/>
				{{ $t(`levelup.helper`) }}
			</div>
			<div class="select">
				<table>
					<tbody>
						<tr>
							<th class="name">{{ $t('details.th.comp') }}</th>
							<th class="type">{{ $t('details.th.type') }}</th>
							<th class="type">{{ $t('levelup.level') }}</th>
							<th class="type"></th>
						</tr>
						<tr
							v-for="skill in availableSkills.learnableSkills"
							:key="skill.skillId"
							@click="learnSkill(skill.skillId)"
						>
							<td class="name">
								<div class="skillName">
									<img
										v-for="element in skill.element"
										:key="element"
										:src="getImgURL('elements', `elem_${ElementType[element].toLowerCase()}`)"
										alt="elementUp"
									/>
									<p>{{ $t(`skill.name.${skillList[skill.skillId].name}`) }}</p>
								</div>
								<p class="desc">
									{{ $t(`skill.description.${skillList[skill.skillId].name}`) }}
								</p>
								<hr class="demarcation" />
								<div class="hidden-stats">
									<p
										class="desc"
										v-html="
											formatContent(
												$t(`skill.energy`, {
													energy: skillList[skill.skillId].energy
												})
											)
										"
									/>
									<p
										class="desc"
										v-if="skillList[skill.skillId].priority !== undefined && skillList[skill.skillId].priority !== null"
										v-html="
											formatContent(
												$t(`skill.priority`, {
													priority: skillList[skill.skillId].priority
												})
											)
										"
									/>
									<p
										class="desc"
										v-if="
											skillList[skill.skillId].probability !== undefined &&
											skillList[skill.skillId].probability !== null
										"
										v-html="
											formatContent(
												$t(`skill.probability`, {
													probability: skillList[skill.skillId].probability
												})
											)
										"
									/>
								</div>
							</td>
							<Tippy theme="normal" tag="td" class="type">
								{{ skill.type }}
								<template #content>
									<h1 v-html="formatContent($t(`details.type.name.${skill.type}`))" />
									<p v-html="formatContent($t(`details.type.description.${skill.type}`))" />
								</template>
							</Tippy>
							<td class="type">
								{{ String(skill.skillId)[2] }}
							</td>
							<td class="learn">
								<img :src="getImgURL('icons', 'small_right')" alt="right" />{{ $t('levelup.learn') }}
							</td>
						</tr>
						<template v-if="availableSkills.unlockableSkills">
							<tr v-if="availableSkills.unlockableSkills.length > 0" @click="unlockSkill()">
								<td class="name" colspan="4">
									<div class="skillName">
										<img :src="getImgURL('icons', 'small_right')" alt="right" />
										{{ $t(`levelup.unlock1`) }}
										{{ availableSkills.unlockableSkills.length }}
										{{ $t(`levelup.unlock2`) }}
										<Tippy tag="img" :src="getImgURL('icons', `help${getLanguage()}`)" theme="normal" class="help">
											<template #content>
												<h1 v-html="formatContent($t(`levelup.helperUnlock.title`))" />
												<p v-html="formatContent($t(`levelup.helperUnlock.description`))" />
											</template>
										</Tippy>
									</div>
									<ul class="unlock">
										<Tippy
											tag="li"
											theme="small"
											v-for="(skill, index) in (availableSkills as DinozSkillOwnAndUnlockable).unlockableSkills"
											:key="index"
										>
											<img
												v-for="element in skill.element"
												:key="element"
												:src="getImgURL('elements', `elem_${ElementType[element].toLowerCase()}`)"
												alt="elementUp"
											/>
											{{ $t(`skill.name.${skillList[skill.skillId].name}`) }}
											<template #content>
												{{ $t(`levelup.unlock`) }}
											</template>
										</Tippy>
									</ul>
								</td>
							</tr>
						</template>
					</tbody>
				</table>
			</div>
			<a
				class="button"
				v-if="availableSkills.canRelaunch"
				@click="retry()"
				v-tippy="{
					content: formatContent($t('levelup.pdc')),
					theme: 'small'
				}"
			>
				{{ $t(`skill.name.PlanDeCarriere`) }}
			</a>
		</div>
	</div>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from 'vue';
import EventBus from '../events/index.js';
import { DinozService } from '../services/index.js';
import { errorHandler } from '../utils/index.js';
import { DinozSkillOwnAndUnlockable } from '@drpg/core/models/dinoz/DinozSkillOwnAndUnlockable';
import { dinozPlacement } from '../constants/index.js';
import { ElementType } from '@drpg/core/models/enums/ElementType';
import { dinozStore } from '../store/index.js';
import LevelUpGrid from '../components/dinoz/LevelUpGrid.vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import Elements from '../components/data/Elements.vue';
import { skillList } from '@drpg/core/models/dinoz/SkillList';
import DZDisclaimer from '../components/common/DZDisclaimer.vue';
import { FBService } from '../services/FBTournamentService.js';

export default defineComponent({
	name: 'LevelUp',
	components: {
		DZDisclaimer,
		LevelUpGrid,
		TitleHeader,
		Elements,
		DinozWithoutFlash: defineAsyncComponent(() => import('../components/dinoz/DinozWithoutFlash.vue'))
	},
	data() {
		return {
			dinozStore: dinozStore(),
			availableSkills: null as DinozSkillOwnAndUnlockable | null,
			tryNumber: 1 as number,
			skillList,
			ElementType: ElementType,
			isSpinOver: false as boolean,
			position: dinozPlacement
		};
	},
	props: {
		id: { type: Number, required: true },
		event: {
			type: String,
			required: false,
			default: null
		},
		eventId: {
			type: String,
			required: false,
			default: null
		}
	},
	methods: {
		spinOver(): void {
			console.log('received');
			this.isSpinOver = true;
		},
		learnSkill(skillId: number): void {
			if (
				confirm(
					this.$t('levelup.confirmSkill', {
						skill: this.$t(`skill.name.${skillList[skillId].name}`),
						level: (this.availableSkills?.level ?? 0) + 1
					})
				)
			) {
				const skillIdList: Array<number> = [skillId];

				this.learnSkillAndSetStore(skillIdList);
			}
		},
		unlockSkill(): void {
			if (!this.availableSkills) {
				return;
			}
			if (confirm(this.$t('levelup.confirmUnlock', { quantity: this.availableSkills.unlockableSkills?.length }))) {
				if (!this.availableSkills.unlockableSkills) {
					return;
				}
				const skillIdList: Array<number> = this.availableSkills.unlockableSkills.map(skill => skill.skillId);

				this.learnSkillAndSetStore(skillIdList);
			}
		},
		async learnSkillAndSetStore(skillIdList: Array<number>): Promise<void> {
			const dinozId: number = parseInt(this.$route.params.id.toString());

			EventBus.emit('isLoading', true);
			try {
				if (!this.event) {
					await DinozService.learnSkill(dinozId, skillIdList, this.tryNumber);
					EventBus.emit('isLoading', false);
					this.$router.push({ name: 'DinozPage', params: { id: dinozId } });
				} else {
					await FBService.learnSkill(dinozId, skillIdList, this.tryNumber, this.event);
					EventBus.emit('isLoading', false);
					this.$router.push({ name: 'FBTournament', query: { id: this.eventId } });
				}
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		retry(): void {
			this.isSpinOver = false;
			this.availableSkills = null;
			this.tryNumber = this.tryNumber === 1 ? 2 : 1;
			this.getLearnableSkills(this.id, this.tryNumber);
		},
		async getLearnableSkills(dinozId: number, tryNumber: number): Promise<void> {
			EventBus.emit('isLoading', true);
			try {
				if (this.event) {
					this.availableSkills = await FBService.levelUp(dinozId, tryNumber, this.event);
				} else {
					this.availableSkills = await DinozService.levelUp(dinozId, tryNumber.toString());
				}

				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		getLanguage() {
			return this.$i18n.locale.toLocaleUpperCase();
		}
	},
	async created(): Promise<void> {
		await this.getLearnableSkills(this.id, 1);
	}
});
</script>

<style lang="scss" scoped>
.levelUp {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10px;
}
.disclaimer {
	border-radius: 5px;
	margin-top: 10px;
	margin-bottom: 10px;
	padding: 5px 5px 5px 20px;
	color: #fce3bc;
	font-size: 10pt;
	background-color: #bc683c;
	background-position: 5px 8px;
	background-repeat: no-repeat;
	width: 90%;
}
.border {
	border: 1px solid #874b2e;
	outline: 3px solid #f1c98e;
}
.dinozWrapper {
	background-color: #d99b73;
	height: 211px;
	max-width: 195px;
	width: 50%;
}
.wrapper {
	display: flex;
	width: 90%;
	max-width: 362px;
	justify-content: center;
	color: #fce3bc;
	text-align: center;
	background-color: #854b25;
	align-self: center;
	align-items: center;
}

@keyframes bounce-in-top {
	0% {
		transform: translateY(-200px);
		animation-timing-function: ease-in;
		opacity: 0;
	}
	38% {
		transform: translateY(0);
		animation-timing-function: ease-out;
		opacity: 1;
	}
	55% {
		transform: translateY(-65px);
		animation-timing-function: ease-in;
		opacity: 60%;
	}
	72% {
		transform: translateY(0);
		animation-timing-function: ease-out;
		opacity: 1;
	}
	81% {
		transform: translateY(-28px);
		animation-timing-function: ease-in;
		opacity: 80%;
	}
	90% {
		transform: translateY(0);
		animation-timing-function: ease-out;
		opacity: 92%;
	}
	95% {
		transform: translateY(-8px);
		-webkit-animation-timing-function: ease-in;
		animation-timing-function: ease-in;
		opacity: 96%;
	}
	100% {
		transform: translateY(0);
		animation-timing-function: ease-out;
		opacity: 1;
	}
}
.slide-bottom {
	animation: bounce-in-top 1.1s both;
	animation-timing-function: ease-in-out;
	animation-delay: 1s;
	display: flex;
	flex-direction: column;
	align-items: center;
}
.hidden {
	display: none;
}
.skillName {
	font-size: 12pt;
	text-align: left;
	padding-left: 15px;
	display: flex;
	align-items: baseline;
	img {
		height: fit-content;
	}
}
.help {
	border: 1px solid #bc683c;
	cursor: help;
	margin-left: 5px;
	&:hover {
		outline: 1px solid white;
	}
}
.result {
	width: 90%;
	display: flex;
	flex-direction: column;
	align-items: center;
	align-self: center;
	color: #fce3bc;
	text-align: center;
	background-color: #bc683c;
	border-radius: 10px;
	-webkit-border-radius: 10px;
	font-size: 10pt;
	padding: 5px;
}
.demarcation {
	border: 1px solid #bc683c;
	margin-top: 10px;
	margin-bottom: 10px;
	width: 92%;
}
.hidden-stats {
	display: flex;
	flex-wrap: wrap;
	gap: 5px;
	& p {
		font-size: 8.5pt !important;
	}
}
.desc {
	font-size: 9pt;
	line-height: 10pt;
	margin-left: 15px;
	margin-top: -5px;
	margin-bottom: 6px;
	font-style: italic;
}
:deep(strong) {
	color: #710;
}
:deep(.name:hover strong) {
	color: #fff;
}
.elements {
	display: flex;
	justify-content: space-evenly;
}
.unlock {
	list-style: none;
	padding-left: 20px;
	display: block;
	img {
		margin-top: -7px;
	}
	li {
		float: left;
		position: relative;
		margin-right: 8px;
		padding-left: 4px;
		padding-right: 4px;
		padding-top: 7px;
		font-size: 9pt;
		font-weight: normal;
	}
}
.select {
	margin: 5px;
	table {
		width: 100%;
		margin-top: 10px;
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
				background-image: url('../assets/background/table_header.webp');
				background-position: left bottom;
				&.name {
					width: 330px;
				}
				&.type {
					max-width: 30px;
				}
			}
			td {
				font-size: 9pt;
				padding-right: 5px;
				padding-top: 1px;
				padding-bottom: 1px;
				color: #710 !important;
				background-color: #f3ca92;
				border: 1px solid #c88f44;
				&.name {
					background-image: url('../assets/background/table_cell.webp');
					background-position: 0px 0px;
					//padding-left: 15px;
					max-width: 337px;
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
				&.learn {
					font-weight: bold;
					text-align: center;
					color: #bc683c;
					background-image: url('../assets/background/table_cell.webp');
					background-position: -10px 0px;
					text-decoration: underline;
					background-repeat: no-repeat;
				}
			}
			&:hover {
				td {
					outline: 1px solid #9a4029;
					color: white !important;
					cursor: pointer;
				}
			}
		}
	}
}
</style>
