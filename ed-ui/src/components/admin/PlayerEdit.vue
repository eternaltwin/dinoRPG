<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
	<form class="ml-[-50px] mt-[45px] sm:ml-0 sm:mt-[20px]" @submit.prevent="sendUpdate()">
		<fieldset>
			<legend class="text-[10pt] sm:text-[13pt]">Player details</legend>
			<div>
				<label class="title" for="playerName">Player :</label>
				<input type="text" id="playerName" v-model="player.name" disabled />
				<input type="text" id="playerName" v-model="player.eternalTwinId" disabled />
			</div>
			<div>
				<label class="title" for="playerHasImported">HasImported :</label>
				<input id="playerHasImported" type="text" disabled v-model="player.hasImported" />
				<div class="hasImported">
					<input
						class="radio"
						type="radio"
						id="true"
						value="true"
						name="hasImported"
						v-model="playerFields.hasImported"
					/>
					<label class="radio" for="true">true</label>
					<input
						class="radio"
						type="radio"
						id="false"
						value="false"
						name="hasImported"
						v-model="playerFields.hasImported"
					/>
					<label class="radio" for="false">false</label>
				</div>
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
					<label class="title" for="itemId">Item ID:</label>
					<input type="number" id="itemId" v-model="playerFields.selectedItem" min="1" />
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
					<label class="title" for="ingredientId">Ingredient ID:</label>
					<input type="number" id="ingredientId" v-model="playerFields.selectedIngredient" min="1" />
				</div>
				<div>
					<label class="title" for="ingredientQuantity">Quantity:</label>
					<input type="number" id="ingredientQuantity" v-model="playerFields.ingredientQuantity" min="1" />
				</div>
				<div>
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
						<option v-for="questID in player.quests" :key="questID.questId" :value="questID.questId">
							{{ quest.questId }}
						</option>
					</select>
					<input type="number" id="selectedQuestId" v-model="playerFields.selectedQuestId" />
					<label class="title" for="progressionInput">Progression :</label>
					<input type="text" disabled v-model="quest.progression" />
					<input type="number" id="progressionInput" v-model="playerFields.progressionQuest" />
				</template>
				<div>
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
import { itemNameList } from '@drpg/core/models/item/ItemNameList';
import { ingredientNameList } from '@drpg/core/models/ingredient/IngredientNameList';
import { Player } from '@drpg/core/models/player/Player';
import { PlayerEdit } from '@drpg/core/models/player/PlayerEdit';

export default defineComponent({
	name: 'PlayerEdit',
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
			epicList: epicList,
			epicListFiltered: {} as Array<string>,
			itemNameList: itemNameList,
			ingredientNameList: ingredientNameList,
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
					this.playerFields.hasImported,
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

			if (this.playerFields.money && this.playerFields.operation) {
				await AdminService.givePlayerMoney(this.player.id, this.playerFields.money, this.playerFields.operation);
			}

			if (this.playerFields.rewards!.length > 0 && this.playerFields.epicOperation) {
				await AdminService.givePlayerEpicRewards(
					this.player.id,
					this.playerFields.rewards!,
					this.playerFields.epicOperation
				);
			}

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

			this.player = await AdminService.getplayerInformation(this.player.id);

			this.playerFields.rewards = [];
			this.filterEpicList(this.playerFields.epicOperation!);

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
		filterEpicList(operation: string): void {
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
	min-width: 100%;
	margin-bottom: 10px;
	background-color: #ecbd84;
	border-spacing: 2px;
	padding: 5px;
	fieldset {
		border: 2px solid #bc683c;
		margin: 15px 0;
		padding: 20px;
		width: 100%;
	}
	legend {
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
.hasImported,
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
</style>
