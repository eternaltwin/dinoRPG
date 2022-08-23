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
				<tr v-for="skill in dinozSkill" :key="skill.skillId" :class="skill.state === false ? 'disabled' : ''">
					<td class="name">
						<Tippy theme="normal">
							<img
								v-for="(element, index) in skill.element"
								:key="index"
								:src="getImg('elements', 'elem_', ElementType[element])"
							/>
							<p>{{ $t(`skill.name.${skillNameList[skill.skillId]}`) }}</p>
							<template #content>
								<h1 v-html="formatContent($t(`skill.name.${skillNameList[skill.skillId]}`))" />
								<p v-html="formatContent($t(`skill.description.${skillNameList[skill.skillId]}`))" />
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
								:src="getImg('icons', 'small_skill_', skill.state)"
								v-if="skill.activatable"
								@click="changeState(skill)"
								v-tippy="{
									content: formatContent($t(`details.activate.${skill.state}`)),
									theme: 'small'
								}"
							/>
							<img
								v-else
								src="@/assets/icons/small_skill_inactive.webp"
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
	</div>
</template>

<script lang="ts" scoped>
import { defineComponent, PropType } from 'vue';
import { statusList, skillNameList } from '@/constants';
import { Dinoz, Skill } from '@/models';
import { DinozService } from '@/services';
import { errorHandler } from '@/utils';
import EventBus from '@/events';
import { ElementType } from '@/enums';

export default defineComponent({
	name: 'DetailsTab',
	props: { dinozData: Object as PropType<Dinoz> },
	data() {
		return {
			dinozSkill: [] as Array<Skill>,
			skillNameList: skillNameList,
			selectedSort: 'Default' as string,
			picked: 'Ascendant' as string,
			hidden: true as boolean,
			ElementType: ElementType
		};
	},
	methods: {
		getImg(folder: string, imgPrefix: string, imgName: string): string {
			return require(`@/assets/${folder}/${imgPrefix}${imgName}.webp`);
		},
		async changeState(skill: Skill): Promise<void> {
			const dinozId = this.$route.params.id as string;
			EventBus.emit('isLoading', true);
			try {
				await DinozService.setSkillState(dinozId, skill.skillId, !skill.state);
				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err);
				return;
			}

			skill.state = !skill.state;
		},
		hasAmulst(): boolean {
			return this.dinozData!.statusList.includes(statusList.id.amulst);
		},
		sort(): void {
			switch (this.selectedSort) {
				case 'Default':
					this.dinozSkill = this.dinozSkill.sort((a: Skill, b: Skill) =>
						a.skillId > b.skillId ? 1 : b.skillId > a.skillId ? -1 : 0
					);
					break;
				case 'Type':
					this.dinozSkill = this.dinozSkill.sort((a: Skill, b: Skill) =>
						a.type > b.type ? 1 : b.type > a.type ? -1 : 0
					);
					break;
				case 'Energy':
					this.dinozSkill = this.dinozSkill.sort((a: Skill, b: Skill) =>
						a.energy > b.energy ? 1 : b.energy > a.energy ? -1 : 0
					);
					break;
				case 'State':
					this.dinozSkill = this.dinozSkill.sort((a: Skill, b: Skill) =>
						a.state > b.state ? 1 : b.state > a.state ? -1 : 0
					);
					break;
				default:
					break;
			}
		},
		reverse(): void {
			this.dinozSkill = this.dinozSkill.reverse();
		}
	},
	async mounted(): Promise<void> {
		EventBus.emit('isLoading', true);
		try {
			const dinozId = this.$route.params.id as string;
			this.dinozSkill = await DinozService.getDinozSkill(dinozId);
			this.sort();
			EventBus.emit('isLoading', false);
		} catch (err) {
			errorHandler.handle(err);
			return;
		}
	}
});
</script>

<style lang="scss" scoped>
.wrapperMenu {
	zoom: 1;
	*display: inline;
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
	zoom: 1;
	*display: inline;
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
				background-image: url('~@/assets/background/table_header.gif');
				background-position: left bottom;
				max-width: 222px;
				&.name {
					width: 200px;
				}
				&.type {
					max-width: 15px;
				}
				&.state {
					max-width: 15px;
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
					background-image: url('~@/assets/background/table_cell.gif');
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
					background-image: url('~@/assets/background/table_cell.gif');
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
					background-image: url('~@/assets/background/table_cell.gif');
					background-position: -10px 0px;
				}
			}
		}
		.disabled {
			td {
				opacity: 0.4;
				zoom: 1;
				&.state {
					background-color: red;
					background-image: none;
					opacity: 1;
				}
			}
		}
	}
}
</style>
