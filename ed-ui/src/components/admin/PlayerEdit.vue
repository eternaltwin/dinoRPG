<template>
	<form @submit.prevent="sendUpdate()">
		<fieldset>
			<legend>Player details</legend>
			<div>
				<label class="title" for="playerName">Player :</label>
				<input type="text" id="playerName" v-model="player.name" disabled />
				<input type="text" id="playerId" v-model="player.id" disabled />
			</div>
			<div>
				<label class="title" for="playerCustomText">CustomText :</label>
				<input type="text" disabled v-model="player.customText" />
				<input type="text" id="playerCustomText" v-model="playerFields.customText" />
			</div>
			<div>
				<label class="title" for="playerMoney">Money :</label>
				<input type="text" id="playerMoney" disabled v-model="player.money" />
				<div class="money">
					<input type="number" min="0" v-model="playerFields.money" />
					<input class="radio" type="radio" id="add" value="add" name="operation" v-model="playerFields.operation" />
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
				</div>
			</div>
			<div>
				<label class="title" for="playerQuetzuBought">Quetzu Bought :</label>
				<input type="text" v-model="player.quetzuBought" />
				<input type="number" min="0" max="6" v-model="playerFields.quetzuBought" />
			</div>
			<div>
				<label class="title" for="playerDailyGridRewards">Daily Grid Rewards :</label>
				<input type="text" v-model="player.dailyGridRewards" />
				<input type="number" min="0" max="10" v-model="playerFields.dailyGridRewards" />
			</div>
			<div>
				<label class="title" for="role">Role :</label>
				<input id="role" type="text" v-model="player.role" disabled />
				<div class="uSkills">
					<input class="radio" type="radio" value="admin" name="role" v-model="playerFields.role" />
					<label class="radio" for="admin">admin</label>
					<input class="radio" type="radio" value="beta" name="role" v-model="playerFields.role" />
					<label class="radio" for="beta">beta</label>
					<input class="radio" type="radio" value="player" name="role" v-model="playerFields.role" />
					<label class="radio" for="player">player</label>
				</div>
			</div>
		</fieldset>
		<fieldset>
			<legend>Moderation</legend>
			<div v-if="player.banCase" class="moderation">
				<label class="title" for="banReason">Reason: </label>
				<select id="banReasonSelect" v-model="player.banCase.reason">
					<option v-for="reason in banReasons" :key="reason">
						{{ reason }}
					</option>
				</select>
				<label class="title" for="banAction">Action: </label>
				<select id="banActionSelect" v-model="player.banCase.sorted">
					<option v-for="action in banActions" :key="action">
						{{ action }}
					</option>
				</select>
				<label class="title" for="banComment">Comment: </label>
				<input type="text" id="banComment" v-model="player.banCase.comment" />
				<label class="title" for="banDinoz">Dinoz ID: </label>
				<input type="text" id="banDinoz" v-model="player.banCase.dinozId" />
				<label class="title" for="reportId">Report ID: </label>
				<input type="text" id="reportId" v-model="player.banCase.id" disabled />
				<label class="title" for="reporterId">Reporter ID: </label>
				<input type="text" id="reporterId" v-model="player.banCase.reporterId" disabled />
				<label class="title" for="banDate">Ban Date: </label>
				<input type="text" id="banDate" v-model="player.banCase.banDate" disabled />
				<label class="title" for="banEndDate">Ban End Date: </label>
				<input type="text" id="banEndDate" v-model="player.banCase.banEndDate" disabled />
				<DZButton @click="updateBan()">Update Ban</DZButton>
				<DZButton @click="cancelBan()">Cancel Ban</DZButton>
			</div>
			<div v-else class="moderation">
				<label class="title" for="banReason">Reason: </label>
				<select id="banReasonSelect" v-model="banFields.reason">
					<option v-for="reason in banReasons" :key="reason">
						{{ reason }}
					</option>
				</select>
				<label class="title" for="banAction">Action: </label>
				<select id="banActionSelect" v-model="banFields.sorted">
					<option v-for="action in banActions" :key="action">
						{{ action }}
					</option>
				</select>
				<label class="title" for="banComment">Comment: </label>
				<input type="text" id="banComment" v-model="banFields.comment" />
				<label class="title" for="banDinoz">Dinoz ID: </label>
				<input type="text" id="banDinoz" v-model="banFields.dinozId" />
				<DZButton @click="banPlayer()">Ban</DZButton>
			</div>
		</fieldset>
		<fieldset>
			<legend>Rewards</legend>
			<div class="rewards">
				<template v-for="(reward, index) in player.rewards" :key="index">
					<Tippy theme="normal">
						<img
							:src="getImgURL('epicRewards', `collec_${epicList.imgName[reward]}`)"
							:alt="epicList.imgName[reward]"
						/>
						<template #content>
							<h1 v-html="formatContent($t(`rewards.name.${epicList.imgName[reward]}`))" />
							<p v-html="formatContent($t(`rewards.description.${epicList.imgName[reward]}`))" />
						</template>
					</Tippy>
				</template>
			</div>
			<div class="rewards">
				<select v-model="playerFields.rewards" multiple size="5">
					<option v-for="(reward, index) in epicListFiltered" :key="index" :value="reward">
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
			</div>
		</fieldset>
		<fieldset>
			<legend>Items</legend>
			<div class="items">
				<template v-for="(item, index) in player.items" :key="index">
					<Tippy theme="normal">
						<img :src="getImgURL('item', `item_${itemNameList[item.itemId]}`)" :alt="itemNameList[item.itemId]" />
						<template #content>
							<h1 v-html="formatContent($t(`item.name.${itemNameList[item.itemId]}`))" />
							<p v-html="formatContent($t(`item.description.${itemNameList[item.itemId]}`))" />
							<br />
							<p>ItemId: {{ item.itemId }}</p>
							<p>Quantity: {{ item.quantity }}</p>
						</template>
					</Tippy>
				</template>
			</div>
			<div class="items">
				<div>
					<label class="title" for="itemId">Item :</label>
					<select id="itemId" v-model.number="playerFields.selectedItem">
						<option v-for="(name, id) in itemNameList" :key="id" :value="id">
							{{ $t(`item.name.${name}`) }}
						</option>
					</select>
				</div>
				<div>
					<label class="title" for="itemQuantity">Quantity:</label>
					<input type="number" id="itemQuantity" v-model="playerFields.itemQuantity" min="1" />
				</div>
				<div class="itemOperations">
					<input
						class="radio"
						type="radio"
						id="increase"
						value="increase"
						name="itemOperation"
						v-model="playerFields.itemOperation"
					/>
					<label class="radio" for="increase">Increase</label>
					<input
						class="radio"
						type="radio"
						id="decrease"
						value="decrease"
						name="itemOperation"
						v-model="playerFields.itemOperation"
					/>
					<label class="radio" for="decrease">Decrease</label>
				</div>
			</div>
		</fieldset>
		<fieldset>
			<legend>Ingredients</legend>
			<div class="ingredients">
				<template v-for="(ing, index) in player.ingredients" :key="index">
					<Tippy theme="normal">
						<img
							:src="getImgURL('ingredients', `${ingredientNameList[ing.ingredientId]}`)"
							:alt="ingredientNameList[ing.ingredientId]"
						/>
						<template #content>
							<h1 v-html="formatContent($t(`ingredients.name.${ingredientNameList[ing.ingredientId]}`))" />
							<p v-html="formatContent($t(`ingredients.description.${ingredientNameList[ing.ingredientId]}`))" />
							<br />
							<p>ItemId: {{ ing.ingredientId }}</p>
							<p>Quantity: {{ ing.quantity }}</p>
						</template>
					</Tippy>
				</template>
			</div>
			<div class="ingredients">
				<div>
					<label class="title" for="ingredientId">Ingredient :</label>
					<select id="itemId" v-model.number="playerFields.selectedIngredient">
						<option v-for="(name, id) in ingredientNameList" :key="id" :value="id">
							{{ $t(`ingredients.name.${name}`) }}
						</option>
					</select>
				</div>
				<div>
					<label class="title" for="ingredientQuantity">Quantity:</label>
					<input type="number" id="ingredientQuantity" v-model="playerFields.ingredientQuantity" min="1" />
				</div>
				<div class="ingredientOperations">
					<input
						class="radio"
						type="radio"
						id="increase"
						value="increase"
						name="ingOperation"
						v-model="playerFields.ingOperation"
					/>
					<label class="radio" for="increase">Increase</label>
					<input
						class="radio"
						type="radio"
						id="decrease"
						value="decrease"
						name="ingOperation"
						v-model="playerFields.ingOperation"
					/>
					<label class="radio" for="decrease">Decrease</label>
				</div>
			</div>
		</fieldset>
		<fieldset>
			<legend>U Skills</legend>
			<div>
				<label class="title" for="playerLeader">Leader :</label>
				<input id="playerLeader" type="text" v-model="player.leader" disabled />
				<div class="uSkills">
					<input class="radio" type="radio" value="true" name="leader" v-model="playerFields.leader" />
					<label class="radio" for="true">true</label>
					<input class="radio" type="radio" value="false" name="leader" v-model="playerFields.leader" />
					<label class="radio" for="false">false</label>
				</div>
			</div>
			<div>
				<label class="title" for="playerEngineer">Engineer :</label>
				<input id="playerEngineer" type="text" v-model="player.engineer" disabled />
				<div class="uSkills">
					<input class="radio" type="radio" value="true" name="engineer" v-model="playerFields.engineer" />
					<label class="radio" for="true">true</label>
					<input class="radio" type="radio" value="false" name="engineer" v-model="playerFields.engineer" />
					<label class="radio" for="false">false</label>
				</div>
			</div>
			<div>
				<label class="title" for="playerCooker">Cooker :</label>
				<input id="playerCooker" type="text" v-model="player.cooker" disabled />
				<div class="uSkills">
					<input class="radio" type="radio" value="true" name="cooker" v-model="playerFields.cooker" />
					<label class="radio" for="true">true</label>
					<input class="radio" type="radio" value="false" name="cooker" v-model="playerFields.cooker" />
					<label class="radio" for="false">false</label>
				</div>
			</div>
			<div>
				<label class="title" for="playerShopKeeper">ShopKeeper :</label>
				<input id="playerShopKeeper" type="text" v-model="player.shopKeeper" disabled />
				<div class="uSkills">
					<input class="radio" type="radio" value="true" name="shopKeeper" v-model="playerFields.shopKeeper" />
					<label class="radio" for="true">true</label>
					<input class="radio" type="radio" value="false" name="shopKeeper" v-model="playerFields.shopKeeper" />
					<label class="radio" for="false">false</label>
				</div>
			</div>
			<div>
				<label class="title" for="playerMerchant">Merchant :</label>
				<input id="playerMerchant" type="text" v-model="player.merchant" disabled />
				<div class="uSkills">
					<input class="radio" type="radio" value="true" name="merchant" v-model="playerFields.merchant" />
					<label class="radio" for="true">true</label>
					<input class="radio" type="radio" value="false" name="merchant" v-model="playerFields.merchant" />
					<label class="radio" for="false">false</label>
				</div>
			</div>
			<div>
				<label class="title" for="playerPriest">Priest :</label>
				<input id="playerPriest" type="text" v-model="player.priest" disabled />
				<div class="uSkills">
					<input class="radio" type="radio" value="true" name="priest" v-model="playerFields.priest" />
					<label class="radio" for="true">true</label>
					<input class="radio" type="radio" value="false" name="priest" v-model="playerFields.priest" />
					<label class="radio" for="false">false</label>
				</div>
			</div>
			<div>
				<label class="title" for="playerTeacher">Teacher :</label>
				<input id="playerTeacher" type="text" v-model="player.teacher" disabled />
				<div class="uSkills">
					<input class="radio" type="radio" value="true" name="teacher" v-model="playerFields.teacher" />
					<label class="radio" for="true">true</label><br />
					<input class="radio" type="radio" value="false" name="teacher" v-model="playerFields.teacher" />
					<label class="radio" for="false">false</label>
				</div>
			</div>
			<div>
				<label class="title" for="playerMessiah">Messiah :</label>
				<input id="playerMessiah" type="text" v-model="player.messie" disabled />
				<div class="uSkills">
					<input class="radio" type="radio" value="true" name="messie" v-model="playerFields.messie" />
					<label class="radio" for="true">true</label><br />
					<input class="radio" type="radio" value="false" name="messie" v-model="playerFields.messie" />
					<label class="radio" for="false">false</label>
				</div>
			</div>
			<div>
				<label class="title" for="playerMatelasseur">Matelasseur :</label>
				<input id="playerMatelasseur" type="text" v-model="player.matelasseur" disabled />
				<div class="uSkills">
					<input class="radio" type="radio" value="true" name="matelasseur" v-model="playerFields.matelasseur" />
					<label class="radio" for="true">true</label><br />
					<input class="radio" type="radio" value="false" name="matelasseur" v-model="playerFields.matelasseur" />
					<label class="radio" for="false">false</label>
				</div>
			</div>
		</fieldset>
		<fieldset>
			<legend>Quests</legend>
			<div class="quests">
				<template v-for="(quest, index) in player.quests" :key="index">
					<label class="title" for="selectedQuestId">Quest ID :</label>
					<select id="questIdSelect" v-model="quest.questId" @change="updateProgression(quest)">
						<option v-for="(scenario, id) in ScenarioDetails" :key="id" :value="id">
							{{ $t(`scenario.${scenario.name}`) }}
						</option>
					</select>
					<label class="title" for="selectedQuestIdSelect">Sélectionner une quête :</label>
					<select id="selectedQuestIdSelect" v-model.number="playerFields.selectedQuestId">
						<option v-for="(scenario, id) in ScenarioDetails" :key="id" :value="id">
							{{ $t(`scenario.${scenario.name}`) }}
						</option>
					</select>
					<label class="title" for="progressionInput">Progression :</label>
					<input type="text" disabled v-model="quest.progression" />
					<input type="number" id="progressionInput" v-model="playerFields.progressionQuest" />
				</template>
				<div class="questOperations">
					<input
						class="radio"
						type="radio"
						id="increase"
						value="increase"
						name="questOperation"
						v-model="playerFields.questOperation"
					/>
					<label class="radio" for="increase">Increase</label>
					<input
						class="radio"
						type="radio"
						id="decrease"
						value="decrease"
						name="questOperation"
						v-model="playerFields.questOperation"
					/>
					<label class="radio" for="decrease">Decrease</label>
				</div>
			</div>
		</fieldset>
		<input type="submit" />
	</form>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { AdminService } from '../../services/index.js';
