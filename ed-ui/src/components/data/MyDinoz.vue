<template>
	<ul style="list-style: none">
		<Tippy v-for="(dinoz, index) in accountData.dinoz" :key="index" theme="small">
			<li class="dinozList">
				<div class="name">
					{{ dinoz.name }}
				</div>
				<div class="dinozInfo">
					{{ $t(`race.name.${raceList[dinoz.raceId]}`) }}
					{{ $t(`myAccount.level`) }} {{ dinoz.level }}
				</div>
				<DinozWithoutFlash
					:style="{
						position: `absolute`,
						left: `${position.noFliped[dinoz.display[1]].left}px`,
						top: `${position.noFliped[dinoz.display[1]].top}px`
					}"
					:display="dinoz.display"
					:life="dinoz.life"
					:flip="1"
				/>
			</li>
			<template #content>
				<template v-for="(status, index) in dinoz.statusList" :key="index">
					<img
						v-if="statusList.displayed[status]"
						:src="getImgURL('status', `fx_${statusList.imgName[status]}`)"
						:alt="statusList.imgName[status]"
					/>
				</template>
			</template>
		</Tippy>
	</ul>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent, PropType } from 'vue';
import { raceList, statusList } from '@/constants';
import { PlayerInfo } from '@/models';
import { dinozPlacement } from '@/constants';

export default defineComponent({
	name: 'MyDinoz',
	components: {
		DinozWithoutFlash: defineAsyncComponent(() => import('@/components/dinoz/dinozWithoutFlash.vue'))
	},
	props: {
		accountData: {
			type: Object as PropType<PlayerInfo>
		}
	},
	data() {
		return {
			raceList: raceList,
			statusList: statusList,
			position: dinozPlacement
		};
	}
});
</script>
<style lang="scss" scoped>
.dinozList {
	float: left;
	position: relative;
	width: 170px;
	height: 175px;
	background-color: #fbdba8;
	margin-bottom: 10px;
	margin-right: 3px;
	cursor: default;
	border: 1px solid #fce3bc;
	border-radius: 10px;
	-moz-border-radius: 10px;
	-webkit-border-radius: 10px;
	&:hover {
		border: 1px solid #f1c98e;
	}
}
.name {
	text-align: center;
	font-weight: bold;
	line-height: 10pt;
	color: #52646b;
	background-color: transparent;
	margin-top: 145px;
}
.dinozInfo {
	text-align: center;
	font-size: 9pt;
	line-height: 10pt;
	color: #bc683c;
	width: 170px;
}
</style>
