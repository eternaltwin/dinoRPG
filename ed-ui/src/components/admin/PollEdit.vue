<template>
	<form @submit.prevent="createNewsPoll">
		<fieldset>
			<legend>News Details</legend>
			<div>
				<label class="title" for="newsTitle">Titre principal :</label>
				<input type="text" id="newsTitle" v-model="form.title" required />
			</div>
			<div>
				<label class="title" for="newsImage">Image (optionnelle) :</label>
				<input type="file" id="newsImage" @change="handleImageChange" accept="image/*" />
				<div v-if="imagePreview" class="image-preview">
					<img :src="imagePreview" alt="Preview" />
				</div>
			</div>
		</fieldset>

		<fieldset>
			<legend>Multilingual Titles</legend>
			<div>
				<label class="title" for="frenchTitle">Français :</label>
				<input type="text" id="frenchTitle" v-model="form.frenchTitle" />
			</div>
			<div>
				<label class="title" for="englishTitle">Anglais :</label>
				<input type="text" id="englishTitle" v-model="form.englishTitle" />
			</div>
			<div>
				<label class="title" for="spanishTitle">Espagnol :</label>
				<input type="text" id="spanishTitle" v-model="form.spanishTitle" />
			</div>
			<div>
				<label class="title" for="germanTitle">Allemand :</label>
				<input type="text" id="germanTitle" v-model="form.germanTitle" />
			</div>
		</fieldset>

		<fieldset>
			<legend>Multilingual Content</legend>
			<div>
				<label class="title" for="frenchText">Français :</label>
				<textarea id="frenchText" v-model="form.frenchText" rows="4"></textarea>
			</div>
			<div>
				<label class="title" for="englishText">Anglais :</label>
				<textarea id="englishText" v-model="form.englishText" rows="4"></textarea>
			</div>
			<div>
				<label class="title" for="spanishText">Espagnol :</label>
				<textarea id="spanishText" v-model="form.spanishText" rows="4"></textarea>
			</div>
			<div>
				<label class="title" for="germanText">Allemand :</label>
				<textarea id="germanText" v-model="form.germanText" rows="4"></textarea>
			</div>
		</fieldset>

		<fieldset>
			<legend>Poll Options</legend>
			<div v-for="(option, index) in pollOptions" :key="index" class="poll-option">
				<label class="title" :for="`option${index}`">Option {{ index + 1 }} :</label>
				<input :id="`option${index}`" type="text" v-model="option.optionText" required />
				<div class="option-controls">
					<label class="title" for="orderIndex">Ordre :</label>
					<input type="number" v-model.number="option.orderIndex" min="0" :placeholder="index" />
					<DZButton v-if="pollOptions.length > 2" @click="removeOption(index)" type="button"> Supprimer </DZButton>
				</div>
			</div>

			<div class="poll-actions">
				<DZButton @click="addOption" type="button"> Ajouter une option </DZButton>
			</div>
		</fieldset>

		<div class="form-actions">
			<input
				type="submit"
				:disabled="loading || !isFormValid"
				:value="loading ? 'Création...' : 'Créer la news avec sondage'"
			/>
			<DZButton @click="resetForm" type="button"> Réinitialiser </DZButton>
		</div>

		<div v-if="message" :class="['message', messageType]">
			{{ message }}
		</div>
	</form>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DZButton from '../common/DZButton.vue';
import { NewsService } from '../../services';
import { errorHandler } from '../../utils';

interface CreatePollOption {
	optionText: string;
	orderIndex?: number;
}

interface NewsForm {
	title: string;
	frenchTitle?: string;
	englishTitle?: string;
	spanishTitle?: string;
	germanTitle?: string;
	frenchText?: string;
	englishText?: string;
	spanishText?: string;
	germanText?: string;
}

