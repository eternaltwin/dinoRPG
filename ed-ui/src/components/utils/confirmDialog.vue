<template>
	<div v-if="visible" class="simple-confirm-dialog-mask" @click="rejectDialog">
		<div class="simple-confirm-dialog" @click.stop>
			<header class="simple-confirm-dialog-header">
				<h3 class="simple-confirm-dialog-title">{{ header }}</h3>
				<button class="simple-confirm-dialog-close" @click="rejectDialog">&times;</button>
			</header>

			<section class="simple-confirm-dialog-content">
				<i v-if="icon" :class="icon" class="simple-confirm-dialog-icon"></i>
				<p class="simple-confirm-dialog-message">{{ message }}</p>
			</section>

			<footer class="simple-confirm-dialog-footer">
				<button class="btn btn-reject" @click="rejectDialog">{{ rejectLabel }}</button>
				<button class="btn btn-accept" @click="acceptDialog" @keydown.enter="acceptDialog">{{ acceptLabel }}</button>
			</footer>
		</div>
	</div>
</template>

<script lang="ts">
export default {
	name: 'confirmDialog',
	emits: [
		'update:visible', // Pour le support de v-model:visible
		'confirm', // Quand l'utilisateur confirme
		'reject' // Quand l'utilisateur annule
	],
	data() {
		return {
			isDialogOpen: false,
			currentMessage: '',
			currentHeader: '',
			// Stocker les fonctions de callback pour l'acceptation et le rejet
			resolveCallback: null,
			rejectCallback: null
		};
	},
	props: {
		visible: Boolean,
		header: String,
		message: String,
		icon: String,
		acceptLabel: String,
		rejectLabel: String,
		onConfirm: Function,
		onReject: Function
	},
	methods: {
		acceptDialog() {
			if (this.onConfirm) {
				this.onConfirm();
			}
		},
		rejectDialog() {
			if (this.onReject) {
				this.onReject();
			}
		}
	}
};
</script>

<style scoped>
.simple-confirm-dialog-mask {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.4);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 1000;
}

.simple-confirm-dialog {
	background: white;
	border-radius: 6px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	width: 90%;
	max-width: 400px;
	overflow: hidden;
}

.simple-confirm-dialog-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 1rem;
	border-bottom: 1px solid #eee;
}

.simple-confirm-dialog-title {
	margin: 0;
	font-size: 1.25rem;
}

.simple-confirm-dialog-close {
	background: none;
	border: none;
	font-size: 1.5rem;
	cursor: pointer;
	line-height: 1;
}

.simple-confirm-dialog-content {
	padding: 1rem;
	display: flex;
	align-items: center;
	gap: 1rem;
}

.simple-confirm-dialog-icon {
	font-size: 1.5rem;
	color: orange;
}

.simple-confirm-dialog-footer {
	padding: 1rem;
	border-top: 1px solid #eee;
	text-align: right;
}

.btn {
	padding: 0.5rem 1rem;
	border-radius: 4px;
	cursor: pointer;
	margin-left: 0.5rem;
}

.btn-reject {
	background-color: #f4f4f4;
	color: #333;
	border: 1px solid #ccc;
}

.btn-accept {
	background-color: #007bff;
	color: white;
	border: 1px solid #007bff;
}
</style>
