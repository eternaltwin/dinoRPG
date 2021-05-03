<template>
	<div class="dinorpg">
		<div v-if="displayAuth">
			<authentication @leaveAuth="leaveAuth()"></authentication>
		</div>
		<div v-else>
			<table id="layout">
				<tbody>
					<tr>
						<td id="left"><div></div></td>
						<td id="center">
							<a href="/" class="linkHome"></a>
							<div id="centerHeader">
								<div id="menu"></div>
								<div id="dinozList">
									<common-elements></common-elements>
								</div>
								<div id="centerContent" class="newsSection">
									<router-view />
								</div>
							</div>
						</td>
						<td id="right"><div></div></td>
					</tr>
					<tr>
						<td><div></div></td>
						<td>
							<div class="skyfootercore"></div>
						</td>
						<td>
							<div class="skyfooterright"></div>
						</td>
					</tr>
				</tbody>
			</table>
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
