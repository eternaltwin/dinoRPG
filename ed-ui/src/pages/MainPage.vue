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
							<LeftPanel />
							<Router-view />
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
import LeftPanel from '@/components/common/LeftPanel.vue';

export default defineComponent({
	name: 'MainPage',
	components: {
		LeftPanel
	}
});
</script>

<style lang="scss" scoped>
a.linkHome {
	position: absolute;
	width: 500px;
	height: 80px;
	z-index: 10;
	margin-top: 25px;
	margin-left: 240px;
	background-color: transparent;
}
</style>
