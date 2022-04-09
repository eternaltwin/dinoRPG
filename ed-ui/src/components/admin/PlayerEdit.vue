<template>
	<form @submit.prevent="sendUpdate()">
		<table>
			<tbody>
				<tr>
					<th>Champs</th>
					<th>Valeur actuelle</th>
					<th>Valeur désirée</th>
				</tr>
				<tr>
					<td>customText</td>
					<td>{{ player.customText }}</td>
					<td>
						<input type="text" v-model="playerFields.customText" />
					</td>
				</tr>
				<tr>
					<td>hasImported</td>
					<td>{{ player.hasImported }}</td>
					<td>
						<input
							class="radio"
							type="radio"
							id="true"
							value="true"
							name="hasImported"
							v-model="playerFields.hasImported"
						/>
						<label class="radio" for="true">true</label><br />
						<input
							class="radio"
							type="radio"
							id="false"
							value="false"
							name="hasImported"
							v-model="playerFields.hasImported"
						/>
						<label class="radio" for="false">false</label>
					</td>
				</tr>
				<tr>
					<td>rewards</td>
					<td>
						<template v-for="(reward, index) in player.rewards" :key="index">
							<Tippy theme="normal">
								<img :src="getEpicImg(epicList.imgName[reward])" />
								<template #content>
									<h1
										v-html="
											formatContent(
												$t(`rewards.name.${epicList.imgName[reward]}`)
											)
										"
									/>
									<p
										v-html="
											formatContent(
												$t(`rewards.description.${epicList.imgName[reward]}`)
											)
										"
									/>
								</template>
							</Tippy>
						</template>
					</td>
					<td>
						<select v-model="playerFields.rewards" multiple size="4">
							<option
								v-for="(reward, index) in epicListFiltered"
								:key="index"
								:value="reward"
							>
								{{ epicList.imgName[reward] }}
							</option>
						</select>
						<input
							class="radio"
							type="radio"
							value="add"
							name="epicOperation"
							@click="filterEpicList('add')"
							v-model="playerFields.epicOperation"
						/>
						<label class="radio" for="add">add</label>
						<input
							class="radio"
							type="radio"
							value="remove"
							name="epicOperation"
							@click="filterEpicList('remove')"
							v-model="playerFields.epicOperation"
						/>
						<label class="radio" for="remove">remove</label>
					</td>
				</tr>
				<tr>
					<td>money</td>
					<td>{{ player.money }}</td>
					<td>
						<input type="number" min="0" v-model="playerFields.money" /><br />
						<input
							class="radio"
							type="radio"
							id="add"
							value="add"
							name="operation"
							v-model="playerFields.operation"
						/>
						<label class="radio" for="add">add</label>
						<input
							class="radio"
							type="radio"
							id="remove"
							value="remove"
							name="operation"
							v-model="playerFields.operation"
						/>
						<label class="radio" for="remove">remove</label>
					</td>
				</tr>
				<tr>
					<td>quetzuBought</td>
					<td>{{ player.quetzuBought }}</td>
					<td>
						<input
							type="number"
							min="0"
							max="6"
							v-model="playerFields.quetzuBought"
						/><br />
					</td>
				</tr>
				<tr>
					<td>leader</td>
					<td>{{ player.leader }}</td>
					<td>
						<input
							class="radio"
							type="radio"
							value="true"
							name="leader"
							v-model="playerFields.leader"
						/>
						<label class="radio" for="true">true</label><br />
						<input
							class="radio"
							type="radio"
							value="false"
							name="leader"
							v-model="playerFields.leader"
						/>
						<label class="radio" for="false">false</label>
					</td>
				</tr>
				<tr>
					<td>engineer</td>
					<td>{{ player.engineer }}</td>
					<td>
						<input
							class="radio"
							type="radio"
							value="true"
							name="engineer"
							v-model="playerFields.engineer"
						/>
						<label class="radio" for="true">true</label><br />
						<input
							class="radio"
							type="radio"
							value="false"
							name="engineer"
							v-model="playerFields.engineer"
						/>
						<label class="radio" for="false">false</label>
					</td>
				</tr>
				<tr>
					<td>cooker</td>
					<td>{{ player.cooker }}</td>
					<td>
						<input
							class="radio"
							type="radio"
							value="true"
							name="cooker"
							v-model="playerFields.cooker"
						/>
						<label class="radio" for="true">true</label><br />
						<input
							class="radio"
							type="radio"
							value="false"
							name="cooker"
							v-model="playerFields.cooker"
						/>
						<label class="radio" for="false">false</label>
					</td>
				</tr>
				<tr>
					<td>shopKeeper</td>
					<td>{{ player.shopKeeper }}</td>
					<td>
						<input
							class="radio"
							type="radio"
							value="true"
							name="shopKeeper"
							v-model="playerFields.shopKeeper"
						/>
						<label class="radio" for="true">true</label><br />
						<input
							class="radio"
							type="radio"
							value="false"
							name="shopKeeper"
							v-model="playerFields.shopKeeper"
						/>
						<label class="radio" for="false">false</label>
					</td>
				</tr>
				<tr>
					<td>merchant</td>
					<td>{{ player.merchant }}</td>
					<td>
						<input
							class="radio"
							type="radio"
							value="true"
							name="merchant"
							v-model="playerFields.merchant"
						/>
						<label class="radio" for="true">true</label><br />
						<input
							class="radio"
							type="radio"
							value="false"
							name="merchant"
							v-model="playerFields.merchant"
						/>
						<label class="radio" for="false">false</label>
					</td>
				</tr>
				<tr>
					<td>priest</td>
					<td>{{ player.priest }}</td>
					<td>
						<input
							class="radio"
							type="radio"
							value="true"
							name="priest"
							v-model="playerFields.priest"
						/>
						<label class="radio" for="true">true</label><br />
						<input
							class="radio"
							type="radio"
							value="false"
							name="priest"
							v-model="playerFields.priest"
						/>
						<label class="radio" for="false">false</label>
					</td>
				</tr>
				<tr>
					<td>teacher</td>
					<td>{{ player.teacher }}</td>
					<td>
						<input
							class="radio"
							type="radio"
							value="true"
							name="teacher"
							v-model="playerFields.teacher"
						/>
						<label class="radio" for="true">true</label><br />
						<input
							class="radio"
							type="radio"
							value="false"
							name="teacher"
							v-model="playerFields.teacher"
						/>
						<label class="radio" for="false">false</label>
					</td>
				</tr>
			</tbody>
		</table>
		<input type="submit" />
	</form>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { AdminService } from '@/services';
