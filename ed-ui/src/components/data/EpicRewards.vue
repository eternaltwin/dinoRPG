<template>
	<div class="profil">
		<h3>
			<img :src="getImgURL('design', 'info_button')" alt="info_button" />
			{{ $t(`myAccount.rewards`) }}
			<img :src="getImgURL('design', 'info_button')" alt="info_button" />
		</h3>
		<div class="rewards">
			<template v-for="(reward, index) in epicRewards" :key="index">
				<Tippy theme="normal" v-if="rewardList[reward].displayed">
					<img :src="getImgURL('epicRewards', `collec_${rewardList[reward].name}`)" :alt="rewardList[reward].name" />
					<template #content>
						<h1 v-html="formatContent($t(`rewards.name.${rewardList[reward].name}`))" />
						<p v-html="formatContent($t(`rewards.description.${rewardList[reward].name}`))" />
					</template>
				</Tippy>
			</template>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { rewardList } from '@drpg/core/models/reward/RewardList';

export default defineComponent({
	name: 'EpicRewards',
	data() {
		return {
			rewardList: rewardList
		};
	},
	props: {
		epicRewards: {
			type: Array as PropType<Array<number>>
		}
	}
});
</script>

<style lang="scss" scoped>
.profil {
	background:
		url('../../assets/design/info_header.webp') no-repeat,
		url('../../assets/design/info_footer.webp') no-repeat,
		url('../../assets/design/info_center.webp') repeat-y;
	background-position-y: top, bottom;
	height: auto;
	width: 305px;
	margin-bottom: 10px;
	min-height: 46px;
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
	padding-bottom: 7px;
}
</style>
