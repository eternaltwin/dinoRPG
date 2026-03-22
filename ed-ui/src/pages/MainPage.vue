<template>
	<div class="dinorpg">
		<div id="centerHeader" v-if="loaded">
			<RouterLink to="/" class="linkHome"></RouterLink>
			<LeftPanel />
			<div id="centerContent">
				<Router-view />
			</div>
		</div>
		<div id="prefoot" />
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { playerStore } from '../store/index.js';
import { errorHandler } from '../utils/index.js';
import LeftPanel from '../components/common/LeftPanel.vue';

export default defineComponent({
	name: 'MainPage',
	components: { LeftPanel },
	data() {
		return {
			playerStore: playerStore(),
			loaded: false as boolean
		};
	},
	methods: {
		async firstLoad() {
			try {
				// Set data in sessionStore
				await this.playerStore.update();
				this.loaded = true;
			} catch (e) {
				errorHandler.handle(e, this.$toast);
				return;
			}
		}
	},
	async created() {
		try {
			await this.firstLoad();
		} catch (err) {
			errorHandler.handle(err, this.$toast);
			return;
		}
	}
});
</script>

<style lang="scss" scoped>
.dinorpg {
	background-image: url('../assets/background/bg_ciel3.webp');
	background-repeat: repeat-x;
}
#centerHeader {
	min-height: 100vh;
	background:
		url('../assets/background/full_bg.webp') no-repeat,
		url('../assets/background/full_core_bg.webp') repeat-y;
	background-position-x: calc(50% + 247px);
	background-position-y: top;
	padding-bottom: 50px;
	padding-top: 15px;
	.linkHome {
		grid-area: top;
		cursor: pointer;
		height: 11rem;
		width: 100%;
		max-width: 540px;
	}
}
@media (min-width: 875px) {
	#centerHeader {
		display: grid;
		grid-template-areas: 'left top .' 'left center center';
		grid-template-columns: 1fr 540px 1fr;
		grid-template-rows: 110px 1fr;
	}
}
@media (max-width: 875px) {
	#centerHeader {
		display: flex;
		align-items: center;
		flex-direction: column;
	}
}

#prefoot {
	background-image: url('../assets/background/full_footer.webp');
	background-color: white;
	background-repeat: no-repeat;
	background-position-x: calc(50% + 248px);
	min-height: 128px;
}
#centerContent {
	grid-area: center;
	width: 100%;
	max-width: 640px;
	display: flex;
	flex-direction: column;
	z-index: 1;
	//gap: 10px;
}
</style>
