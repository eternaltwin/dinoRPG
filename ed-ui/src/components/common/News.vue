<template>
	<div
		:class="news.hide ? 'bloc hide' : 'bloc'"
		v-for="news in displayedBatch"
		:key="news.id"
		@click="news.hide = !news.hide"
	>
		<h1>{{ news.title }}</h1>
		<img :src="`${API_BASE}/news/${news.id}/illustration`" />
		<p v-html="news.text" />
	</div>
	<a v-if="displayedBatch.length % 10 === 0" class="overload" @click="overload(page + 1)"> {{ $t('news.overload') }}</a>
</template>

<script lang="ts">
import { DisplayedNews } from '@drpg/core/models/news/DisplayedNews';
import { defineComponent } from 'vue';
import EventBus from '../../events/index.js';
import { NewsService } from '../../services/index.js';
import { localStore } from '../../store/index.js';
import { API_BASE, errorHandler } from '../../utils/index.js';
import { NewsGetResponse } from '@drpg/core/returnTypes/News';

export default defineComponent({
	name: 'News',
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
					return news.map(news => this.getBatchData(news.id, news.frenchTitle, news.frenchText));
				case 'en':
					return news.map(news => this.getBatchData(news.id, news.englishTitle, news.englishText));
				case 'de':
					return news.map(news => this.getBatchData(news.id, news.germanTitle, news.germanText));
				case 'es':
					return news.map(news => this.getBatchData(news.id, news.spanishTitle, news.spanishText));
				default:
					return news.map(news => this.getBatchData(news.id, news.frenchTitle, news.frenchText));
			}
		},
		getBatchData(id: number, title: string | null, text: string | null): DisplayedNews {
			return {
				id,
				title: title || '',
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
				errorHandler.handle(err);
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
				errorHandler.handle(err);
				return Promise.reject(err);
			}
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
.hide {
	max-height: 25px !important;
	overflow: hidden;
	img {
		max-height: 0 !important;
	}
	p {
		display: none;
	}
}
.overload {
	display: block;
	text-align: center;
	margin: 10px;
	padding: 2px;
	cursor: pointer;
}
.bloc {
	background-image: url('../../assets/background/bloc_news.webp');
	background-repeat: repeat-y;
	margin-bottom: 10px;
	margin-right: 11px;
	border: 1px solid #ffee92;
	outline: 1px solid #92471f;
	transition: max-height 0.9s ease-out;
	padding: 10px;
	h1 {
		height: auto;
		max-height: none;
		text-align: left;
		margin-bottom: 5px;
		font-size: 20pt;
		font-weight: bold;
		opacity: 0.8;
		color: white;
		background: transparent;
	}
	img {
		max-width: 495px;
		display: block;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 10px;
	}

	p {
		color: white;
		background: transparent;
	}
}
</style>
