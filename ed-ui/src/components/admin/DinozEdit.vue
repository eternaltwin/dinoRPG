<template>
	<form @submit.prevent="dinozUpdate()">
		<table>
			<tbody>
				<tr>
					<th>Champs</th>
					<th>Valeur actuelle</th>
					<th>Valeur désirée</th>
				</tr>
				<tr>
					<td>name</td>
					<td>{{ dinoz.name }}</td>
					<td>
						<input type="text" v-model="dinozField.name" />
					</td>
				</tr>
				<tr>
					<td>isFrozen</td>
					<td>{{ dinoz.isFrozen }}</td>
					<td>
						<input class="radio" type="radio" value="true" name="isFrozen" v-model="dinozField.isFrozen" />
						<label class="radio">true</label><br />
						<input class="radio" type="radio" value="false" name="isFrozen" v-model="dinozField.isFrozen" />
						<label class="radio">false</label>
					</td>
				</tr>
				<tr>
					<td>isSacrificed</td>
					<td>{{ dinoz.isSacrificed }}</td>
					<td>
						<input class="radio" type="radio" value="true" name="isSacrificed" v-model="dinozField.isSacrificed" />
						<label class="radio">true</label><br />
						<input class="radio" type="radio" value="false" name="isSacrificed" v-model="dinozField.isSacrificed" />
						<label class="radio">false</label>
					</td>
				</tr>
				<tr>
					<td>canChangeName</td>
					<td>{{ dinoz.canChangeName }}</td>
					<td>
						<input class="radio" type="radio" value="true" name="canChangeName" v-model="dinozField.canChangeName" />
						<label class="radio">true</label><br />
						<input class="radio" type="radio" value="false" name="canChangeName" v-model="dinozField.canChangeName" />
						<label class="radio">false</label>
					</td>
				</tr>
				<tr>
					<td>level</td>
					<td>{{ dinoz.level }}</td>
					<td>
						<input type="number" min="1" max="80" v-model="dinozField.level" />
					</td>
				</tr>
				<tr>
					<td>placeId</td>
					<td>{{ dinoz.placeId }}</td>
					<td>
						<input type="number" min="1" v-model="dinozField.placeId" />
					</td>
				</tr>
				<tr>
					<td>life</td>
					<td>{{ dinoz.life }}</td>
					<td>
						<input type="number" min="0" v-model="dinozField.life" />
					</td>
				</tr>
				<tr>
					<td>maxLife</td>
					<td>{{ dinoz.maxLife }}</td>
					<td>
						<input type="number" min="0" v-model="dinozField.maxLife" />
					</td>
				</tr>
				<tr>
					<td>experience</td>
					<td>{{ dinoz.experience }}</td>
					<td>
						<input type="number" min="0" v-model="dinozField.experience" />
					</td>
				</tr>
				<tr>
					<td>Status</td>
					<td>
						<template v-for="(status, index) in dinoz.status" :key="index">
							<Tippy theme="normal" v-if="statusList.displayed[status]">
								<img :src="getImgURL('status', `fx_${statusList.imgName[status]}`)" :alt="statusList.imgName[status]" />
								<template #content>
									<h1 v-html="formatContent($t(`status.name.${status}`))"></h1>
									<p v-html="formatContent($t(`status.description.${status}`))"></p>
								</template>
							</Tippy>
							<p v-if="!statusList.displayed[status]" v-html="statusList.imgName[status]" />
						</template>
					</td>
					<td>
						<select v-model="dinozField.statusList" multiple size="4">
							<template v-for="(status, index) in statusListFiltered" :key="index">
								<option :value="status">
									{{ $t(`status.name.${status}`) }}
								</option>
							</template>
						</select>
						<input
							class="radio"
							type="radio"
							value="add"
							name="addStatus"
							@click="filterStatusList('add')"
							v-model="statusOperation"
						/>
						<label class="radio">add</label>
						<input
							class="radio"
							type="radio"
							value="remove"
							name="removeStatus"
							@click="filterStatusList('remove')"
							v-model="statusOperation"
						/>
						<label class="radio">remove</label>
					</td>
				</tr>
				<tr>
					<td>Skill</td>
					<td>
						<template v-for="skillId in dinoz.skills" :key="skillId">
							{{ $t(`skill.name.${skillList[skillId]}`) }} <br />
						</template>
					</td>
					<td>
						<select v-model="dinozField.skillList" multiple size="10">
							<template v-for="(skill, index) in skillListFiltered" :key="index">
								<option :value="skill">
									{{ $t(`skill.name.${skillList[skill]}`) }}
								</option>
							</template>
						</select>
						<br />
						<input
							class="radio"
							type="radio"
							value="add"
							name="addSkill"
							@click="filterSkillList('add')"
							v-model="skillOperation"
						/>
						<label class="radio">add</label>
						<input
							class="radio"
							type="radio"
							value="remove"
							name="removeSkill"
							@click="filterSkillList('remove')"
							v-model="skillOperation"
						/>
						<label class="radio">remove</label>
					</td>
				</tr>
			</tbody>
		</table>
		<input type="submit" />
	</form>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { AdminService } from '../../services/index.js';