import { epicList } from '../../constants/index.js';
import { errorHandler } from '../../utils/index.js';
import { itemNameList } from '@drpg/core/models/item/ItemNameList';
import { ingredientNameList } from '@drpg/core/models/ingredient/IngredientNameList';
import { Player } from '@drpg/core/models/player/Player';
import { PlayerEdit } from '@drpg/core/models/player/PlayerEdit';
import { ModerationAdminType } from '@drpg/core/models/admin/ModerationType';
import { ScenarioDetails } from '@drpg/core/models/enums/Scenario';
import DZButton from '../common/DZButton.vue';

const banReasons = ['multi', 'accountName', 'avatar', 'customText', 'dinozName'];
const banActions = ['shortBan', 'mediumBan', 'longBan', 'infiniteBan'];

export default defineComponent({
	name: 'PlayerEdit',
	components: { DZButton },
	data() {
		return {
			playerFields: {
				rewards: [],
				items: [],
				selectedItem: undefined as number | undefined,
				itemQuantity: 1,
				itemOperation: '',
				ingredients: [],
				selectedIngredient: undefined as number | undefined,
				ingredientQuantity: 1,
				ingOperation: '',
				quests: [],
				selectedQuestId: undefined as number | undefined,
				progressionQuest: undefined as number | undefined,
				questOperation: ''
			} as PlayerEdit,
			banFields: {
				sorted: undefined as string | undefined,
				reason: undefined as string | undefined,
				comment: undefined as string | undefined,
				banDate: undefined as Date | undefined,
				banEndDate: undefined as Date | undefined
			} as ModerationAdminType,
			epicList: epicList,
			epicListFiltered: {} as Array<string>,
			itemNameList: itemNameList,
			ingredientNameList: ingredientNameList,
			ScenarioDetails,
			player: {} as Player,
			banReasons,
			banActions
		};
	},
	props: {
		playerProp: { type: Object as PropType<Player>, required: true }
	},
	methods: {
		async sendUpdate(): Promise<void> {
			// General player update
			if (
				this.playerFields.customText ||
				this.playerFields.quetzuBought ||
				this.playerFields.dailyGridRewards !== undefined ||
				this.playerFields.leader !== undefined ||
				this.playerFields.engineer !== undefined ||
				this.playerFields.cooker !== undefined ||
				this.playerFields.shopKeeper !== undefined ||
				this.playerFields.merchant !== undefined ||
				this.playerFields.priest !== undefined ||
				this.playerFields.teacher !== undefined ||
				this.playerFields.messie !== undefined ||
				this.playerFields.matelasseur !== undefined ||
				this.playerFields.role !== undefined
			) {
				await AdminService.updatePlayer(
					this.player.id,
					this.playerFields.customText,
					this.playerFields.quetzuBought,
					this.playerFields.dailyGridRewards,
					this.playerFields.leader,
					this.playerFields.engineer,
					this.playerFields.cooker,
					this.playerFields.shopKeeper,
					this.playerFields.merchant,
					this.playerFields.priest,
					this.playerFields.teacher,
					this.playerFields.messie,
					this.playerFields.matelasseur,
					this.playerFields.role
				);
			}

			// Money update
			if (this.playerFields.money && this.playerFields.operation) {
				await AdminService.givePlayerMoney(this.player.id, this.playerFields.money, this.playerFields.operation);
			}

			// Epic rewards update
			if ((this.playerFields.rewards?.length ?? 0) > 0 && this.playerFields.epicOperation) {
				await AdminService.givePlayerEpicRewards(
					this.player.id,
					this.playerFields.rewards ?? [],
					this.playerFields.epicOperation
				);
			}

			// Item update
			if (
				this.playerFields.selectedItem !== undefined &&
				this.playerFields.itemQuantity !== undefined &&
				this.playerFields.itemOperation
			) {
				await AdminService.modifyPlayerItems(
					this.player.id,
					this.playerFields.selectedItem,
					this.playerFields.itemQuantity,
					this.playerFields.itemOperation
				);
			}

			// Ingredient update
			if (
				this.playerFields.selectedIngredient !== undefined &&
				this.playerFields.ingredientQuantity !== undefined &&
				this.playerFields.ingOperation
			) {
				await AdminService.modifyPlayerIngredients(
					this.player.id,
					this.playerFields.selectedIngredient,
					this.playerFields.ingredientQuantity,
					this.playerFields.ingOperation
				);
			}

			// Quest update
			if (
				this.playerFields.selectedQuestId !== undefined &&
				this.playerFields.progressionQuest !== undefined &&
				this.playerFields.questOperation
			) {
				await AdminService.updateQuest(
					this.player.id,
					this.playerFields.selectedQuestId,
					this.playerFields.progressionQuest,
					this.playerFields.questOperation
				);
			}

			// Reload player info
			this.player = await AdminService.getplayerInformation(this.player.id);

			this.playerFields.rewards = [];

			if (this.playerFields.epicOperation) {
				this.filterEpicList(this.playerFields.epicOperation);
			}

			this.playerFields.selectedItem = undefined;
			this.playerFields.itemQuantity = 1;
			this.playerFields.itemOperation = '';
			this.sortItemsById();

			this.playerFields.selectedIngredient = undefined;
			this.playerFields.ingredientQuantity = 1;
			this.playerFields.ingOperation = '';
			this.sortIngredientsById();

			this.playerFields.selectedQuestId = undefined;
			this.playerFields.progressionQuest = undefined;
			this.playerFields.questOperation = '';
		},
		filterEpicList(operation: string) {
			if (operation === 'add') {
				this.epicListFiltered = Object.keys(epicList.imgName).filter(
					epicRewardId => !this.player.rewards.includes(parseInt(epicRewardId))
				);
			} else {
				this.epicListFiltered = Object.keys(epicList.imgName).filter(epicRewardId =>
					this.player.rewards.includes(parseInt(epicRewardId))
				);
			}
		},
		filterQuestList(operation: string): void {
			if (operation === 'update') {
				this.questListFiltered = this.player.quests.find(q => q.questId === parseInt(quest.questId));
			} else {
				this.questListFiltered = Object.keys(epicList.imgName).filter(epicRewardId =>
					this.player.rewards.includes(parseInt(epicRewardId))
				);
			}
		},
		sortItemsById(): void {
			this.player.items.sort((a, b) => a.itemId - b.itemId);
		},
		sortIngredientsById(): void {
			this.player.ingredients.sort((a, b) => a.ingredientId - b.ingredientId);
		},
		updateProgression(quest: unknown) {
			const selectedQuestId = this.player.quests.find(q => q.questId === parseInt(quest.questId));
			if (selectedQuestId) {
				quest.progression = selectedQuestId.progression;
			} else {
				quest.progression = '';
			}
		},
		async banPlayer() {
			const res: boolean = confirm(this.$t('popup.confirmBanAction'));
			if (res) {
				try {
					await AdminService.banPlayer(
						this.player.id,
						this.banFields.reason,
						this.banFields.sorted,
						this.banFields.comment,
						this.banFields.dinozId
					);
					this.player = await AdminService.getplayerInformation(this.player.id);
				} catch (err) {
					errorHandler.handle(err, this.$toast);
					return;
				}
			}
		},
		async cancelBan() {
			try {
				await AdminService.cancelBan(this.player.id);
				this.player = await AdminService.getplayerInformation(this.player.id);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		async updateBan() {
			try {
				await AdminService.updateBan(
					this.player.id,
					this.player.banCase.sorted,
					this.player.banCase.reason,
					this.player.banCase.comment,
					this.player.banCase.dinozId
				);
				this.player = await AdminService.getplayerInformation(this.player.id);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		mountedPlayer(): void {
			this.player = this.playerProp;
		}
	},
	mounted(): void {
		this.mountedPlayer();
		this.sortItemsById();
		this.sortIngredientsById();
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
.money,
.rewards,
.items,
.ingredients,
.uSkills,
.quests {
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
