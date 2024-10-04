<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
	<div class="twino">
		<h3>
			<img :src="getImgURL('design', 'info_button')" alt="info_button" />
			{{ $t(`myAccount.stat.name`) }}
			<img :src="getImgURL('design', 'info_button')" alt="info_button" />
		</h3>
		<div class="allSite" v-if="general">
			<div class="site" v-for="s in site" :key="s.siteId" @click="getSiteInfo(s.siteId, 'stat')">
				<div class="score">{{ s.npoints }}</div>
				<div class="name">{{ $t(`myAccount.stat.${s.siteId}`) }}</div>
			</div>
		</div>
		<div v-if="!general">
			<a href="#" @click="general = true">Retour</a>
			<div class="selector">
				<a
					href="#"
					@click="
						tabSelected = 1;
						getSiteInfo(selectedSite, 'stat');
					"
					>Statistiques</a
				>
				<a
					href="#"
					@click="
						tabSelected = 2;
						getSiteInfo(selectedSite, 'achiev');
					"
					>Gains</a
				>
			</div>
			<div class="scrollcontent">
				<table v-if="tabSelected === 1">
					<tbody>
						<tr v-for="info in stat" :key="info.name">
							<td class="key">{{ info.name }}</td>
							<td class="value">{{ info.score }}</td>
						</tr>
					</tbody>
				</table>
				<table v-if="tabSelected === 2">
					<tbody>
						<tr v-for="info in achiev" :key="info.name">
							<td class="key">{{ info.name }}</td>
							<td class="value">{{ info.quantity }}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { TwinoStat } from '@drpg/core/models/import/twinoStat';
import { PlayerService } from '../../services/index.js';
import { SiteAchiev } from '@drpg/core/models/import/siteAchiev';
import { SiteStat } from '@drpg/core/models/import/siteStat';

export default defineComponent({
	name: 'TwinoDisplay',
	data() {
		return {
			site: [] as Array<TwinoStat>,
			general: true as boolean,
			stat: [] as Array<SiteStat>,
			achiev: [] as Array<SiteAchiev>,
			tabSelected: 1 as number,
			selectedSite: 0 as number
		};
	},
	methods: {
		async getSiteInfo(siteId: number, type: 'stat' | 'achiev'): Promise<void> {
			const playerId = this.$route.params.id as string;
			if (type === 'stat') {
				this.stat = await PlayerService.getTwinoSpecificItem(parseInt(playerId), type, siteId);
				this.stat.sort((a, b) => b.score - a.score);
			} else {
				this.achiev = await PlayerService.getTwinoSpecificItem(parseInt(playerId), type, siteId);
				this.achiev.sort((a, b) => b.quantity - a.quantity);
			}
			this.selectedSite = siteId;
			this.general = false;
		}
	},
	async mounted() {
		// const playerId = this.$route.params.id as string;
		// this.site = await PlayerService.getTwinoGeneralStat(parseInt(playerId));
		// this.site.sort((a, b) => b.npoints - a.npoints);
		// this.site = this.site.filter(site => site.siteId !== 10);
	}
});
</script>

<style scoped lang="scss">
.key {
	text-align: left;
	width: 150px;
	padding-left: 5px;
}
.value {
	text-align: right;
	width: 150px;
	padding-right: 5px;
}
.selector {
	display: flex;
	margin: 5px;
	justify-content: space-evenly;
	a {
		color: #ffee92;
		text-decoration: auto;
	}
}
.active {
	border: 1px solid white;
	text-decoration: none;
	border-bottom: 0px;
	-moz-box-shadow: inset 0px 1px 2px rgba(0, 0, 0, 0.5);
	-webkit-box-shadow: inset 0px 1px 2px rgba(0, 0, 0, 0.5);
	box-shadow: inset 0px 1px 2px rgba(0, 0, 0, 0.5);
}
.allSite {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	justify-content: center;
}
.site {
	display: inline-block;
	padding: 10px 6px;
	vertical-align: bottom;
	width: 70px;
	overflow: hidden;
	margin-left: 10px;
	margin-top: 10px;
	&:hover {
		box-shadow: 0px 2px 4px #1d2028;
		background: none;
		cursor: pointer;
		.score {
			color: white;
		}
		.name {
			color: white;
		}
	}
}
.score {
	text-align: center;
	font-size: 19pt;
	line-height: 16pt;
	font-weight: bold;
	opacity: 0.8;
	filter: alpha(opacity=80);
	zoom: 1;
	white-space: nowrap;
	color: #ffee92;
	text-shadow: 1px 1px 1px #383522;
}
.name {
	font-size: 8pt;
	font-weight: bold;
	text-align: center;
	white-space: nowrap;
	opacity: 0.7;
	filter: alpha(opacity=50);
	zoom: 1;
	color: #ffee92;
	text-shadow: 1px 1px 1px #383522;
}
.twino {
	background:
		url('../../assets/design/info_header.webp') no-repeat,
		url('../../assets/design/info_footer.webp') no-repeat,
		url('../../assets/design/info_center.webp') repeat-y;
	background-position-y: top, bottom;
	height: auto;
	max-height: 600px;
	overflow: auto;
	width: 305px;
	margin-bottom: 10px;
	h3 {
		display: flex;
		justify-content: space-evenly;
		padding-top: 3px;
		font-family: Arial, sans-serif;
		font-size: 10pt;
		font-style: normal;
		font-variant-caps: small-caps;
		font-weight: 400;
		text-align: center;
		color: #ffee92; //!important;
		text-shadow: 1px 1px 1px #383522;
		img {
			height: 7px;
			width: 7px;
			padding-top: 5px;
		}
	}
	dl {
		// position: absolute;
		width: 245px;
		margin-left: 30px;
		margin-top: 10px;
		dt {
			float: left;
			position: relative;
			width: 85px;
			height: 19px;
			font-weight: bold;
			font-size: 9pt;
			font-variant: small-caps;
			color: #ffee92;
		}
		dd {
			min-height: 19px;
			height: auto;
			font-size: 10pt;
			text-align: right;
			color: #fce3bb;
			a {
				color: white;
				font-weight: normal;
			}
		}
	}
}
</style>
