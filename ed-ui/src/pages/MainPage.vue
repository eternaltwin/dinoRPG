<template>
	<div class="dinorpg">
		<table id="layout">
			<tbody>
				<tr>
					<td id="left"><div></div></td>
					<td id="center">
						<a href="/" class="linkHome"></a>
						<div id="centerHeader">
							<div id="menu"></div>
							<common-elements></common-elements>
							<router-view />
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
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import CommonElements from '@/components/CommonElements.vue';

export default defineComponent({
	name: 'MainPage',
	components: {
		CommonElements
	}
});
</script>
