<template>
	<div class="wrapper">
		<template v-if="dinozList">
			<div
				v-for="dinoz in dinozList"
				:key="dinoz.dinoz.id"
				:class="['dinoz-button', { fighted: dinoz.fighted }]"
				@click="toggleDinoz(dinoz)"
			>
				<DinozWithoutFlash :display="dinoz.dinoz.display" flip :life="1" />

				<div class="textbox">
					<p class="name">{{ dinoz.dinoz.name }}</p>
					<p class="level">{{ $t('myAccount.level') }} {{ dinoz.dinoz.level }}</p>
				</div>
			</div>
		</template>
		<template v-if="ennemyList">
			<div
				v-for="dinoz in ennemyList"
				:key="dinoz.dinoz.id"
				:class="['dinoz-button', { fighted: dinoz.achieved }]"
				@click="toggleEnnemyDinoz(dinoz)"
			>
				<img
					v-if="dinoz.fighted && !dinoz.achieved"
					class="delete"
					:src="getImgURL('icons', 'small_delete')"
					alt="skip"
					@click.stop="skipOpponent(dinoz.dinoz.id)"
				/>
				<DinozWithoutFlash :display="dinoz.dinoz.display" :life="1" />

				<div class="textbox">
					<p class="name">{{ dinoz.dinoz.name }}</p>
					<p class="level">{{ $t('myAccount.level') }} {{ dinoz.dinoz.level }}</p>
				</div>
			</div>
		</template>
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import DinozWithoutFlash from '../dinoz/DinozWithoutFlash.vue';
import { Dinoz, DojoOpponents, DojoTeam } from '@drpg/prisma';
import { DojoService } from '../../services/DojoService.js';
import { errorHandler } from '../../utils/index.js';

export default defineComponent({
	name: 'CarousselDinoz',
	components: {
		DinozWithoutFlash
	},
	data() {
		return {
			selectedDinoz: undefined as undefined | number
		};
	},
	props: {
		ennemyList: {
			type: Object as PropType<
				(Pick<DojoOpponents, 'fighted' | 'achieved'> & { dinoz: Pick<Dinoz, 'id' | 'name' | 'level' | 'display'> })[]
			>
		},
		dinozList: {
			type: Object as PropType<
				(Pick<DojoTeam, 'fighted'> & { dinoz: Pick<Dinoz, 'id' | 'name' | 'level' | 'display'> })[]
			>
		}
	},
	emits: ['validate', 'refresh'],
	methods: {
		toggleDinoz(dinoz: Pick<DojoTeam, 'fighted'> & { dinoz: Pick<Dinoz, 'id'> }) {
			if (dinoz.fighted) return;
			this.$emit('validate', dinoz.dinoz.id);
		},
		toggleEnnemyDinoz(dinoz: Pick<DojoOpponents, 'fighted' | 'achieved'> & { dinoz: Pick<Dinoz, 'id'> }) {
			if (dinoz.achieved) return;
			this.$emit('validate', dinoz.dinoz.id);
		},
		async skipOpponent(dinozId: number) {
			try {
				await DojoService.skipOpponent(dinozId);
				this.$emit('refresh');
			} catch (e) {
				errorHandler.handle(e, this.$toast);
			}
		}
	},
	async mounted() {}
});
</script>

<style lang="scss" scoped>
.subtitle {
	text-transform: uppercase;
	font-weight: bold;
	text-align: center;
}

.wrapper {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;

	.dinoz-button {
		max-width: 96px;
		margin: 4px;
		border-radius: 5px;
		text-align: center;
		border: 1px solid #874b2e;
		cursor: pointer;
		user-select: none;
		display: flex;
		flex-direction: column;
		background-image: url('../../assets/battle/forcebrut.webp');
		background-repeat: no-repeat;
		background-size: cover;
		background-position-x: center;
		background-position-y: -4px;
		position: relative;

		.delete {
			position: absolute;
			right: 3px;
			top: 3px;

			&:hover {
				filter: brightness(120%);
			}
		}
		.textbox {
			background: rgb(255 249 0);
			background: linear-gradient(180deg, rgb(255 249 0) 0%, rgb(176 153 20) 100%);
			border-top: 1px solid #874b2e;
			border-bottom-left-radius: 5px;
			border-bottom-right-radius: 5px;
			font-size: 10px;
			font-weight: bold;

			.name {
				color: #874b2e;
			}

			.level {
				color: #fce3bc;
			}
		}
	}
	.fighted {
		filter: grayscale(100%);
	}
}
</style>
