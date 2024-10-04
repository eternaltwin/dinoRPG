<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
	<Tippy class="action" tag="div" id="act_follow" theme="normal" @click="displayFollow()">
		<img :src="getImgURL('icons', 'act_follow')" alt="act_follow" />
		<p>
			{{ $t(`action.name.follow`) }}
		</p>
		<template #content>
			<h1 v-html="formatContent($t(`action.name.follow`))" />
			<p v-html="formatContent($t(`action.description.follow`))" />
		</template>
	</Tippy>
	<div
		v-for="dinozToFollow in dinozAvailableToFollow"
		:key="dinozToFollow"
		class="dinoz-to-follow"
		@click="followDinoz(dinozToFollow.id)"
	>
		<p>
			<img :src="getImgURL('icons', 'small_follow')" alt="follow" />
			{{ dinozToFollow.name }}
		</p>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { DinozService } from '../../services/index.js';
import EventBus from '../../events/index.js';
import { getFollowableDinoz, orderDinozList } from '@drpg/core/utils/DinozUtils';
import { errorHandler } from '../../utils/index.js';
import { dinozStore } from '../../store/index.js';
import { DinozFiche } from '@drpg/core/models/dinoz/DinozFiche';
import { formatText } from '../../utils/formatText.js';

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
				this.$toast.open({ message: formatText(this.$t(`toast.dinozListMissing`)), type: 'error' });
				return;
			}

			if (this.dinozAvailableToFollow.length > 0) {
				this.dinozAvailableToFollow = [];
				return;
			}

			const currentDinoz = this.dinozStore.getDinoz(+this.$route.params.id);

			if (!currentDinoz) {
				this.$toast.open({ message: formatText(this.$t(`toast.unknownDinoz`)), type: 'error' });
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
					this.$toast.open({ message: formatText(this.$t(`toast.dinozListMissing`)), type: 'error' });
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
				errorHandler.handle(e, this.$toast);
			}
		}
	}
});
</script>

<style scoped lang="scss">
.action {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 0.5rem;
	margin-left: 5px;
	margin-right: 5px;
	border-radius: 7px;
	font-size: 11pt;
	font-variant: small-caps;
	line-height: 10.5pt;
	font-weight: 700;
	&:hover {
		background-color: #9a4029;
		cursor: pointer;
		img {
			outline: 1px solid white;
		}
	}
}
.dinoz-to-follow {
	padding-left: 7px;
	padding-top: 2px;
	padding-bottom: 2px;

	&:hover {
		outline: none;
		background-color: #9a4029;
		cursor: pointer;
	}
}
</style>
