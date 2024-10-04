<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
	<div v-if="hasAccess" class="wrapper">
		<div class="banner-panel" v-if="hasBannerEditRight">
			<p>{{ $t('clanSettings.banner.title') }}</p>
			<div class="action">
				<input ref="fileInput" type="file" @change="onFileChanged()" />
				<img
					v-if="filePreviewUrl"
					:src="filePreviewUrl"
					alt="File Preview"
					style="max-width: 300px; max-height: 300px"
				/>
			</div>
			<div class="disclaimer">
				<img :src="getImgURL('icons', 'small_question')" alt="info_button" style="margin-right: 2px" />
				{{ $t('clanSettings.banner.info') }}
			</div>
		</div>
		<a class="button" @click="deleteClan()">{{ $t('clanSettings.action.delete') }}</a>
		<!-- <input type="file" @change="onFileChanged($event)" accept="image/*" capture /> -->
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import EventBus from '../../events/index.js';
import { ClanService } from '../../services/ClanService.js';
import { errorHandler } from '../../utils/errorHandler.js';
import { playerStore } from '../../store/playerStore.js';
import { ClanMemberRight } from '@drpg/core/models/enums/ClanMemberRight';

export default defineComponent({
	name: 'ClanParameters',
	components: {},
	data() {
		return {
			playerStore: playerStore(),
			hasAccess: false as boolean,
			banner_url: '' as string,
			hasBannerEditRight: false as boolean,
			filePreviewUrl: ''
		};
	},
	methods: {
		async deleteClan(): Promise<void> {
			const res: boolean = confirm(this.$t('popup.confirm'));
			if (res) {
				EventBus.emit('isLoading', true);
				try {
					await ClanService.deleteClan(Number(this.$route.params.id));
					this.playerStore.setClanId(undefined);
					EventBus.emit('isLoading', false);
					this.$router.push({ name: 'ClansList' });
				} catch (err) {
					errorHandler.handle(err, this.$toast, this.$t);
					return;
				}
			}
		},
		async getHasBannerEditRight() {
			try {
				this.hasBannerEditRight = await ClanService.getPlayerHasRight(
					Number(this.$route.params.id),
					ClanMemberRight[ClanMemberRight.CLAN_EDIT_BANNER]
				);
			} catch (err) {
				errorHandler.handle(err, this.$toast, this.$t);
				return;
			}
		},
		async onFileChanged() {
			const form = new FormData();
			const image = this.$refs.fileInput! as HTMLInputElement;
			const file = image.files![0];
			if (file) {
				const reader = new FileReader();
				reader.onload = e => {
					this.filePreviewUrl = e.target!.result as string;
				};
				reader.readAsDataURL(file);
				form.delete('file');
				form.append('file', image!.files![0]);
				await ClanService.updateClanBanner(Number(this.$route.params.id), form);
			}
		}
	},
	async mounted() {
		this.hasAccess = this.playerStore.clanId == Number(this.$route.params.id);
		if (!this.hasAccess) {
			this.$router.push({ name: 'Clan', params: { id: this.$route.params.id } });
		}
		await this.getHasBannerEditRight();
		if (!this.hasBannerEditRight) {
			this.$router.push({ name: 'Clan', params: { id: this.$route.params.id } });
		}
	}
});
</script>

<style lang="scss" scoped>
.wrapper {
	margin: 5px;
	width: auto;
	display: flex;
	flex-direction: column;
	.banner-panel {
		display: flex;
		flex-direction: column;
		gap: 8px;
		.action {
			display: flex;
			justify-content: space-between;
			align-items: center;
			input {
				width: 75%;
			}
		}
	}
}

.disclaimer {
	margin-top: 10px;
	margin-bottom: 10px;
	padding: 5px;
	padding-left: 5px;
	padding-left: 20px;
	color: #fce3bc;
	font-size: 10pt;
	background-color: #bc683c;
	background-position: 5px 8px;
	background-repeat: no-repeat;
}
</style>
