<template>
	<div id="dinozFiche">
		<table>
			<tbody>
				<div v-for="object in objects">
					<img src="@/assets/logo.png">
				</div>
			</tbody>
		</table>
	</div>
</template>

<script>
	export default {
		data () {
			return {

			}
		},
		methods: {
			objectClicked (colonne) {
				this.$emit('objectClicked', colonne);
			}
		},
		props: {
			nbrColonnes: Number,
			nbrLignes: Number,
			objects: Array
		}
	}
</script>

<style>

</style>
