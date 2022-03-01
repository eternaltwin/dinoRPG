<template>
	<div id="chooseDinozName">
		<p>{{ $t('chooseDinoz.information') }}</p>
		<p>{{ $t('chooseDinoz.nomDuDinoz') }}</p>
		<input type="text" v-model="name" />
		<button @click="nameDinoz()">{{ $t('button.name') }}</button>
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { errorHandler } from '@/utils';
import { DinozService } from '@/services';
import { Dinoz } from '@/models';
import { sessionStore } from '@/store';
import EventBus from '@/events';

export default defineComponent({
	name: 'ChooseDinozName',
	data() {
		return {
			name: undefined as string | undefined,
			regexName: /^[a-zA-Z0-9éèêëÉÈÊËîïÎÏôÔûÛ\-']{3,16}$/
		};
	},
	props: {
		dinozData: Object as PropType<Dinoz>
	},
	emits: ['setNameChoosen'],
	methods: {
		async nameDinoz(): Promise<void> {
			// Check if dinoz name matches regex
			if (this.regexName.test(this.name!)) {
				EventBus.emit('isLoading', true);
				try {
					await DinozService.setDinozName(this.dinozData!.dinozId!, this.name!);
					EventBus.emit('isLoading', false);
				} catch (err) {
					errorHandler.handle(err);
					return;
				}

				// Update dinozList in store
				const dinozList: Array<Dinoz> = sessionStore.getters.getDinozList;
				const dinozToUpdate = dinozList.find(
					dinoz => dinoz.dinozId == this.dinozData!.dinozId
				)!;
				dinozToUpdate.name = this.name;

				sessionStore.commit('setDinozList', dinozList);

				// Set parent's data to display dinoz page
				this.$emit('setNameChoosen', this.name);
			} else {
				// TODO : afficher popin d'erreur
				console.log('Seulement chiffres et lettres ! ');
			}
		}
	}
});
</script>
