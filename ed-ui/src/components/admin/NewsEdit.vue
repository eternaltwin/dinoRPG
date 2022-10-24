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
		<table>
			<tbody>
				<tr>
					<th>Langue</th>
					<th>Texte</th>
				</tr>
				<tr>
					<td>French Title</td>
					<td><textarea v-model="newsEdit.frenchTitle" /></td>
				</tr>
				<tr>
					<td>English Title</td>
					<td><textarea v-model="newsEdit.englishTitle" /></td>
				</tr>
				<tr>
					<td>Spanish Title</td>
					<td><textarea v-model="newsEdit.spanishTitle" /></td>
				</tr>
				<tr>
					<td>German Title</td>
					<td><textarea v-model="newsEdit.germanTitle" /></td>
				</tr>
				<tr>
					<td>French</td>
					<td><textarea v-model="newsEdit.frenchText" /></td>
				</tr>
				<tr>
					<td>English</td>
					<td><textarea v-model="newsEdit.englishText" /></td>
				</tr>
				<tr>
					<td>Spanish</td>
					<td><textarea v-model="newsEdit.spanishText" /></td>
				</tr>
				<tr>
					<td>German</td>
					<td><textarea v-model="newsEdit.germanText" /></td>
				</tr>
			</tbody>
		</table>
		<input type="file" ref="file" @change="upfile" />
		<input type="submit" />
	</form>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { NewsService } from '@/services';
import { AllNews } from '@/models';
import EventBus from '@/events';
import { errorHandler } from '@/utils';

export default defineComponent({
	name: 'NewsEdit',
	data() {
		return {
			newsEdit: {} as Partial<AllNews>,
			batchNews: [] as Array<Partial<AllNews>>,
			formData: new FormData(),
			newSelect: false as boolean
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
			this.formData.delete('file');
			this.formData.append('file', image!.files![0]);
		}
	},
	async mounted(): Promise<void> {
		EventBus.emit('isLoading', true);
		try {
			this.batchNews = await NewsService.getNewsFromPage(1);
			EventBus.emit('isLoading', false);
		} catch (err) {
			errorHandler.handle(err);
			return;
		}
	}
});
</script>

<style lang="scss" scoped>
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
			background-image: url('@/assets/background/table_header.webp');
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
