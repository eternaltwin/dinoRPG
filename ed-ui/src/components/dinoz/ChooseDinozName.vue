<template>
	<TitleHeader :title="`${$t('pageTitle.dinozNaming')}`"></TitleHeader>
	<div class="section">
		<div class="titlePage">
			<h3>{{ $t(`chooseDinoz.pageName`) }}</h3>
		</div>
	</div>
	<div id="chooseDinozName">
		<div class="disclaimer">{{ $t('chooseDinoz.information') }}</div>
		<div class="dinoz_display">
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
		<div class="naming">
			<p class="name">{{ $t('chooseDinoz.nomDuDinoz') }}</p>
			<input type="text" v-model="name" />
			<a class="button" @click="nameDinoz()">{{ $t('button.name') }}</a>
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
					errorHandler.handle(err, this.$toast, this.$t);
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
.naming {
	position: relative;
	top: -110px;
	left: 190px;
	width: 310px;
	height: 60px;
	display: grid;
	grid-template-columns: repeat(4, 110px);
}
.name {
	width: 95px;
	text-align: center;
	font-variant: normal;
	font-weight: bold;
	font-size: 8pt;
	color: #ffee92;
	background-color: #e4aa69;
	border-radius: 10px;
	-webkit-border-radius: 10px;
	grid-column: 1;
	grid-row: 1;
}
input {
	width: 184px;
	height: 20px;
	padding-left: 8px;
	padding-right: 8px;
	padding-top: 2px;
	color: #ffee92;
	font-size: 9pt;
	font-weight: bold;
	border: none;
	background-image: url('../../assets/design/form_field.webp');
	background-repeat: no-repeat;
	background-color: transparent;
	grid-column: 2 / 4;
	grid-row: 1;
}
.button {
	grid-row: 2;
	grid-column: 1 / 2;
}
.dinoz_display {
	position: relative;
	height: 130px;
	width: 175px;
}
.disclaimer {
	margin-top: 10px;
	margin-bottom: 10px;
	padding: 5px 5px 5px 20px;
	color: #fce3bc;
	font-size: 10pt;
	background-color: #bc683c;
	background-position: 5px 8px;
	background-repeat: no-repeat;
	flex-grow: 2;
}
</style>
