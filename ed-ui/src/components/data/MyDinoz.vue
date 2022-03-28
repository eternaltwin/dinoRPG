<template>
	<ul style="list-style:none">
		<Tippy
			v-for="(dinoz, index) in accountData.dinoz"
			:key="index"
			theme="small"
		>
			<li class="dinozList">
				<div class="name">
					{{ dinoz.name }}
				</div>
				<div class="dinozInfo">
					{{ $t(`race.name.${raceList[dinoz.raceId]}`) }}
					{{ $t(`myAccount.level`) }} {{ dinoz.level }}
				</div>
			</li>
			<template #content>
				<template v-for="(status, index) in dinoz.statusList" :key="index">
					<img
						v-if="statusList.displayed[status]"
						:src="getStatusImg(statusList.imgName[status])"
					/>
				</template>
			</template>
		</Tippy>
	</ul>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { raceList, statusList } from '@/constants';
import { PlayerInfo } from '@/models';

export default defineComponent({
	name: 'MyDinoz',
	props: {
		accountData: {
			type: Object as PropType<PlayerInfo>
		}
	},
	data() {
		return {
			raceList: raceList,
			statusList: statusList
		};
	},
	methods: {
		getStatusImg(imgName: string): string {
			return require(`@/assets/status/fx_${imgName}.webp`);
		}
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
}
.dinozInfo {
	text-align: center;
	font-size: 9pt;
	line-height: 10pt;
	color: #bc683c;
	width: 170px;
}
</style>
