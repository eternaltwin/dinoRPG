<template>
	<TitleHeader :title="`${$t('pageTitle.dinozNaming')}`"></TitleHeader>
	<div class="section -mt-[25px] sm:mt-0 -ml-[25px] sm:ml-0">
		<div class="titlePage">
			<h3>{{ $t(`chooseDinoz.pageName`) }}</h3>
		</div>
	</div>
	<div id="chooseDinozName" class="flex flex-col">
		<div
			class="my-[10px] mt-[5px] -ml-[40px] sm:ml-0 pt-[5px] pr-[5px] pb-[5px] pl-[20px] text-[#fce3bc] text-[10pt] bg-[#bc683c]"
		>
			{{ $t('chooseDinoz.information') }}
		</div>
		<div class="dinoz_display relative w-[175px] h-[130px]">
			<Suspense>
				<DinozWithoutFlash
					:display="dinozData.display"
					:life="1"
					:flip="-1"
					:race="dinozData.race.raceId"
				></DinozWithoutFlash>
				<template #fallback> <Loading /> </template>
			</Suspense>
		</div>
		<div
			class="naming relative top-[-110px] left-[190px] grid w-[310px] h-[70px]"
			style="grid-template-columns: repeat(4, 110px)"
		>
			<p
				class="name w-[95px] pt-[7px] font-bold text-[#ffee92] text-[8.5pt] text-center bg-[#e4aa69] rounded-[10px]"
				style="font-variant: normal"
			>
				{{ $t('chooseDinoz.nomDuDinoz') }}
			</p>
			<input
				class="w-[200px] h-[25px] mt-[5px] px-[8px] pt-[2px] font-bold text-[#ffee92] text-[9pt] border-none outline-none bg-[url('./assets/design/form_field.webp')] bg-no-repeat bg-transparent"
				type="text"
				v-model="name"
			/>
			<a class="button row-[2]" @click="nameDinoz()">{{ $t('button.name') }}</a>
		</div>
	</div>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent, PropType } from 'vue';
import { errorHandler } from '../../utils/index.js';
import { DinozService } from '../../services/index.js';
import { dinozStore } from '../../store/index.js';
import EventBus from '../../events/index.js';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import TitleHeader from '../../components/utils/TitleHeader.vue';
import { formatText } from '../../utils/formatText.js';

export default defineComponent({
	name: 'ChooseDinozName',
	components: {
		TitleHeader,
		DinozWithoutFlash: defineAsyncComponent(() => import('../../components/dinoz/DinozWithoutFlash.vue'))
	},
	data() {
		return {
			dinozStore: dinozStore(),
			name: undefined as string | undefined,
			regexName: /^[a-zA-Z0-9éèêëÉÈÊËîïÎÏôÔûÛ\-']{3,16}$/
		};
	},
	props: {
		dinozData: Object as PropType<DinozFiche>
	},
	emits: ['setNameChoosen'],
	methods: {
		async nameDinoz(): Promise<void> {
			// Check if dinoz name matches regex
			if (this.name && this.regexName.test(this.name)) {
				EventBus.emit('isLoading', true);
				try {
					await DinozService.setDinozName(this.dinozData!.id!, this.name!);
					EventBus.emit('isLoading', false);
				} catch (err) {
					errorHandler.handle(err, this.$toast);
					return;
				}

				// Update dinozList in store
				const dinozList: Array<DinozFiche> = this.dinozStore.getDinozList!;
				const dinozToUpdate = dinozList.find(dinoz => dinoz.id == this.dinozData!.id)!;
				dinozToUpdate.name = this.name;

				this.dinozStore.setDinozList(dinozList);

				// Set parent's data to display dinoz page
				this.$emit('setNameChoosen', this.name);
			} else {
				this.$toast.open({
					message: formatText(this.$t(`toast.OnlyLettersAndNumbers`)),
					type: 'error'
				});
			}
		}
	},
	mounted() {
		EventBus.emit('isLoading', false);
	}
});
</script>

<style lang="scss" scoped>
@media (max-width: 586px) {
	.naming {
		position: initial;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		margin-top: 50px;
		margin-left: -30px;
		width: 250px;
	}
	.name {
		padding: 5px;
	}
	input {
		min-height: 25px;
		padding-top: 0;
	}
	.button {
		min-height: 28px;
	}
	.dinoz_display {
		margin-left: -50px;
	}
	#chooseDinozName {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
	}
}
</style>
