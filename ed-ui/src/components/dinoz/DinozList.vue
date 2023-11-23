<template>
	<ul>
		<li
			v-for="(dinoz, index) in dinozList"
			:key="index"
			:class="{
				dead: dinoz.life === 0,
				selected: currentDinozId ? dinoz.id === currentDinozId : dinoz.id === pageId,
				light: true
			}"
		>
			<a @click="goToDinozPage(dinoz.id)">
				<span class="icon">
					<span class="tinyBar">
						<span :style="getLifeBarWidth(dinoz.life, dinoz.maxLife)"></span>
					</span>
				</span>
				<span class="name"
					>{{ dinoz.name }}
					<img
						v-if="dinoz.experience >= dinoz.maxExperience && dinoz.maxExperience !== 0"
						src="../../assets/icons/small_lup.webp"
						v-tippy="{
							content: formatContent($t('levelup.small')),
							theme: 'small'
						}"
						alt="lvlup"
				/></span>
				<em> {{ $t(`place.name.${getPlaceName(dinoz.placeId)}`) }} </em>
			</a>
		</li>
	</ul>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { dinozStore, playerStore } from '../../store/index.js';
import { placeList } from '../../constants/index.js';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { orderDinozList } from '@drpg/core/utils/DinozUtils';

export default defineComponent({
	name: 'DinozList',
	props: {
		currentDinozId: { type: Number, required: false }
	},
	data() {
		return {
			dinozStore: dinozStore(),
			playerStore: playerStore(),
			dinozList: [] as Array<DinozFiche>,
			hasPDA: false as boolean
		};
	},
	methods: {
		goToDinozPage(dinozId: number): void {
			this.$router.push({ name: 'DinozPage', params: { id: dinozId } });
		},
		getLifeBarWidth(life: number, maxLife: number): string {
			const width: number = Math.round((life / maxLife) * 36);
			return `width : ${width}px`;
		},
		getPlaceName(placeId: number): string {
			return placeList.find(place => place.placeId === placeId)!.name;
		}
	},
	computed: {
		storeDinozList(): Array<DinozFiche> {
			if (!this.dinozStore.getDinozList) return [];

			return this.dinozStore.getDinozList;
		},
		pageId(): number {
			return parseInt(this.$route.params.id as string);
		}
	},
	watch: {
		storeDinozList: function (dinozList: Array<DinozFiche>) {
			this.dinozList = orderDinozList(dinozList);
		}
	},
	mounted(): void {
		if (!this.dinozStore.getDinozList) return;

		this.dinozList = this.dinozStore.getDinozList;
		this.hasPDA = this.playerStore.getPlayerOptions!.hasPDA;
	}
});
</script>

<style lang="scss" scoped>
ul {
	list-style: none;
	font-size: 0pt;
	line-height: 0pt;
	margin-bottom: 1px;
	padding: 2px;
	border: 1px solid #d69e68;

	li {
		a {
			border: 1px solid #fbdca5;
			padding: 2px;
			display: block;
			font-size: 10pt;
			line-height: 11pt;
			text-decoration: none;
			cursor: pointer;

			em {
				font-variant: normal;
				font-weight: normal;
				color: #cf8a51;
				font-size: 8pt;
				line-height: 8pt;
				display: block;
				float: left;
				position: relative;
				width: 87px;
			}

			span.name {
				display: block;
				float: left;
				position: relative;
				width: 87px;
				white-space: nowrap;
				overflow: hidden;
				font-weight: bold;
				font-variant: small-caps;
			}

			.icon {
				position: relative;
				width: 40px;
				height: 10px;
				font-size: 0pt;
				line-height: 0pt;
			}
		}

		&.light {
			a {
				height: 25px;

				.icon {
					float: right;

					.tinyBar {
						margin-top: 6px;
					}
				}
			}

			&.dead {
				color: #a52323;
				background-color: #a9a9a9;
				span {
					text-decoration: line-through;
				}
			}

			&.off {
				opacity: 0.3;
			}

			&.selected {
				background-color: #e6b479;
				color: black;
				border-color: black;
				a {
					background-color: #e6b479;
					color: black;
					border-color: black;
				}
				span {
					color: black;
				}
			}

			em {
				width: 150px;
				font-size: 7.5pt;
			}
		}
	}
}
</style>
