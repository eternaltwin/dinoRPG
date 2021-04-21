<template>
	<div id="mainPage">
		<div v-if="displayAuth">
			<authentication @leaveAuth="leaveAuth()"></authentication>
		</div>
		<div v-else>
			<common-elements></common-elements>
			<router-view />
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Authentication from '@/pages/Authentication.vue';
import store from '@/store';
import { isNil } from 'lodash';
import CommonElements from '@/components/CommonElements.vue';

export default defineComponent({
	name: 'MainPage',
	data() {
		return {
			displayAuth: true as boolean
		};
	},
	components: {
		Authentication,
		CommonElements
	},
	methods: {
		leaveAuth(): void {
			this.displayAuth = false;
		}
	},
	mounted(): void {
		this.displayAuth = isNil(store.getters.getJwt);
	}
});
</script>
