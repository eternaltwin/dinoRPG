<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
	<div class="player-menu" v-if="loadedPlayer">
		<p class="playerLink" @click="goToPlayerPage()">
			{{ $t('playerMenu.title') }} <span>{{ loadedPlayer.name }}</span>
		</p>
		<span class="dashed"></span>
		<div class="grid-menu">
			<a class="link-block" :href="`https://eternaltwin.org/users/${loadedPlayer.eternalTwinId}`" target="_blank">
				<img :src="getImgURL('icons', 'small_eternaltwin')" alt="eternaltwinProfile" /><br />
				{{ $t('playerMenu.gridMenu.pEternal') }}
			</a>
			<a class="link-block">
				<img :src="getImgURL('icons', 'mail')" alt="sendMessage" /><br />
				{{ $t('playerMenu.gridMenu.sendMSG') }}
			</a>
			<a class="link-block">
				<img :src="getImgURL('icons', 'addContact')" alt="addContact" /><br />
				{{ $t('playerMenu.gridMenu.addContact') }}
			</a>
		</div>
		<div class="report">
			<p @click="report()">{{ $t('playerMenu.report.signal') }}</p>
			<p>{{ $t('playerMenu.report.block') }}</p>
		</div>
		<span class="dashed"></span>
		<div class="profil">
			<div class="profil-info">
				<div class="player-desc" v-html="loadedPlayer.customText"></div>
			</div>
			<p class="contact">{{ $t('playerMenu.contact') }}</p>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Player } from '@drpg/core/models/player/Player';
import { PlayerService } from '../../services/index.js';
import { errorHandler } from '../../utils/index.js';
import EventBus from '../../events/index.js';

export default defineComponent({
	name: 'PlayerMenu',
	data() {
		return {
			loadedPlayer: undefined as undefined | Pick<Player, 'id' | 'name' | 'eternalTwinId' | 'customText'>
		};
	},
	props: {
		playerId: {
			type: Number,
			required: true
		}
	},
	methods: {
		leave() {
			this.$emit('leavePlayerMenu');
		},
		goToPlayerPage() {
			if (!this.loadedPlayer) return;
			this.$router.push({ name: 'MyAccount', params: { id: this.loadedPlayer.id } });
		},
		report() {
			if (!this.loadedPlayer) return;
			EventBus.emit('report', this.loadedPlayer.id);
		}
	},
	async mounted() {
		try {
			this.loadedPlayer = await PlayerService.getPlayerMenuInfos(this.playerId);
		} catch (e) {
			errorHandler.handle(e, this.$toast);
			return;
		}
	}
});
</script>

<style lang="scss" scoped>
.player-menu {
	background-color: #bc683c;
	font-size: 10px;
	font-weight: 700;
	border: 1px solid #845a45;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	border-radius: 4px;
	color: #f1e8e6;
	padding: 10px;
	position: absolute;
	top: 100%;
	left: -12px;
	width: 261px;
	height: auto;
	z-index: 1000;
	.grid-menu {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin-top: 7px;
		margin-bottom: 7px;
	}
	.report {
		text-align: right;
		color: #f1e8e6;
		cursor: pointer;
		transition: background-color 0.3s;
		font-size: 9px;
		display: flex;
		flex-direction: column;
		& p {
			cursor: pointer;
			transition: color 0.3s;
		}
		& p:hover {
			color: #ff9200;
		}
	}
	.profil {
		display: flex;
		flex-direction: column;
		gap: 10px;
		.profil-info {
			display: flex;
			justify-content: space-between;
			& img {
				width: 50px;
				height: 50px;
				border-radius: 50%;
				position: relative;
				left: 10px;
			}
		}
		.contact {
			background-color: #fff;
			color: #c2381a;
			padding: 4px;
			border: 1px solid #ccc;
			border-radius: 4px;
		}
	}
	.dashed {
		border-top: 1px dashed #ff9200;
		margin-top: 2px;
		display: block;
	}
}

.link-block {
	background-color: #79432b;
	font-size: 10px;
	cursor: pointer;
	border-radius: 4px;
	color: #f1e8e6;
	display: inline-block;
	height: 55px;
	margin: 0 1px 1px 0;
	overflow: hidden;
	padding: 5px 0;
	text-align: center;
	text-decoration: none;
	width: 72px;
	& img {
		vertical-align: center;
		width: 16px;
		height: 16px;
	}
	&:hover {
		background-color: #8c5a42;
		color: #f9e0c6;
	}
}

.playerLink {
	cursor: pointer;
	margin: 0 -10px;
	padding: 1px 10px;
	text-decoration: none;
	font-size: 10px;
	&:hover {
		background-color: #79432b;
	}
}
.player-desc {
	background-color: #79432b;
	border-radius: 4px;
	color: #fce3bb;
	font-weight: 400;
	font-size: 10px;
	margin-top: 10px;
	padding: 5px;
	word-break: break-word;
	&::before {
		border-bottom: 5px solid #79432b;
		border-left: 5px solid transparent;
		border-right: 5px solid transparent;
		content: ' ';
		display: inline-block;
		height: 0;
		left: 32px;
		margin-top: -9px;
		position: absolute;
		width: 0;
	}
}
</style>
