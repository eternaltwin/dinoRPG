<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
	<TitleHeader :title="$t('pageTitle.createClan')"></TitleHeader>
	<div class="section ml-[-25px] mt-[-30px] sm:ml-[-7px] sm:mt-0">
		<div class="titlePage">
			<h3>{{ $t('createClan.title') }}</h3>
		</div>
	</div>
	<div id="chooseClanName">
		<div class="disclaimer ml-[-45px] sm:ml-[-7px]">
			<span>
				<img :src="getImgURL('icons', 'small_question')" alt="question_mark" style="margin-right: 2px" />
				{{ $t('createClan.information') }}
				<strong class="text-[#ffee92]">{{ creationCost }}</strong>
				<img :src="getImgURL('icons', 'small_gold')" alt="question_mark" style="margin-left: 3px" />
			</span>
		</div>
		<div class="ml-[-50px] flex w-full flex-col items-start gap-5 sm:ml-[-7px]">
			<div class="flex flex-wrap gap-5 lg:flex-nowrap">
				<p>{{ $t('createClan.clan_name') }}</p>
				<input class="name" type="text" v-model="name" />
			</div>
			<div class="flex flex-wrap gap-5 lg:flex-nowrap">
				<p>{{ $t('createClan.clan_description') }}</p>
				<textarea class="w-[250px] sm:w-[300px]" type="text" v-model="description"></textarea>
			</div>
		</div>
		<div class="ml-[-45px] mt-4 flex flex-col sm:ml-[-7px]">
			<div class="flex flex-wrap justify-center gap-5">
				<a class="button" @click="goToClanList()">
					<img class="max-w-[10px]" :src="getImgURL('button', 'button-back-arrow')" alt="go back" />
					{{ $t('createClan.go_back_button') }}
				</a>
				<a class="button" @click="CreateClan()">{{ $t('createClan.create_button') }}</a>
			</div>
			<div class="mt-6 flex justify-center">
				<img class="w-[190px] justify-center" :src="getImgURL('background', 'logo_clan_swords')" alt="clan_image" />
			</div>
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

export default defineComponent({
	name: 'CreateClan',
	components: {
		TitleHeader
	},
	data() {
		return {
			name: '' as string,
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
				const clan = await ClanService.createClan(this.name, this.description);
				this.playerStore.setClanId(clan.id);
				EventBus.emit('isLoading', false);
				this.$router.push({ name: 'Clan', params: { id: clan.id } });
			} catch (err) {
				errorHandler.handle(err, this.$toast, this.$t);
				return;
			}
		},
		goToClanList(): void {
			this.$router.push({ name: 'ClansList' });
		}
	}
});
</script>

<style lang="scss" scoped>
p {
	font-variant: normal;
	font-weight: bold;
	font-size: 8pt;
	color: #ffee92;
	text-align: center;
	background-color: #e4aa69;
	border-radius: 10px;
	-webkit-border-radius: 10px;
	min-width: 150px;
}
input {
	padding-left: 8px;
	padding-right: 8px;
	color: #ffee92;
	font-size: 9pt;
	font-weight: bold;
	border: none;
	min-width: 200px;
	height: 25px;
	background-image: url('../../assets/design/form_field.webp');
	background-repeat: no-repeat;
	background-color: transparent;
}
textarea {
	padding-left: 8px;
	padding-right: 8px;
	color: #ffee92;
	font-size: 9pt;
	font-weight: bold;
	border: none;
	height: 100px;
	background-color: #bc683c;
	resize: vertical;
}
</style>
