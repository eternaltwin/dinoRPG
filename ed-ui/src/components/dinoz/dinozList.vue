<template>
	<ul>
		<li class="light" v-for="(dinoz, index) in dinozList" :key="index">
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
						src="@/assets/icons/small_lup.webp"
						v-tippy="{
							content: formatContent($t('levelup.small')),
							theme: 'small'
						}"
						alt="lvlup"
				/></span>
				<em> {{ $t(`place.name.${getPlaceName(dinoz.placeId)}`) }} </em>
			</a>
			<!--<SDinozSWF
			:display="dinoz.display"
			:flip="1"
			:width="40"
			:height="40"
			type="sdino"
		></SDinozSWF>-->
		</li>
	</ul>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Dinoz } from '@/models';
import { sessionStore } from '@/store';
import { placeList } from '@/constants';
// import SDinozSWF from '@/components/dinoz/dinozSWF.vue';

export default defineComponent({
	name: 'DinozList',
	data() {
		return {
			sessionStore: sessionStore(),
			dinozList: [] as Array<Dinoz>
		};
	},
	/*components: {
		SDinozSWF
	},*/
	methods: {
		goToDinozPage(dinozId: string): void {
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
		storeDinozList(): Array<Dinoz> {
			return this.sessionStore.getDinozList!;
		}
	},
	watch: {
		storeDinozList: function (dinozList: Array<Dinoz>) {
			this.dinozList = dinozList;
		}
	},
	mounted(): void {
		this.dinozList = this.sessionStore.getDinozList!;
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

			em {
				width: 150px;
				font-size: 7.5pt;
			}
		}
	}
}
</style>
