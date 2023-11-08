<template>
	<TitleHeader :title="`${$t('pageTitle.levelup')}${dinozData.name} ]`"></TitleHeader>
	<div style="width: auto">
		<div class="section">
			<div class="titlePage">
				<h3>{{ $t(`levelup.title`) }} {{ dinozData.name }}</h3>
			</div>
		</div>
	</div>
	<div class="disclaimer">
		{{ $t('levelup.disclaimer') }}
	</div>
	<div class="wrapper border">
		<LevelUpGrid
			v-if="availableSkills.upChance && availableSkills.element"
			:grid="availableSkills.upChance"
			:element="availableSkills.element"
			@spinOver="spinOver"
		/>
		<div class="dinozWrapper">
			<DinozWithoutFlash
				:style="{
					position: `relative`,
					top: `45px`
				}"
				:display="dinozData.display"
				:life="dinozData.life"
				:flip="1"
				:race="dinozData.race.raceId"
			/>
		</div>
	</div>
	<div class="slide-bottom" :class="isSpinOver ? '' : 'hidden'">
		<div class="result" v-if="ElementType[availableSkills.element]">
			{{ dinozData.name }}
			<p v-html="formatContent($t(`levelup.${ElementType[availableSkills.element].toLowerCase()}`))" />
			<Elements
				:fire="
					ElementType[availableSkills.element] === 'fire' ? availableSkills.nbrUpFire + 1 : availableSkills.nbrUpFire
				"
				:wood="
					ElementType[availableSkills.element] === 'wood' ? availableSkills.nbrUpWood + 1 : availableSkills.nbrUpWood
				"
				:water="
					ElementType[availableSkills.element] === 'water' ? availableSkills.nbrUpWater + 1 : availableSkills.nbrUpWater
				"
				:lightning="
					ElementType[availableSkills.element] === 'lightning'
						? availableSkills.nbrUpLightning + 1
						: availableSkills.nbrUpLightning
				"
				:air="ElementType[availableSkills.element] === 'air' ? availableSkills.nbrUpAir + 1 : availableSkills.nbrUpAir"
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
					<tr v-for="skill in availableSkills.learnableSkills" :key="skill" @click="learnSkill(skill.skillId)">
						<td class="name">
							<div class="skillName">
								<img
									v-for="element in skill.element"
									:key="element"
									:src="getImgURL('elements', `elem_${ElementType[element].toLowerCase()}`)"
									alt="elementUp"
								/>
								<p>{{ $t(`skill.name.${skillNameList[skill.skillId]}`) }}</p>
							</div>
							<p class="desc">
								{{ $t(`skill.description.${skillNameList[skill.skillId]}`) }}
							</p>
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
						<td class="learn"><img :src="getImgURL('icons', 'small_right')" alt="right" />{{ $t('levelup.learn') }}</td>
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
									<Tippy tag="li" theme="small" v-for="(skill, index) in availableSkills.unlockableSkills" :key="index">
										<img
											v-for="element in skill.element"
											:key="element"
											:src="getImgURL('elements', `elem_${ElementType[element].toLowerCase()}`)"
											alt="elementUp"
										/>
										{{ $t(`skill.name.${skillNameList[skill.skillId]}`) }}
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
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from 'vue';
import EventBus from '../events/index.js';
import { DinozService } from '../services/index.js';
import { errorHandler } from '../utils/index.js';
import { DinozSkillOwnAndUnlockable } from '@drpg/core/models/dinoz/DinozSkillOwnAndUnlockable';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { dinozPlacement, skillNameList } from '../constants/index.js';
import { ElementType } from '@drpg/core/models/enums/ElementType';
import { sessionStore } from '../store/index.js';

