<template>
	<TitleHeader :title="$t('pageTitle.createClan')" :header="$t('createClan.title')"></TitleHeader>
	<div id="chooseClanName">
		<DZDisclaimer help round :content="$t('createClan.information', { cost: creationCost })" />
		<div class="middle-content">
			<div class="grid">
				<p>{{ $t('createClan.clan_name') }}</p>
				<DZInput type="text" v-model="clanName" />

				<p>{{ $t('createClan.clan_langs') }}</p>
				<LangSelector v-model="langs" class="lang-selector" />

				<p>{{ $t('createClan.clan_description') }}</p>
				<textarea class="description" type="text" v-model="description"></textarea>
			</div>
		</div>

		<div class="end-content">
			<div class="buttons">
				<!-- <img :src="getImgURL('button', 'button-back-arrow')" alt="go back" /> -->
				<a class="button" @click="goToClanList()">{{ $t('createClan.go_back_button') }}</a>
				<a class="button" @click="CreateClan()">{{ $t('createClan.create_button') }}</a>
			</div>
			<img :src="getImgURL('background', 'logo_clan_swords')" alt="clan_image" />
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import TitleHeader from '../../components/utils/TitleHeader.vue';
import EventBus from '../../events/index.js';
import { errorHandler } from '../../utils/errorHandler.js';
import { ClanService } from '../../services/ClanService.js';
import { CLAN_CREATE_MONEY } from '@drpg/core/constants';
import { formatNumber } from '../../utils/formatText.js';
import { playerStore } from '../../store/index.js';
import DZDisclaimer from '../../components/common/DZDisclaimer.vue';
import DZInput from '../../components/common/DZInput.vue';
import LangSelector from '../../components/clans/LangSelector.vue';
import { LocalesEnum } from '../../i18n';

export default defineComponent({
	name: 'CreateClan',
	components: {
		LangSelector,
		DZDisclaimer,
		TitleHeader,
		DZInput
	},
	data() {
		return {
			clanName: '' as string,
			langs: [] as LocalesEnum[],
			description: '' as string,
			canCreateClan: false as boolean,
			creationCost: formatNumber(CLAN_CREATE_MONEY, '.'),
			playerStore: playerStore()
		};
	},
	methods: {
		async CreateClan(): Promise<void> {
			EventBus.emit('isLoading', true);
			try {
				const clan = await ClanService.createClan(this.clanName, this.description, this.langs);
				this.playerStore.setClanId(clan.id);
				EventBus.emit('isLoading', false);
				this.$router.push({ name: 'Clan', params: { id: clan.id } });
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		goToClanList(): void {
			this.$router.push({ name: 'ClansList' });
		}
	},
	mounted() {
		this.langs = [this.$i18n.locale as LocalesEnum];
	}
});
</script>

<style lang="scss" scoped>
#chooseClanName {
	max-width: 95%;
	align-self: center;
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
	strong {
		color: #ffee92;
	}
}
.grid {
	display: inline-grid;
	column-gap: 5px;
	row-gap: 5px;
	p {
		grid-column: 1;
		font-variant: normal;
		font-weight: bold;
		font-size: 8pt;
		color: #ffee92;
		width: 150px;
		text-align: center;
		background-color: #e4aa69;
		border-radius: 10px;
		-webkit-border-radius: 10px;
	}
	select {
		color: #ffee92;
		background-color: #bc683c;
	}
	textarea {
		grid-column: 2;
		padding-left: 8px;
		padding-right: 8px;
		color: #ffee92;
		font-size: 9pt;
		font-weight: bold;
		border: none;
		height: 100px;
		width: 184px;
		background-color: #bc683c;
		resize: vertical;
	}

	.lang-selector {
		display: flex;
		width: 184px;
		flex-wrap: wrap;
		justify-content: space-around;
	}
}
.middle-content {
	display: flex;
	.grid {
		margin: auto;
	}
}
.end-content {
	display: flex;
	flex-direction: column;
	.buttons {
		display: flex;
		column-gap: 10px;
		margin: 10px auto;
	}
	img {
		margin: auto;
		width: 190px;
	}
}
</style>
