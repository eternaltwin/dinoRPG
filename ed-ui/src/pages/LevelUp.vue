<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
	<TitleHeader :title="`${$t('pageTitle.levelup')}${dinozData.name} ]`"></TitleHeader>
	<div style="width: auto">
		<div class="section mb-[40px] ml-[-25px] mt-[-25px] flex justify-between sm:my-0 sm:ml-0">
			<div class="titlePage">
				<h3>{{ $t(`levelup.title`) }} {{ dinozData.name }}</h3>
			</div>
		</div>
	</div>
	<DZDisclaimer help :content="$t('levelup.disclaimer')" class="ml-[-40px] sm:ml-0" />
	<div
		class="ml-[-40px] flex h-auto w-[210px] flex-col justify-center self-center bg-[#854b25] text-center sm:ml-0 sm:w-[362px] sm:flex-row"
		style="border: 1px solid #874b2e; outline: 3px solid #f1c98e"
		v-if="availableSkills"
	>
		<LevelUpGrid
			v-if="availableSkills.upChance && availableSkills.element"
			:grid="availableSkills.upChance"
			:element="availableSkills.element"
			@spinOver="spinOver"
		/>
		<div class="size-[211px] bg-[#d99b73]">
			<Suspense>
				<DinozWithoutFlash
					class="relative sm:top-[45px]"
					:display="dinozData.display"
					:life="dinozData.life / dinozData.maxLife"
					:flip="1"
					:race="dinozData.race.raceId"
				/>
				<template #fallback><Loading /></template>
			</Suspense>
		</div>
	</div>
	<div class="slide-bottom ml-[-55px] sm:ml-0" :class="isSpinOver ? '' : 'hidden'" v-if="availableSkills">
		<div
			class="m-auto mb-[15px] mt-[10px] max-w-[330px] rounded-[10px] bg-[#bc683c] p-2 text-center text-[10pt] text-[#fce3bc]"
			v-if="ElementType[availableSkills.element]"
		>
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
				class="my-[10px] pl-[32px] sm:pl-[58px]"
				style="border-bottom: 1px solid #cd8a4e"
			/>
			{{ $t(`levelup.helper`) }}
		</div>
		<div class="m-0 flex w-full flex-col sm:m-[5px]">
			<div class="flex border-b border-[#bc683c]">
				<div class="header name-header">{{ $t('details.th.comp') }}</div>
				<div class="header hidden sm:block">{{ $t('details.th.type') }}</div>
				<div class="header hidden sm:block">{{ $t('levelup.level') }}</div>
				<div class="header"></div>
			</div>
			<div
				v-for="skill in availableSkills.learnableSkills"
				:key="skill"
				class="data flex cursor-pointer border-b border-[#c88f44]"
				@click="learnSkill(skill.skillId)"
			>
				<div class="name flex-1">
					<div class="flex flex-wrap items-baseline pl-4 text-left text-[12pt]">
						<img
							v-for="element in skill.element"
							:key="element"
							:src="getImgURL('elements', `elem_${ElementType[element].toLowerCase()}`)"
							alt="elementUp"
							class="relative float-left mr-[5px] align-bottom"
						/>
						<p>{{ $t(`skill.name.${skillList[skill.skillId].name}`) }}</p>
					</div>
					<p class="mb-[6px] ml-[10px] mt-[-5px] pt-[7px] text-[9pt] italic leading-[10pt]">
						{{ $t(`skill.description.${skillList[skill.skillId].name}`) }}
					</p>
				</div>
				<Tippy
					theme="normal"
					tag="div"
					class="type hidden flex-1 bg-[url('./assets/background/table_cell.webp')] bg-[-10px] text-center sm:block"
				>
					{{ skill.type }}
					<template #content>
						<h1 v-html="formatContent($t(`details.type.name.${skill.type}`))" />
						<p v-html="formatContent($t(`details.type.description.${skill.type}`))" />
					</template>
				</Tippy>
				<div class="hidden flex-1 bg-[url('./assets/background/table_cell.webp')] bg-[-10px] text-center sm:block">
					{{ String(skill.skillId)[2] }}
				</div>
				<div class="learn flex-1">
					<img :src="getImgURL('icons', 'small_right')" alt="right" />{{ $t('levelup.learn') }}
				</div>
			</div>
			<template v-if="availableSkills.unlockableSkills">
				<div v-if="availableSkills.unlockableSkills.length > 0" class="data flex cursor-pointer" @click="unlockSkill()">
					<div class="name flex-1">
						<div class="flex items-baseline pl-4 text-left text-[12pt]">
							<img class="mr-[5px]" :src="getImgURL('icons', 'small_right')" alt="right" />
							{{ $t(`levelup.unlock1`) }}
							{{ availableSkills.unlockableSkills.length }}
							{{ $t(`levelup.unlock2`) }}
							<Tippy
								tag="img"
								:src="getImgURL('icons', `help${getLanguage()}`)"
								theme="normal"
								class="ml-[5px] cursor-help hover:outline hover:outline-1 hover:outline-white"
								style="border: 1px solid #bc683c"
							>
								<template #content>
									<h1 v-html="formatContent($t(`levelup.helperUnlock.title`))" />
									<p v-html="formatContent($t(`levelup.helperUnlock.description`))" />
								</template>
							</Tippy>
						</div>
						<ul class="block pl-[20px]">
							<Tippy
								tag="li"
								theme="small"
								v-for="(skill, index) in (availableSkills as DinozSkillOwnAndUnlockable).unlockableSkills"
								:key="index"
								class="relative float-left mr-[8px] px-[4px] pt-[7px] text-[9pt] font-normal"
							>
								<img
									class="mt-[-2px]"
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
					</div>
				</div>
			</template>
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
import { dinozPlacement } from '../constants/index.js';
import { ElementType } from '@drpg/core/models/enums/ElementType';
import { dinozStore } from '../store/index.js';
import LevelUpGrid from '../components/dinoz/LevelUpGrid.vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import Elements from '../components/data/Elements.vue';
import { skillList } from '@drpg/core/models/dinoz/SkillList';
import DZDisclaimer from '../components/common/DZDisclaimer.vue';

