<template>
	<div id="centerContent">
		<DinozSWF
			:display="display"
			:width="190"
			:height="165"
			type="dino"
			class="avatar"
			v-if="showDinoz"
		></DinozSWF>
		<p>CHK : {{ display }}</p>
		<br />
		<div>
			<label>1ère lettre :</label>&nbsp;
			<input
				type="text"
				:value="display[0]"
				@change="changeLetter($event.target.value, 0)"
			/>
		</div>
		<div v-for="(letter, index) in display.slice(1)" :key="index">
			<label>{{ index + 2 }}ème lettre: </label>&nbsp;
			<input
				type="text"
				:value="display[index + 1]"
				@change="changeLetter($event.target.value, index + 1)"
			/>
		</div>
		<button @click="reload()">Reload</button>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DinozSWF from '@/components/dinoz/dinozSWF.vue';

export default defineComponent({
	name: 'DinozGenerator',
	data() {
		return {
			display: '' as string,
			showDinoz: true as boolean
		};
	},
	components: {
		DinozSWF
	},
	methods: {
		reload(): void {
			this.showDinoz = false;
			this.$router.push({ query: { chk: this.display } });
		},
		rerender(): void {
			this.display = this.$router.currentRoute.value.query.chk as string;
			this.showDinoz = true;
		},
		changeLetter(newLetter: string, index: number): void {
			this.display = this.display
				.substring(0, index)
				.concat(newLetter)
				.concat(this.display.substring(index + 1));
		}
	},
	created(): void {
		this.display =
			(this.$router.currentRoute.value.query.chk as string) ??
			'89XIW5r5kNoJF000';
	},
	watch: {
		'$route.params': 'rerender'
	}
});
</script>
