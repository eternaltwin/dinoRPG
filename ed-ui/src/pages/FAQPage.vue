<template>
	<TitleHeader :title="`${$t('pageTitle.faq')}`" />
	<div class="section ml-[-25px] mt-[-30px] sm:ml-0 sm:mt-0">
		<div class="titlePage">
			<h3>{{ $t(`rightMenu.faq`) }}</h3>
		</div>
	</div>
	<DZDisclaimer help :content="$t(`faq.intro`)" class="ml-[-45px] sm:ml-0" />
	<form
		class="ml-[-40px] mt-[10px] flex w-full flex-col items-center gap-2 sm:ml-0 sm:flex-row"
		@submit.prevent="searchQuestion"
	>
		<input
			class="h-[22px] w-[200px] self-center border-none bg-transparent bg-[url('./assets/background/form_field.webp')] bg-no-repeat px-[8px] pt-[2px] text-[9pt] font-bold text-[#fce3bc] placeholder:text-[#fce3bc]"
			name="search"
			v-model="searchQuery"
			:placeholder="$t(`faq.qa`)"
		/>
		<input type="submit" class="button" :value="$t(`faq.search`)" />
	</form>
	<div class="ml-[-50px] mt-[20px] w-full sm:ml-0">
		<h3 class="mb-[10px] bg-[#bc683c] pl-[10px] text-[#fff1ad]">{{ $t('faq.qa') }}</h3>
		<dl class="mt-[10px] flex flex-col gap-[10px]">
			<template v-for="pair in filteredPairs" :key="pair.id">
				<dt @click="toggleCollapse(pair.id)">
					<span><img :src="getImgURL('icons', 'small_follow')" /></span>
					<p v-html="formatContent(pair.question)" />
				</dt>
				<dd v-show="!pair.collapsed" v-html="formatContent(pair.answer)" />
			</template>
		</dl>
	</div>
</template>
<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import DZDisclaimer from '../components/common/DZDisclaimer.vue';

interface FaqPair {
	id: number;
	question: string;
	answer: string;
	collapsed: boolean;
}

export default defineComponent({
	name: 'FAQ',
	components: {
		TitleHeader,
		DZDisclaimer
	},
	data() {
		const faqPairs = ref<FaqPair[]>([
			{ id: 1, question: this.$t('faq.faq1.question'), answer: this.$t('faq.faq1.answer'), collapsed: true },
			{ id: 2, question: this.$t('faq.faq2.question'), answer: this.$t('faq.faq2.answer'), collapsed: true },
			{ id: 3, question: this.$t('faq.faq8.question'), answer: this.$t('faq.faq8.answer'), collapsed: true },
			{ id: 4, question: this.$t('faq.faq3.question'), answer: this.$t('faq.faq3.answer'), collapsed: true },
			//{ id: 5, question: this.$t('faq.faq9.question'), answer: this.$t('faq.faq9.answer'), collapsed: true },
			{ id: 6, question: this.$t('faq.faq10.question'), answer: this.$t('faq.faq10.answer'), collapsed: true },
			{ id: 7, question: this.$t('faq.faq4.question'), answer: this.$t('faq.faq4.answer'), collapsed: true },
			{ id: 8, question: this.$t('faq.faq5.question'), answer: this.$t('faq.faq5.answer'), collapsed: true },
			{ id: 9, question: this.$t('faq.faq6.question'), answer: this.$t('faq.faq6.answer'), collapsed: true },
			{ id: 10, question: this.$t('faq.faq11.question'), answer: this.$t('faq.faq11.answer'), collapsed: true },
			{ id: 11, question: this.$t('faq.faq12.question'), answer: this.$t('faq.faq12.answer'), collapsed: true },
			{ id: 12, question: this.$t('faq.faq13.question'), answer: this.$t('faq.faq13.answer'), collapsed: true },
			//{ id: 13, question: this.$t('faq.faq14.question'), answer: this.$t('faq.faq14.answer'), collapsed: true },
			//{ id: 14, question: this.$t('faq.faq15.question'), answer: this.$t('faq.faq15.answer'), collapsed: true },
			//{ id: 15, question: this.$t('faq.faq16.question'), answer: this.$t('faq.faq16.answer'), collapsed: true },
			{ id: 16, question: this.$t('faq.faq7.question'), answer: this.$t('faq.faq7.answer'), collapsed: true },
			{ id: 17, question: this.$t('faq.faq17.question'), answer: this.$t('faq.faq17.answer'), collapsed: true },
			{ id: 18, question: this.$t('faq.faq18.question'), answer: this.$t('faq.faq18.answer'), collapsed: true },
			{ id: 19, question: this.$t('faq.faq19.question'), answer: this.$t('faq.faq19.answer'), collapsed: true },
			//{ id: 20, question: this.$t('faq.faq20.question'), answer: this.$t('faq.faq20.answer'), collapsed: true },
			{ id: 21, question: this.$t('faq.faq21.question'), answer: this.$t('faq.faq21.answer'), collapsed: true },
			{ id: 22, question: this.$t('faq.faq22.question'), answer: this.$t('faq.faq22.answer'), collapsed: true },
			{ id: 23, question: this.$t('faq.faq23.question'), answer: this.$t('faq.faq23.answer'), collapsed: true },
			{ id: 24, question: this.$t('faq.faq24.question'), answer: this.$t('faq.faq24.answer'), collapsed: true },
			{ id: 25, question: this.$t('faq.faq25.question'), answer: this.$t('faq.faq25.answer'), collapsed: true },
			//{ id: 26, question: this.$t('faq.faq26.question'), answer: this.$t('faq.faq26.answer'), collapsed: true },
			{ id: 27, question: this.$t('faq.faq27.question'), answer: this.$t('faq.faq27.answer'), collapsed: true },
			{ id: 28, question: this.$t('faq.faq28.question'), answer: this.$t('faq.faq28.answer'), collapsed: true },
			{ id: 29, question: this.$t('faq.faq29.question'), answer: this.$t('faq.faq29.answer'), collapsed: true },
			{ id: 30, question: this.$t('faq.faq30.question'), answer: this.$t('faq.faq30.answer'), collapsed: true }
		]);

		const searchQuery = ref<string>('');

		const toggleCollapse = (id: number) => {
			const pair = faqPairs.value.find(pair => pair.id === id);
			if (pair) {
				pair.collapsed = !pair.collapsed;
			}
		};

		const filteredPairs = computed(() => {
			const searchTerm = searchQuery.value.toLowerCase();
			return faqPairs.value.filter(pair => pair.question.toLowerCase().includes(searchTerm));
		});

		return {
			faqPairs,
			searchQuery,
			toggleCollapse,
			filteredPairs
		};
	}
});
</script>
<style lang="scss" scoped>
dt {
	color: #8e3e26;
	cursor: pointer;
	display: flex;
	font-variant: small-caps;
	font-weight: bold;
	gap: 6px;
	margin-top: 10px;
	padding-left: 20px;
	&:hover {
		background-color: #8e3e26;
		color: #fff1ad;
	}
}
dd {
	background-color: #f3ca92;
	border: 1px solid #fcf9d1;
	display: block;
	margin-inline-start: 40px;
	outline: 2px solid #f8d39c;
	padding: 5px;
	width: 90%;
}
</style>
