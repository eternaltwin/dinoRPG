<template>
	<Tippy tag="tr" id="act_follow" theme="normal" @click="displayFollow()">
		<td class="icon">
			<img :src="getImgURL('icons', 'act_follow')" alt="act_follow" />
		</td>
		<td class="label">
			{{ $t(`action.name.follow`) }}
		</td>
		<template #content>
			<h1 v-html="formatContent($t(`action.name.follow`))" />
			<p v-html="formatContent($t(`action.description.follow`))" />
		</template>
	</Tippy>
	<tr
		v-for="dinozToFollow in dinozAvailableToFollow"
		:key="dinozToFollow"
		class="dinoz-to-follow"
		@click="followDinoz(dinozToFollow.id)"
	>
		<td class="icon">
			<img :src="getImgURL('icons', 'small_follow')" alt="follow" />
		</td>
		<td class="label">
			{{ dinozToFollow.name }}
		</td>
	</tr>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { DinozService } from '../../services/index.js';
import EventBus from '../../events/index.js';
import { getFollowableDinoz, orderDinozList } from '@drpg/core/utils/DinozUtils';
import { errorHandler } from '../../utils/index.js';
import { dinozStore } from '../../store/index.js';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';

export default defineComponent({
	name: 'DZFollow',
	data() {
		return {
			dinozStore: dinozStore(),
			dinozAvailableToFollow: [] as DinozFiche[]
		};
	},
	methods: {
		displayFollow(): void {
			if (!this.dinozStore.getDinozList) {
				this.$toast.open({ message: this.$t(`toast.dinozListMissing`), type: 'error' });
				return;
			}

			if (this.dinozAvailableToFollow.length > 0) {
				this.dinozAvailableToFollow = [];
				return;
			}

			const currentDinoz = this.dinozStore.getDinoz(+this.$route.params.id);

			if (!currentDinoz) {
				this.$toast.open({ message: this.$t(`toast.unknownDinoz`), type: 'error' });
				return;
			}

			// Display the list of dinoz available to follow
			this.dinozAvailableToFollow = getFollowableDinoz(this.dinozStore.getDinozList, currentDinoz);
		},
		async followDinoz(targetId: number) {
			try {
				await DinozService.follow(+this.$route.params.id, targetId);

				// Reset the list of dinoz available to follow
				this.dinozAvailableToFollow = [];

				// Refresh followed and following status
				const currentDinozList = this.dinozStore.getDinozList;
				if (!currentDinozList) {
					this.$toast.open({ message: this.$t(`toast.dinozListMissing`), type: 'error' });
					return;
				}

				this.dinozStore.setDinozList(
					orderDinozList(
						currentDinozList.map(dinoz => {
							if (dinoz.id === +this.$route.params.id) {
								dinoz.leaderId = targetId;
							} else if (dinoz.id === targetId) {
								dinoz.followers.push(+this.$route.params.id);
							}
							return dinoz;
						})
					)
				);
				EventBus.emit('refreshDinoz', true);
			} catch (e) {
				errorHandler.handle(e);
			}
		}
	}
});
</script>

<style scoped lang="scss">
.action_button {
	position: relative;
	left: 5px;
	border-collapse: collapse;
	border-spacing: 0;
	margin-bottom: 2px;
	width: 175px;
	tr {
		&:hover,
		&.hover {
			td {
				&.icon {
					outline: 1px solid white;
				}
				&.label {
					background-color: #9a4029;
				}
			}
		}

		&.dinoz-to-follow {
			padding: 2px;
			.icon {
				text-align: right;
				padding-top: 6px;
				padding-bottom: 6px;
			}

			&:hover {
				td {
					&.icon {
						outline: none;
						background-color: #9a4029;
					}
				}
			}
		}
	}

	td {
		margin: 0;
		padding: 0 0 2px;
		text-align: left;
		cursor: pointer;

		&.label {
			padding-left: 4px;
			padding-right: 4px;
			font-weight: bold;
			color: white;
			font-size: 11pt;
			font-variant: small-caps;
			line-height: 10.5pt;
			border-top-right-radius: 7px;
			border-bottom-right-radius: 7px;
		}

		&.icon {
			width: 32px;
			font-size: 0;
			line-height: 0;
		}
	}
}
</style>
