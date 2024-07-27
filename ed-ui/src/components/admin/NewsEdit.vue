<template>
	<label for="news">Select a news to edit : </label>
	<select id="news" v-model="newsEdit" @change="newSelect = true">
		<template v-for="(news, index) in batchNews" :key="index">
			<option :value="news">{{ news.title }}</option>
		</template></select
	><br />
	<label for="createNews">Or type the name to create a news : </label>
	<input id="createNews" v-model="newsEdit.title" type="text" />
	<form @submit.prevent="submit()" v-if="newsEdit.title">
		<fieldset>
			<legend>Title News</legend>
			<div>
				<label for="frenchTitle" class="title">French Title :</label>
				<textarea id="frenchTitle" v-model="newsEdit.frenchTitle" />
			</div>
			<div>
				<label for="englishTitle" class="title">English Title :</label>
				<textarea id="englishTitle" v-model="newsEdit.englishTitle" />
			</div>
			<div>
				<label for="spanishTitle" class="title">Spanish Title :</label>
				<textarea id="spanishTitle" v-model="newsEdit.spanishTitle" />
			</div>
			<div>
				<label for="germanTitle" class="title">Spanish Title :</label>
				<textarea id="germanTitle" v-model="newsEdit.germanTitle" />
			</div>
		</fieldset>
		<fieldset>
			<legend>Text News</legend>
			<div>
				<label for="frenchText" class="title">French Text :</label>
				<textarea id="frenchText" v-model="newsEdit.frenchText" />
			</div>
			<div>
				<label for="englishText" class="title">English Text :</label>
				<textarea id="englishText" v-model="newsEdit.englishText" />
			</div>
			<div>
				<label for="spanishText" class="title">Spanish Text :</label>
				<textarea id="spanishText" v-model="newsEdit.spanishText" />
			</div>
			<div>
				<label for="germanText" class="title">German Text :</label>
				<textarea id="germanText" v-model="newsEdit.germanText" />
			</div>
		</fieldset>
		<fieldset>
			<legend>File News</legend>
			<div>
				<input type="file" ref="file" @change="upfile" />
				<img
					v-if="filePreviewUrl"
					:src="filePreviewUrl"
					alt="File Preview"
					style="max-width: 300px; max-height: 300px"
				/>
			</div>
		</fieldset>
		<input type="submit" />
	</form>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { NewsService } from '../../services/index.js';
import { AllNews } from '@drpg/core/models/news/AllNews';
import EventBus from '../../events/index.js';
import { errorHandler } from '../../utils/index.js';
import { NewsGetResponse } from '@drpg/core/returnTypes/News';

export default defineComponent({
	name: 'NewsEdit',
	data() {
		return {
			newsEdit: {} as Partial<AllNews>,
			batchNews: [] as NewsGetResponse,
			formData: new FormData(),
			newSelect: false as boolean,
			filePreviewUrl: ''
		};
	},
	methods: {
		async submit(): Promise<void> {
			if (this.newsEdit.frenchText) {
				this.formData.delete('frenchText');
				this.formData.append('frenchText', this.newsEdit.frenchText);
			}
			if (this.newsEdit.englishText) {
				this.formData.delete('englishText');
				this.formData.append('englishText', this.newsEdit.englishText);
			}
			if (this.newsEdit.spanishText) {
				this.formData.delete('spanishText');
				this.formData.append('spanishText', this.newsEdit.spanishText);
			}
			if (this.newsEdit.germanText) {
				this.formData.delete('germanText');
				this.formData.append('germanText', this.newsEdit.germanText);
			}
			if (this.newsEdit.frenchTitle) {
				this.formData.delete('frenchTitle');
				this.formData.append('frenchTitle', this.newsEdit.frenchTitle);
			}
			if (this.newsEdit.englishTitle) {
				this.formData.delete('englishTitle');
				this.formData.append('englishTitle', this.newsEdit.englishTitle);
			}
			if (this.newsEdit.spanishTitle) {
				this.formData.delete('spanishTitle');
				this.formData.append('spanishTitle', this.newsEdit.spanishTitle);
			}
			if (this.newsEdit.germanTitle) {
				this.formData.delete('germanTitle');
				this.formData.append('germanTitle', this.newsEdit.germanTitle);
			}
			if (this.batchNews.find(news => news.title === this.newsEdit.title)) {
				if (this.newSelect) {
					await NewsService.updateNews(this.formData, this.newsEdit.title!);
					this.$router.go(0);
				} else {
					alert(
						'A recent news with this title already exist. If you wish to edit this existing news, please select it in the drop-down menu.'
					);
					return;
				}
			} else {
				await NewsService.createNews(this.formData, this.newsEdit.title!);
				this.$router.go(0);
			}
		},
		upfile(): void {
			const image = this.$refs.file! as HTMLInputElement;
			const file = image.files![0];

			if (file) {
				const reader = new FileReader();
				reader.onload = e => {
					this.filePreviewUrl = e.target!.result as string;
				};
				reader.readAsDataURL(file);
				this.formData.delete('file');
				this.formData.append('file', image!.files![0]);
			}
		}
	},
	async mounted(): Promise<void> {
		EventBus.emit('isLoading', true);
		try {
			this.batchNews = await NewsService.getNewsFromPage(1);
			EventBus.emit('isLoading', false);
		} catch (err) {
			errorHandler.handle(err, this.$toast);
			return;
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
	textarea {
		width: calc(100% - 20px);
		padding: 5px;
		margin-top: 5px;
		margin-bottom: 10px;
		border: 1px solid #c88f44;
		background-color: #f3ca92;
		color: #710;
	}
	input[type='submit'],
	input[type='file'] {
		margin-top: 20px;
		background-color: #c64e36;
		color: #fffdba;
		border: none;
		padding: 10px 20px;
		cursor: pointer;
		border-radius: 5px;
	}
}
input[type='text'],
select {
	padding: 5px;
	margin-top: 5px;
	margin-bottom: 10px;
	border: 1px solid #c88f44;
	background-color: #f3ca92;
	color: #710;
}
.title {
	text-transform: uppercase;
	font-weight: bold;
	margin-top: 5px;
}
</style>
