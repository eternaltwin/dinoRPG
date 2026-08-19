<template>
	<TitleHeader :title="$t('pageTitle.terms')" :header="$t('terms.title')" />
	<div id="terms">
		<DZDisclaimer round content="terms.intro" />
		<ul class="clauses">
			<li v-for="(clause, index) in clauses" :key="index" v-html="clause" />
		</ul>
		<div class="end-content">
			<a class="button" @click="accept()">{{ $t('terms.accept_button') }}</a>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TitleHeader from '../components/utils/TitleHeader.vue';
import DZDisclaimer from '../components/common/DZDisclaimer.vue';
import { errorHandler } from '../utils/errorHandler.js';
import { PlayerService } from '../services/PlayerService.js';
import { playerStore } from '../store/index.js';

export default defineComponent({
	name: 'Terms',
	components: {
		TitleHeader,
		DZDisclaimer
	},
	data() {
		return {
			playerStore: playerStore()
		};
	},
	computed: {
		clauses(): string[] {
			return [this.$t('terms.clause1'), this.$t('terms.clause2'), this.$t('terms.clause3')];
		}
	},
	methods: {
		async accept(): Promise<void> {
			try {
				await PlayerService.acceptTos();
				this.playerStore.setTosAccepted(true);
				this.$router.push({ name: 'News' });
			} catch (err) {
				errorHandler.handle(err, this.$toast);
			}
		}
	}
});
</script>

<style lang="scss" scoped>
#terms {
	max-width: 95%;
	align-self: center;
}
.clauses {
	margin: 15px 10px;
	display: flex;
	flex-direction: column;
	gap: 8px;
}
.end-content {
	display: flex;
	justify-content: center;
	margin: 15px;
}
</style>
