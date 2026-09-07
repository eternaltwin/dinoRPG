<template>
	<div id="dataCollector" v-if="!importData">
		<DZDisclaimer :content="formatText($t(`import.disclaimer`))" />
		<a
			href="javascript:(function(){let e=function e(i){let t=`; ${document.cookie}`,o=t.split('; sid=');if(2===o.length)return o.pop().split(';').shift()}('sid');if(e){let i=document.createElement('input');document.body.appendChild(i),i.value=e,i.focus(),i.select(),document.execCommand('copy'),i.remove(),alert('SID copied to clipboard')}})();"
			>Cookie</a
		>
		<input v-model="cookie" type="text" placeholder="Cookie" />
		<div class="buttonLand" v-if="twinoCode && cookie && !importOver">
			<DZButton @click="getApiData('fr')">Français</DZButton>
			<DZButton @click="getApiData('en')">English</DZButton>
			<DZButton @click="getApiData('es')">Español</DZButton>
		</div>
		<DZDisclaimer :content="formatText($t(`import.disclaimer2`))" />
		<DZButton @click="importTwinoidOnly()">Twinoid</DZButton>
	</div>
	<div v-if="importData">
		<DZDisclaimer
			:content="
				formatText(
					$t(`import.${importData.status}`, {
						accountName: importData.twinoAccountName,
						accountID: importData.twinoAccountID,
						nbDinos: importData.dinozCount,
						nbDemons: importData.demonCount,
						server: importData.server
					})
				)
			"
		/>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { PlayerService } from '../services/index.js';
import { errorHandler } from '../utils/index.js';
import { ImportResponse } from '@drpg/core/models/import/ImportResponse';
import { formatText } from '../utils/formatText.js';
import DZButton from '../components/common/DZButton.vue';
import DZDisclaimer from '../common/DZDisclaimer.vue';

export default defineComponent({
	name: 'ImportPage',
	components: {
		DZButton,
		DZDisclaimer
	},
	data() {
		return {
			twinoCode: false as boolean,
			cookie: undefined as string | undefined,
			importOver: false as boolean,
			importData: undefined as undefined | ImportResponse
		};
	},
	methods: {
		formatText,
		async getApiData(server: string): Promise<void> {
			if (!this.cookie) return;
			const codeRegex = window.location.search.match(/code=(.*)/);
			if (!codeRegex) return;

			const code = codeRegex[1];
			try {
				this.importData = await PlayerService.requestImportAPI(code, server, this.cookie);
				this.importOver = true;
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		async importTwinoidOnly(): Promise<void> {
			const codeRegex = window.location.search.match(/code=(.*)/);
			if (!codeRegex) return;

			const code = codeRegex[1];
			try {
				await PlayerService.requestImportTwinoid(code);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		}
	},
	created() {
		if (window.location.search) this.twinoCode = true;
	}
});
</script>

<style lang="scss" scoped>
.buttonLand {
	align-items: flex-start;
	flex-grow: row;
	justify-content: space-around;
	flex-wrap: wrap;
	display: flex;
	left: 25px;
	width: 400px;
	height: auto;
	margin: auto;
	margin-bottom: auto;
	align-items: center;
	margin-bottom: 5px;
}
</style>