import { DinozEdit } from '@drpg/core/models/dinoz/DinozEdit';
import { statusList } from '../../constants/index.js';
import { errorHandler } from '../../utils/index.js';
import EventBus from '../../events/index.js';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { skillList, Skill } from '@drpg/core/models/dinoz/SkillList';

export default defineComponent({
	name: 'DinozEdit',
	data() {
		return {
			dinozField: {
				skillList: [],
				statusList: []
			} as DinozEdit,
			dinoz: {} as DinozFiche,
			statusList: statusList,
			statusOperation: '' as string,
			statusListFiltered: [] as Array<string>,
			skillList,
			skillListFiltered: [] as Array<string>,
			skillOperation: '' as string
		};
	},
	props: {
		dinozProp: { type: Object as PropType<DinozFiche>, required: true },
		playerId: { type: Number, required: true }
	},
	methods: {
		mountedDinoz(): void {
			this.dinoz = this.dinozProp;
		},
		async dinozUpdate(): Promise<void> {
			EventBus.emit('isLoading', true);

			try {
				if (
					this.dinozField.name ||
					this.dinozField.isFrozen !== undefined ||
					this.dinozField.isSacrificed !== undefined ||
					this.dinozField.level ||
					this.dinozField.placeId ||
					this.dinozField.canChangeName !== undefined ||
					this.dinozField.life! > -1 ||
					this.dinozField.maxLife ||
					this.dinozField.experience ||
					(this.dinozField.statusList.length > 0 && this.statusOperation) ||
					(this.dinozField.skillList.length > 0 && this.skillOperation)
				) {
					await AdminService.updateDinoz(
						this.dinoz.id!,
						this.dinozField.name,
						this.dinozField.isFrozen,
						this.dinozField.isSacrificed,
						this.dinozField.level,
						this.dinozField.placeId,
						this.dinozField.canChangeName,
						this.dinozField.life,
						this.dinozField.maxLife,
						this.dinozField.experience,
						this.dinozField.statusList,
						this.statusOperation,
						this.dinozField.skillList,
						this.skillOperation
					);
				}

				const refresh: Array<DinozFiche> = await AdminService.listAllDinozFromPlayer(this.playerId);
				this.dinoz = refresh.find(dinoz => dinoz.id === this.dinozProp.id)!;
			} catch (err) {
				EventBus.emit('isLoading', false);
				errorHandler.handle(err);
				return;
			}

			this.dinozField.skillList = [];
			this.filterSkillList(this.skillOperation);
			this.dinozField.statusList = [];
			this.filterStatusList(this.statusOperation);

			EventBus.emit('isLoading', false);
		},
		filterSkillList(operation: string): void {
			if (operation === 'add') {
				this.skillListFiltered = Object.values(Skill).filter(skillId => !this.dinoz.skills?.includes(skillId));
			} else {
				this.skillListFiltered = Object.values(Skill).filter(skillId => this.dinoz.skills?.includes(skillId));
			}
		},
		filterStatusList(operation: string): void {
			if (operation === 'add') {
				this.statusListFiltered = Object.keys(statusList.imgName).filter(
					statusId => !this.dinoz.status?.includes(parseInt(statusId))
				);
			} else {
				this.statusListFiltered = Object.keys(statusList.imgName).filter(
					statusId => this.dinoz.status?.includes(parseInt(statusId))
				);
			}
		}
	},
	mounted(): void {
		this.mountedDinoz();

		this.skillOperation = 'add';
		this.filterSkillList(this.skillOperation);

		this.statusOperation = 'add';
		this.filterStatusList(this.statusOperation);
	},
	watch: {
		dinozProp(): void {
			this.mountedDinoz();
		}
	}
});
</script>

<style lang="scss" scoped>
.radio {
	padding-right: 10px;
	margin-left: 3px;
	margin-top: 3px;
}
table {
	width: 100%;
	margin-top: 10px;
	margin-bottom: 10px;
	border: 2px solid #bc683c;
	background-color: #ecbd84;
	border-collapse: separate;
	border-spacing: 1px;
	tr {
		display: table-row;
		th {
			font-size: 8pt;
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
		}
		td {
			font-size: 9pt;
			padding: 1px 5px;
			color: #710;
			background-color: #f3ca92;
			border: 1px solid #c88f44;
			height: 75px;
		}
	}
}
</style>
