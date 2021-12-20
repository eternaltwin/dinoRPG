<template>
	<div>
		<!-- Dinoz 1 -->
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
				@change="changeLetterDinozOne($event.target.value, 0)"
			/>
		</div>
		<div v-for="(letter, index) in display.slice(1)" :key="index">
			<label>{{ index + 2 }}ème lettre: </label>&nbsp;
			<input
				type="text"
				:value="display[index + 1]"
				@change="changeLetterDinozOne($event.target.value, index + 1)"
			/>
		</div>
	</div>

	<div>
		<!-- Dinoz 2 -->
		<DinozSWF
			:display="display2"
			:width="190"
			:height="165"
			type="dino"
			class="avatar"
			v-if="showDinoz"
		></DinozSWF>
		<p>CHK : {{ display2 }}</p>
		<br />
		<div>
			<label>1ère lettre :</label>&nbsp;
			<input
				type="text"
				:value="display2[0]"
				@change="changeLetterDinozTwo($event.target.value, 0)"
			/>
		</div>
		<div v-for="(letter, index) in display2.slice(1)" :key="index">
			<label>{{ index + 2 }}ème lettre: </label>&nbsp;
			<input
				type="text"
				:value="display2[index + 1]"
				@change="changeLetterDinozTwo($event.target.value, index + 1)"
			/>
		</div>
	</div>
	<button @click="reload()">Reload</button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DinozSWF from '@/components/dinoz/dinozSWF.vue';

export default defineComponent({
	name: 'DinozGenerator',
	data() {
		return {
			display: '' as string,
			display2: '' as string,
			showDinoz: true as boolean
		};
	},
	components: {
		DinozSWF
	},
	methods: {
		reload(): void {
			this.showDinoz = false;
			this.$router.push({ query: { chk: this.display, chk2: this.display2 } });
			this.$router.push({ query: { chk: this.display, chk2: this.display2 } });
		},
		rerender(): void {
			this.display = this.$router.currentRoute.value.query.chk as string;
			this.display2 = this.$router.currentRoute.value.query.chk2 as string;
			this.showDinoz = true;
		},
		changeLetterDinozOne(newLetter: string, index: number): void {
			this.display = this.display
				.substring(0, index)
				.concat(newLetter)
				.concat(this.display.substring(index + 1));
		},
		changeLetterDinozTwo(newLetter: string, index: number): void {
			this.display2 = this.display2
				.substring(0, index)
				.concat(newLetter)
				.concat(this.display2.substring(index + 1));
		}
	},
	created(): void {
		this.display =
			(this.$router.currentRoute.value.query.chk as string) ??
			'89XIW5r5kNoJF000';
		this.display2 =
			(this.$router.currentRoute.value.query.chk2 as string) ??
			'89XIW5r5kNoJF000';
	},
	watch: {
		'$route.params': 'rerender'
	}
});
</script>
<style lang="scss" scoped>
.swfdis {
	width: 300px !important;
}
#centerContent {
	display: flex;
	flex-wrap: nowrap;
}
</style>
