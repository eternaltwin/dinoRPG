<!-- eslint-disable tailwindcss/no-custom-classname -->
<!-- eslint-disable tailwindcss/enforces-negative-arbitrary-values -->
<template>
	<div class="relative bottom-0 -ml-[25px] mt-[15px] sm:ml-0">
		<h3 class="my-[15px] text-3xl font-bold text-[#9a4029] underline" style="font-variant: small-caps">
			{{ $t('roadmap.title') }}
		</h3>
		<ul
			class="my-[10px] ml-0 flex min-h-[530px] list-none flex-col bg-[url('./assets/background/underDevTimelineVertical.webp')] bg-no-repeat pl-[110px] sm:min-h-[85px] sm:flex-row sm:bg-[url('./assets/background/underDevTimeline.webp')]"
		>
			<li
				@click="showTable(1)"
				class="-ml-[80px] mt-[100px] flex w-full cursor-pointer flex-col items-center gap-[10px] pr-[9px] pt-[30px] text-center text-[#9a4029] sm:my-2 sm:ml-0 sm:w-[106px] sm:pt-[15px]"
			>
				<a>
					<small
						class="-mt-[15px] mb-[5px] block h-[17px] text-base font-bold uppercase text-black"
						style="border-bottom: 1px dashed #9a4029"
						>{{ $t('roadmap.small') }}</small
					>
					<strong class="block text-[12px] leading-7 text-[#9a4029]">
						<img class="relative" :src="getImgURL('icons', 'r_world')" alt="world" />
						<span class="ml-[5px]">{{ $t('roadmap.strong.title1') }}</span>
					</strong>
				</a>
			</li>
			<li
				@click="showTable(2)"
				class="-ml-[80px] mt-[35px] flex w-full cursor-pointer flex-col items-center pr-[9px] pt-[30px] text-center sm:my-2 sm:ml-0 sm:w-[106px] sm:pt-[15px]"
			>
				<a>
					<small
						class="-mt-[15px] mb-[5px] block h-[20px] text-base font-bold uppercase text-black"
						style="border-bottom: 1px dashed #9a4029"
						>{{ $t('roadmap.small') }}</small
					>
					<strong class="block text-[12px] leading-7 text-[#9a4029]">
						<img class="relative" :src="getImgURL('icons', 'r_world')" alt="world" />
						<span class="ml-[5px]">{{ $t('roadmap.strong.title2') }}</span>
					</strong>
				</a>
			</li>
			<li
				@click="showTable(3)"
				class="-ml-[80px] mt-[30px] flex w-full cursor-pointer flex-col items-center pr-[9px] pt-[30px] text-center sm:my-2 sm:ml-0 sm:w-[106px] sm:pt-[15px]"
			>
				<a>
					<small
						class="-mt-[15px] mb-[5px] block h-[20px] text-base font-bold uppercase text-black"
						style="border-bottom: 1px dashed #9a4029"
						>{{ $t('roadmap.small') }}</small
					>
					<strong class="block text-[12px] leading-7 text-[#9a4029]">
						<img class="relative" :src="getImgURL('icons', 'r_world')" alt="world" />
						<span class="ml-[5px]">{{ $t('roadmap.strong.title3') }}</span>
					</strong>
				</a>
			</li>
		</ul>
		<div
			class="relative -ml-[10px] w-full sm:ml-[40px] md:ml-[80px] lg:ml-[120px]"
			:style="{ display: showFuturTable ? 'block' : 'none' }"
		>
			<div class="h-[33px] bg-[url('./assets/background/maj_bg_header.webp')] bg-contain bg-no-repeat">
				<div class="relative ml-[45px] text-[12px] uppercase text-[#ffee92] sm:ml-[80px]">
					<img class="mr-[5px]" :src="getImgURL('icons', 'small_sage')" alt="smallsage" />
					<span>{{ $t('roadmap.futurTitle') }}</span>
				</div>
			</div>
			<div class="max-w-[347px] bg-[url('./assets/background/maj_bg.webp')] bg-contain bg-repeat-y">
				<div class="mt-[-16px] block text-[14px] text-[#67220d]">
					<ul class="mt-[4px] flex list-none flex-col">
						<li v-for="(item, index) in futurInfoList" :key="index" class="ml-[10px] mt-[4px]">
							<img
								class="relative"
								v-if="item.imageUrl"
								:src="getImgURL(item.imageUrl.path, item.imageUrl.name)"
								alt="Image"
							/>
							<span v-html="formatContent(item.text)" class="ml-[16px]" />
						</li>
					</ul>
				</div>
			</div>
			<div class="futur-footer"></div>
		</div>
		<div
			class="my-[10px] -ml-[10px] w-full bg-[#bc683c] bg-[url('./assets/icons/small_missAct.webp')] bg-no-repeat p-[5px] pl-[20px] text-[#fce3bc] sm:ml-0"
			style="background-position: 5px 8px"
		>
			<p>{{ $t('roadmap.help') }}</p>
		</div>
		<div class="mx-auto -ml-[10px] p-[5px] text-lg italic text-[#bc683c] sm:ml-0">
			<p>{{ $t('roadmap.disclaimer') }}</p>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'Roadmap',
	data() {
		return {
			showFuturTable: false,
			futurInfoList: [] as { imageUrl: { path: string; name: string }; text: string }[]
		};
	},
	methods: {
		showTable(tableIndex: number) {
			this.showFuturTable = !this.showFuturTable;
			this.updateFuturInfo(tableIndex);
		},
		updateFuturInfo(tableIndex: number) {
			switch (tableIndex) {
				case 1:
					this.futurInfoList = [
						{ imageUrl: { path: 'achievements', name: 'moves' }, text: this.$t('roadmap.futureInfo1.text1') },
						{ imageUrl: { path: 'icons', name: 'small_reput' }, text: this.$t('roadmap.futureInfo1.text2') },
						{ imageUrl: { path: 'icons', name: 'small_missAct' }, text: this.$t('roadmap.futureInfo1.text3') }
					];
					break;
				case 2:
					this.futurInfoList = [
						{ imageUrl: { path: 'achievements', name: 'moves' }, text: this.$t('roadmap.futureInfo2.text1') },
						{ imageUrl: { path: 'icons', name: 'small_reput' }, text: this.$t('roadmap.futureInfo2.text2') }
					];
					break;
				case 3:
					this.futurInfoList = [
						{ imageUrl: { path: 'icons', name: 'small_missAct' }, text: this.$t('roadmap.futureInfo3.text1') }
					];
					break;
				default:
					this.futurInfoList = [];
			}
		}
	}
});
</script>

<style lang="scss" scoped>
.futur-footer {
	&::before {
		content: '';
		display: block;
		background-image: url('../../assets/background/maj_bg_footer.webp');
		min-height: 20px;
		background-size: contain;
		background-repeat: no-repeat;
		background-position: left top;
		max-width: 347px;
	}
}
</style>
