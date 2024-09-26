<template>
	<div class="relative bottom-0 mt-[15px] -ml-[25px] sm:ml-0">
		<h3 class="my-[15px] font-bold text-3xl text-[#9a4029] underline" style="font-variant: small-caps">
			{{ $t('roadmap.title') }}
		</h3>
		<ul
			class="flex flex-col sm:flex-row min-h-[530px] sm:min-h-[85px] ml-0 my-[10px] pl-[110px] list-none bg-[url('./assets/background/underDevTimelineVertical.webp')] sm:bg-[url('./assets/background/underDevTimeline.webp')] bg-no-repeat"
		>
			<li
				@click="showTable(1)"
				class="flex flex-col gap-[10px] items-center w-full sm:w-[106px] text-[#9a4029] text-center -ml-[80px] sm:ml-0 mt-[105px] sm:my-2 pr-[9px] pt-[30px] sm:pt-[15px] cursor-pointer"
			>
				<a>
					<small
						class="block h-[17px] -mt-[15px] mb-[5px] text-black text-base font-bold uppercase"
						style="border-bottom: 1px dashed #9a4029"
						>{{ $t('roadmap.small') }}</small
					>
					<strong class="block text-[12px] text-[#9a4029] leading-7">
						<img class="relative" :src="getImgURL('icons', 'r_world')" alt="world" />
						<span class="ml-[5px]">{{ $t('roadmap.strong.title1') }}</span>
					</strong>
				</a>
			</li>
			<li
				@click="showTable(2)"
				class="flex flex-col items-center w-full sm:w-[106px] text-center -ml-[80px] sm:ml-0 mt-[50px] sm:my-2 pr-[9px] pt-[30px] sm:pt-[15px] cursor-pointer"
			>
				<a>
					<small
						class="block h-[20px] -mt-[15px] mb-[5px] text-black text-base font-bold uppercase"
						style="border-bottom: 1px dashed #9a4029"
						>{{ $t('roadmap.small') }}</small
					>
					<strong class="block text-[12px] text-[#9a4029] leading-7">
						<img class="relative" :src="getImgURL('icons', 'r_world')" alt="world" />
						<span class="ml-[5px]">{{ $t('roadmap.strong.title2') }}</span>
					</strong>
				</a>
			</li>
			<li
				@click="showTable(3)"
				class="flex flex-col items-center w-full sm:w-[106px] text-center -ml-[80px] sm:ml-0 mt-[50px] sm:my-2 pr-[9px] pt-[30px] sm:pt-[15px] cursor-pointer"
			>
				<a>
					<small
						class="block h-[20px] -mt-[15px] mb-[5px] text-black text-base font-bold uppercase"
						style="border-bottom: 1px dashed #9a4029"
						>{{ $t('roadmap.small') }}</small
					>
					<strong class="block text-[12px] text-[#9a4029] leading-7">
						<img class="relative" :src="getImgURL('icons', 'r_world')" alt="world" />
						<span class="ml-[5px]">{{ $t('roadmap.strong.title3') }}</span>
					</strong>
				</a>
			</li>
		</ul>
		<div
			class="relative w-full -ml-[10px] sm:ml-[40px] md:ml-[80px] lg:ml-[120px]"
			:style="{ display: showFuturTable ? 'block' : 'none' }"
		>
			<div class="futur-header bg-no-repeat bg-contain h-[33px]">
				<div class="relative uppercase text-[12px] text-[#ffee92] ml-[45px] sm:ml-[80px]">
					<img class="mr-[5px]" :src="getImgURL('icons', 'small_sage')" alt="smallsage" />
					<span>{{ $t('roadmap.futurTitle') }}</span>
				</div>
			</div>
			<div class="futur-desc bg-repeat-y bg-contain max-w-[347px]">
				<div class="text-[#67220d] block text-[14px] mt-[-16px]">
					<ul class="flex flex-col list-none mt-[4px]">
						<li v-for="(item, index) in futurInfoList" :key="index" class="mt-[4px] ml-[10px]">
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
			class="w-full my-[10px] -ml-[10px] sm:ml-0 p-[5px] pl-[20px] text-[#fce3bc] bg-[#bc683c] bg-[url('./assets/icons/small_missAct.webp')] bg-no-repeat"
			style="background-position: 5px 8px"
		>
			<p>{{ $t('roadmap.help') }}</p>
		</div>
		<div class="mx-auto -ml-[10px] sm:ml-0 p-[5px] text-lg text-[#bc683c] italic">
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
.futur-header {
	background-image: url('../../assets/background/maj_bg_header.webp');
}
.futur-desc {
	background-image: url('../../assets/background/maj_bg.webp');
}
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
