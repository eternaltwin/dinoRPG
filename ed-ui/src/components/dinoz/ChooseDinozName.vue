<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
	<TitleHeader :title="`${$t('pageTitle.dinozNaming')}`"></TitleHeader>
	<div class="section ml-[-25px] mt-[-25px] sm:ml-0 sm:mt-0">
		<div class="titlePage">
			<h3>{{ $t(`chooseDinoz.pageName`) }}</h3>
		</div>
	</div>
	<div id="chooseDinozName" class="flex flex-col">
		<div
			class="my-[10px] ml-[-40px] mt-[5px] bg-[#bc683c] py-[5px] pl-[20px] pr-[5px] text-[10pt] text-[#fce3bc] sm:ml-0"
		>
			{{ $t('chooseDinoz.information') }}
		</div>
		<div class="dinoz_display relative h-[130px] w-[175px]">
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
			class="naming relative left-[190px] top-[-110px] grid h-[70px] w-[310px]"
			style="grid-template-columns: repeat(4, 110px)"
		>
			<p
				class="name w-[95px] rounded-[10px] bg-[#e4aa69] pt-[7px] text-center text-[8.5pt] font-bold text-[#ffee92]"
				style="font-variant: normal"
			>
				{{ $t('chooseDinoz.nomDuDinoz') }}
			</p>
			<input
				class="mt-[5px] h-[25px] w-[200px] border-none bg-transparent bg-[url('./assets/design/form_field.webp')] bg-no-repeat px-[8px] pt-[2px] text-[9pt] font-bold text-[#ffee92] outline-none"
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
