<template>
	<div v-if="hasAccess" class="wrapper">
		<div class="banner-panel dz-box" v-if="hasBannerEditRight">
			<h3>{{ $t('clanSettings.banner.title') }}</h3>
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
		<div v-if="hasLangEditRight" class="language-panel dz-box">
			<h3>{{ $t('clanSettings.langs.title') }}</h3>
			<LangSelector v-model="langs" @change="saveLangs" class="df" />
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
import LangSelector from './LangSelector.vue';
import { LocalesEnum } from '../../i18n';
import { clanStore } from '../../store/clanStore';
import { useLoadingStore } from '../../store';

export default defineComponent({
	name: 'ClanParameters',
	components: { LangSelector },
	data() {
		return {
			playerStore: playerStore(),
			hasAccess: false as boolean,
			banner_url: '' as string,
			hasBannerEditRight: false as boolean,
			hasLangEditRight: false as boolean,
			filePreviewUrl: '',
			clanStore: clanStore(),
			langs: [] as LocalesEnum[]
		};
	},
	methods: {
		async saveLangs(): Promise<void> {
			useLoadingStore().setLoaderOn();
			try {
				await this.clanStore.updateLang(this.clanStore.getClanId, this.langs);
				useLoadingStore().setLoaderOff();
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		async deleteClan(): Promise<void> {
			const res: boolean = await this.$confirm({
				message: this.$t('popup.confirm'),
				header: this.$t('popup.attention'),
				acceptLabel: this.$t('popup.accept'),
				rejectLabel: this.$t('popup.reject'),
				icon: 'pi pi-trash'
			});
			if (res) {
				useLoadingStore().setLoaderOn();
				try {
					await ClanService.deleteClan(this.clanStore.getClanId);
					this.playerStore.setClanId(undefined);
					useLoadingStore().setLoaderOff();
					this.$router.push({ name: 'ClansList' });
				} catch (err) {
					errorHandler.handle(err, this.$toast);
					return;
				}
			}
		},
		async getHasBannerEditRight() {
			try {
				this.hasBannerEditRight = await ClanService.getPlayerHasRight(
					this.clanStore.getClanId,
					ClanMemberRight.CLAN_EDIT_BANNER
				);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		async getHasLangEditRight() {
			try {
				this.hasLangEditRight = await ClanService.getPlayerHasRight(
					this.clanStore.getClanId,
					ClanMemberRight.CLAN_EDIT_LANG
				);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		async onFileChanged() {
			const form = new FormData();
			const image = this.$refs.fileInput as HTMLInputElement;
			const file = image.files?.[0];
			if (file) {
				const reader = new FileReader();
				reader.onload = e => {
					this.filePreviewUrl = e.target?.result as string;
					EventBus.emit('clanBannerUpdated', this.filePreviewUrl);
				};
				reader.readAsDataURL(file);
				form.delete('file');
				form.append('file', file);
				await ClanService.updateClanBanner(this.clanStore.getClanId, form);
			}
		}
	},
	async mounted() {
		this.hasAccess = this.playerStore.clanId == this.clanStore.getClanId;
		if (!this.hasAccess) {
			this.$router.push({ name: 'Clan', params: { id: this.$route.params.id } });
		}
		await Promise.all([this.getHasBannerEditRight(), this.getHasLangEditRight()]);
		if (!this.hasBannerEditRight && !this.hasLangEditRight) {
			this.$router.push({ name: 'Clan', params: { id: this.$route.params.id } });
		}
		this.langs = (this.clanStore.getClan?.langs as LocalesEnum[]) ?? [];
	}
});
</script>

<style lang="scss" scoped>
.wrapper {
	margin: 5px;
	margin-right: 10px;
	width: auto;
	display: flex;
	flex-direction: column;
	width: calc(100% - 11px) !important;
	box-sizing: border-box;
	.banner-panel {
		margin: 8px 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
		color: #fce3bb;
		padding: 0 8px 8px 8px;
		.action {
			display: flex;
			justify-content: space-between;
			align-items: center;
			input {
				width: 75%;
			}
		}
		.disclaimer {
			font-style: italic;
			font-size: 12px;
		}
	}
	.language-panel {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 0 8px 8px 8px;
	}
}
</style>
