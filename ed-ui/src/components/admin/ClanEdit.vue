<template>
	<div class="search">
		<DZSelect id="clanSelect" v-model="searchedClanId" :search="searchClan" placeholder="Search for a clan..." />
		<DZButton @click="loadClan">Edit</DZButton>
	</div>

	<form @submit.prevent>
		<fieldset :disabled="!isLoaded">
			<legend>Clan Name</legend>
			<input type="text" v-model="clanFields.name" />
			<DZButton @click="updateName">Rename</DZButton>
		</fieldset>

		<fieldset :disabled="!isLoaded">
			<legend>Description (Pages)</legend>
			<div v-for="page in clan.pages" :key="page.id" class="page-block">
				<div class="page-header">
					<label class="page-label">Name:</label>
					<input type="text" v-model="page.name" class="page-name-input" />
				</div>
				<textarea v-model="page.content" rows="8"></textarea>
				<div class="page-actions">
					<DZButton @click="updatePage(page)">Save Page</DZButton>
					<DZButton v-if="!page.home" @click="deletePage(page.id)">Delete Page</DZButton>
				</div>
			</div>
		</fieldset>

		<fieldset :disabled="!isLoaded">
			<legend>Banner</legend>
			<div v-if="clan.banner">
				<img :src="`${API_BASE}/clan/${clan.id}/banner`" class="banner-img" />
				<DZButton @click="removeBanner">Remove the banner</DZButton>
			</div>
			<p v-else>No banner set</p>
		</fieldset>

		<fieldset :disabled="!isLoaded">
			<legend>Languages</legend>
			<div class="checkbox-group">
				<label class="checkbox-label"><input type="checkbox" value="FR" v-model="clanFields.langs" /> FR</label>
				<label class="checkbox-label"><input type="checkbox" value="EN" v-model="clanFields.langs" /> EN</label>
				<label class="checkbox-label"><input type="checkbox" value="ES" v-model="clanFields.langs" /> ES</label>
				<label class="checkbox-label"><input type="checkbox" value="DE" v-model="clanFields.langs" /> DE</label>
			</div>
			<DZButton @click="updateLangs">Save Languages</DZButton>
		</fieldset>

		<fieldset :disabled="!isLoaded">
			<legend>Treasure Gold</legend>
			<div class="treasure-gold">
				<label>Amount of gold : {{ clan.treasureValue ?? 0 }}</label>
				<div class="treasure-gold-controls">
					<input type="number" min="0" v-model.number="treasureFields.gold" class="treasure-input" />
					<DZButton @click="updateTreasureGold('add')">Add</DZButton>
					<DZButton @click="updateTreasureGold('remove')">Remove</DZButton>
				</div>
			</div>
		</fieldset>

		<fieldset :disabled="!isLoaded">
			<legend>Treasure Ingredients</legend>
			<div class="ingredients-current">
				<div v-if="clan.ingredients && clan.ingredients.length > 0" class="ingredient-list">
					<div v-for="ing in clan.ingredients" :key="ing.ingredientId" class="ingredient-row">
						<img
							:src="getImgURL('ingredients', ingredientNameList[ing.ingredientId] ?? '')"
							:alt="ingredientNameList[ing.ingredientId]"
							class="ingredient-img"
						/>
						<span class="ingredient-name">{{ ingredientNameList[ing.ingredientId] ?? `#${ing.ingredientId}` }}</span>
						<span class="ingredient-qty">x{{ ing.quantity }}</span>
					</div>
				</div>
				<p v-else>No ingredients in treasure.</p>
			</div>
			<div class="treasure-ing-controls">
				<div>
					<label>Ingredient:</label>
					<select v-model.number="treasureFields.selectedIngredient">
						<option v-for="(name, id) in ingredientNameList" :key="id" :value="id">{{ name }}</option>
					</select>
				</div>
				<div>
					<label>Quantity:</label>
					<input type="number" min="1" v-model.number="treasureFields.ingredientQuantity" class="treasure-input" />
				</div>
				<div class="treasure-ing-actions">
					<DZButton @click="updateTreasureIngredients('add')">Add</DZButton>
					<DZButton @click="updateTreasureIngredients('remove')">Remove</DZButton>
				</div>
			</div>
		</fieldset>

		<fieldset :disabled="!isLoaded">
			<legend>Members</legend>
			<table>
				<tr v-for="m in clan.members" :key="m.playerId">
					<td>{{ m.player.name }}</td>
					<td>{{ isLeader(m) ? '(Leader)' : '' }}</td>
					<td>
						<div class="actions">
							<DZButton v-if="!isLeader(m)" @click="promoteToLeader(m.playerId, m.player.name)">
								Promote to Leader
							</DZButton>
							<DZButton @click="kickMember(m.playerId, m.player.name)"> Kick of the Clan </DZButton>
						</div>
					</td>
				</tr>
			</table>
		</fieldset>

		<fieldset :disabled="!isLoaded" class="danger">
			<legend>Delete Clan</legend>
			<DZButton @click="deleteClan">Delete Clan</DZButton>
		</fieldset>
	</form>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { AdminService } from '../../services/AdminService.js';
