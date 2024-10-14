<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
	<div class="ml-[-210px] mt-[-99px] flex min-w-full items-center justify-center sm:ml-0 sm:mt-0 sm:block">
		<div class="fx sm:absolute">
			<div class="fx_top">
				<p>{{ $t('layout.fx') }}</p>
			</div>
			<div class="fx_content">
				<template v-for="(status, index) in dinozStatus" :key="index">
					<Tippy theme="normal" v-if="statusList.displayed[status]">
						<img
							class="mt-[8px]"
							:src="getImgURL('status', `fx_${statusList.imgName[status]}`)"
							:alt="statusList.imgName[status]"
						/>
						<template #content>
							<h1 v-html="formatContent($t(`status.name.${status}`))"></h1>
							<p v-html="formatContent($t(`status.description.${status}`))"></p>
						</template>
					</Tippy>
				</template>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { statusList } from '../../constants/index.js';

export default defineComponent({
	name: 'DinozStatus',
	data() {
		return {
			statusList: statusList
		};
	},
	props: {
		dinozStatus: Array as PropType<Array<number>>
	}
});
</script>

<style lang="scss" scoped>
.fx {
	margin-left: 192px;
	margin-top: 101px;
	width: 223px;
	// display: flex;
	// flex-wrap: wrap;
	background: linear-gradient(180deg, rgba(186, 107, 66, 1) 0%, rgba(211, 152, 96, 1) 100%);
	box-shadow: inset 0 0 1px 2px #d3a76a;
	.fx_top {
		position: relative;
		width: 223px;
		height: 29px;
		background: url('../../assets/background/box_header.webp') no-repeat;
		p {
			color: white;
			padding-left: 2px;
			font-size: 7.5pt;
			position: absolute;
			top: -1.5px;
			text-shadow: 0.5px 0 1px grey;
			text-transform: uppercase;
			font-family: 'Trebuchet MS', Arial, sans-serif;
			font-weight: bold;
		}
	}
	.fx_content {
		height: 77px;
		margin-top: -9px;
		padding-left: 2px;
		border-style: hidden solid solid solid;
		border-width: 0 1px 1px 1px;
		border-color: #9f5841;
	}
	img {
		border: 1px solid transparent;
		border-radius: 5px;
		&:hover {
			border-color: white;
		}
	}
}
</style>
