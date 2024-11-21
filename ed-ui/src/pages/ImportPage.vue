<template>
	<div id="dataCollector" v-if="!importData">
		<p class="disclaimer" v-html="formatText($t(`import.disclaimer`))" />
		<a
			href="javascript:(function(){let e=function e(i){let t=`; ${document.cookie}`,o=t.split('; sid=');if(2===o.length)return o.pop().split(';').shift()}('sid');if(e){let i=document.createElement('input');document.body.appendChild(i),i.value=e,i.focus(),i.select(),document.execCommand('copy'),i.remove(),alert('SID copied to clipboard')}})();"
			>Cookie</a
		>
		<input v-model="cookie" type="text" placeholder="Cookie" />
		<div class="buttonLand" v-if="twinoCode && cookie && !importOver">
			<p class="smallbutton" @click="getApiData('fr')">Français</p>
			<p class="smallbutton" @click="getApiData('en')">English</p>
			<p class="smallbutton" @click="getApiData('es')">Español</p>
		</div>
		<p class="disclaimer" v-html="formatText($t(`import.disclaimer2`))" />
		<p class="smallbutton" @click="importTwinoidOnly()">Twinoid</p>
	</div>
	<div v-if="importData">
		<p
			class="disclaimer"
			v-html="
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
import EventBus from '../events/index.js';
import { errorHandler } from '../utils/index.js';
import { ImportResponse } from '@drpg/core/models/import/ImportResponse';
import { formatText } from '../utils/formatText.js';

export default defineComponent({
	name: 'ImportPage',
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
			EventBus.emit('isLoading', true);
			const code = codeRegex[1];
			try {
				this.importData = await PlayerService.requestImportAPI(code, server, this.cookie);
				this.importOver = true;
				EventBus.emit('isLoading', false);
			} catch (err) {
				errorHandler.handle(err, this.$toast);
				return;
			}
		},
		async importTwinoidOnly(): Promise<void> {
			const codeRegex = window.location.search.match(/code=(.*)/);
			if (!codeRegex) return;
			EventBus.emit('isLoading', true);
			const code = codeRegex[1];
			try {
				await PlayerService.requestImportTwinoid(code);
				EventBus.emit('isLoading', false);
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
.smallbutton {
	background-image: url('../assets/design/button_small.webp');
	padding-top: 4px;
	font-size: 9pt;
	line-height: 7pt;
	width: 80px;
	padding-top: 5px;
	padding-right: 5px;
	color: white;
	font-weight: normal;
	font-variant: small-caps;
	text-align: center;
	height: 24px;
	margin-top: 3px;
	margin-bottom: 2px;
	padding-left: 10px;
	cursor: pointer;
	&:hover {
		background-image: url('../assets/design/button_small_hover.webp');
	}
}
/*.disclaimer {
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
}*/
</style>
