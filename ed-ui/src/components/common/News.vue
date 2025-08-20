<template>
	<div
		:class="news.hide ? 'bloc hide' : 'bloc'"
		v-for="news in displayedBatch"
		:key="news.id"
		@click="news.hide = !news.hide"
	>
		<div class="news">
			<div class="newsTitle">
				<img class="newsImg" :src="getImgURL('background', 'news_image')" alt="Logo News" />
				<div class="newsContent">
					<h1>{{ news.title }}</h1>
					<span>{{ '' + formatCreatedDate(news.createdDate) }}</span>
				</div>
			</div>
			<div class="newsLike" @click.stop="toggleLike(news)">
				<div class="newsCounter">
					<img :src="getImgURL('icons', news.likedByMe ? 'miniIcon_on' : 'miniIcon_off')" alt="icon" />
					<span class="newsCounter">{{ news.likes }}</span>
				</div>
			</div>
		</div>
		<img :src="`${API_BASE}/news/${news.id}/illustration`" :alt="news.title" />
		<p v-html="formatContent(news.text)" />
	</div>
	<a v-if="displayedBatch.length % 10 === 0" class="overload" @click="overload(page + 1)"> {{ $t('news.overload') }}</a>
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
					return news.map(news =>
						this.getBatchData(news.id, news.frenchTitle, news.frenchText, news.createdDate, news.likes, news.likedByMe)
					);
				case 'en':
					return news.map(news =>
						this.getBatchData(
							news.id,
							news.englishTitle,
							news.englishText,
							news.createdDate,
							news.likes,
							news.likedByMe
						)
					);
				case 'de':
					return news.map(news =>
						this.getBatchData(news.id, news.germanTitle, news.germanText, news.createdDate, news.likes, news.likedByMe)
					);
				case 'es':
					return news.map(news =>
						this.getBatchData(
							news.id,
							news.spanishTitle,
							news.spanishText,
							news.createdDate,
							news.likes,
							news.likedByMe
						)
					);
				default:
					return news.map(news =>
						this.getBatchData(news.id, news.frenchTitle, news.frenchText, news.createdDate, news.likes, news.likedByMe)
					);
			}
		},
		getBatchData(
			id: number,
			title: string | null,
			text: string | null,
			createdDate: Date,
			likes: number,
			likedByMe: boolean
		): DisplayedNews {
			return {
				id,
				title: title || '',
				createdDate: createdDate ? new Date(createdDate) : new Date(),
				text: text || '',
				hide: true,
				likes,
				likedByMe
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
			const options = { year: 'numeric', month: 'long', day: 'numeric' } as const;
			return date.toLocaleDateString('fr-FR', options);
		},
		async toggleLike(news: DisplayedNews) {
			try {
				const result = await NewsService.toggleLike(news.id);
				news.likes = result.likes;
				// Updates whether the user has liked or not
				news.likedByMe = result.likedByMe;
			} catch (err) {
				errorHandler.handle(err, this.$toast);
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
	max-height: 50px !important;
	overflow: hidden;
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
	width: 90%;
	align-self: center;
	max-width: 496px;
	background-repeat: repeat-y;
	cursor: pointer;
	margin-bottom: 10px;
	border: 1px solid #ffee92;
	outline: 1px solid #92471f;
	transition: max-height 0.9s ease-out;
	padding: 10px;
	.news {
		display: flex;
		justify-content: space-between;
		align-items: center;
		.newsTitle {
			display: flex;
			gap: 10px;
			.newsImg {
				height: 57px;
				width: 48px;
			}
			.newsContent {
				color: #ffee92;
				display: flex;
				flex-direction: column;
				& h1 {
					height: auto;
					max-height: none;
					text-align: left;
					margin-bottom: 5px;
					font-size: 20pt;
					font-weight: bold;
					line-height: 1em;
					opacity: 0.8;
					background: transparent;
				}
				& span {
					font-size: 7.5pt;
					margin-bottom: 6px;
					opacity: 0.7;
				}
			}
		}
		.newsLike {
			background-image: url('../../assets/design/marker.webp');
			background-repeat: no-repeat;
			display: flex;
			align-items: center;
			margin-top: -20px;
			margin-right: -12px;
			width: 130px;
			height: 70px;
			.newsCounter {
				display: flex;
				color: #ffee92;
				cursor: pointer;
				font-size: 16pt;
				font-weight: bold;
				margin-left: 25px;
				& img {
					height: 26px;
					width: 26px;
				}
				& span {
					margin-left: 6px;
				}
			}
		}
	}
	img {
		max-width: 100%;
		display: block;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 20px;
	}
	p {
		color: white;
		background: transparent;
	}
}
</style>
