<template>
	<div
		:class="news.hide ? 'bloc max-h-[76px] overflow-hidden' : 'bloc'"
		class="w-full bg-repeat-y bg-cover cursor-pointer mb-[10px] mr-[11px] -ml-[25px] sm:ml-0 border border-[#ffee92] transition-[max-height] duration-900 ease-out p-[10px]"
		v-for="news in displayedBatch"
		:key="news.id"
		@click="news.hide = !news.hide"
	>
		<div class="grid mb-[10px]" style="grid-template-columns: 0.5fr 3fr">
			<img class="w-[57px] h-[57px] pr-[15px]" :src="getImgURL('background', 'news_image')" alt="Logo News" />
			<div class="newsContent flex flex-col text-[#ffee92]">
				<h1 class="h-auto mb-[5px] font-bold text-5xl">{{ news.title }}</h1>
				<span class="mb-[6px] opacity-70 text-xl">{{ '' + formatCreatedDate(news.createdDate) }}</span>
			</div>
		</div>
		<img class="block mx-auto mb-[20px]" :src="`${API_BASE}/news/${news.id}/illustration`" />
		<div class="news-content flex flex-col text-white">
			<p v-html="formatContent(news.text)" />
		</div>
		<div class="flex mt-[15px]">
			<a class="flex gap-[5px] font-extrabold text-xl text-[#ffee92] cursor-pointer">
				<img :src="getImgURL('icons', 'miniIcon_off')" alt="icon" />
				0
			</a>
		</div>
	</div>
	<a
		v-if="displayedBatch.length % 10 === 0"
		class="overload block m-[10px] p-[2px] -ml-[25px] sm:ml-0 text-[#9a4029] text-center cursor-pointer"
		@click="overload(page + 1)"
	>
		{{ $t('news.overload') }}</a
	>
	<Roadmap></Roadmap>
</template>

<script lang="ts">
import { DisplayedNews } from '@drpg/core/models/news/DisplayedNews';
import { defineComponent } from 'vue';
import EventBus from '../../events/index.js';
import { NewsService } from '../../services/index.js';
import { localStore } from '../../store/index.js';
import { API_BASE, errorHandler } from '../../utils/index.js';
import { NewsGetResponse } from '@drpg/core/returnTypes/News';
import Roadmap from './Roadmap.vue';

export default defineComponent({
	name: 'News',
	components: {
		Roadmap
	},
	data() {
		return {
			localStore: localStore(),
			batch: [] as NewsGetResponse,
			displayedBatch: [] as DisplayedNews[],
			page: 1,
			API_BASE
		};
	},
	computed: {
		language() {
			return this.localStore.getLanguage;
		}
	},
	methods: {
		transformLanguage(news: NewsGetResponse) {
			switch (this.localStore.getLanguage) {
				case 'fr':
					return news.map(news => this.getBatchData(news.id, news.frenchTitle, news.frenchText, news.createdDate));
				case 'en':
					return news.map(news => this.getBatchData(news.id, news.englishTitle, news.englishText, news.createdDate));
				case 'de':
					return news.map(news => this.getBatchData(news.id, news.germanTitle, news.germanText, news.createdDate));
				case 'es':
					return news.map(news => this.getBatchData(news.id, news.spanishTitle, news.spanishText, news.createdDate));
				default:
					return news.map(news => this.getBatchData(news.id, news.frenchTitle, news.frenchText, news.createdDate));
			}
		},
		getBatchData(id: number, title: string | null, text: string | null, createdDate: Date): DisplayedNews {
			return {
				id,
				title: title || '',
				createdDate: createdDate ? new Date(createdDate) : new Date(),
				text: text || '',
				hide: true
			};
		},
		async overload(page: number) {
			EventBus.emit('isLoading', true);
			try {
				const newLoad = await NewsService.getNewsFromPage(page);
				this.displayedBatch.push(...this.transformLanguage(newLoad));
				this.page++;
				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return Promise.reject(err);
			}
		},
		async getFirstNews() {
			EventBus.emit('isLoading', true);
			try {
				this.batch = await NewsService.getNewsFromPage(this.page);
				this.displayedBatch = this.transformLanguage(this.batch);
				if (this.displayedBatch.length !== 0) {
					this.displayedBatch[0].hide = false;
				}
				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return Promise.reject(err);
			}
		},
		formatCreatedDate(date: Date): string {
			const options = { year: 'numeric', month: 'long', day: 'numeric' };
			return date.toLocaleDateString('fr-FR', options);
		}
	},
	async mounted() {
		await this.getFirstNews();
	},
	watch: {
		language() {
			this.page = 1;
			this.getFirstNews();
		}
	}
});
</script>

<style lang="scss" scoped>
.bloc {
	background-image: url('../../assets/background/bloc_news.webp');
	outline: 1px solid #92471f;
}
</style>