export default defineComponent({
	name: 'LevelUp',
	components: {
		LevelUpGrid,
		TitleHeader,
		Elements,
		DinozWithoutFlash: defineAsyncComponent(() => import('../components/dinoz/DinozWithoutFlash.vue')),
		DZDisclaimer
	},
	data() {
		return {
			dinozStore: dinozStore(),
			availableSkills: null as DinozSkillOwnAndUnlockable | null,
			dinozData: {} as DinozFiche,
			tryNumber: 1 as number,
			skillList,
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
						skill: this.$t(`skill.name.${skillList[skillId].name}`),
						level: this.dinozData.level + 1
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
				const newMaxExperience = await DinozService.learnSkill(dinozId, skillIdList, this.tryNumber);

				const dinozList: Array<DinozFiche> = this.dinozStore.getDinozList!;
				const dinozToUpdate = dinozList.find(dinoz => dinoz.id === dinozId)!;
				dinozToUpdate.experience = 0;
				dinozToUpdate.maxExperience = parseInt(newMaxExperience);
				this.dinozStore.setDinozList(dinozList);
				EventBus.emit('isLoading', false);

				this.$router.push({ name: 'DinozPage', params: { id: dinozId } });
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		retry(): void {
			this.isSpinOver = false;
			this.availableSkills = null;
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
				errorHandler.handle(err, this.$toast);
				this.$router.push({
					name: 'DinozPage',
					params: { id: +dinozId }
				});
				return;
			}
		},
		getLanguage() {
			return this.$i18n.locale.toLocaleUpperCase();
		}
	},
	async created(): Promise<void> {
		const dinozId: string = this.$route.params.id.toString();
		const dinozList: Array<DinozFiche> = this.dinozStore.getDinozList!;
		this.dinozData = dinozList.find(dinoz => dinoz.id!.toString() === dinozId)!;

		await this.getLearnableSkills(dinozId, 1);
	}
});
</script>

<style lang="scss" scoped>
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
.header {
	width: 25%;
	font-weight: bold;
	padding: 10px;
	font-size: 9pt;
	text-shadow: 1px 1px 0px #356847;
	height: 41px;
	color: #fffdba;
	text-transform: uppercase;
	letter-spacing: 2pt;
	text-align: left;
	white-space: nowrap;
	border: 1px solid #356847;
	background-image: url('../assets/background/table_header.webp');
	background-position: left bottom;
}
.name-header {
	width: 50%;
}
.data {
	font-size: 10pt;
	padding-right: 5px;
	padding-top: 1px;
	padding-bottom: 1px;
	color: #710 !important;
	background-color: #f3ca92;
	border: 1px solid #c88f44;
	height: auto;
	&:hover {
		border: 2px solid #9a4029;
		color: white !important;
		cursor: pointer;
	}
}
.name {
	flex: 2;
	background-image: url('../assets/background/table_cell.webp');
	background-repeat: no-repeat;
	background-size: cover;
	height: auto;
}
.learn {
	font-weight: bold;
	text-align: center;
	color: #710;
	background-image: url('../assets/background/table_cell.webp');
	background-position: -10px 0px;
	text-decoration: underline;
	background-repeat: no-repeat;
}
@media (max-width: 640px) {
	.header {
		flex-basis: 100%;
	}
	.name {
		flex-basis: 60%;
	}
	.type,
	.learn {
		flex-basis: 20%;
	}
}
@media (max-width: 520px) {
	.header,
	.name,
	.learn {
		flex-basis: 100%;
	}
}
</style>
