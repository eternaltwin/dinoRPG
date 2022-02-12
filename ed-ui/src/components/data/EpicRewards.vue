<template>
	<div class="profil">
		<h3>
			<img :src="getImg('design', 'info_', 'button')" />
			{{ $t(`myAccount.rewards`) }}
			<img :src="getImg('design', 'info_', 'button')" />
		</h3>
		<div class="rewards">
			<template v-for="(rewards, index) in epicRewards" :key="index">
				<Tippy theme="normal">
					<img :src="getEpicImg(epicList.imgName[rewards])" />
					<template #content>
						<h1
							v-html="
								formatContent($t(`rewards.name.${epicList.imgName[rewards]}`))
							"
						/>
						<p
							v-html="
								formatContent(
									$t(`rewards.description.${epicList.imgName[rewards]}`)
								)
							"
						/>
					</template>
				</Tippy>
			</template>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { epicList } from '@/constants';

export default defineComponent({
	name: 'EpicRewards',
	data() {
		return {
			epicList: epicList
		};
	},
	props: {
		epicRewards: {
			type: Array as PropType<Array<number>>
		}
	},
	methods: {
		getImg(folder: string, imgPrefix: string, imgName: string): string {
			return require(`@/assets/${folder}/${imgPrefix}${imgName}.gif`);
		},
		getEpicImg(imgName: string): string {
			return require(`@/assets/epicRewards/collec_${imgName}.webp`);
		}
	}
});
</script>

<style lang="scss" scoped>
.profil {
	background: url('../../assets/design/info_header.gif') no-repeat,
		url('../../assets/design/info_footer.gif') no-repeat,
		url('../../assets/design/info_center.gif') repeat-y;
	background-position-y: top, bottom;
	height: auto;
	width: 304px;
	margin-bottom: 10px;
	h3 {
		display: flex;
		justify-content: space-evenly;
		padding-top: 3px;
		font-family: Arial, sans-serif;
		font-size: 10pt;
		font-style: normal;
		font-variant-caps: small-caps;
		font-weight: 400;
		text-align: center;
		color: #ffee92; //!important;
		text-shadow: 1px 1px 1px #383522;
		img {
			height: 7px;
			width: 7px;
			padding-top: 5px;
		}
	}
	dl {
		// position: absolute;
		width: 245px;
		margin-left: 30px;
		margin-top: 10px;
		dt {
			float: left;
			position: relative;
			width: 85px;
			height: 19px;
			font-weight: bold;
			font-size: 9pt;
			font-variant: small-caps;
			color: #ffee92;
		}
		dd {
			min-height: 19px;
			height: auto;
			font-size: 10pt;
			text-align: right;
			color: #fce3bb;
			a {
				color: white;
				font-weight: normal;
			}
		}
	}
}
.rewards {
	padding-top: 10px;
	padding-left: 5px;
}
</style>