import { ClanEdit, ClanPage } from '@drpg/core/models/clan/ClanEdit';
import DZSelect from '../common/DZSelect.vue';
import DZButton from '../common/DZButton.vue';
import { errorHandler } from '../../utils/index.js';
import { API_BASE } from '../../utils/index.js';
import { ingredientNameList } from '@drpg/core/models/ingredient/IngredientNameList';

export default defineComponent({
	name: 'ClanEdit',
	components: { DZSelect, DZButton },
	data() {
		return {
			clan: {} as ClanEdit,
			clanFields: {
				name: '',
				langs: [] as string[]
			},
			treasureFields: {
				gold: 0,
				selectedIngredient: undefined as number | undefined,
				ingredientQuantity: 1
			},
			ingredientNameList,
			searchedClanId: undefined as number | undefined,
			isLoaded: false as boolean,
			API_BASE: API_BASE
		};
	},
	props: {
		id: {
			type: String,
			required: false
		}
	},
	async mounted() {
		const clanId = this.id || this.$route.query.id;

		if (clanId) {
			this.searchedClanId = Number(clanId);
			await this.loadClan();
		}
	},
	methods: {
		async searchClan(query: string) {
			try {
				const results = await AdminService.searchClans(query);
				return results.map((clan: { id: number; name: string }) => ({
					value: clan.id,
					label: `${clan.name} (${clan.id})`
				}));
			} catch (err) {
				return [];
			}
		},

		async loadClan() {
			if (!this.searchedClanId) return;
			try {
				this.clan = await AdminService.getClanDetails(this.searchedClanId);
				this.clanFields.name = this.clan.name;
				this.clanFields.langs = (this.clan.langs || []).map((l: string) => l.toUpperCase());
				this.treasureFields.gold = 0;
				this.treasureFields.ingredientQuantity = 1;
				this.treasureFields.selectedIngredient = undefined;
				this.isLoaded = true;
			} catch (err) {
				console.error(err);
				await this.$globalConfirm({
					message: 'Clan not found.',
					header: 'Error',
					acceptLabel: 'OK',
					rejectLabel: ''
				}).catch(() => {});
			}
		},

		async updateName() {
			try {
				await AdminService.updateClanName(this.clan.id, this.clanFields.name);
				await this.$globalConfirm({
					message: 'Clan name updated successfully!',
					header: 'Success',
					acceptLabel: 'OK',
					rejectLabel: ''
				}).catch(() => {});
			} catch (err) {
				await this.$globalConfirm({
					message: 'Failed to update clan name.',
					header: 'Error',
					acceptLabel: 'OK',
					rejectLabel: ''
				}).catch(() => {});
			}
		},

		async updateLangs() {
			try {
				const langsLower = this.clanFields.langs.map((l: string) => l.toLowerCase());
				await AdminService.updateClanLangs(this.clan.id, langsLower);
				await this.$globalConfirm({
					message: 'Languages updated successfully!',
					header: 'Success',
					acceptLabel: 'OK',
					rejectLabel: ''
				}).catch(() => {});
			} catch (err) {
				await this.$globalConfirm({
					message: 'Failed to update languages.',
					header: 'Error',
					acceptLabel: 'OK',
					rejectLabel: ''
				}).catch(() => {});
			}
		},

		async updateTreasureGold(operation: 'add' | 'remove') {
			if (!this.treasureFields.gold || this.treasureFields.gold <= 0) {
				await this.$globalConfirm({
					message: 'Please enter a valid gold amount.',
					header: 'Error',
					acceptLabel: 'OK',
					rejectLabel: ''
				}).catch(() => {});
				return;
			}
			try {
				const result = await AdminService.updateClanTreasureGold(this.clan.id, this.treasureFields.gold, operation);
				this.clan.treasureValue = result.treasureValue;
				this.treasureFields.gold = 0;
				await this.$globalConfirm({
					message: `Gold ${operation === 'add' ? 'added' : 'removed'} successfully. New total: ${result.treasureValue}`,
					header: 'Success',
					acceptLabel: 'OK',
					rejectLabel: ''
				}).catch(() => {});
			} catch (err) {
				await this.$globalConfirm({
					message: 'Failed to update treasure gold.',
					header: 'Error',
					acceptLabel: 'OK',
					rejectLabel: ''
				}).catch(() => {});
			}
		},

		async updateTreasureIngredients(operation: 'add' | 'remove') {
			if (this.treasureFields.selectedIngredient === undefined) {
				await this.$globalConfirm({
					message: 'Please select an ingredient.',
					header: 'Error',
					acceptLabel: 'OK',
					rejectLabel: ''
				}).catch(() => {});
				return;
			}
			try {
				const updatedIngredients = await AdminService.updateClanTreasureIngredients(
					this.clan.id,
					this.treasureFields.selectedIngredient,
					this.treasureFields.ingredientQuantity,
					operation
				);
				this.clan.ingredients = updatedIngredients;
				this.treasureFields.ingredientQuantity = 1;
				await this.$globalConfirm({
					message: `Ingredient ${operation === 'add' ? 'added' : 'removed'} successfully.`,
					header: 'Success',
					acceptLabel: 'OK',
					rejectLabel: ''
				}).catch(() => {});
			} catch (err) {
				await this.$globalConfirm({
					message: 'Failed to update treasure ingredients.',
					header: 'Error',
					acceptLabel: 'OK',
					rejectLabel: ''
				}).catch(() => {});
			}
		},

		async updatePage(page: ClanPage) {
			try {
				await AdminService.updateClanPage(page.id, {
					name: page.name,
					content: page.content
				});
				await this.$globalConfirm({
					message: `Page "${page.name}" saved.`,
					header: 'Success',
					acceptLabel: 'OK',
					rejectLabel: ''
				}).catch(() => {});
			} catch (err) {
				await this.$globalConfirm({
					message: 'Failed to save page.',
					header: 'Error',
					acceptLabel: 'OK',
					rejectLabel: ''
				}).catch(() => {});
			}
		},

		async deletePage(pageId: number) {
			try {
				await this.$globalConfirm({
					message: 'Are you sure you want to delete this page?',
					header: 'Confirmation',
					acceptLabel: 'Yes',
					rejectLabel: 'No'
				});
				try {
					await AdminService.deleteClanPage(pageId);
					await this.$globalConfirm({
						message: 'Page deleted.',
						header: 'Success',
						acceptLabel: 'OK',
						rejectLabel: ''
					}).catch(() => {});
					await this.loadClan();
				} catch (err) {
					await this.$globalConfirm({
						message: 'Failed to delete page.',
						header: 'Error',
						acceptLabel: 'OK',
						rejectLabel: ''
					}).catch(() => {});
				}
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},

		async removeBanner() {
			try {
				await this.$globalConfirm({
					message: 'Are you sure you want to remove the banner?',
					header: 'Confirmation',
					acceptLabel: 'Yes',
					rejectLabel: 'No'
				});
				try {
					await AdminService.removeClanBanner(this.clan.id);
					this.clan.banner = null;
					await this.$globalConfirm({
						message: 'Banner removed.',
						header: 'Success',
						acceptLabel: 'OK',
						rejectLabel: ''
					}).catch(() => {});
				} catch (err) {
					await this.$globalConfirm({
						message: 'Failed to remove banner.',
						header: 'Error',
						acceptLabel: 'OK',
						rejectLabel: ''
					}).catch(() => {});
				}
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},

		isLeader(member: { playerId: string; rights: string[] }): boolean {
			if (this.clan.leaderId && member.playerId === this.clan.leaderId) return true;
			return member.rights && member.rights.includes('LEADER');
		},

		async promoteToLeader(playerId: string, playerName: string) {
			try {
				await this.$globalConfirm({
					message: `Transfer leadership to ${playerName}?`,
					header: 'Confirmation',
					acceptLabel: 'Yes',
					rejectLabel: 'No'
				});
				try {
					await AdminService.setClanLeader(this.clan.id, playerId);
					await this.$globalConfirm({
						message: `${playerName} is now the leader.`,
						header: 'Success',
						acceptLabel: 'OK',
						rejectLabel: ''
					}).catch(() => {});
					await this.loadClan();
				} catch (err) {
					await this.$globalConfirm({
						message: 'Failed to change leader.',
						header: 'Error',
						acceptLabel: 'OK',
						rejectLabel: ''
					}).catch(() => {});
				}
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},

		async kickMember(playerId: string, playerName: string) {
			const member = this.clan.members.find(m => m.playerId === playerId);
			const isLastMember = this.clan.members.length <= 1;

			if (member && this.isLeader(member) && !isLastMember) {
				await this.$globalConfirm({
					message: 'You cannot kick the leader while there are other members. Please promote another leader first.',
					header: 'Impossible action',
					acceptLabel: 'OK',
					rejectLabel: ''
				}).catch(() => {});
				return;
			}
			if (isLastMember) {
				try {
					await this.$globalConfirm({
						message: `${playerName} is the last member. Kicking them will DELETE the clan. CONTINUE?`,
						header: 'Warning',
						acceptLabel: 'Yes, delete',
						rejectLabel: 'No'
					});
					try {
						await AdminService.kickClanMemberAdmin(playerId);
						await AdminService.deleteClan(this.clan.id);
						await this.$globalConfirm({
							message: 'Member kicked and clan deleted.',
							header: 'Success',
							acceptLabel: 'OK',
							rejectLabel: ''
						}).catch(() => {});
						this.isLoaded = false;
						this.searchedClanId = undefined;
					} catch (err) {
						await this.$globalConfirm({
							message: 'Failed to kick member and delete clan.',
							header: 'Error',
							acceptLabel: 'OK',
							rejectLabel: ''
						}).catch(() => {});
					}
				} catch (err) {
					errorHandler.handle(err, this.$toast);
					return;
				}
				return;
			}

			try {
				await this.$globalConfirm({
					message: `Kick ${playerName} from the clan?`,
					header: 'Confirmation',
					acceptLabel: 'Oui',
					rejectLabel: 'Non',
					icon: 'pi pi-user-minus'
				});
				try {
					await AdminService.kickClanMemberAdmin(playerId);
					await this.$globalConfirm({
						message: `${playerName} has been removed.`,
						header: 'Succès',
						acceptLabel: 'OK',
						rejectLabel: ''
					}).catch(() => {});
					await this.loadClan();
				} catch (err) {
					await this.$globalConfirm({
						message: 'Failed to kick member.',
						header: 'Erreur',
						acceptLabel: 'OK',
						rejectLabel: ''
					}).catch(() => {});
				}
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},

		async deleteClan() {
			try {
				await this.$globalConfirm({
					message: 'DANGER : This will permanently DELETE the clan. CONTINUE?',
					header: '⚠ Supprimer le clan',
					acceptLabel: 'Oui, supprimer',
					rejectLabel: 'Non',
					icon: 'pi pi-exclamation-triangle'
				});
				try {
					await AdminService.deleteClan(this.clan.id);
					await this.$globalConfirm({
						message: 'Clan deleted.',
						header: 'Succès',
						acceptLabel: 'OK',
						rejectLabel: ''
					}).catch(() => {});
					this.isLoaded = false;
					this.searchedClanId = undefined;
				} catch (err) {
					await this.$globalConfirm({
						message: 'Failed to delete clan.',
						header: 'Erreur',
						acceptLabel: 'OK',
						rejectLabel: ''
					}).catch(() => {});
				}
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		}
	}
});
</script>

<style lang="scss" scoped>
.search {
	display: flex;
	align-items: center;
	gap: 10px;
}

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
		padding: 0 8px 8px;
		height: 41px;
		color: #fffdba;
		text-transform: uppercase;
		font-weight: bold;
		letter-spacing: 1.5pt;
		border: 1px solid #356847;
		background-color: #c64e36;
		background-image: url('../../assets/background/table_header.webp');
		background-position: left bottom;
		width: 60%;
	}

	div {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	input[type='text'],
	textarea,
	select {
		width: calc(100% - 20px);
		padding: 5px;
		margin-top: 5px;
		margin-bottom: 10px;
		border: 1px solid #c88f44;
		background-color: #f3ca92;
		color: #710;
	}
}

.page-block {
	margin-bottom: 20px;
	width: 100%;
}

.page-header {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 10px;
	width: 100%;
	margin-bottom: 5px;
}

.page-label {
	margin: 0;
	min-width: 50px;
}

.page-name-input {
	margin: 0;
	flex: 1;
}

.page-actions {
	display: flex;
	flex-direction: row;
	gap: 10px;
	margin-top: 5px;
}

.checkbox-group {
	display: flex;
	flex-direction: row;
	gap: 15px;
	margin-bottom: 10px;
}

.checkbox-label {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 5px;
}

.banner-img {
	max-width: 500px;
}

.treasure-gold-controls {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 10px;
}

.treasure-input {
	width: 120px !important;
	margin: 0 !important;
}

.ingredients-current {
	margin-bottom: 12px;
}

.ingredient-list {
	gap: 4px;
	margin-bottom: 8px;
}

.ingredient-row {
	display: flex;
	flex-direction: row;
	gap: 10px;
	align-items: center;
	padding: 3px 6px;
	background-color: rgba(255, 255, 255, 0.3);
	border-radius: 3px;
}

.ingredient-img {
	width: 24px;
	height: 24px;
	object-fit: contain;
	flex-shrink: 0;
}

.treasure-ing-controls {
	gap: 8px;
}

.treasure-ing-actions {
	display: flex;
	flex-direction: row;
	gap: 10px;
}
</style>