export default defineComponent({
	name: 'NewsPollCreator',
	components: { DZButton },

	data() {
		return {
			form: {
				title: '',
				frenchTitle: '',
				englishTitle: '',
				spanishTitle: '',
				germanTitle: '',
				frenchText: '',
				englishText: '',
				spanishText: '',
				germanText: ''
			} as NewsForm,
			selectedImage: null as File | null,
			imagePreview: null as string | null,
			pollOptions: [
				{ optionText: '', orderIndex: 0 },
				{ optionText: '', orderIndex: 1 }
			] as CreatePollOption[],
			loading: false,
			message: '',
			messageType: 'info' as 'info' | 'success' | 'error'
		};
	},

	computed: {
		isFormValid(): boolean {
			return (
				this.form.title.trim() !== '' &&
				this.pollOptions.length >= 2 &&
				this.pollOptions.every(option => option.optionText.trim() !== '')
			);
		}
	},

	methods: {
		handleImageChange(event: Event): void {
			const target = event.target as HTMLInputElement;
			const file = target.files?.[0];

			if (file) {
				this.selectedImage = file;

				const reader = new FileReader();
				reader.onload = e => {
					this.imagePreview = e.target?.result as string;
				};
				reader.readAsDataURL(file);
			} else {
				this.selectedImage = null;
				this.imagePreview = null;
			}
		},

		addOption(): void {
			if (this.pollOptions.length < 10) {
				this.pollOptions.push({
					optionText: '',
					orderIndex: this.pollOptions.length
				});
			}
		},

		removeOption(index: number): void {
			if (this.pollOptions.length > 2) {
				this.pollOptions.splice(index, 1);
				this.pollOptions.forEach((option, i) => {
					if (option.orderIndex === undefined || option.orderIndex === null) {
						option.orderIndex = i;
					}
				});
			}
		},

		async createNewsPoll(): Promise<void> {
			if (!this.isFormValid) return;

			this.loading = true;
			this.message = '';

			try {
				const formData = new FormData();
				if (this.selectedImage) {
					formData.append('file', this.selectedImage);
				}
				Object.keys(this.form).forEach(key => {
					const value = this.form[key as keyof NewsForm];
					if (value) {
						formData.append(key, value);
					}
				});
				formData.append('options', JSON.stringify(this.pollOptions));

				await NewsService.createPoll(formData, this.form.title);
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			} finally {
				this.loading = false;
			}
		},

		resetForm(): void {
			this.form = {
				title: '',
				frenchTitle: '',
				englishTitle: '',
				spanishTitle: '',
				germanTitle: '',
				frenchText: '',
				englishText: '',
				spanishText: '',
				germanText: ''
			};

			this.pollOptions = [
				{ optionText: '', orderIndex: 0 },
				{ optionText: '', orderIndex: 1 }
			];

			this.selectedImage = null;
			this.imagePreview = null;
			this.message = '';

			// Reset du input file
			const fileInput = this.$el.querySelector('input[type="file"]') as HTMLInputElement;
			if (fileInput) {
				fileInput.value = '';
			}
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
		margin-bottom: 10px;
	}

	label {
		display: block;
		margin-bottom: 5px;
		color: #710;
		font-size: 9pt;
	}

	input[type='text'],
	input[type='number'],
	input[type='file'],
	textarea {
		width: calc(100% - 20px);
		padding: 5px;
		margin-top: 5px;
		margin-bottom: 10px;
		border: 1px solid #c88f44;
		background-color: #f3ca92;
		color: #710;
	}

	textarea {
		resize: vertical;
		min-height: 80px;
	}

	input[type='submit'] {
		margin-top: 20px;
		background-color: #c64e36;
		color: #fffdba;
		border: none;
		padding: 10px 20px;
		cursor: pointer;
		border-radius: 5px;

		&:disabled {
			background-color: #999;
			cursor: not-allowed;
		}
	}
}

.title {
	text-transform: uppercase;
	font-weight: bold;
	margin-top: 5px;
}

.poll-option {
	border: 1px solid #bc683c;
	padding: 15px;
	margin-bottom: 10px;
	background-color: rgba(255, 255, 255, 0.1);
	border-radius: 5px;
}

.option-controls {
	align-items: center;
	display: flex;
	flex-direction: row;
	gap: 10px;
	margin-top: 10px;

	input[type='number'] {
		width: 80px;
	}
}

.poll-actions {
	display: flex;
	justify-content: center;
	margin-top: 15px;
}

.form-actions {
	display: flex;
	gap: 15px;
	margin-top: 30px;
	align-items: center;
}

.image-preview {
	margin-top: 10px;

	img {
		max-width: 200px;
		max-height: 200px;
		border-radius: 4px;
		border: 1px solid #bc683c;
	}
}

.message {
	margin-top: 20px;
	padding: 10px;
	border-radius: 4px;

	&.success {
		background-color: #d4edda;
		color: #155724;
		border: 1px solid #c3e6cb;
	}

	&.error {
		background-color: #f8d7da;
		color: #721c24;
		border: 1px solid #f5c6cb;
	}

	&.info {
		background-color: #d1ecf1;
		color: #0c5460;
		border: 1px solid #bee5eb;
	}
}
</style>
