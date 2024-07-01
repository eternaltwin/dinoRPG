<template>
	<ul>
		<li
			v-for="(dinoz, index) in dinozList"
			:key="index"
			:class="{
				dead: dinoz.life === 0,
				selected: currentDinozId ? dinoz.id === currentDinozId : dinoz.id === pageId,
				light: true,
				group: getLeaderGroup(dinoz)
			}"
		>
			<a @click="goToDinozPage(dinoz.id)">
				<span class="icon">
					<span class="tinyBar">
						<span class="life" :style="getBarWidth(dinoz.life, dinoz.maxLife)"></span>
					</span>
					<span class="tinyBar">
						<span class="xp" :style="getBarWidth(dinoz.experience, dinoz.maxExperience)"></span>
					</span>
					<div class="icons">
						<img
							v-if="dinoz.leaderId"
							:src="getImgURL('icons', 'small_follow')"
							v-tippy="{
								content: formatContent($t('following')),
								theme: 'small'
							}"
							alt="lvlup"
						/>
						<img
							v-if="dinoz.followers.length > 0"
							:src="getImgURL('icons', 'crown', true)"
							v-tippy="{
								content: formatContent($t('followed')),
								theme: 'small'
							}"
							alt="lvlup"
						/>
						<template v-for="i in dinoz.remainingActions" :key="i">
							<img
								:src="getImgURL('icons', `small_hourglass`)"
								v-tippy="{
									content: formatContent($t('remaingActions')),
									theme: 'small'
								}"
								alt="actions"
							/>
						</template>
						<img
							v-if="dinoz.experience >= dinoz.maxExperience && dinoz.maxExperience !== 0"
							:src="getImgURL('icons', 'small_lup')"
							v-tippy="{
								content: formatContent($t('levelup.small')),
								theme: 'small'
							}"
							alt="lvlup"
						/>
					</div>
				</span>
				<span class="name">
					<span>{{ dinoz.name }}</span>
				</span>
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
import { UnavailableReasonFront } from '@drpg/core/models/dinoz/UnavailableReasonFront';

export default defineComponent({
	name: 'DinozList',
	props: {
		currentDinozId: { type: Number, required: false }
	},
	data() {
		return {
			dinozStore: dinozStore(),
			playerStore: playerStore(),
			dinozList: dinozStore().getDinozList as Array<DinozFiche>,
			hasPDA: false as boolean
		};
	},
	methods: {
		goToDinozPage(dinozId: number): void {
			this.$router.push({ name: 'DinozPage', params: { id: dinozId } });
		},
		getBarWidth(actual: number, max: number): string {
			if (actual > max) actual = max;
			const width: number = Math.round((actual / max) * 36);
			return `width : ${width}px`;
		},
		getPlaceName(placeId: number): string {
			return placeList.find(place => place.placeId === placeId)!.name;
		},
		getLeaderGroup(dinoz: DinozFiche) {
			if (!dinoz.leaderId && this.currentDinozId) {
				const selectedDinoz = this.dinozStore.getDinoz(this.currentDinozId);
				if (selectedDinoz && selectedDinoz.leaderId === dinoz.id) return true;
			}
			const leader = this.dinozStore.getDinoz(dinoz.leaderId);
			const selectedDinoz = this.dinozStore.getDinoz(this.currentDinozId);
			if (dinoz.leaderId && leader?.followers.includes(this.currentDinozId)) {
				return true;
			}
			if (dinoz.followers && dinoz.followers.includes(this.currentDinozId)) {
				return true;
			}
			if (dinoz.id === this.currentDinozId) {
				return true;
			}
			if (selectedDinoz?.followers.includes(dinoz.id)) {
				return true;
			}
			return false;
		}
	},
	computed: {
		pageId(): number {
			return parseInt(this.$route.params.id as string);
		}
	},
	watch: {
		'dinozStore.getDinozList': {
			handler(dinozList: Array<DinozFiche>) {
				this.dinozList = orderDinozList(dinozList.filter(d => d.unavailableReason !== UnavailableReasonFront.frozen));
			},
			deep: true
		}
	},
	mounted(): void {
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
				display: flex;
				align-items: center;
				float: left;
				position: relative;
				width: 87px;
				white-space: nowrap;
				overflow: hidden;
				font-weight: bold;
				font-variant: small-caps;

				img {
					width: 10px;
					margin-left: 3px;
				}
			}

			.icon {
				position: relative;
				width: 40px;
				height: 10px;
				font-size: 0pt;
				line-height: 0pt;
				.icons {
					overflow: hidden;
					display: flex;
					gap: 2px;
					margin-top: 4px;
					flex-wrap: wrap-reverse;
					img {
						object-fit: contain;
					}
				}
			}
		}

		&.light {
			a {
				height: 48px;

				.icon {
					float: right;

					.tinyBar {
						margin-top: 4px;
						display: block;
						height: 2px;
						width: 36px;
						border: 1px solid #bc683c;
						background-color: black;
						.life {
							display: block;
							height: 2px;
							background-color: yellow;
						}
						.xp {
							display: block;
							height: 2px;
							background-color: #ff54e4;
						}
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
				width: 90px;
				font-size: 7.5pt;
			}
		}

		&.group {
			background-color: #f2ca8e;
		}
	}
}
</style>
