<template>
	<div
		:class="news.hide ? 'bloc hide' : 'bloc'"
		v-for="(news, index) in displayedBatch"
		:key="index"
		@click="news.hide = !news.hide"
		:id="index"
	>
		<h1>{{ news.title }}</h1>
		<img v-if="news.image" :src="`data:image/webp;base64,${transformImage(news.image.data)}`" />
		<p v-html="news.text" />
	</div>
	<a v-if="displayedBatch.length % 10 === 0" class="overload" @click="overload(page + 1)"> {{ $t('news.overload') }}</a>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import EventBus from '@/events';
import { NewsService } from '@/services';
import { errorHandler } from '@/utils';
import { AllNews, Image, News } from '@/models';
import { localStore } from '@/store';

export default defineComponent({
	name: 'News',
	data() {
		return {
			localStore: localStore(),
			batch: [] as Array<Partial<AllNews>>,
			displayedBatch: [] as Array<Partial<News>>,
			page: 1 as number
		};
	},
	computed: {
		language(): string | undefined {
			return this.localStore.getLanguage;
		}
	},
	methods: {
		transformLanguage(news: Array<Partial<AllNews>>): Array<Partial<News>> {
			switch (this.localStore.getLanguage) {
				case 'fr':
					return news.map(news => this.getBatchData(news.frenchTitle!, news.image!, news.frenchText!));
				case 'en':
					return news.map(news => this.getBatchData(news.englishTitle!, news.image!, news.englishText!));
				case 'de':
					return news.map(news => this.getBatchData(news.germanTitle!, news.image!, news.germanText!));
				case 'es':
					return news.map(news => this.getBatchData(news.spanishTitle!, news.image!, news.spanishText!));
				default:
					return news.map(news => this.getBatchData(news.frenchTitle!, news.image!, news.frenchText!));
			}
		},
		getBatchData(title: string, image: Image, text: string): News {
			return {
				title: title,
				image: image,
				text: text,
				hide: true
			};
		},
		transformImage(image: Array<number>): string {
			return btoa(image.reduce((data: string, byte: number) => data + String.fromCharCode(byte), ''));
		},
		async overload(page: number): Promise<void> {
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
		async getFirstNews(): Promise<void> {
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
	async mounted(): Promise<void> {
		await this.getFirstNews();
	},
	watch: {
		language(): void {
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
	&:hover {
		color: yellow;
	}
}
.bloc {
	background-image: url('~@/assets/background/bloc_news.jpg');
	background-repeat: repeat-y;
	margin-bottom: 10px;
	margin-right: 10px;
	border: 1px solid #ffee92;
	outline: 1px solid #92471f;
	transition: max-height 0.9s ease-out;
	max-height: 250px;
	padding: 10px;
	h1 {
		height: auto;
		max-height: none;
		text-align: left;
		margin-bottom: 5px;
		font-size: 20pt;
		font-weight: bold;
		opacity: 0.8;
		filter: alpha(opacity=80);
		zoom: 1;
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
		filter: alpha(opacity=80);
		zoom: 1;
		color: white;
		background: transparent;
	}
}
</style>
