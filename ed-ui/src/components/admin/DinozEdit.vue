<template>
	<form @submit.prevent="dinozUpdate()">
		<fieldset>
			<legend>Dinoz Details</legend>
			<div>
				<label class="title" for="dinozName">Name :</label>
				<input id="dinozName" type="text" v-model="dinoz.name" disabled />
				<input type="text" v-model="dinozField.name" />
			</div>
			<div>
				<label class="title" for="dinozCanChangeName">Can Change Name :</label>
				<input id="dinozCanChangeName" type="text" v-model="dinoz.canChangeName" disabled />
				<div class="canChangeName">
					<input class="radio" type="radio" value="true" name="canChangeName" v-model="dinozField.canChangeName" />
					<label class="radio">true</label><br />
					<input class="radio" type="radio" value="false" name="canChangeName" v-model="dinozField.canChangeName" />
					<label class="radio">false</label>
				</div>
			</div>
			<div>
				<label class="title" for="dinozLocation">PlaceID :</label>
				<input id="dinozLocation" type="text" v-model="dinoz.placeId" disabled />
				<input type="number" min="1" v-model="dinozField.placeId" />
			</div>
			<div>
				<label class="title" for="dinozLevel">Level :</label>
				<input id="dinozLevel" type="text" v-model="dinoz.level" disabled />
				<input type="number" min="1" max="80" v-model="dinozField.level" />
			</div>
			<div>
				<label class="title" for="dinozExperience">Experience :</label>
				<input id="dinozExperience" type="text" v-model="dinoz.experience" disabled />
				<input type="number" min="0" v-model="dinozField.experience" />
			</div>
			<div>
				<label class="title" for="dinozLife">Life :</label>
				<input id="dinozLife" type="text" v-model="dinoz.life" disabled />
				<input type="number" min="0" v-model="dinozField.life" />
			</div>
			<div>
				<label class="title" for="dinozMaxLife">Max Life :</label>
				<input id="dinozMaxLife" type="text" v-model="dinoz.maxLife" disabled />
				<input type="number" min="0" v-model="dinozField.maxLife" />
			</div>
		</fieldset>
		<fieldset>
			<legend>Dinoz Statuses</legend>
			<div>
				<label class="title" for="dinozUnavailableReason">Unavailable Reason :</label>
				<input id="dinozUnavailableReason" type="text" v-model="dinoz.unavailableReason" disabled />
				<div class="unavailableReason">
					<select v-model="dinozField.unavailableReason" size="5">
						<template v-for="unavailableReason in unavailableReasonListFiltered" :key="unavailableReason">
							<option :value="unavailableReason">
								{{ unavailableReason }}
							</option>
						</template>
					</select>
					<input
						v-if="dinoz.unavailableReason === null"
						class="radio"
						type="radio"
						value="add"
						name="addUnavailableReason"
						v-model="unavailableReasonOperation"
					/>
					<label class="radio" v-if="dinoz.unavailableReason === null">add</label>
					<input
						v-if="dinoz.unavailableReason"
						class="radio"
						type="radio"
						value="remove"
						name="removeUnavailableReason"
						v-model="unavailableReasonOperation"
					/>
					<label class="radio" v-if="dinoz.unavailableReason">remove</label>
				</div>
			</div>
			<div>
				<label class="title" for="dinozStatuses">Statuses :</label>
				<div class="statuses">
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
				</div>
				<div class="statuses">
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
				</div>
			</div>
		</fieldset>
		<fieldset>
			<legend>Dinoz Skills</legend>
			<div class="skills">
				<template v-for="skillId in dinoz.skills" :key="skillId">
					<div class="skills" />
					{{ $t(`skill.name.${skillList[skillId].name}`) }}
				</template>
			</div>
			<div class="skills">
				<select v-model="dinozField.skillList" multiple size="10">
					<template v-for="skill in skillListFiltered" :key="skill.id">
						<option :value="skill.id">
							{{ $t(`skill.name.${skill.name}`) }}
						</option>
					</template>
				</select>
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
			</div>
		</fieldset>
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
import { skillList } from '@drpg/core/models/dinoz/SkillList';
import { SkillDetails } from '@drpg/core/models/dinoz/SkillDetails';
import { UnavailableReasonFront } from '@drpg/core/models/dinoz/UnavailableReasonFront';