import { epicList } from '@/constants';
import { Player, PlayerEdit } from '@/models/index.js';

export default defineComponent({
	name: 'PlayerEdit',
	data() {
		return {
			playerFields: {
				rewards: []
			} as PlayerEdit,
			epicList: epicList,
			epicListFiltered: {} as Array<string>,
			player: {} as Player
		};
	},
	props: {
		playerProp: { type: Object as PropType<Player>, required: true }
	},
	methods: {
		async sendUpdate(): Promise<void> {
			if (
				this.playerFields.customText ||
				this.playerFields.hasImported ||
				this.playerFields.quetzuBought ||
				this.playerFields.leader !== undefined ||
				this.playerFields.engineer !== undefined ||
				this.playerFields.cooker !== undefined ||
				this.playerFields.shopKeeper !== undefined ||
				this.playerFields.merchant !== undefined ||
				this.playerFields.priest !== undefined ||
				this.playerFields.teacher !== undefined
			) {
				await AdminService.updatePlayer(
					this.player.playerId,
					this.playerFields.customText,
					this.playerFields.hasImported,
					this.playerFields.quetzuBought,
					this.playerFields.leader,
					this.playerFields.engineer,
					this.playerFields.cooker,
					this.playerFields.shopKeeper,
					this.playerFields.merchant,
					this.playerFields.priest,
					this.playerFields.teacher
				);
			}

			if (this.playerFields.money && this.playerFields.operation) {
				await AdminService.givePlayerMoney(
					this.player.playerId,
					this.playerFields.money,
					this.playerFields.operation
				);
			}

			if (
				this.playerFields.rewards!.length > 0 &&
				this.playerFields.epicOperation
			) {
				await AdminService.givePlayerEpicRewards(
					this.player.playerId,
					this.playerFields.rewards!,
					this.playerFields.epicOperation
				);
			}
			this.player = await AdminService.getplayerInformation(
				this.player.playerId
			);

			this.playerFields.rewards = [];
			this.filterEpicList(this.playerFields.epicOperation!);
		},
		getEpicImg(imgName: string): string {
			return require(`@/assets/epicRewards/collec_${imgName}.webp`);
		},
		filterEpicList(operation: string): void {
			if (operation === 'add') {
				this.epicListFiltered = Object.keys(epicList.imgName).filter(
					epicRewardId => !this.player.rewards.includes(parseInt(epicRewardId))
				);
			} else {
				this.epicListFiltered = Object.keys(
					epicList.imgName
				).filter(epicRewardId =>
					this.player.rewards.includes(parseInt(epicRewardId))
				);
			}
		},
		mountedPlayer(): void {
			this.player = this.playerProp;
		}
	},
	mounted(): void {
		this.mountedPlayer();

		this.playerFields.epicOperation = 'add';
		this.filterEpicList(this.playerFields.epicOperation);
	},
	watch: {
		playerProp(): void {
			this.mountedPlayer();
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
			background-image: url('~@/assets/background/table_header.gif');
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
