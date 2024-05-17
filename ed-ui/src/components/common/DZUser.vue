<template>
	<div class="user-container">
		<span class="user-component" @click="toggleMenu">
			<img src="../../assets/design/small_member.webp" :alt="user.name" />
			<span>{{ user.name }}</span>
		</span>
		<PlayerMenu v-if="seePlayer" />
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import PlayerMenu from './PlayerMenu.vue';

export default defineComponent({
	name: 'DZUser',
	components: {
		PlayerMenu
	},
	props: {
		user: {
			type: Object,
			required: true
		}
	},
	data() {
		return {
			seePlayer: false
		};
	},
	methods: {
		toggleMenu() {
			this.seePlayer = !this.seePlayer;
		}
	}
});
</script>

<style lang="scss" scoped>
.user-container {
	position: relative;
	display: inline-block;
}
.user-component {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	font-size: 9pt;
	line-height: 7pt;
	background-color: #c2381a;
	border-top: 1px solid #ff9200;
	box-shadow: 0px 0px 2px #000000;
	color: white;
	border-radius: 4px;
	padding: 2px 4px;
	cursor: pointer;
	user-select: none;

	&:hover {
		background-color: #e04b2b;
	}

	img {
		margin-right: 4px;
	}
}
</style>