export default defineComponent({
	name: 'DinozEdit',
	data() {
		return {
			UnavailableReasonFront,
			dinozField: {
				skillList: [],
				statusList: []
			} as DinozEdit,
			dinoz: {} as DinozFiche,
			statusList: statusList,
			statusOperation: '' as string,
			statusListFiltered: [] as Array<string>,
			skillList,
			skillListFiltered: [] as SkillDetails[],
			skillOperation: '' as string,
			unavailableReasonOperation: '' as '' | 'add' | 'remove',
			unavailableReasonListFiltered: [] as Array<UnavailableReasonFront>
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
					this.dinozField.unavailableReason ||
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
						this.dinozField.unavailableReason,
						this.unavailableReasonOperation,
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
				errorHandler.handle(err, this.$toast);
				return;
			}

			this.dinozField.skillList = [];
			this.filterSkillList(this.skillOperation);
			this.dinozField.statusList = [];
			this.filterStatusList(this.statusOperation);
			this.unavailableReasonOperation = '';
			this.filterUnavailableReason();

			EventBus.emit('isLoading', false);
		},
		filterSkillList(operation: string): void {
			if (operation === 'add') {
				this.skillListFiltered = Object.values(skillList).filter(skill => !this.dinoz.skills?.includes(skill.id));
			} else {
				this.skillListFiltered = Object.values(skillList).filter(skill => this.dinoz.skills?.includes(skill.id));
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
		},
		filterUnavailableReason(): void {
			if (this.dinoz.unavailableReason === null) {
				this.unavailableReasonListFiltered = Object.values(UnavailableReasonFront);
			} else {
				this.unavailableReasonListFiltered = Object.values(UnavailableReasonFront).filter(
					reason => reason === this.dinoz.unavailableReason
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

		this.filterUnavailableReason();
	},
	watch: {
		dinozProp(): void {
			this.mountedDinoz();
		}
	}
});
</script>

<style lang="scss" scoped>
form {
	width: 100%;
	margin-top: 20px;
	margin-bottom: 10px;
	background-color: #ecbd84;
	border-spacing: 2px;
	padding: 5px;
	fieldset {
		border: 2px solid #bc683c;
		margin: 15px 0;
		padding: 20px;
		width: 90%;
	}
	legend {
		font-size: 13pt;
		text-shadow: 1px 1px 0px #356847;
		padding-left: 8px;
		padding-right: 8px;
		padding-bottom: 8px;
		height: 41px;
		color: #fffdba;
		text-transform: uppercase;
		font-weight: bold;
		letter-spacing: 1.5pt;
		text-align: left;
		border: 1px solid #356847;
		background-color: #c64e36;
		background-image: url('../../assets/background/table_header.webp');
		background-position: left bottom;
		width: 60%;
	}
	div {
		align-items: flex-start;
		display: flex;
		flex-direction: column;
	}
	label {
		display: block;
		margin-bottom: 5px;
		color: #710;
		font-size: 9pt;
	}
	input[type='text'],
	input[type='number'],
	select {
		width: calc(100% - 20px);
		padding: 5px;
		margin-top: 5px;
		margin-bottom: 10px;
		border: 1px solid #c88f44;
		background-color: #f3ca92;
		color: #710;
	}
	input[type='submit'] {
		margin-top: 20px;
		background-color: #c64e36;
		color: #fffdba;
		border: none;
		padding: 10px 20px;
		cursor: pointer;
		border-radius: 5px;
	}
}
.radio {
	padding-right: 10px;
	margin-left: 3px;
	margin-top: 3px;
}
.canChangeName,
.unavailableReason,
.statuses,
.skills {
	align-items: center;
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 5px;
	margin-bottom: 5px;
}
.title {
	text-transform: uppercase;
	font-weight: bold;
	margin-top: 5px;
}
</style>
