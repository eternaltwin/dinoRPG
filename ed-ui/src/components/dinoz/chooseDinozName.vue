<template>
	<div id="chooseDinozName">
		<p>{{ $t('chooseDinoz.information') }}</p>
		<dinozSWF
			:display="dinozData.display"
			:width="190"
			:height="165"
			type="dino"
		></dinozSWF>
		<p>{{ $t('chooseDinoz.nomDuDinoz') }}</p>
		<input type="text" v-model="name" />
		<button @click="nameDinoz()">{{ $t('bouton.nommer') }}</button>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { errorHandler } from '@/utils';
import { DinozService } from '@/services';
import { Dinoz } from '@/models';
import store from '@/store';
import DinozSWF from '@/components/dinoz/dinozSWF.vue';

export default defineComponent({
	name: 'ChooseDinozName',
	data() {
		return {
			name: undefined as string | undefined,
			regexName: /^[a-zA-Z0-9éèêëÉÈÊËîïÎÏôÔûÛ\-']{3,}$/
		};
	},
	props: {
		dinozData: Object
	},
	components: {
		DinozSWF
	},
	emits: ['setNameChoosen'],
	methods: {
		async nameDinoz(): Promise<void> {
			// Check if dinoz name matches regex
			if (this.regexName.test(this.name!)) {
				try {
					await DinozService.setDinozName(this.dinozData!.dinozId, this.name!);
				} catch (err) {
					errorHandler.handle(err);
					return;
				}

				console.log(this.dinozData);

				// Update dinozList in store
				const dinozList: Array<Dinoz> = store.getters.getDinozList;
				const dinozToUpdate = dinozList.find(
					dinoz => dinoz.dinozId == this.dinozData!.dinozId
				)!;
				dinozToUpdate.name = this.name;

				store.commit('setDinozList', dinozList);

				// Set parent's data to display dinoz page
				this.$emit('setNameChoosen');
			} else {
				// TODO : afficher popin d'erreur
				console.log('Seulement chiffres et lettres ! ');
			}
		}
	}
});
</script>
