<template>
	<div id="centerContent">
		<div v-if="nameChoosen === false">
			<choose-dinoz-name
				:dinozData="dinozData"
				@setNameChoosen="setNameChoosen()"
			></choose-dinoz-name>
		</div>
		<div class="dinoz" v-if="nameChoosen === true">
			<a class="left"></a>
			<div class="title">{{ dinozData.name }}</div>
			<a class="right"></a>
			<div class="avatar">
				<dinozSWF
					:display="dinozData.display"
					:width="190"
					:height="165"
					type="dino"
				></dinozSWF>
			</div>
			<div class="level">
				<div class="over">{{ dinozData.level.level }}</div>
			</div>
			<div class="infos">
				<elements
					:fire="dinozData.nbrUpFire"
					:wood="dinozData.nbrUpWood"
					:water="dinozData.nbrUpWater"
					:light="dinozData.nbrUpLight"
					:air="dinozData.nbrUpAir"
				></elements>
			</div>
			<!--<equipement type="dinoz" :objects="dinozData.assDinozObject"></equipement>
			<status :status="dinozData.status"></status>
			<p>Name : {{ dinozData.name }}</p>
			
			<div v-for="action in dinozData.actions" :key="action.name">
				<p>
					<img
						class="actionImg"
						:src="getActionImg(action.imgName)"
						:alt="action.imgName"
					/>
					{{ $t(`action.${action.name}`) }}
				</p>
			</div>-->
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Dinoz } from '@/models';
import { errorHandler } from '@/utils';
import { DinozService } from '@/services';
import { isNil } from 'lodash';
import ChooseDinozName from '@/components/dinoz/chooseDinozName.vue';
//import Equipement from '@/components/equipement/equipement.vue';
//import Status from '@/components/status/status.vue';
import Elements from '@/components/elements/elements.vue';
import DinozSWF from '@/components/dinoz/dinozSWF.vue';

export default defineComponent({
	name: 'DinozPage',
	data() {
		return {
			nameChoosen: undefined as boolean | undefined,
			dinozData: {} as Dinoz
		};
	},
	components: {
		ChooseDinozName,
		//Equipement,
		//Status,
		Elements,
		DinozSWF
	},
	methods: {
		setNameChoosen(): void {
			this.nameChoosen = true;
		},
		getActionImg(imgName: string): string {
			return require(`@/assets/action/${imgName}.png`);
		}
	},
	async mounted(): Promise<void> {
		try {
			const dinozId = this.$route.params.id as string;
			this.dinozData = await DinozService.getDinozFiche(dinozId);
		} catch (err) {
			errorHandler.handle(err);
			return;
		}

		this.nameChoosen = this.dinozData.name !== '?';
	},
	watch: {
		// Reload page if player go on another dinoz page
		'$route.params.id': function(to) {
			if (!isNil(to)) {
				this.$router.go(0);
			}
		}
	}
});
</script>