export default defineComponent({
	name: 'LevelUp',
	components: {
		LevelUpGrid: defineAsyncComponent(() => import('../components/dinoz/LevelUpGrid.vue')),
		TitleHeader: defineAsyncComponent(() => import('../components/utils/TitleHeader.vue')),
		Elements: defineAsyncComponent(() => import('../components/data/elements.vue')),
		DinozWithoutFlash: defineAsyncComponent(() => import('../components/dinoz/dinozWithoutFlash.vue'))
	},
	data() {
		return {
			sessionStore: sessionStore(),
			availableSkills: {} as Partial<DinozSkillOwnAndUnlockable>,
			dinozData: {} as DinozFiche,
			tryNumber: 1 as number,
			skillNameList: skillNameList,
			ElementType: ElementType,
			isSpinOver: false as boolean,
			position: dinozPlacement
		};
	},
	methods: {
		spinOver(): void {
			this.isSpinOver = true;
		},
		learnSkill(skillId: number): void {
			if (
				confirm(
					this.$t('levelup.confirmSkill', {
						skill: this.$t(`skill.name.${skillNameList[skillId]}`),
						level: this.dinozData.level
					})
				)
			) {
				const skillIdList: Array<number> = [skillId];

				this.learnSkillAndSetStore(skillIdList);
			}
		},
		unlockSkill(): void {
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
				const newMaxExperience = await DinozService.learnSkill(dinozId, skillIdList, this.tryNumber);

				const dinozList: Array<DinozFiche> = this.sessionStore.getDinozList!;
				const dinozToUpdate = dinozList.find(dinoz => dinoz.id === dinozId)!;
				dinozToUpdate.experience = 0;
				dinozToUpdate.maxExperience = parseInt(newMaxExperience);
				this.sessionStore.setDinozList(dinozList);
				EventBus.emit('isLoading', false);

				this.$router.push({ name: 'DinozPage', params: { id: dinozId } });
			} catch (err) {
				errorHandler.handle(err);
				return;
			}
		},
		retry(): void {
			this.isSpinOver = false;
			this.availableSkills = {};
			const dinozId: string = this.$route.params.id.toString();
			this.tryNumber = this.tryNumber === 1 ? 2 : 1;
			this.getLearnableSkills(dinozId, this.tryNumber);
		},
		async getLearnableSkills(dinozId: string, tryNumber: number): Promise<void> {
			EventBus.emit('isLoading', true);
			try {
				this.availableSkills = await DinozService.levelUp(parseInt(dinozId), tryNumber.toString());
				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err);
				return;
			}
		},
		getLanguage() {
			return this.$i18n.locale.toLocaleUpperCase();
		}
	},
	async created(): Promise<void> {
		const dinozId: string = this.$route.params.id.toString();
		const dinozList: Array<DinozFiche> = this.sessionStore.getDinozList!;
		this.dinozData = dinozList.find(dinoz => dinoz.id!.toString() === dinozId)!;

		await this.getLearnableSkills(dinozId, 1);
	}
});
</script>

<style lang="scss" scoped>
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
}
.border {
	border: 1px solid #874b2e;
	outline: 3px solid #f1c98e;
}
.dinozWrapper {
	background-color: #d99b73;
	height: 211px;
	width: 195px;
}
.wrapper {
	display: flex;
	width: 362px;
	justify-content: center;
	margin: auto;
	color: #fce3bc;
	text-align: center;
	background-color: #854b25;
}
.hidden {
	display: none;
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
	width: 330px;
	margin: auto;
	margin-top: 5px;
	margin-bottom: 15px;
	padding: 5px;
	padding-left: 5px;
	color: #fce3bc;
	text-align: center;
	background-color: #bc683c;
	border-radius: 10px;
	-webkit-border-radius: 10px;
	font-size: 10pt;
}
.desc {
	font-size: 9pt;
	line-height: 10pt;
	margin-left: 15px;
	margin-top: -5px;
	margin-bottom: 6px;
	font-style: italic;
}
.elements {
	margin-bottom: 5px;
	margin-top: 5px;
	padding-left: 58px;
	padding-bottom: 4px;
	border-bottom: 1px solid #cd8a4e;
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
